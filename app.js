(()=>{"use strict";
const D=window.QF_DATA,$=id=>document.getElementById(id),MAX=4;
const U={
  home:$("homeScreen"),lobby:$("lobbyScreen"),game:$("gameScreen"),final:$("finalScreen"),
  createName:$("createName"),joinName:$("joinName"),joinCode:$("joinCode"),createRoomBtn:$("createRoomBtn"),joinRoomBtn:$("joinRoomBtn"),
  roomCodeText:$("roomCodeText"),copyRoomBtn:$("copyRoomBtn"),lobbyPlayers:$("lobbyPlayers"),roundCountSelect:$("roundCountSelect"),choiceCountSelect:$("choiceCountSelect"),formatPreview:$("formatPreview"),
  startGameBtn:$("startGameBtn"),hostHint:$("hostHint"),scorePlayers:$("scorePlayers"),roundProgress:$("roundProgress"),progressBar:$("progressBar"),finalStageChip:$("finalStageChip"),gameModeChip:$("gameModeChip"),
  roundStatus:$("roundStatus"),teamALogo:$("teamALogo"),teamBLogo:$("teamBLogo"),teamAName:$("teamAName"),teamBName:$("teamBName"),answerGrid:$("answerGrid"),resultFlash:$("resultFlash"),selectionFeed:$("selectionFeed"),
  winnerTitle:$("winnerTitle"),winnerSubtitle:$("winnerSubtitle"),finalScores:$("finalScores"),playAgainBtn:$("playAgainBtn"),backHomeBtn:$("backHomeBtn"),soundBtn:$("soundBtn"),fullscreenBtn:$("fullscreenBtn"),brandBtn:$("brandBtn"),toast:$("toast")
};
let peer=null,hostConn=null,conns=new Map,isHost=false,room="",me="",sound=localStorage.getItem("qf-sound")!=="0",audio=null,anthem=null,tt;
let imgCache=safeJSON(localStorage.getItem("qf-img"),{}),imgPromises=new Map(),warmedUrls=new Set(),preloadQueue=[],preloadActive=0,lobbyWarmed=false;
let S=blank();
function safeJSON(v,f){try{return JSON.parse(v)||f}catch{return f}}
function blank(){return{status:"home",hostId:null,players:{},settings:{roundCount:100,optionCount:6},deck:[],roundIndex:-1,currentCard:null,options:[],selections:{},locked:false,winnerId:null,correctAnswerId:null,preload:[]}}
function screen(n){["home","lobby","game","final"].forEach(k=>U[k].classList.toggle("active",k===n))}
function toast(x){clearTimeout(tt);U.toast.textContent=x;U.toast.classList.add("show");tt=setTimeout(()=>U.toast.classList.remove("show"),1600)}
function esc(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function name(x){return String(x||"").trim().replace(/[<>]/g,"").slice(0,18)}
function code(x){return String(x||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,8)}
function mkcode(){const a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",v=new Uint32Array(6);crypto.getRandomValues(v);return[...v].map(n=>a[n%a.length]).join("")}
function hostId(c){return"quizfootball-"+c.toLowerCase()}
function initials(x){return String(x||"?").split(/\s+/).slice(0,2).map(v=>v[0]||"").join("").toUpperCase()}
function shuf(a,r=Math.random){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function rng(str){let h=2166136261;for(let c of str){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return()=>{h+=0x6D2B79F5;let r=h;r=Math.imul(r^r>>>15,r|1);r^=r+Math.imul(r^r>>>7,r|61);return((r^r>>>14)>>>0)/4294967296}}
function active(){return Object.values(S.players).filter(p=>p.active!==false)}
function card(id){return D.cards.find(c=>c.id===id)}
function normalizedOptionCount(v){v=+v;return[4,6,8].includes(v)?v:6}
function options(c,count=normalizedOptionCount(S.settings.optionCount)){
  const r=rng(c.id+":"+count),answer=D.players[c.answer],target=count-1;
  const safe=Object.values(D.players).filter(p=>p.id!==c.answer&&!(p.clubs.includes(c.teamA)&&p.clubs.includes(c.teamB)));
  const A=shuf(safe.filter(p=>p.clubs.includes(c.teamA)&&!p.clubs.includes(c.teamB)),r);
  const B=shuf(safe.filter(p=>p.clubs.includes(c.teamB)&&!p.clubs.includes(c.teamA)),r);
  const rest=shuf(safe.filter(p=>!A.some(x=>x.id===p.id)&&!B.some(x=>x.id===p.id)),r),pick=[];
  let ai=0,bi=0;
  while(pick.length<target&&(ai<A.length||bi<B.length)){
    const pool=pick.length%2===0?A:B,idx=pick.length%2===0?ai++:bi++;
    const p=pool[idx];if(p&&!pick.some(x=>x.id===p.id))pick.push(p);
    if(!p){const alt=pool===A?B[bi++]:A[ai++];if(alt&&!pick.some(x=>x.id===alt.id))pick.push(alt)}
  }
  for(const p of [...A.slice(ai),...B.slice(bi),...rest]){if(pick.length>=target)break;if(!pick.some(x=>x.id===p.id))pick.push(p)}
  return shuf([answer,...pick.slice(0,target)],r).map(p=>p.id)
}
function preloadPlan(){if(!isHost||S.status!=="playing")return S.preload||[];return S.deck.slice(S.roundIndex+1,S.roundIndex+3).map(id=>{const c=card(id);return c?{teamA:c.teamA,teamB:c.teamB,options:options(c)}:null}).filter(Boolean)}
function snap(){return{status:S.status,hostId:S.hostId,players:S.players,settings:S.settings,roundIndex:S.roundIndex,totalRounds:S.deck.length||S.settings.roundCount,currentCard:S.currentCard?{id:S.currentCard.id,teamA:S.currentCard.teamA,teamB:S.currentCard.teamB}:null,options:S.options,selections:S.selections,locked:S.locked,winnerId:S.winnerId,correctAnswerId:S.locked?S.correctAnswerId:null,preload:preloadPlan()}}
function send(c,t,p={}){if(c?.open)c.send({type:t,payload:p})}
function bcast(t,p={}){conns.forEach(c=>send(c,t,p))}
function sync(){if(isHost){S.preload=preloadPlan();bcast("state",snap());render()}}
function destroy(){try{hostConn?.close()}catch{}conns.forEach(c=>{try{c.close()}catch{}});conns.clear();try{peer?.destroy()}catch{}peer=hostConn=null}
function hostRoom(n){
  destroy();isHost=true;room=mkcode();let tries=0;
  const go=()=>{peer=new Peer(hostId(room),{debug:0});peer.on("open",id=>{me=id;S=blank();S.status="lobby";S.hostId=id;S.players[id]={id,name:n,score:0,host:true,active:true};S.settings.roundCount=+U.roundCountSelect.value||100;S.settings.optionCount=normalizedOptionCount(U.choiceCountSelect.value);render()});peer.on("connection",c=>{c.on("data",m=>guestMsg(c,m));c.on("close",()=>drop(c.peer));c.on("error",()=>drop(c.peer))});peer.on("error",e=>{if(e.type==="unavailable-id"&&tries++<4){try{peer.destroy()}catch{}room=mkcode();return setTimeout(go,100)}toast("Oda bağlantısı kurulamadı")})};go()
}
function guestMsg(c,m){if(!m)return;if(m.type==="join"){if(S.status!=="lobby")return send(c,"reject",{reason:"Oyun başladı."});if(active().length>=MAX)return send(c,"reject",{reason:"Oda dolu."});let n=name(m.payload?.name)||"Oyuncu";conns.set(c.peer,c);S.players[c.peer]={id:c.peer,name:n,score:0,active:true};send(c,"welcome",{playerId:c.peer,roomCode:room,state:snap()});sync();toast(n+" katıldı")}else if(m.type==="select"&&S.players[c.peer])choose(c.peer,m.payload?.optionId,m.payload?.cardId)}
function drop(id){conns.delete(id);if(!S.players[id])return;if(S.status==="lobby")delete S.players[id];else S.players[id].active=false;sync();checkSpent()}
function join(n,c){destroy();isHost=false;room=c;peer=new Peer();peer.on("open",id=>{me=id;hostConn=peer.connect(hostId(c),{reliable:true});hostConn.on("open",()=>send(hostConn,"join",{name:n}));hostConn.on("data",hostMsg);hostConn.on("close",()=>{toast("Kurucu bağlantısı kesildi");setTimeout(home,1200)})});peer.on("error",e=>toast(e.type==="peer-unavailable"?"Oda bulunamadı":"Bağlantı hatası"))}
function hostMsg(m){if(!m)return;if(m.type==="reject"){toast(m.payload.reason||"Giriş reddedildi");return setTimeout(home,1000)}if(m.type==="welcome"){me=m.payload.playerId;room=m.payload.roomCode;Object.assign(S,m.payload.state);render()}if(m.type==="state"){Object.assign(S,m.payload);render()}if(m.type==="result"){m.payload.winnerId?okSound():revealSound()}}
function start(){if(!isHost||active().length<2)return toast("En az 2 oyuncu gerekli");Object.values(S.players).forEach(p=>p.score=0);S.settings.optionCount=normalizedOptionCount(S.settings.optionCount);S.deck=shuf(D.cards).slice(0,Math.min(+S.settings.roundCount||100,D.cards.length)).map(c=>c.id);S.roundIndex=-1;S.status="playing";next()}
function next(){if(!isHost)return;if(++S.roundIndex>=S.deck.length)return finish();let c=card(S.deck[S.roundIndex]);S.currentCard=c;S.options=options(c);S.selections={};S.locked=false;S.winnerId=null;S.correctAnswerId=c.answer;S.preload=preloadPlan();primeVisible(c,S.options);primePlan(S.preload);sync();if((S.roundIndex+1)/S.deck.length>=.82)startAnthem()}
function localChoose(id){ensureAudio();if(S.locked||S.selections[me])return;isHost?choose(me,id,S.currentCard.id):send(hostConn,"select",{optionId:id,cardId:S.currentCard.id})}
function choose(pid,opt,cid){if(!isHost||S.status!=="playing"||S.locked||S.currentCard?.id!==cid||S.selections[pid]||!S.options.includes(opt))return;let good=opt===S.currentCard.answer;S.selections[pid]={optionId:opt,correct:good};if(good){S.locked=true;S.winnerId=pid;S.players[pid].score=(S.players[pid].score||0)+1;bcast("result",{winnerId:pid});sync();okSound();setTimeout(next,620)}else{sync();checkSpent()}}
function checkSpent(){if(!isHost||S.locked||S.status!=="playing")return;let a=active();if(a.length&&a.every(p=>S.selections[p.id])){S.locked=true;bcast("result",{winnerId:null});sync();revealSound();setTimeout(next,760)}}
function finish(){S.status="final";S.currentCard=null;S.options=[];S.locked=true;S.preload=[];sync();startAnthem(true)}
function again(){if(!isHost)return;stopAnthem();S.status="lobby";S.deck=[];S.roundIndex=-1;S.currentCard=null;S.options=[];S.selections={};S.locked=false;S.preload=[];Object.values(S.players).forEach(p=>p.score=0);sync()}
function home(){stopAnthem();destroy();S=blank();isHost=false;room=me="";history.replaceState({},"",location.pathname);screen("home")}
function render(){if(S.status==="lobby"){screen("lobby");renderLobby()}else if(S.status==="playing"){screen("game");renderGame()}else if(S.status==="final"){screen("final");renderFinal()}else screen("home");U.soundBtn.textContent=sound?"🔊":"🔇"}
function renderLobby(){
  U.roomCodeText.textContent=room;
  U.lobbyPlayers.innerHTML=active().map(p=>`<div class="lobby-player"><div class="player-meta"><div class="avatar-dot">${esc(initials(p.name))}</div><div><b>${esc(p.name)}</b><small>${p.host?"Oda kurucusu":"Hazır"}</small></div></div><div>${p.host?'<span class="badge">KURUCU</span>':""} <i class="online-dot"></i></div></div>`).join("");
  U.roundCountSelect.disabled=!isHost;U.roundCountSelect.value=S.settings.roundCount;
  U.choiceCountSelect.disabled=!isHost;U.choiceCountSelect.value=normalizedOptionCount(S.settings.optionCount);
  U.formatPreview.textContent=`${S.settings.roundCount} kart • ${normalizedOptionCount(S.settings.optionCount)} seçenek • süre yok`;
  U.startGameBtn.style.display=isHost?"":"none";U.startGameBtn.disabled=active().length<2;
  U.hostHint.textContent=isHost?(active().length<2?"Bir arkadaşının katılmasını bekle.":active().length+" oyuncu hazır."):"Maç ayarlarını kurucu belirler.";
  if(!lobbyWarmed){lobbyWarmed=true;idle(()=>warmAllTeamLogos())}
}
function renderGame(){
  let c=S.currentCard;if(!c)return;let a=D.teams[c.teamA],b=D.teams[c.teamB],tot=S.deck.length||S.totalRounds||100,cur=S.roundIndex+1,count=normalizedOptionCount(S.settings.optionCount);
  U.teamAName.textContent=a.short;U.teamBName.textContent=b.short;teamImg(U.teamALogo,c.teamA);teamImg(U.teamBLogo,c.teamB);
  U.roundProgress.textContent=`${cur} / ${tot}`;U.progressBar.style.width=cur/tot*100+"%";U.finalStageChip.classList.toggle("show",cur/tot>=.82);U.gameModeChip.textContent=`${count} SEÇENEK`;
  if(cur/tot>=.82)startAnthem(true);let spent=!!S.selections[me];
  U.roundStatus.textContent=S.locked?"Sıradaki kart hazırlanıyor":spent?"Seçimini yaptın":"İki takımda da oynamış futbolcuyu seç";
  U.answerGrid.dataset.count=String(count);
  U.answerGrid.innerHTML=S.options.map(id=>{let p=D.players[id],sel=S.selections[me]?.optionId===id,cor=S.locked&&S.correctAnswerId===id,wr=sel&&S.selections[me]&&!S.selections[me].correct;return`<button class="answer-card ${sel?"selected":""} ${cor?"correct":""} ${wr?"wrong":""}" data-id="${id}" ${S.locked||spent?"disabled":""}><div class="player-photo image-shell" data-img="${id}"><span>${esc(initials(p.name))}</span></div><div class="answer-copy"><div class="answer-name">${esc(p.name)}</div><div class="answer-sub">Seçmek için dokun</div></div></button>`}).join("");
  U.answerGrid.querySelectorAll(".answer-card").forEach(x=>x.onclick=()=>localChoose(x.dataset.id));
  U.answerGrid.querySelectorAll("[data-img]").forEach(x=>playerImg(x,x.dataset.img));
  scores();feed();let ans=D.players[S.correctAnswerId]?.name||"";U.resultFlash.className="result-flash";
  if(S.locked){U.resultFlash.textContent=S.winnerId?`${S.players[S.winnerId]?.name} doğru bildi! +1 • ${ans}`:`Herkes yanıldı • Doğru cevap: ${ans}`;U.resultFlash.classList.add(S.winnerId?"good":"neutral")}else if(S.selections[me]&&!S.selections[me].correct){U.resultFlash.textContent="Yanlış seçim — bu kartta hakkın bitti.";U.resultFlash.classList.add("bad")}else U.resultFlash.textContent="";
  idle(()=>primePlan(S.preload||[]));
}
function scores(){let p=Object.values(S.players).sort((a,b)=>(b.score||0)-(a.score||0));U.scorePlayers.innerHTML=p.map((x,i)=>`<div class="score-row ${x.id===me?"me":""}"><span class="score-rank">${i+1}</span><span class="score-name">${esc(x.name)}${x.host?" ★":""}</span><span class="score-points">${x.score||0}</span></div>`).join("")}
function feed(){U.selectionFeed.innerHTML=Object.values(S.players).map(p=>{let s=S.selections[p.id],ch=s?D.players[s.optionId]?.name:"";return`<div class="feed-row ${s?.correct?"correct":s?"wrong":""}"><div class="feed-user"><span>${esc(p.name)}</span><span>${s?.correct?"✓":s?"×":"…"}</span></div><div class="feed-choice ${ch?"":"feed-wait"}">${ch?esc(ch):"Henüz seçmedi"}</div></div>`}).join("")}
function renderFinal(){let p=Object.values(S.players).sort((a,b)=>(b.score||0)-(a.score||0)),w=p[0];U.winnerTitle.textContent=w?w.name+" Şampiyon!":"Maç Tamamlandı";U.winnerSubtitle.textContent=w?`${w.score||0} puanla gecenin lideri.`:"";U.finalScores.innerHTML=p.map((x,i)=>`<div class="final-row ${i===0?"winner":""}"><b>${i+1}</b><span>${esc(x.name)}</span><strong>${x.score||0} puan</strong></div>`).join("");U.playAgainBtn.style.display=isHost?"":"none";startAnthem(true)}
function saveImgCache(){try{localStorage.setItem("qf-img",JSON.stringify(imgCache))}catch{}}
async function wiki(q,key,title=false){
  if(imgCache[key])return imgCache[key];if(imgPromises.has(key))return imgPromises.get(key);
  const size=title?256:240;
  const url=title?`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=${size}&pilicense=any&titles=${encodeURIComponent(q)}`:`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=${size}&pilicense=any`;
  const promise=fetch(url,{cache:"force-cache"}).then(r=>r.ok?r.json():Promise.reject()).then(j=>{let p=Object.values(j.query?.pages||{})[0],s=p?.thumbnail?.source||"";if(s){imgCache[key]=s;saveImgCache()}return s}).catch(()=>"").finally(()=>imgPromises.delete(key));
  imgPromises.set(key,promise);return promise
}
function primeUrl(url){if(!url||warmedUrls.has(url))return;warmedUrls.add(url);let i=new Image;i.decoding="async";i.referrerPolicy="no-referrer";i.src=url}
function enqueuePreload(task){preloadQueue.push(task);pumpPreload()}
function pumpPreload(){while(preloadActive<4&&preloadQueue.length){preloadActive++;Promise.resolve().then(preloadQueue.shift()).catch(()=>{}).finally(()=>{preloadActive--;pumpPreload()})}}
function idle(fn){if("requestIdleCallback" in window)requestIdleCallback(fn,{timeout:900});else setTimeout(fn,90)}
function primeTeam(id){let t=D.teams[id],k="t:"+id;return wiki(t.wiki,k,true).then(primeUrl)}
function primePlayer(id){let p=D.players[id],k="p:"+id;return wiki(p.search,k,false).then(primeUrl)}
function primeVisible(c,ids){primeTeam(c.teamA);primeTeam(c.teamB);ids.forEach(primePlayer)}
function primePlan(plan){for(const p of plan||[]){enqueuePreload(()=>primeTeam(p.teamA));enqueuePreload(()=>primeTeam(p.teamB));for(const id of p.options||[])enqueuePreload(()=>primePlayer(id))}}
function warmAllTeamLogos(){Object.keys(D.teams).forEach(id=>enqueuePreload(()=>primeTeam(id)))}
function setImg(el,url,label,fit,position="center"){
  el.classList.remove("loaded");el.innerHTML=`<span>${esc(initials(label))}</span>`;if(!url)return;
  let i=new Image;i.alt=label;i.decoding="async";i.loading="eager";i.referrerPolicy="no-referrer";i.style.objectFit=fit;i.style.objectPosition=position;i.fetchPriority="high";
  i.onload=()=>{el.innerHTML="";el.appendChild(i);el.classList.add("loaded")};i.onerror=()=>{el.classList.remove("loaded")};i.src=url
}
async function teamImg(el,id){let t=D.teams[id],k="t:"+id;if(el.dataset.k===k&&el.querySelector("img"))return;el.dataset.k=k;setImg(el,imgCache[k]||"",t.short,"contain");if(!imgCache[k])setImg(el,await wiki(t.wiki,k,true),t.short,"contain")}
async function playerImg(el,id){let p=D.players[id],k="p:"+id;if(el.dataset.k===k&&el.querySelector("img"))return;el.dataset.k=k;setImg(el,imgCache[k]||"",p.name,"cover","50% 18%");if(!imgCache[k])setImg(el,await wiki(p.search,k,false),p.name,"cover","50% 18%")}
function ensureAudio(){if(!sound)return null;if(!audio)audio=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==="suspended")audio.resume();return audio}
function tone(f,d,v=.06,delay=0){let a=ensureAudio();if(!a)return;let o=a.createOscillator(),g=a.createGain(),t=a.currentTime+delay;o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(a.destination);o.start(t);o.stop(t+d+.02)}
function okSound(){tone(523,.14,.07);tone(659,.18,.06,.05);tone(784,.21,.05,.1)}
function revealSound(){tone(294,.16,.045);tone(349,.2,.045,.07)}
function startAnthem(force=false){if(window.QFV4Music?.start)window.QFV4Music.start()}
function stopAnthem(){if(window.QFV4Music?.stop)window.QFV4Music.stop();if(anthem)clearInterval(anthem);anthem=null}
U.createRoomBtn.onclick=()=>{let n=name(U.createName.value);if(!n)return toast("Kullanıcı adını yaz");ensureAudio();hostRoom(n)};
U.joinRoomBtn.onclick=()=>{let n=name(U.joinName.value),c=code(U.joinCode.value);if(!n)return toast("Kullanıcı adını yaz");if(c.length<5)return toast("Oda kodunu yaz");ensureAudio();join(n,c)};
U.joinCode.oninput=e=>e.target.value=code(e.target.value);
U.copyRoomBtn.onclick=async()=>{let link=`${location.origin}${location.pathname}?room=${room}`;try{await navigator.clipboard.writeText(link);toast("Davet bağlantısı kopyalandı")}catch{toast(room)}};
U.roundCountSelect.onchange=()=>{if(isHost){S.settings.roundCount=+U.roundCountSelect.value;sync()}};
U.choiceCountSelect.onchange=()=>{if(isHost){S.settings.optionCount=normalizedOptionCount(U.choiceCountSelect.value);sync()}};
U.startGameBtn.onclick=start;U.playAgainBtn.onclick=again;U.backHomeBtn.onclick=home;U.brandBtn.onclick=()=>{if(S.status==="home"||confirm("Odadan çıkılsın mı?"))home()};
U.soundBtn.onclick=()=>{sound=!sound;localStorage.setItem("qf-sound",sound?"1":"0");if(!sound)stopAnthem();render()};
U.fullscreenBtn.onclick=async()=>{try{document.fullscreenElement?await document.exitFullscreen():await document.documentElement.requestFullscreen()}catch{}};
let q=code(new URLSearchParams(location.search).get("room"));if(q)U.joinCode.value=q;
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();
})();
