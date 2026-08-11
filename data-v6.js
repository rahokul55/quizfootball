(()=>{"use strict";
const D=window.QF_DATA||{players:{},teams:{}},V=window.QF_V5||{managers:{}};
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const POS={
 vds:"GK",courtois:"GK",buffon:"GK",szczesny:"GK",
 danialves:"RB",navas:"RB",ramos:"CB",pepe:"CB",tsilva:"CB",bonucci:"CB",cannavaro:"CB",boateng:"CB",ashleycole:"LB",clichy:"LB",davidluiz:"CB",mascherano:"CB",
 xabi:"CM",kroos:"CM",kdb:"CM",zidane:"CAM",ozil:"CAM",pogba:"CM",pirlo:"CM",fabregas:"CM",yaya:"CM",vieira:"CM",rakitic:"CM",thiago:"CM",wijnaldum:"CM",calhanoglu:"CAM",sneijder:"CAM",beckham:"RM",
 neymar:"LW",cr7:"RW",bale:"RW",mane:"LW",sterling:"LW",alexis:"LW",sancho:"RW",sane:"LW",coman:"LW",perisic:"LW",ronaldinho:"LW",coutinho:"LW",dimaria:"RW",
 haaland:"ST",lewa:"ST",suarez:"ST",zlatan:"ST",aguero:"ST",torres:"ST",etoo:"ST",ronaldo:"ST",higuain:"ST",rooney:"ST",rvp:"ST",lukaku:"ST",morata:"ST",dzeko:"ST",icardi:"ST",tevez:"ST",anelka:"ST",villa:"ST",dcosta:"ST",balotelli:"ST",kean:"ST"
};
const roles={GK:["Sweeper Keeper","Shot Stopper"],CB:["Ball Playing Defender","Stopper","Cover"],LB:["Wing Back","Full Back"],RB:["Wing Back","Full Back"],CM:["Box-to-Box","Deep Playmaker","Ball Winner"],CAM:["Advanced Playmaker","Shadow Striker"],LM:["Wide Playmaker"],RM:["Wide Playmaker"],LW:["Inside Forward","Winger"],RW:["Inside Forward","Winger"],ST:["Advanced Forward","Poacher","Target Man","False 9"]};
function posFor(id,i=0){if(POS[id])return POS[id];const list=["CM","CB","RW","LB","ST","CM","RB","LW"];return list[(hash(id)+i)%list.length]}
function attrs(id,p){const h=hash(id),pos=posFor(id),base=72+(h%15),attack=["ST","LW","RW","CAM"].includes(pos),def=["CB","LB","RB","GK"].includes(pos);let pace=clamp(base+((h>>>3)%15)-5,58,95),shoot=clamp(base+(attack?7:-8)+((h>>>7)%9)-4,45,96),pass=clamp(base+(["CM","CAM"].includes(pos)?7:0)+((h>>>11)%9)-4,48,95),dribble=clamp(base+(["LW","RW","CAM"].includes(pos)?8:0)+((h>>>15)%9)-4,45,96),defense=clamp(base+(def?9:-18)+((h>>>19)%8)-4,30,95),physical=clamp(base+((h>>>22)%12)-5,52,95),finish=clamp(shoot+(attack?4:-2),45,97),vision=clamp(pass+(["CM","CAM"].includes(pos)?4:0),45,97),keeper=pos==="GK"?clamp(78+(h%15),74,95):20;const ovr=Math.round(pos==="GK"?keeper:(pace+shoot+pass+dribble+defense+physical)/6);return{id,name:p.name,pos,role:(roles[pos]||roles.CM)[h%(roles[pos]||roles.CM).length],ovr,pace,shoot,pass,dribble,defense,physical,finish,vision,keeper,fitness:100,form:75,cost:Math.round((ovr-60)*(ovr-60)*3.6+250)}}
const players={};Object.entries(D.players||{}).forEach(([id,p],i)=>players[id]=attrs(id,p,i));
const defaultIds=["vds","danialves","ramos","tsilva","ashleycole","xabi","kdb","zidane","neymar","haaland","cr7","courtois","pepe","pogba","kroos","mane","lewa","suarez"].filter(id=>players[id]);
const formations={
 "4-3-3":[[50,88,"GK"],[18,72,"LB"],[38,75,"CB"],[62,75,"CB"],[82,72,"RB"],[30,51,"CM"],[50,55,"CM"],[70,51,"CM"],[20,25,"LW"],[50,18,"ST"],[80,25,"RW"]],
 "4-2-3-1":[[50,88,"GK"],[18,72,"LB"],[38,75,"CB"],[62,75,"CB"],[82,72,"RB"],[38,54,"CM"],[62,54,"CM"],[50,38,"CAM"],[20,31,"LW"],[80,31,"RW"],[50,16,"ST"]],
 "4-4-2":[[50,88,"GK"],[18,72,"LB"],[38,75,"CB"],[62,75,"CB"],[82,72,"RB"],[18,48,"LM"],[40,52,"CM"],[60,52,"CM"],[82,48,"RM"],[40,19,"ST"],[60,19,"ST"]],
 "3-5-2":[[50,88,"GK"],[30,73,"CB"],[50,76,"CB"],[70,73,"CB"],[12,48,"LM"],[32,51,"CM"],[50,43,"CAM"],[68,51,"CM"],[88,48,"RM"],[40,19,"ST"],[60,19,"ST"]]
};
const managers={};Object.entries(V.managers||{}).forEach(([id,m])=>{const h=hash(id);managers[id]={id,name:m.name,clubs:m.clubs||[],attack:75+h%18,defense:72+(h>>>4)%20,press:65+(h>>>8)%28,motivation:70+(h>>>12)%23,youth:62+(h>>>16)%31,style:["Possession","Gegenpress","Counter Attack","Direct Play","Balanced","Wing Play"][h%6]}});
const managerIds=Object.keys(managers),defaultManager=managerIds[0]||"";
const opponents=[
 {id:"northstar",name:"Northstar FC",short:"NOR",strength:76,style:"Balanced"},{id:"royalblue",name:"Royal Blue",short:"RBL",strength:80,style:"Possession"},{id:"redforge",name:"Red Forge",short:"RFG",strength:82,style:"Gegenpress"},{id:"atlas",name:"Atlas Athletic",short:"ATL",strength:84,style:"Counter Attack"},{id:"capital",name:"Capital United",short:"CAP",strength:86,style:"Balanced"},{id:"eclipse",name:"Eclipse XI",short:"ECL",strength:88,style:"Possession"},{id:"imperial",name:"Imperial CF",short:"IMP",strength:90,style:"Gegenpress"},{id:"legends",name:"Legends Select",short:"LEG",strength:92,style:"Balanced"}
];
const competitions={
 daily:{id:"daily",name:"Günlük Kupa",type:"knockout",teams:4,reward:350,icon:"◈",desc:"Dört takımlı hızlı eleme kupası."},
 weekend:{id:"weekend",name:"Hafta Sonu Kupası",type:"knockout",teams:8,reward:800,icon:"◆",desc:"Sekiz takımlı daha sert turnuva."},
 continental:{id:"continental",name:"Continental Masters",type:"knockout",teams:8,reward:1400,icon:"✦",desc:"Üst seviye AI kulüplerine karşı kıta kupası."},
 league:{id:"league",name:"Club League",type:"league",teams:8,reward:1800,icon:"▦",desc:"Sekiz takımlı puan usulü kulüp ligi."}
};
window.QF_V6={players,formations,managers,defaultIds,defaultManager,opponents,competitions,hash,clamp};
})();