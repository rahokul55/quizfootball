import fs from 'node:fs';
function rw(path,fn){const old=fs.readFileSync(path,'utf8'),next=fn(old);if(next!==old)fs.writeFileSync(path,next)}
rw('index.html',s=>{
  // Rebuild the fragile beginning of <head> from a stable anchor so malformed legacy metadata cannot survive.
  const theme='  <meta name="theme-color" content="#071018" />';
  const enhanced='  <link rel="stylesheet" href="enhancements-v4.css?v=500" />';
  const canonical=`${theme}\n  <meta name="description" content="Quiz Football V13 — akıcı 3D maç yayını, kulüp yönetimi ve futbol quiz deneyimi." />\n  <title>Quiz Football V13 — 3D Match Broadcast</title>\n  <link rel="stylesheet" href="styles.css?v=500" />\n`;
  if(s.includes(theme)&&s.includes(enhanced)) s=s.replace(new RegExp(theme.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[\\s\\S]*?(?='+enhanced.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')'),canonical);
  s=s.replace(/<small>V(?:11|12)<\/small>/g,'<small>V13</small>');

  // CSS is canonical and unique.
  s=s.replace(/\s*<link rel="stylesheet" href="v13\.css\?v=\d+" \/>/g,'');
  s=s.replace('<link rel="stylesheet" href="v12.css?v=1200" />','<link rel="stylesheet" href="v12.css?v=1200" />\n  <link rel="stylesheet" href="v13.css?v=1300" />');

  // Remove every legacy or duplicate match/audio runtime before inserting exactly one V13 stack.
  s=s.replace(/\s*<script src="(?:audio-v8|audio-v13|match3d-v10|match3d-v11|runtime-v12|commentary-v10|match3d-v13|commentary-v13|runtime-v13)\.js\?v=\d+"><\/script>/g,'');
  s=s.replace('  <script src="online-v7.js?v=700"></script>','  <script src="online-v7.js?v=700"></script>\n  <script src="audio-v13.js?v=1300"></script>');
  s=s.replace('  <script src="match-flow-v11.js?v=1100"></script>','  <script src="match-flow-v11.js?v=1100"></script>\n  <script src="match3d-v13.js?v=1300"></script>\n  <script src="commentary-v13.js?v=1300"></script>\n  <script src="runtime-v13.js?v=1300"></script>');
  return s;
});
rw('sw-v5.js',s=>{
  s=s.replace(/const CACHE='quizfootball-[^']+'/,"const CACHE='quizfootball-v13.1.0'");
  for(const f of["'./v13.css'","'./audio-v13.js'","'./match3d-v13.js'","'./commentary-v13.js'","'./runtime-v13.js'"]) if(!s.includes(f)) s=s.replace("'./icon.svg'",`${f},'./icon.svg'`);
  return s;
});
console.log('V13.1 canonical production wiring applied: repaired head, one 3D renderer, one audio engine, one commentator.');
