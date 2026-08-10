import { chromium } from 'playwright-core';
import fs from 'node:fs';

const candidates=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'];
const executablePath=candidates.find(p=>fs.existsSync(p));
if(!executablePath)throw new Error('Chrome/Chromium executable not found on runner');
const browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
const hostCtx=await browser.newContext({viewport:{width:1440,height:950}}),guestCtx=await browser.newContext({viewport:{width:1440,height:950}});
const host=await hostCtx.newPage(),guest=await guestCtx.newPage();
const base='http://127.0.0.1:4173/';
const log=(m)=>console.log(`[E2E] ${m}`);
const waitActive=(p,id)=>p.waitForFunction(id=>document.getElementById(id)?.classList.contains('active'),id,{timeout:20000});
const txt=(p,s)=>p.locator(s).textContent();

try{
  await Promise.all([host.goto(base,{waitUntil:'domcontentloaded'}),guest.goto(base,{waitUntil:'domcontentloaded'})]);
  await host.locator('#createName').fill('HostQA');await host.locator('#createRoomBtn').click();await waitActive(host,'lobbyScreen');
  const code=(await txt(host,'#roomCodeText'))?.trim();if(!code||code.includes('-'))throw new Error('Room code not generated');log(`room ${code}`);
  await guest.locator('#joinName').fill('GuestQA');await guest.locator('#joinCode').fill(code);await guest.locator('#joinRoomBtn').click();await waitActive(guest,'lobbyScreen');
  await host.waitForFunction(()=>document.querySelectorAll('#lobbyPlayers .lobby-player').length===2,{timeout:20000});
  await guest.waitForFunction(()=>document.querySelectorAll('#lobbyPlayers .lobby-player').length===2,{timeout:20000});log('two clients synchronized in lobby');

  await host.locator('#choiceSegmentsV4 button[data-value="4"]').click();
  await host.locator('#roundSegmentsV4 button[data-value="25"]').click();
  await guest.waitForFunction(()=>document.querySelector('#formatPreview')?.textContent?.includes('4 seçenek'),{timeout:10000});
  await host.locator('#startGameBtn').click();await Promise.all([waitActive(host,'gameScreen'),waitActive(guest,'gameScreen')]);
  await Promise.all([host.waitForFunction(()=>document.querySelectorAll('#answerGrid .answer-card').length===4),guest.waitForFunction(()=>document.querySelectorAll('#answerGrid .answer-card').length===4)]);log('4-option mode synchronized');

  const snapshot=async p=>p.evaluate(()=>({round:document.querySelector('#roundProgress')?.textContent?.trim(),a:document.querySelector('#teamAName')?.textContent?.trim(),b:document.querySelector('#teamBName')?.textContent?.trim(),answers:[...document.querySelectorAll('#answerGrid .answer-name')].map(x=>x.textContent.trim())}));
  let hs=await snapshot(host),gs=await snapshot(guest);if(JSON.stringify(hs)!==JSON.stringify(gs))throw new Error(`Initial card mismatch: ${JSON.stringify({hs,gs})}`);log(`same initial card ${hs.a} vs ${hs.b}`);

  const correct=await guest.evaluate(()=>{const D=window.QF_DATA,aName=document.querySelector('#teamAName').textContent.trim(),bName=document.querySelector('#teamBName').textContent.trim();const A=Object.entries(D.teams).find(([,t])=>t.short===aName)?.[0],B=Object.entries(D.teams).find(([,t])=>t.short===bName)?.[0];const visible=[...document.querySelectorAll('#answerGrid .answer-name')].map(x=>x.textContent.trim());return Object.values(D.players).find(p=>visible.includes(p.name)&&p.clubs.includes(A)&&p.clubs.includes(B))?.name||''});
  if(!correct)throw new Error('Could not derive correct answer from production data');
  const beforeRound=hs.round;await guest.locator('#answerGrid .answer-card').filter({hasText:correct}).click();
  await guest.waitForFunction(r=>document.querySelector('#roundProgress')?.textContent?.trim()!==r,beforeRound,{timeout:6000});
  await host.waitForFunction(r=>document.querySelector('#roundProgress')?.textContent?.trim()!==r,beforeRound,{timeout:6000});
  const guestScore=await guest.evaluate(()=>[...document.querySelectorAll('#scorePlayers .score-row')].find(x=>x.textContent.includes('GuestQA'))?.querySelector('.score-points')?.textContent?.trim());
  if(guestScore!=='1')throw new Error(`First correct did not score exactly one point: ${guestScore}`);log('first correct scored and both clients auto-advanced');

  hs=await snapshot(host);gs=await snapshot(guest);if(JSON.stringify(hs)!==JSON.stringify(gs))throw new Error('Second card mismatch');
  const info=await host.evaluate(()=>{const D=window.QF_DATA,aName=document.querySelector('#teamAName').textContent.trim(),bName=document.querySelector('#teamBName').textContent.trim();const A=Object.entries(D.teams).find(([,t])=>t.short===aName)?.[0],B=Object.entries(D.teams).find(([,t])=>t.short===bName)?.[0],cards=[...document.querySelectorAll('#answerGrid .answer-card')];const correct=Object.values(D.players).find(p=>cards.some(c=>c.textContent.includes(p.name))&&p.clubs.includes(A)&&p.clubs.includes(B))?.name;return{correct,wrong:cards.map(c=>c.querySelector('.answer-name')?.textContent?.trim()).filter(n=>n&&n!==correct)}});
  if(info.wrong.length<2)throw new Error('Not enough wrong choices for all-wrong test');
  const allWrongRound=hs.round;await host.locator('#answerGrid .answer-card').filter({hasText:info.wrong[0]}).click();await guest.locator('#answerGrid .answer-card').filter({hasText:info.wrong[1]}).click();
  await Promise.all([host.waitForFunction(r=>document.querySelector('#roundProgress')?.textContent?.trim()!==r,allWrongRound,{timeout:6000}),guest.waitForFunction(r=>document.querySelector('#roundProgress')?.textContent?.trim()!==r,allWrongRound,{timeout:6000})]);log('all-wrong rule auto-advanced on both clients');

  await Promise.all([host.waitForFunction(()=>[...document.querySelectorAll('.team-logo img,.player-photo img')].filter(i=>i.complete&&i.naturalWidth>0).length>=6,{timeout:12000}),guest.waitForFunction(()=>[...document.querySelectorAll('.team-logo img,.player-photo img')].filter(i=>i.complete&&i.naturalWidth>0).length>=6,{timeout:12000})]);
  const overflow=await host.evaluate(()=>[...document.querySelectorAll('.team-logo img')].some(img=>{const a=img.getBoundingClientRect(),b=img.parentElement.getBoundingClientRect();return a.left<b.left-1||a.right>b.right+1||a.top<b.top-1||a.bottom>b.bottom+1}));if(overflow)throw new Error('Team logo overflows its shell');log('images loaded and team logos stayed inside shells');

  const music=await host.evaluate(()=>!!window.QFV4Music&&typeof window.QFV4Music.start==='function');if(!music)throw new Error('Full-match music layer missing');
  const sync3=await Promise.all([snapshot(host),snapshot(guest)]);if(JSON.stringify(sync3[0])!==JSON.stringify(sync3[1]))throw new Error('Clients diverged after gameplay');
  console.log('E2E PASS: two-client lobby, settings sync, first-correct scoring, all-wrong auto-next, image load, logo fit, music layer and round sync.');
} finally {await hostCtx.close();await guestCtx.close();await browser.close()}
