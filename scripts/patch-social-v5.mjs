import fs from 'node:fs/promises';
let s=await fs.readFile('app-v5.js','utf8'),n=0;
if(!s.includes('function sendReaction(')){
  const anchor='function startPingLoop(){',at=s.indexOf(anchor);if(at<0)throw new Error('social insertion anchor missing');
  const code=`function showReaction(name,emoji){const allowed=["🔥","👏","⚽","🤯","😂","👍"];if(!allowed.includes(emoji))return;const el=document.createElement("div");el.className="reaction-pop";el.innerHTML=\`<b>\${esc(name||"Oyuncu")}</b><span>\${emoji}</span>\`;document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add("show"));setTimeout(()=>{el.classList.remove("show");setTimeout(()=>el.remove(),260)},1650)}
function sendReaction(emoji){const allowed=["🔥","👏","⚽","🤯","😂","👍"];if(!allowed.includes(emoji))return;const name=S.players[me]?.name||profile.username||"Oyuncu";showReaction(name,emoji);if(isHost)broadcast("reaction",{name,emoji});else send(hostConn,"reaction",{name,emoji})}
`;
  s=s.slice(0,at)+code+s.slice(at);n++
}
if(!s.includes('guestMsgReactionV5')){
  const ping='else if(m.type==="ping")send(c,"pong",{t:x.t})';
  if(!s.includes(ping))throw new Error('guest reaction routing anchor missing');
  const route='else if(m.type==="reaction"){const emoji=String(x.emoji||"");const allowed=["🔥","👏","⚽","🤯","😂","👍"];if(allowed.includes(emoji)){const name=S.players[c.peer]?.name||x.name||"Oyuncu";showReaction(name,emoji);conns.forEach((conn,id)=>{if(id!==c.peer)send(conn,"reaction",{name,emoji})})}}/*guestMsgReactionV5*/else if(m.type==="ping")send(c,"pong",{t:x.t})';
  s=s.replace(ping,route);n++
}
if(!s.includes('hostMsgReactionV5')){
  const result='else if(m.type==="result"){x.good?okSound():wrongSound()}';
  if(!s.includes(result))throw new Error('host reaction receive anchor missing');
  s=s.replace(result,'else if(m.type==="reaction"){showReaction(x.name,x.emoji)}else if(m.type==="result"){x.good?okSound():wrongSound()}/*hostMsgReactionV5*/');n++
}
if(!s.includes('id="reactionBar"')){
  const wire='function wire(){',at=s.indexOf(wire);if(at<0)throw new Error('wire anchor missing'),pos=s.indexOf('{',at)+1;
  s=s.slice(0,pos)+'if(!document.getElementById("reactionBar")){const panel=document.querySelector(".activity-panel");if(panel){panel.insertAdjacentHTML("beforeend",`<div id="reactionBar" class="reaction-bar"><small>TEPKİ</small>${["🔥","👏","⚽","🤯","😂","👍"].map(e=>`<button type="button" data-react="${e}" aria-label="${e} tepkisi gönder">${e}</button>`).join("")}</div>`);panel.querySelectorAll("[data-react]").forEach(b=>b.onclick=()=>sendReaction(b.dataset.react))}}'+s.slice(pos);n++
}
if(!s.includes('window.QFSocial={react:sendReaction}')){s=s.replace('wire();\n})();','window.QFSocial={react:sendReaction};\nwire();\n})();');n++}
await fs.writeFile('app-v5.js',s);console.log(`Social V5 patches applied: ${n}`);
for(const marker of ['function sendReaction(','guestMsgReactionV5','hostMsgReactionV5','reactionBar'])if(!s.includes(marker))throw new Error(`social reactions patch incomplete: ${marker}`);
