(()=>{"use strict";
const V6=window.QF_V6||{players:{},managers:{},hash:s=>0,clamp:(n,a,b)=>Math.max(a,Math.min(b,n))};
const D=window.QF_DATA||{players:{},teams:{}};
const hash=V6.hash||((s)=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h});
const clamp=V6.clamp||((n,a,b)=>Math.max(a,Math.min(b,n)));
const DEF=new Set(["GK","CB","LB","RB"]),MID=new Set(["CM","CAM","LM","RM"]),ATT=new Set(["LW","RW","ST"]);
const playerValueM=p=>Math.max(2,Math.round(((p.ovr-63)**2)*.12+(p.finish||70)*.06));
const wageM=p=>Math.max(.35,Math.round((.18+(p.ovr-66)*.055+(p.ovr>=86?1.2:0))*100)/100);
const managerValueM=m=>Math.max(1,Math.round((((m.attack+m.defense+m.press+m.motivation)/4)-65)*.48));
const managerWageM=m=>Math.max(.25,Math.round((.3+managerValueM(m)*.055)*100)/100);
const playerMeta={};Object.entries(V6.players||{}).forEach(([id,p])=>playerMeta[id]={...p,valueM:playerValueM(p),wageM:wageM(p),potential:clamp(p.ovr+(hash(id)%8),p.ovr,95),age:19+(hash(id+"age")%17)});
const managerMeta={};Object.entries(V6.managers||{}).forEach(([id,m])=>managerMeta[id]={...m,valueM:managerValueM(m),wageM:managerWageM(m),formation:["4-3-3","4-2-3-1","4-4-2","3-5-2"][hash(id+"form")%4]});
function starterSquad(){
 const arr=Object.values(playerMeta).sort((a,b)=>a.valueM-b.valueM||a.ovr-b.ovr),picked=[];
 const take=(pred,n)=>{for(const p of arr){if(picked.length>=18)break;if(n<=0)break;if(!picked.includes(p.id)&&pred(p)){picked.push(p.id);n--}}};
 take(p=>p.pos==="GK",2);take(p=>DEF.has(p.pos)&&p.pos!=="GK",6);take(p=>MID.has(p.pos),5);take(p=>ATT.has(p.pos),5);
 for(const p of arr)if(picked.length<18&&!picked.includes(p.id))picked.push(p.id);
 return picked.slice(0,18);
}
function starterManager(){return Object.values(managerMeta).sort((a,b)=>a.valueM-b.valueM)[0]?.id||Object.keys(managerMeta)[0]||""}
const aiClubs=[
 ["Harbor Athletic","HBR",72,"youth"],["Northbridge FC","NBR",74,"balanced"],["Red Borough","RDB",76,"press"],["Union 1908","UNI",78,"balanced"],["Kingsport City","KSC",80,"possession"],["Olympic Vale","OLV",82,"counter"],["Metro United","MET",84,"press"],["Royal District","ROY",86,"possession"],["Continental XI","CON",88,"balanced"],["Elite Capital","ELI",90,"possession"]
].map(([name,short,strength,style],i)=>({id:`ai${i+1}`,name,short,strength,style,budgetM:55+i*18}));
const facilities={
 stadium:{name:"Stadyum",icon:"▦",base:12,desc:"Maç günü gelirini artırır.",effect:"Gelir"},
 training:{name:"Antrenman",icon:"↗",base:10,desc:"Form ve oyuncu gelişimini artırır.",effect:"Gelişim"},
 academy:{name:"Akademi",icon:"◇",base:9,desc:"Daha iyi genç adaylar üretir.",effect:"Gençler"},
 scouting:{name:"Scout",icon:"◎",base:8,desc:"Teknik direktörün daha iyi transfer hedefleri bulmasını sağlar.",effect:"Transfer"}
};
const sponsors=[
 {id:"local",name:"Local Partner",signM:6,weeklyM:.45,objective:"Güvenli başlangıç"},
 {id:"national",name:"National Sport",signM:10,weeklyM:.65,objective:"İlk 6 hedefi"},
 {id:"global",name:"Global Eleven",signM:14,weeklyM:.85,objective:"İlk 4 hedefi"}
];
window.QF_V7={playerMeta,managerMeta,starterSquad,starterManager,aiClubs,facilities,sponsors,playerValueM,wageM,managerValueM,managerWageM,DEF,MID,ATT,hash,clamp,D};
})();