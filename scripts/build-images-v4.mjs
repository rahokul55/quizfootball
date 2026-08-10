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

async function jfetch(url,{tries=2,timeout=5500}={}){
  for(let i=0;i<tries;i++){
    try{
      const r=await fetch(url,{headers:{'user-agent':'quizfootball-image-resolver/4.3'},signal:AbortSignal.timeout(timeout)});
      if(r.ok)return await r.json();
      if(r.status===429)await sleep(900*(i+1));
    }catch{}
    if(i<tries-1)await sleep(180*(i+1));
  }
  return null;
}

async function summaryImage(title){
  const j=await jfetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,{tries:2,timeout:5000});
  return j?.thumbnail?.source||j?.originalimage?.source||'';
}
async function wikiSearch(q,size){
  const url=`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=${size}&pilicense=any`;
  const j=await jfetch(url,{tries:2,timeout:5500}),p=Object.values(j?.query?.pages||{})[0];
  return p?.thumbnail?.source||'';
}
async function wikiTitle(q,size){
  const url=`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=${size}&pilicense=any&titles=${encodeURIComponent(q)}`;
  const j=await jfetch(url,{tries:2,timeout:5500}),p=Object.values(j?.query?.pages||{})[0];
  return p?.thumbnail?.source||'';
}
async function sportsPlayer(name){
  const j=await jfetch(`https://www.thesportsdb.com/api/v1/json/123/searchplayers.php?p=${encodeURIComponent(name.replace(/\s+/g,'_'))}`,{tries:1,timeout:5500});
  const list=j?.player||[],p=list.find(x=>String(x.strSport||'').toLowerCase()==='soccer')||list[0];
  return p?.strCutout||p?.strThumb||'';
}
async function pool(entries,worker,n=8){let i=0;async function run(){while(i<entries.length){const e=entries[i++];await worker(e)}}await Promise.all(Array.from({length:n},run))}

// Exact REST summaries are fast, stable and avoid a search request for most famous clubs/players.
await pool(Object.entries(D.teams),async([id,t])=>{
  if(out.teams[id])return;
  let u=await summaryImage(t.wiki);
  if(!u)u=await summaryImage(t.name);
  if(!u)u=await wikiTitle(t.wiki,360);
  if(!u)u=await wikiSearch(t.wiki,360);
  if(u)out.teams[id]=u;else missing.teams.push(id);
},6);

const unresolvedPlayers=[];
await pool(Object.entries(D.players),async([id,p])=>{
  if(out.players[id])return;
  let u=await summaryImage(p.name);
  if(!u){
    const stripped=String(p.search||'').replace(/\s+footballer.*$/i,'').trim();
    if(stripped&&stripped!==p.name)u=await summaryImage(stripped);
  }
  if(u)out.players[id]=u;else unresolvedPlayers.push([id,p]);
},8);

// Only unresolved names use the heavier search API, with controlled concurrency.
await pool(unresolvedPlayers,async([id,p])=>{
  if(out.players[id])return;
  let u=await wikiSearch(p.search||`${p.name} footballer`,320);
  if(!u)u=await wikiSearch(`${p.name} footballer`,320);
  if(u)out.players[id]=u;
},3);

// Final fallback is deliberately throttled so the public sports endpoint is not flooded.
for(const [id,p] of unresolvedPlayers){
  if(out.players[id])continue;
  const u=await sportsPlayer(p.name);
  if(u)out.players[id]=u;
  await sleep(2100);
}

missing.teams=Object.keys(D.teams).filter(id=>!out.teams[id]);
missing.players=Object.keys(D.players).filter(id=>!out.players[id]);
await fs.writeFile('images-v4.js',`window.QF_IMAGES=${JSON.stringify(out)};\n`);
await fs.writeFile('image-report.json',JSON.stringify({generatedAt:out.generatedAt,teamCount:Object.keys(out.teams).length,totalTeams:Object.keys(D.teams).length,playerCount:Object.keys(out.players).length,totalPlayers:Object.keys(D.players).length,missing},null,2));
console.log(`images: ${Object.keys(out.teams).length}/${Object.keys(D.teams).length} teams, ${Object.keys(out.players).length}/${Object.keys(D.players).length} players`);
if(missing.teams.length||missing.players.length)console.log('missing',missing);
