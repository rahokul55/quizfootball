import fs from 'node:fs/promises';
import vm from 'node:vm';
const raw=await fs.readFile('data-v5.js','utf8');
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(raw,sandbox);const M=sandbox.window.QF_V5.managers;
let seed={};try{const old=await fs.readFile('manager-images-v5.js','utf8');const s={window:{}};vm.createContext(s);vm.runInContext(old,s);seed=s.window.QF_MANAGER_IMAGES||{}}catch{}
const out={...seed},sleep=ms=>new Promise(r=>setTimeout(r,ms));
const aliases={vangaal:'Louis van Gaal',luisenrique:'Luis Enrique',nuno:'Nuno Espírito Santo',avb:'André Villas-Boas',deboer:'Frank de Boer',tenhag:'Erik ten Hag'};
async function jfetch(url,{tries=3,timeout=6500}={}){for(let i=0;i<tries;i++){try{const r=await fetch(url,{headers:{'user-agent':'quizfootball-manager-image-resolver/5.1'},signal:AbortSignal.timeout(timeout)});if(r.ok)return await r.json();if(r.status===429)await sleep(900*(i+1))}catch{}if(i<tries-1)await sleep(250*(i+1))}return null}
async function summary(title){const j=await jfetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,{tries:2,timeout:5500});return j?.thumbnail?.source||j?.originalimage?.source||''}
async function titleImage(title){const j=await jfetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=420&pilicense=any&titles=${encodeURIComponent(title)}`,{tries:3}),p=Object.values(j?.query?.pages||{})[0];return p?.thumbnail?.source||''}
async function search(q){const j=await jfetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=3&prop=pageimages&piprop=thumbnail&pithumbsize=420&pilicense=any`,{tries:3}),pages=Object.values(j?.query?.pages||{});const p=pages.find(x=>x.thumbnail?.source)||pages[0];return p?.thumbnail?.source||''}
async function commons(q){const j=await jfetch(`https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(q+' football manager portrait')}&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=420`,{tries:2}),pages=Object.values(j?.query?.pages||{});for(const p of pages){const u=p?.imageinfo?.[0]?.thumburl||p?.imageinfo?.[0]?.url;if(u)return u}return''}
const unresolved=[];
for(const [id,m] of Object.entries(M)){if(out[id])continue;const base=aliases[id]||m.name;let u=await summary(base);if(!u)u=await titleImage(base);if(!u)u=await summary(m.name);if(!u)u=await titleImage(m.name);if(u)out[id]=u;else unresolved.push([id,m]);await sleep(120)}
for(const [id,m] of unresolved){if(out[id])continue;const base=aliases[id]||m.name;let u=await search(`${base} football manager`);if(!u)u=await search(base);if(!u)u=await commons(base);if(u)out[id]=u;await sleep(500)}
await fs.writeFile('manager-images-v5.js',`window.QF_MANAGER_IMAGES=${JSON.stringify(out)};\n`);
const missing=Object.keys(M).filter(id=>!out[id]);await fs.writeFile('manager-image-report-v5.json',JSON.stringify({found:Object.keys(out).length,total:Object.keys(M).length,missing},null,2));
console.log(`manager images: ${Object.keys(out).length}/${Object.keys(M).length}`);if(missing.length){console.log('missing managers',missing);process.exitCode=2}
