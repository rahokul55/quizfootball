import fs from 'node:fs';
function rw(path,fn){const old=fs.readFileSync(path,'utf8'),next=fn(old);if(next!==old)fs.writeFileSync(path,next)}
rw('index.html',s=>{
  if(!s.includes('v12.css')) s=s.replace('<link rel="stylesheet" href="v11.css?v=1100" />','<link rel="stylesheet" href="v11.css?v=1100" />\n  <link rel="stylesheet" href="v12.css?v=1200" />');
  if(!s.includes('runtime-v12.js')) s=s.replace('  <script src="commentary-v10.js?v=1100"></script>','  <script src="runtime-v12.js?v=1200"></script>\n  <script src="commentary-v10.js?v=1100"></script>');
  return s;
});
rw('sw-v5.js',s=>{
  for(const f of["'./v12.css'","'./runtime-v12.js'"]) if(!s.includes(f)) s=s.replace("'./icon.svg'",`${f},'./icon.svg'`);
  return s;
});
console.log('V12 viewport/performance/live-crowd runtime wired.');
