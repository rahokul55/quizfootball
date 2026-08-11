import { chromium } from 'playwright-core';
import fs from 'node:fs';
const bins=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'];
const executablePath=bins.find(p=>fs.existsSync(p));if(!executablePath)throw new Error('Chrome missing');
const base=process.env.QF_TEST_BASE||'http://127.0.0.1:4187/';
const browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const ctx=await browser.newContext({viewport:{width:1366,height:768}}),p=await ctx.newPage();
const fail=m=>{throw new Error(m)};
try{
 await p.goto(base,{waitUntil:'domcontentloaded'});await p.waitForSelector('#v7Onboard',{timeout:15000});
 await p.locator('#v7ClubName').fill('V14 Smooth FC');await p.locator('#v7ClubShort').fill('V14');await p.locator('#v7CreateClub').click();
 await p.waitForFunction(()=>!!window.QF_MATCH_3D_V13&&!!window.QF_COMMENTARY_V14,{timeout:10000});
 await p.evaluate(()=>window.QF_V7_TEST.startFast());await p.waitForSelector('#v7-match.active',{timeout:8000});await p.waitForFunction(()=>window.QF_MATCH_3D_V13.state().active,{timeout:10000});
 await p.waitForTimeout(1200);
 const scripts=await p.evaluate(()=>({details:[...document.scripts].filter(s=>/match-details-v10\.js/.test(s.src)).length,c13:[...document.scripts].filter(s=>/commentary-v13\.js/.test(s.src)).length,c14:[...document.scripts].filter(s=>/commentary-v14\.js/.test(s.src)).length}));
 if(scripts.details!==1)fail(`match-details loaded ${scripts.details} times`);if(scripts.c13!==0||scripts.c14!==1)fail(`commentary wiring wrong ${JSON.stringify(scripts)}`);
 await p.evaluate(()=>{window.QF_MATCH_3D_V13.setSetting('quality','low');window.QF_MATCH_3D_V13.forceQuality('low')});await p.waitForTimeout(500);
 const state=await p.evaluate(()=>window.QF_MATCH_3D_V13.state());if(state.targetFps!==60)fail(`low quality still targets ${state.targetFps}fps`);
 const smooth=await p.evaluate(()=>new Promise(resolve=>{const m=window.QF_V7_TEST.match(),pl=m.v9.visual.home[2];pl.tx=Math.min(.9,pl.x+.18);const xs=[],times=[];let last=performance.now(),n=0;function f(t){times.push(t-last);last=t;xs.push(pl.x);if(++n>=45){const distinct=new Set(xs.map(x=>x.toFixed(5))).size;times.sort((a,b)=>a-b);resolve({distinct,p50:times[Math.floor(times.length*.5)],p95:times[Math.floor(times.length*.95)],max:Math.max(...times)});return}requestAnimationFrame(f)}requestAnimationFrame(f)}));
 if(smooth.distinct<20)fail(`player motion updates too sparsely: ${JSON.stringify(smooth)}`);if(smooth.p50>26)fail(`median frametime too high: ${smooth.p50}`);if(smooth.p95>75)fail(`p95 frametime too high: ${smooth.p95}`);
 await p.evaluate(()=>window.QF_COMMENTARY_V14.resetDedupe());const before=await p.evaluate(()=>window.QF_COMMENTARY_V14.state().speeches);await p.evaluate(()=>{window.QF_COMMENTARY_V14.test('goal');setTimeout(()=>window.QF_COMMENTARY_V14.test('goal'),320)});await p.waitForTimeout(1000);const after=await p.evaluate(()=>window.QF_COMMENTARY_V14.state());if(after.speeches-before>1)fail(`duplicate goal speech detected: ${JSON.stringify(after)}`);if(after.deduped<1)fail('dedupe guard did not catch repeated event');
 console.log('V14 PERF PASS',JSON.stringify({state,smooth,commentary:after,scripts}));
}finally{await ctx.close();await browser.close()}
