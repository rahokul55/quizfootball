import { chromium } from 'playwright-core';
import fs from 'node:fs';

const bins=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'];
const executablePath=bins.find(p=>fs.existsSync(p));
if(!executablePath) throw new Error('Chrome/Chromium missing');
const base=process.env.QF_TEST_BASE||'http://127.0.0.1:4184/';
const out='qa-artifacts-v12';
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const ctx=await browser.newContext({viewport:{width:1366,height:768}});
const p=await ctx.newPage();
const errors=[];
p.on('pageerror',e=>errors.push(String(e)));
p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource: the server responded with a status of (401|403)/i.test(m.text())) errors.push(m.text())});
const report={viewport:{width:1366,height:768},screens:[],match:{},errors};

async function shot(name){await p.screenshot({path:`${out}/${name}.png`,fullPage:false});}
async function layout(label){const x=await p.evaluate(()=>{const main=document.querySelector('.v7-main');const active=document.querySelector('.v7-screen.active');const app=document.querySelector('.v7-app');const rect=active?.getBoundingClientRect();return{activeId:active?.id||'',mainClient:main?.clientHeight||0,mainScroll:main?.scrollHeight||0,activeClient:active?.clientHeight||0,activeScroll:active?.scrollHeight||0,activeBottom:rect?Math.round(rect.bottom):0,viewport:innerHeight,bodyScroll:document.documentElement.scrollHeight,appH:app?.getBoundingClientRect().height||0}});report.screens.push({label,...x});console.log('[V12 DIAG]',label,JSON.stringify(x));return x;}

try{
  await p.goto(base,{waitUntil:'domcontentloaded'});
  await p.waitForSelector('#v7Onboard',{timeout:15000});
  await shot('00-onboard');
  await p.locator('#v7ClubName').fill('V12 Diagnostic FC');
  await p.locator('#v7ClubShort').fill('D12');
  await p.locator('#v7CreateClub').click();
  await p.waitForSelector('#v7-home.active',{timeout:10000});
  await layout('home');
  await shot('01-home');

  const navCount=await p.locator('.v7-nav button').count();
  for(let i=0;i<navCount;i++){
    const b=p.locator('.v7-nav button').nth(i);
    const txt=(await b.innerText()).trim().replace(/\s+/g,' ');
    if(!txt) continue;
    await b.click().catch(()=>{});
    await p.waitForTimeout(140);
    const info=await layout(`nav-${i}-${txt.slice(0,28)}`);
    if(i<6 || info.mainScroll>info.mainClient+2) await shot(`nav-${String(i).padStart(2,'0')}`);
  }

  await p.evaluate(()=>window.QF_V7_TEST.startFast());
  await p.waitForSelector('#v7-match.active',{timeout:8000});
  await p.waitForFunction(()=>window.QF_V7_TEST.match()?.v9,{timeout:8000});
  await p.waitForSelector('#v11MatchCanvas3D',{timeout:12000});
  await p.waitForFunction(()=>window.QF_MATCH_3D_V11?.state?.().frames>25,{timeout:15000});
  await p.waitForTimeout(700);
  await shot('90-match');
  const before=performance.now();
  const frames=await p.evaluate(()=>new Promise(resolve=>{let n=0,start=performance.now();function f(t){n++;if(t-start>=2500)resolve({n,ms:t-start});else requestAnimationFrame(f)}requestAnimationFrame(f)}));
  const state=await p.evaluate(()=>window.QF_MATCH_3D_V11.state());
  const matchInfo=await p.evaluate(()=>{const m=window.QF_V7_TEST.match();const c=document.querySelector('#v11MatchCanvas3D');const r=c?.getBoundingClientRect();const src=document.querySelector('#v7MatchCanvas');const sr=src?.getBoundingClientRect();return{homePlayers:m?.v9?.visual?.home?.length||0,awayPlayers:m?.v9?.visual?.away?.length||0,canvas:r?{x:r.x,y:r.y,w:r.width,h:r.height,display:getComputedStyle(c).display,opacity:getComputedStyle(c).opacity,visibility:getComputedStyle(c).visibility}:null,source:sr?{w:sr.width,h:sr.height,display:getComputedStyle(src).display,visibility:getComputedStyle(src).visibility}:null,audioDock:!!document.querySelector('#qfAudioDock'),commentary:window.QF_COMMENTARY_V10?.state?.()||null}});
  report.match={fps:+(frames.n/(frames.ms/1000)).toFixed(1),renderer:state,...matchInfo};
  console.log('[V12 DIAG] match',JSON.stringify(report.match));
  fs.writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));
  if(errors.length) console.log('[V12 DIAG] browser errors',errors.slice(0,8));
} finally {
  await ctx.close();
  await browser.close();
}
