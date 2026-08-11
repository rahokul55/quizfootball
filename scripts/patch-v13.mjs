import fs from 'node:fs';
function rw(path,fn){const old=fs.readFileSync(path,'utf8'),next=fn(old);if(next!==old)fs.writeFileSync(path,next)}
rw('index.html',s=>{
  s=s.replace(/Quiz Football V11[^<]*/g,'Quiz Football V13 — 3D Match Broadcast');
  s=s.replace(/<title>[^<]*<\/title>/,'<title>Quiz Football V13 — 3D Match Broadcast</title>');
  s=s.replace(/<small>V11<\/small>/g,'<small>V13</small>');
  if(!s.includes('v13.css')) s=s.replace('<link rel="stylesheet" href="v12.css?v=1200" />','<link rel="stylesheet" href="v12.css?v=1200" />\n  <link rel="stylesheet" href="v13.css?v=1300" />');
  s=s.replace(/\s*<script src="audio-v8\.js\?v=800"><\/script>/g,'\n  <script src="audio-v13.js?v=1300"></script>');
  s=s.replace(/\s*<script src="match3d-v10\.js\?v=1000"><\/script>/g,'');
  s=s.replace(/\s*<script src="match3d-v11\.js\?v=1100"><\/script>/g,'');
  s=s.replace(/\s*<script src="runtime-v12\.js\?v=1200"><\/script>/g,'');
  s=s.replace(/\s*<script src="commentary-v10\.js\?v=1100"><\/script>/g,'');
  if(!s.includes('match3d-v13.js')) s=s.replace('  <script src="match-flow-v11.js?v=1100"></script>','  <script src="match-flow-v11.js?v=1100"></script>\n  <script src="match3d-v13.js?v=1300"></script>\n  <script src="commentary-v13.js?v=1300"></script>\n  <script src="runtime-v13.js?v=1300"></script>');
  return s;
});
rw('sw-v5.js',s=>{
  s=s.replace(/const CACHE='quizfootball-[^']+'/,"const CACHE='quizfootball-v13.0.0'");
  for(const f of["'./v13.css'","'./audio-v13.js'","'./match3d-v13.js'","'./commentary-v13.js'","'./runtime-v13.js'"]) if(!s.includes(f)) s=s.replace("'./icon.svg'",`${f},'./icon.svg'`);
  return s;
});
console.log('V13 authoritative 3D renderer, single commentary and readable viewport UI wired.');
