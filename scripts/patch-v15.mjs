import fs from 'node:fs';

function rw(path, fn){const old=fs.readFileSync(path,'utf8');const next=fn(old);if(next!==old)fs.writeFileSync(path,next)}

rw('match3d-v13.js', s=>{
  if(s.includes('V15_BROADCAST_REALISM')) return s;
  s=s.replace('lastHudText="";','lastHudText="",camState=null;');
  s=s.replace(/7\.4\*stamina/g,'3.9*stamina').replace(/dt\*12\.5/g,'dt*7.2').replace(/dt\*5\.8/g,'dt*3.2');
  s=s.replace('const grassA=[.045,.28,.15,1],grassB=[.052,.34,.18,1],white=[.92,.96,.94,1]', 'const grassA=[.045,.28,.15,1],grassB=[.052,.34,.18,1],white=[1,1,.98,1]');
  s=s.replace(/const line=\(x,z,sx,sz\)=>add\(C,trs\(x,\.035,z,sx,\.018,sz\),white\);/, 'const line=(x,z,sx,sz)=>add(C,trs(x,.058,z,Math.max(sx,.075),.027,Math.max(sz,.075)),white);');
  s=s.replace('line(-43,0,.035,20);line(43,0,.035,20);if(q>0){line(-48.5,0,.035,9);line(48.5,0,.035,9)}',
`line(-43,0,.08,20);line(43,0,.08,20);
for(const side of[-1,1]){const px=side*47.85;line(px,-20,4.85,.08);line(px,20,4.85,.08);line(side*48.5,0,.08,9);const sx=side*50.6;line(sx,-9,2.1,.08);line(sx,9,2.1,.08);add(S,trs(side*42,.09,0,.13,.035,.13),white)}
add(S,trs(0,.09,0,.13,.035,.13),white);`);
  s=s.replace(/function camera\(src\)\{[\s\S]*?\}\nfunction render/,
`function camera(src){const f=src.v.visual.focus||{x:.5,y:.5},fx=(f.x-.5)*78,fz=(f.y-.5)*46,m=lastMoment,hot=m&&performance.now()-m.at<2100&&(m.type==="goal"||m.phase==="finish"||m.type==="save"||m.type==="post");let desired;if(hot){const side=m.side==="away"?-1:1;desired={eye:[fx-side*12.5,16.7,29],target:[fx*.88,1.45,fz*.82]}}else desired={eye:[fx-10.5,24.3,40.5],target:[fx*.78,1.18,fz*.60]};if(!camState)camState={eye:[...desired.eye],target:[...desired.target]};const a=hot?.085:.052;for(let i=0;i<3;i++){camState.eye[i]+=(desired.eye[i]-camState.eye[i])*a;camState.target[i]+=(desired.target[i]-camState.target[i])*a}return camState}
function render`);
  s=s.replace('scene=null;canvas=null;sourceCanvas=null;sizeCache=null}', 'scene=null;canvas=null;sourceCanvas=null;sizeCache=null;camState=null}');
  s+='\n/* V15_BROADCAST_REALISM: slower delta-time player springs, camera easing and high-contrast complete pitch markings. */\n';
  return s;
});

rw('match-flow-v11.js', s=>{
  s=s.replace('{at:820,phase:"delivery"','{at:1100,phase:"delivery"')
     .replace('{at:1580,phase:"finish"','{at:2350,phase:"finish"')
     .replace('{at:2260,phase:"result"','{at:3600,phase:"result"')
     .replace('busyUntil=now+Math.max(...seq.steps.map(x=>x.at))+900','busyUntil=now+Math.max(...seq.steps.map(x=>x.at))+1400');
  return s;
});

rw('runtime-v13.js', s=>s.replace(/Quiz Football V14/g,'Quiz Football V15').replace(/CHAIRMAN MODE • V14/g,'CHAIRMAN MODE • V15').replace(/textContent="V14"/g,'textContent="V15"').replace('version:"13.2.2"','version:"15.0.0"'));

rw('index.html', s=>{
  s=s.replace(/Quiz Football V14/g,'Quiz Football V15').replace(/<small>V14<\/small>/g,'<small>V15</small>');
  s=s.replace(/<link rel="stylesheet" href="v15\.css\?v=\d+"\s*\/?>\s*/g,'');
  s=s.replace(/<link rel="stylesheet" href="v13\.css\?v=\d+"\s*\/?>/, m=>`${m}\n  <link rel="stylesheet" href="v15.css?v=1500" />`);
  s=s.replace(/\s*<script src="commentary-v14\.js\?v=\d+"><\/script>/g,'');
  s=s.replace(/\s*<script src="commentary-v15\.js\?v=\d+"><\/script>/g,'');
  s=s.replace(/\s*<script src="broadcast-v15\.js\?v=\d+"><\/script>/g,'');
  s=s.replace(/<script src="match3d-v13\.js\?v=\d+"><\/script>/,
    '<script src="match3d-v13.js?v=1500"></script>\n  <script src="commentary-v15.js?v=1500"></script>\n  <script src="broadcast-v15.js?v=1500"></script>');
  s=s.replace(/runtime-v13\.js\?v=\d+/g,'runtime-v13.js?v=1500');
  s=s.replace(/audio-v13\.js\?v=\d+/g,'audio-v13.js?v=1500');
  s=s.replace(/v13\.css\?v=\d+/g,'v13.css?v=1500');
  return s;
});

rw('sw-v5.js', s=>{
  s=s.replace(/const CACHE='quizfootball-[^']+'/,"const CACHE='quizfootball-v15.0.0'");
  for(const f of ["'./commentary-v15.js'","'./broadcast-v15.js'","'./v15.css'"]){if(!s.includes(f))s=s.replace("'./runtime-v13.js'",`'./runtime-v13.js',${f}`)}
  return s;
});

console.log('V15 production patch applied: one-screen Quiz Arena, 2D/3D broadcast selector, slower highlight pacing, completed pitch markings, camera easing and instant V15 commentator.');
