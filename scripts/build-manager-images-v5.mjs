import fs from 'node:fs/promises';
import vm from 'node:vm';
const raw=await fs.readFile('data-v5.js','utf8');
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(raw,sandbox);const M=sandbox.window.QF_V5.managers;
let seed={};try{const old=await fs.readFile('manager-images-v5.js','utf8');const s={window:{}};vm.createContext(s);vm.runInContext(old,s);seed=s.window.QF_MANAGER_IMAGES||{}}catch{}
const out={...seed};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function jfetch(url,tries=2){for(let i=0;i<tries;i++){try{const r=await fetch(url,{headers:{'user-agent':'quizfootball-manager-image-resolver/5.0'},signal:AbortSignal.timeout(5500)});if(r.ok)return await r.json()}catch{}if(i<tries-1)await sleep(180*(i+1))}return null}
async function summary(name){const titles=[name,name.replace(/ /g,'_')];for(const t of titles){const j=await jfetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t)}`);const u=j?.thumbnail?.source||j?.originalimage?.source;if(u)return u}return''}
async function search(q){const j=await jfetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=360&origin=*`);const p=Object.values(j?.query?.pages||{})[0];return p?.thumbnail?.source||''}
let i=0;const entries=Object.entries(M);async function worker(){while(i<entries.length){const [id,m]=entries[i++];if(out[id])continue;let u=await summary(m.name);if(!u)u=await search(m.search);if(u)out[id]=u}}
await Promise.all(Array.from({length:6},worker));
await fs.writeFile('manager-images-v5.js',`window.QF_MANAGER_IMAGES=${JSON.stringify(out)};\n`);
const missing=Object.keys(M).filter(id=>!out[id]);await fs.writeFile('manager-image-report-v5.json',JSON.stringify({found:Object.keys(out).length,total:Object.keys(M).length,missing},null,2));
console.log(`manager images: ${Object.keys(out).length}/${Object.keys(M).length}`);if(missing.length)console.log('missing managers',missing);
