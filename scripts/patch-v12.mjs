import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
function rw(path,fn){const old=fs.readFileSync(path,'utf8'),next=fn(old);if(next!==old)fs.writeFileSync(path,next)}
rw('index.html',s=>{
  if(!s.includes('v12.css')) s=s.replace('<link rel="stylesheet" href="v11.css?v=1100" />','<link rel="stylesheet" href="v11.css?v=1100" />\n  <link rel="stylesheet" href="v12.css?v=1200" />');
  if(!s.includes('runtime-v12.js')) s=s.replace('  <script src="commentary-v10.js?v=1100"></script>','  <script src="runtime-v12.js?v=1200"></script>\n  <script src="commentary-v10.js?v=1100"></script>');
  return s;
});
rw('runtime-v12.js',s=>s.replace('if(fps<30)fallback', 'if(fps<45)fallback').replace('document.body.classList.add("v12-smooth-renderer","v12-low-motion")','document.body.classList.add("v12-smooth-renderer","v12-low-motion","performance-lite")'));
rw('match3d-v11.js',s=>s.replace('if(!cfg.enabled||!src){if(!src)detach(false);raf=requestAnimationFrame(tick);return}', 'if(!cfg.enabled||!src){if(scene||activeCanvas||sourceCanvas)detach(false);setTimeout(()=>{raf=requestAnimationFrame(tick)},240);return}').replace('if(!cfg.enabled||!src){if(scene||activeCanvas||sourceCanvas)detach(false);raf=requestAnimationFrame(tick);return}', 'if(!cfg.enabled||!src){if(scene||activeCanvas||sourceCanvas)detach(false);setTimeout(()=>{raf=requestAnimationFrame(tick)},240);return}'));
rw('match3d-v10.js',s=>s.replace('if(!cfg.enabled||!src){if(!src)detach();raf=requestAnimationFrame(tick);return}', 'if(!cfg.enabled||!src){if(scene||activeCanvas||sourceCanvas)detach();setTimeout(()=>{raf=requestAnimationFrame(tick)},240);return}').replace('if(!cfg.enabled||!src){if(scene||activeCanvas||sourceCanvas)detach();raf=requestAnimationFrame(tick);return}', 'if(!cfg.enabled||!src){if(scene||activeCanvas||sourceCanvas)detach();setTimeout(()=>{raf=requestAnimationFrame(tick)},240);return}'));
rw('match-v9.js',s=>{
  s=s.replace('function pitch(g,w,h){const bg=', 'function pitch(g,w,h){const lite=document.body.classList.contains("performance-lite");const bg=');
  s=s.replace('for(let i=0;i<72;i++){', 'for(let i=0;i<(lite?12:72);i++){');
  s=s.replace('for(let i=0;i<10;i++){const y0=i/10,y1=(i+1)/10,c=i%2?COLORS.grass1:COLORS.grass2;', 'for(let i=0;i<(lite?6:10);i++){const bands=lite?6:10,y0=i/bands,y1=(i+1)/bands,c=i%2?COLORS.grass1:COLORS.grass2;');
  s=s.replace('const far=g.createLinearGradient(0,0,0,60);far.addColorStop(0,"rgba(103,181,255,.28)");far.addColorStop(1,"rgba(103,181,255,0)");g.fillStyle=far;g.fillRect(0,0,w,75)', 'if(!lite){const far=g.createLinearGradient(0,0,0,60);far.addColorStop(0,"rgba(103,181,255,.28)");far.addColorStop(1,"rgba(103,181,255,0)");g.fillStyle=far;g.fillRect(0,0,w,75)}');
  s=s.replace('function player(g,w,h,p,color,ctx){const [x,y]=project(w,h,p.x,p.y),pers=.70+p.y*.42,r=7.2*pers;', 'function player(g,w,h,p,color,ctx){const [x,y]=project(w,h,p.x,p.y),pers=.70+p.y*.42,r=7.2*pers,lite=document.body.classList.contains("performance-lite");if(lite){g.fillStyle=color;g.beginPath();g.arc(x,y,r*.88,0,Math.PI*2);g.fill();g.fillStyle="#fff";g.font=`700 ${Math.max(7,8*pers)}px system-ui`;g.textAlign="center";g.textBaseline="middle";g.fillText(String(p.num),x,y);return}');
  return s;
});
rw('sw-v5.js',s=>{
  for(const f of["'./v12.css'","'./runtime-v12.js'"]) if(!s.includes(f)) s=s.replace("'./icon.svg'",`${f},'./icon.svg'`);
  return s;
});
if(process.env.GITHUB_ACTIONS==='true'){
  try{execFileSync('git',['add','runtime-v12.js','match3d-v11.js','match3d-v10.js','match-v9.js'],{stdio:'ignore'})}catch{}
}
console.log('V12 viewport/performance/live-crowd runtime wired.');
