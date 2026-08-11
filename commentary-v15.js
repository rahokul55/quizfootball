(()=>{"use strict";
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),now=()=>performance.now();
let voice=null,speaking=false,lastCaptionTimer=0,lastSpokenAt=0,lastAnalysisAt=0,flowCtx={actor:"",lane:"center",side:"home",at:0};
const seen=new Map(),recentByKey=new Map(),stats={speeches:0,deduped:0,skipped:0,cancelled:0,lastText:"",lastType:"",lastAt:0,queue:0,analyses:0,instantEvents:0,voice:""};
const BANK={
 left:["sol kanatta boşluğu yakaladı","sol çizgiden hızlandı","sol taraftan bindirmeyi yaptı","sol açıktan savunmanın üstüne gidiyor","sol çizgide topu önüne aldı","sol kanatta vites yükseltti"],
 right:["sağ kanatta boşluğu yakaladı","sağ çizgiden hızlandı","sağ taraftan bindirdi","sağ açıktan savunmanın üstüne gidiyor","sağ çizgide topu kontrol etti","sağ kanatta vites yükseltti"],
 center:["merkezden hızla çıktı","iki hat arasındaki boşluğu buldu","orta alandan yüzünü kaleye döndü","merkezde topu taşıdı","savunmanın merkezine doğru ilerledi","orta sahayı çabuk geçti"],
 cross:["başını kaldırdı ve ortasını gönderdi","ceza alanına çok tehlikeli kesti","yerden içeri çevirdi","ön direğe sert bir top gönderdi","arka direği düşündü","ortasını penaltı noktasına bıraktı"],
 through:["savunmanın arasına ince bir pas bıraktı","tek pasla savunma hattını deldi","ceza sahasına nefis bir ara pası çıkardı","savunmanın arkasına çok iyi bıraktı","dar alanda pas kanalını buldu"],
 goal:["GOOOOOOL! Top ağlarda! Tribün ayağa kalktı!","GOOOOOOL! Müthiş bitiriş! Stad yıkılıyor!","GOOOOOOOL! Fileler havalandı! Ne gol ama!","GOOOOOL! Son dokunuş kusursuz! Tribünler çıldırdı!","GOOOOOOL! İşte beklenen an! Top ağlarda!","GOL GOL GOL! Müthiş bir hücum ve harika final!"],
 save:["VURDU! Kaleci inanılmaz çıkardı!","Şut geldi... kaleci uzandı ve gole izin vermedi!","Büyük fırsat! Kaleci son anda çıkardı!","Vuruş çok sertti ama kaleci ayakta kaldı!","Kaleci müthiş refleks gösterdi!"],
 post:["VURDU... DİREK! Top oyuna geri döndü!","Şut geliyor... direkten döndü! İnanılmaz!","DİREK! Gol santimetrelerle kaçtı!","Ne vurdu ama! Direk gole izin vermedi!","Top direkte patladı! Tribün bir anda ayağa kalktı!"],
 miss:["Vuruş dışarıda! Büyük fırsat kaçtı!","Son vuruş kaleyi bulmadı!","Ahhh! Top az farkla dışarı gitti!","Bu nasıl kaçtı! Top dışarıda!","Vurdu ama çerçeveyi bulamadı!"],
 corner:["Korner geliyor. Ceza sahası tamamen doldu.","Köşe vuruşu. Kalabalık ceza alanında herkes yerini aldı.","Korner kullanılacak. Savunma ve hücum çizgide birbirine girdi."],
 free:["Tehlikeli bir serbest vuruş. Baraj hazır.","Duran top fırsatı. Kaleye mesafe uygun.","Serbest vuruş için topun başındalar. Tribün sessizleşti."],
 penalty:["PENALTI! Stadın tamamı ayağa kalktı!","Hakem beyaz noktayı gösterdi! Penaltı!","PENALTI! Şimdi bütün gözler topun başındaki oyuncuda!"],
 card:["Hakem kartına başvurdu. Oyun biraz sertleşti.","Sarı kart çıktı. Müdahale gerçekten geç kalmıştı.","Hakem cebine gitti. Sarı kart."],
 injury:["Oyuncu yerde kaldı. Sağlık ekibi sahaya çağrılıyor.","Oyun durdu. Bir sakatlık şüphesi var.","Oyuncu ayağa kalkmakta zorlanıyor. Sağlık ekibi içeride."],
 half:["İlk yarının son düdüğü geldi. Kısa bir aradan sonra ikinci yarı.","İlk 45 dakika tamamlandı. Takımlar soyunma odasına gidiyor.","Devre bitti. İkinci yarıda tempo yeniden yükselecek."],
 sub:["Teknik direktörden oyuncu değişikliği. Taze güç sahada.","Oyuncu değişikliği geliyor. Takımın yapısı biraz değişecek.","Kulübe hamlesi geldi. Yeni oyuncu oyunda."],
 analysisClose:["Maç bıçak sırtında. Bir pozisyon her şeyi değiştirebilir.","Skor çok yakın. İki takım da tek hatanın bedelini ödeyebilir.","Sonuç hâlâ ortada. Bu bölümde konsantrasyon çok önemli."],
 analysisLead:["Önde olan taraf oyunun temposunu kontrol etmeye çalışıyor.","Skor avantajı var ama maç henüz bitmiş değil.","Öndeki takım topun hızını düşürüp alanları kapatıyor."],
 analysisTrail:["Geride olan taraf daha fazla risk almak zorunda.","Skoru çevirmek için artık daha cesur oynamaları gerekiyor.","Gerideki takım hatlarını öne çıkardı; arkada boşluk bırakıyor."]
};
function settings(){return window.QF_AUDIO_V13?.getSettings?.()||{enabled:true,commentary:true,commentator:.78,master:.84,captions:true}}
function chooseVoice(){const vs=window.speechSynthesis?.getVoices?.()||[];const score=v=>{let s=0;if(/^tr([-_]|$)/i.test(v.lang||""))s+=150;if(/natural|neural|online|tolga|ahmet|emel|filiz|male|erkek/i.test(v.name||""))s+=40;if(v.localService)s+=2;return s};voice=[...vs].sort((a,b)=>score(b)-score(a))[0]||null;stats.voice=voice?.name||""}
if(window.speechSynthesis){chooseVoice();window.speechSynthesis.onvoiceschanged=chooseVoice}
function clean(t){return String(t||"").replace(/\s+/g," ").replace(/GO{8,}L/gi,"GOOOOOL").trim()}
function pickUnique(key,arr){let rec=recentByKey.get(key)||[];let choices=arr.map((v,i)=>({v,i})).filter(x=>!rec.includes(x.i));if(!choices.length){rec=[];choices=arr.map((v,i)=>({v,i}))}const x=choices[Math.floor(Math.random()*choices.length)];rec.push(x.i);while(rec.length>Math.min(3,arr.length-1))rec.shift();recentByKey.set(key,rec);return x.v}
function caption(text){text=clean(text);if(!text)return;let el=document.getElementById("qfCommentaryCaption");if(!el){el=document.createElement("div");el.id="qfCommentaryCaption";el.className="qf-commentary-caption v13-commentary-caption v15-commentary-caption";document.body.appendChild(el)}el.textContent=text;el.classList.add("show");clearTimeout(lastCaptionTimer);lastCaptionTimer=setTimeout(()=>el.classList.remove("show"),Math.min(7200,3000+text.length*30))}
function fingerprint(d){return`${d.type||""}|${Math.round(+d.minute||0)}|${d.side||""}|${clean(d.text).toLocaleLowerCase("tr-TR").replace(/\d+/g,"#")}`}
function duplicate(d){const t=now(),k=fingerprint(d);for(const[x,v]of seen)if(t-v>12000)seen.delete(x);const p=seen.get(k);if(p&&t-p<8500){stats.deduped++;return true}seen.set(k,t);return false}
function canSpeak(){const s=settings();return s.enabled!==false&&s.commentary!==false&&!!window.speechSynthesis}
function stop(){if(!window.speechSynthesis)return;try{window.speechSynthesis.cancel();stats.cancelled++}catch{}speaking=false;stats.queue=0}
function speak(text,{type="event",interrupt=false,minGap=1400}={}){text=clean(text);if(!text)return;caption(text);const t=Date.now();if(!canSpeak()){stats.skipped++;stats.lastText=text;stats.lastType=type;return}if(!interrupt&&t-lastSpokenAt<minGap){stats.skipped++;return}if(interrupt&&speaking)stop();else if(speaking){stats.skipped++;return}const a=settings(),u=new SpeechSynthesisUtterance(text);u.lang="tr-TR";u.rate=.70;u.pitch=.94;u.volume=clamp((a.master??.84)*(a.commentator??.78),0,1);if(voice)u.voice=voice;speaking=true;stats.queue=1;stats.speeches++;stats.lastText=text;stats.lastType=type;stats.lastAt=now();lastSpokenAt=t;u.onend=u.onerror=()=>{speaking=false;stats.queue=0};try{window.speechSynthesis.speak(u)}catch{speaking=false;stats.queue=0}}
function actorFromText(text){text=clean(text).replace(/^\d+'\s*/,"").replace(/^GOL!?\s*/i,"");const m=text.match(/^([^.!]+?)\s+(?:bitirdi|vurdu|şutunu|kısa süreli)/i);return clean(m?.[1]||"")}
function lane(){return flowCtx.at&&now()-flowCtx.at<900?flowCtx.lane:"center"}
function actor(d){if(flowCtx.at&&now()-flowCtx.at<900&&flowCtx.side===d.side&&flowCtx.actor)return flowCtx.actor;return actorFromText(d.text)}
function buildup(d){const a=actor(d),l=lane(),lead=pickUnique(`lead-${l}`,BANK[l]||BANK.center),pass=pickUnique(`pass-${l}`,l==="center"?BANK.through:BANK.cross);return a?`${a} ${lead}. ${pass}.`:`${lead}. ${pass}.`}
function resultText(type){return pickUnique(`result-${type}`,BANK[type]||BANK.miss)}
function immediate(d){if(duplicate(d))return;stats.instantEvents++;const type=d.type||"";if(["goal","save","post","miss"].includes(type)){const text=`${buildup(d)} ${resultText(type)}`;speak(text,{type,interrupt:type==="goal",minGap:type==="goal"?0:900});return}if(type==="penalty"){speak(pickUnique("penalty",BANK.penalty),{type,interrupt:true,minGap:0});return}if(type==="red"){speak(clean(d.text||"Kırmızı kart! Maçın bütün dengesi değişti."),{type,interrupt:true,minGap:0});return}if(["corner","free","card","injury","half","sub"].includes(type)){const txt=pickUnique(type,BANK[type]||[clean(d.text)]);speak(txt,{type,interrupt:false,minGap:type==="half"?0:2200})}}
function snapshot(){const m=window.QF_V7_TEST?.match?.();if(m?.running)return{minute:m.minute||0,home:m.home||0,away:m.away||0};const n=window.QF_V7_ONLINE_TEST?.net?.();if(n?.match?.running)return{minute:n.match.minute||0,home:n.match.home||0,away:n.match.away||0};return null}
function analysis(){const s=snapshot(),t=Date.now();if(!s||speaking||t-lastSpokenAt<8000||t-lastAnalysisAt<15000)return;lastAnalysisAt=t;const diff=s.home-s.away,bank=diff===0?BANK.analysisClose:diff>0?BANK.analysisLead:BANK.analysisTrail;const prefix=s.minute>74?`${Math.round(s.minute)}. dakikaya geldik. `:"";stats.analyses++;speak(prefix+pickUnique(`analysis-${Math.sign(diff)}`,bank),{type:"analysis",minGap:0})}
window.addEventListener("qf:v11-commentary",e=>{const d=e.detail||{};if(["build","delivery","finish"].includes(d.phase)){flowCtx={actor:clean(d.actorName),lane:d.lane||"center",side:d.side||"home",at:now()}}});
window.addEventListener("qf:v9-event",e=>{const d=e.detail||{};if(!d.type)return;setTimeout(()=>immediate(d),55)});
setInterval(analysis,2500);
function test(type="goal"){immediate({type,side:"home",minute:88,text:type==="goal"?"88' GOL! Test Forvet bitirdi.":`88' Test Forvet vurdu.`,__test:Date.now()})}
const api={unlock:()=>window.QF_AUDIO_V13?.unlock?.(),state:()=>({...stats,speaking,queue:speaking?1:0,rate:.70,voice:voice?.name||""}),getSettings:()=>({...settings(),style:"broadcast",importantOnly:true,rate:.70}),setSetting:(k,v)=>window.QF_AUDIO_V13?.setSetting?.(k,v)??false,test,resetDedupe:()=>{seen.clear();recentByKey.clear()}};
window.QF_COMMENTARY_V15=api;window.QF_COMMENTARY_V14=api;window.QF_COMMENTARY_V13=api;window.QF_COMMENTARY_V11=api;window.QF_COMMENTARY_V10=api;
})();
