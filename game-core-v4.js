(function(root){"use strict";
function optionCount(v){v=+v;return[4,6,8].includes(v)?v:6}
function roundCount(v){v=+v;return[25,50,100].includes(v)?v:100}
function rng(str){let h=2166136261;for(const c of String(str)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return()=>{h+=0x6D2B79F5;let r=h;r=Math.imul(r^r>>>15,r|1);r^=r+Math.imul(r^r>>>7,r|61);return((r^r>>>14)>>>0)/4294967296}}
function shuf(a,r=Math.random){a=[...a];for(let i=a.length-1;i;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function buildOptions(D,c,count=6,seed="preview"){
  count=optionCount(count);const r=rng(seed+":"+c.id+":"+count),answer=D.players[c.answer],target=count-1;if(!answer)return[];
  const safe=Object.values(D.players).filter(p=>p.id!==c.answer&&!(p.clubs.includes(c.teamA)&&p.clubs.includes(c.teamB)));
  const A=shuf(safe.filter(p=>p.clubs.includes(c.teamA)&&!p.clubs.includes(c.teamB)),r),B=shuf(safe.filter(p=>p.clubs.includes(c.teamB)&&!p.clubs.includes(c.teamA)),r),other=shuf(safe.filter(p=>!p.clubs.includes(c.teamA)&&!p.clubs.includes(c.teamB)),r),pick=[];
  let ai=0,bi=0;while(pick.length<target&&(ai<A.length||bi<B.length)){for(const q of [A,B]){if(pick.length>=target)break;let p=q===A?A[ai++]:B[bi++];if(p&&!pick.some(x=>x.id===p.id))pick.push(p)}}
  for(const p of [...A.slice(ai),...B.slice(bi),...other]){if(pick.length>=target)break;if(!pick.some(x=>x.id===p.id))pick.push(p)}
  return shuf([answer,...pick.slice(0,target)],r).map(p=>p.id)
}
function validateCard(D,c){const errors=[];if(!D.teams[c.teamA])errors.push("teamA missing");if(!D.teams[c.teamB])errors.push("teamB missing");const p=D.players[c.answer];if(!p)errors.push("answer missing");else{if(!p.clubs.includes(c.teamA))errors.push("answer not in teamA");if(!p.clubs.includes(c.teamB))errors.push("answer not in teamB")}return errors}
function safeDistractor(D,c,id){const p=D.players[id];return!!p&&id!==c.answer&&!(p.clubs.includes(c.teamA)&&p.clubs.includes(c.teamB))}
function allSpent(players,selections){const a=Object.values(players).filter(p=>p.active!==false);return a.length>0&&a.every(p=>!!selections[p.id])}
function applyPick(state,pid,opt){if(state.locked||state.selections[pid]||!state.players[pid]?.active||!state.options.includes(opt))return{status:"ignored"};const good=opt===state.answer;state.selections[pid]={optionId:opt,correct:good};if(good){state.locked=true;state.winnerId=pid;for(const p of Object.values(state.players).filter(x=>x.active!==false)){if(p.id===pid){p.score=(p.score||0)+1;p.streak=(p.streak||0)+1;p.bestStreak=Math.max(p.bestStreak||0,p.streak)}else p.streak=0}return{status:"correct",winnerId:pid}}state.players[pid].wrong=(state.players[pid].wrong||0)+1;state.players[pid].streak=0;return{status:"wrong",allSpent:allSpent(state.players,state.selections)}}
const api={optionCount,roundCount,rng,shuf,buildOptions,validateCard,safeDistractor,allSpent,applyPick};root.QFCore=api;if(typeof module!=="undefined"&&module.exports)module.exports=api
})(typeof window!=="undefined"?window:globalThis);
