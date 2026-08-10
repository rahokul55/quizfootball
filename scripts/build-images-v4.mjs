import fs from 'node:fs/promises';
import vm from 'node:vm';

const raw=await fs.readFile('data.js','utf8');
const sandbox={window:{}};
vm.createContext(sandbox);
vm.runInContext(raw,sandbox);
const D=sandbox.window.QF_DATA;

let seed={teams:{},players:{}};
try{
  const old=await fs.readFile('images-v4.js','utf8');
  const s={window:{}};vm.createContext(s);vm.runInContext(old,s);seed=s.window.QF_IMAGES||seed;
}catch{}
const out={teams:{...(seed.teams||{})},players:{...(seed.players||{})},generatedAt:new Date().toISOString()};
const missing={teams:[],players:[]};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function jfetch(url,tries=3){for(let i=0;i<tries;i++){try{const r=await fetch(url,{headers:{'user-agent':'quizfootball-image-resolver/4.2'},signal:AbortSignal.timeout(6500)});if(r.ok)return await r.json();if(r.status===429)await sleep(700*(i+1));}catch{}if(i<tries-1)await sleep(220*(i+1))}return null}
async function wiki(q,exact,size){const url=exact?`https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=${size}&pilicense=any&titles=${encodeURIComponent(q)}`:`https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=${size}&pilicense=any`;const j=await jfetch(url),p=Object.values(j?.query?.pages||{})[0];return p?.thumbnail?.source||''}
async function sportsPlayer(name){const j=await jfetch(`https://www.thesportsdb.com/api/v1/json/123/searchplayers.php?p=${encodeURIComponent(name.replace(/\s+/g,'_'))}`);const list=j?.player||[],p=list.find(x=>String(x.strSport||'').toLowerCase()==='soccer')||list[0];return p?.strCutout||p?.strThumb||''}
async function pool(entries,worker,n=10){let i=0;async function run(){while(i<entries.length){const e=entries[i++];await worker(e)}}await Promise.all(Array.from({length:n},run))}

await pool(Object.entries(D.teams),async([id,t])=>{if(out.teams[id])return;let u=await wiki(t.wiki,true,360);if(!u)u=await wiki(t.wiki,false,360);if(u)out.teams[id]=u;else missing.teams.push(id)},8);
await pool(Object.entries(D.players),async([id,p])=>{if(out.players[id])return;let u=await wiki(p.search,false,320);if(!u)u=await sportsPlayer(p.name);if(u)out.players[id]=u;else missing.players.push(id)},10);

await fs.writeFile('images-v4.js',`window.QF_IMAGES=${JSON.stringify(out)};\n`);
await fs.writeFile('image-report.json',JSON.stringify({generatedAt:out.generatedAt,teamCount:Object.keys(out.teams).length,totalTeams:Object.keys(D.teams).length,playerCount:Object.keys(out.players).length,totalPlayers:Object.keys(D.players).length,missing},null,2));
console.log(`images: ${Object.keys(out.teams).length}/${Object.keys(D.teams).length} teams, ${Object.keys(out.players).length}/${Object.keys(D.players).length} players`);
if(missing.teams.length||missing.players.length)console.log('missing',missing);
