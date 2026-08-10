(()=>{"use strict";
const D=window.QF_DATA||{teams:{},players:{}},M=window.QF_IMAGES||{teams:{},players:{}},realFetch=window.fetch.bind(window);
const teamByWiki=new Map(Object.entries(D.teams||{}).map(([id,t])=>[String(t.wiki||'').toLowerCase(),id]));
const playerBySearch=new Map(Object.entries(D.players||{}).map(([id,p])=>[String(p.search||'').toLowerCase(),id]));
window.fetch=async(input,init)=>{try{const raw=typeof input==='string'?input:input.url,u=new URL(raw,location.href);if(u.hostname==='en.wikipedia.org'&&u.pathname.includes('/w/api.php')){let image='';const title=(u.searchParams.get('titles')||'').toLowerCase(),search=(u.searchParams.get('gsrsearch')||'').toLowerCase();if(title){const id=teamByWiki.get(title);if(id)image=M.teams?.[id]||''}else if(search){const exact=playerBySearch.get(search);if(exact)image=M.players?.[exact]||'';else{for(const [q,id] of playerBySearch)if(q===search||q.includes(search)||search.includes(q)){image=M.players?.[id]||'';if(image)break}}}if(image)return new Response(JSON.stringify({query:{pages:{1:{thumbnail:{source:image}}}}}),{status:200,headers:{'content-type':'application/json'}})}}catch{}return realFetch(input,init)};
let ctx=null,timer=null,step=0,volume=Math.max(0,Math.min(1,+localStorage.getItem('qf-v4-volume')||.52));
function enabled(){return localStorage.getItem('qf-sound')!=='0'}
function audio(){if(!enabled())return null;if(!ctx)ctx=new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume().catch(()=>{});return ctx}
function tone(f,d,g=.03,delay=0,type='sine'){const a=audio();if(!a)return;const o=a.createOscillator(),v=a.createGain(),t=a.currentTime+delay;o.type=type;o.frequency.value=f;v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(Math.max(.0002,g*volume),t+.035);v.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(v).connect(a.destination);o.start(t);o.stop(t+d+.05)}
function phrase(){if(!enabled())return;const chords=[[131,196,262],[147,220,294],[117,175,233],[98,147,196]],c=chords[step++%chords.length];c.forEach((f,i)=>tone(f,3.7,i?0.018:0.032,i*.025,i===0?'triangle':'sine'));[0,2,1,2].forEach((n,i)=>tone(c[Math.min(n,2)]*2,.28,.012,.52+i*.68,'sine'))}
function start(){if(timer||!enabled())return;audio();phrase();timer=setInterval(phrase,3700)}function stop(){if(timer)clearInterval(timer);timer=null;step=0}
function sync(){const game=document.getElementById('gameScreen'),final=document.getElementById('finalScreen');if((game?.classList.contains('active')||final?.classList.contains('active'))&&enabled())start();else stop()}
['createRoomBtn','joinRoomBtn','startGameBtn'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>audio(),true));
const target=document.querySelector('main');if(target)new MutationObserver(sync).observe(target,{subtree:true,attributes:true,attributeFilter:['class']});
document.getElementById('soundBtn')?.addEventListener('click',()=>setTimeout(sync,0));
window.QFV4Music={start,stop,sync,get volume(){return volume},setVolume(v){volume=Math.max(0,Math.min(1,+v||0));localStorage.setItem('qf-v4-volume',String(volume))}};
})();
