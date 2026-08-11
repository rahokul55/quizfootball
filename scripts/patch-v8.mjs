import fs from 'node:fs';
let changed=0;
function replaceOnce(src,from,to,label){if(src.includes(to))return src;if(!src.includes(from))throw new Error(`V8 patch target missing: ${label}`);changed++;return src.replace(from,to)}
let html=fs.readFileSync('index.html','utf8');
if(!html.includes('audio-v8.css')){html=replaceOnce(html,'<link rel="stylesheet" href="chairman-v7.css?v=700" />','<link rel="stylesheet" href="chairman-v7.css?v=700" />\n  <link rel="stylesheet" href="audio-v8.css?v=800" />','audio css')}
if(!html.includes('audio-v8.js')){html=replaceOnce(html,'<script src="online-v7.js?v=700"></script>','<script src="online-v7.js?v=700"></script>\n  <script src="audio-v8.js?v=800"></script>','audio js')}
html=html.replace(/<title>Quiz Football V\d+ — Chairman Mode<\/title>/,'<title>Quiz Football V8 — Chairman Mode</title>');
html=html.replace(/Quiz Football V\d+ — kulüp başkanlığı, transfer yönetimi, hızlı maç simülasyonu ve canlı futbol quiz düelloları\./,'Quiz Football V8 — kulüp başkanlığı, Türkçe spiker, stadyum sesleri, hızlı maç simülasyonu ve canlı futbol quiz düelloları.');
fs.writeFileSync('index.html',html);
let sw=fs.readFileSync('sw-v5.js','utf8');
sw=sw.replace(/const CACHE='quizfootball-v[^']+'/,"const CACHE='quizfootball-v8.0.0'");
for(const file of ['./audio-v8.js','./audio-v8.css']) if(!sw.includes(`'${file}'`)) sw=sw.replace("'./chairman-v7.css'",`'./chairman-v7.css','${file}'`);
fs.writeFileSync('sw-v5.js',sw);
let chairman=fs.readFileSync('chairman-v7.js','utf8');
chairman=replaceOnce(chairman,
'else if(Math.random()<.45)addEvent(`${Math.round(match.minute)}\' Tehlikeli hücum, şut dışarı.`)',
'else{const miss=Math.random();if(miss<.42)addEvent(`${Math.round(match.minute)}\' Tehlikeli hücum, şut auta gitti.`);else if(miss<.78)addEvent(`${Math.round(match.minute)}\' Kaleci çok kritik bir kurtarış yaptı.`);else addEvent(`${Math.round(match.minute)}\' Top direkten döndü!`)}',
'solo attacking misses');
chairman=replaceOnce(chairman,
'else if(Math.random()<.35)addEvent(`${Math.round(match.minute)}\' Savunma rakip atağı durdurdu.`)',
'else{const stop=Math.random();if(stop<.4)addEvent(`${Math.round(match.minute)}\' Kalecimiz rakibin şutunu kurtardı.`);else if(stop<.76)addEvent(`${Math.round(match.minute)}\' Savunma rakip atağı durdurdu.`);else addEvent(`${Math.round(match.minute)}\' Rakibin şutu dışarı gitti.`)}',
'solo defending events');
fs.writeFileSync('chairman-v7.js',chairman);
let online=fs.readFileSync('online-v7.js','utf8');
online=replaceOnce(online,
'if(Math.random()<xg*attackChance("home")*4.1){N.match.home++;N.match.momentumHome=0;N.match.multHome=1;log(`${Math.round(N.match.minute)}\' GOL ${N.hostClub.short}! Momentum sıfırlandı.`)}',
'if(Math.random()<xg*attackChance("home")*4.1){N.match.home++;N.match.momentumHome=0;N.match.multHome=1;log(`${Math.round(N.match.minute)}\' GOL ${N.hostClub.short}! Momentum sıfırlandı.`)}else{const miss=Math.random();if(miss<.42)log(`${Math.round(N.match.minute)}\' ${N.hostClub.short} şutu dışarı gitti.`);else if(miss<.78)log(`${Math.round(N.match.minute)}\' ${N.hostClub.short} şutunda kaleci kurtardı.`);else log(`${Math.round(N.match.minute)}\' ${N.hostClub.short} direğe takıldı!`)}',
'online home misses');
online=replaceOnce(online,
'if(Math.random()<xg*attackChance("away")*4.1){N.match.away++;N.match.momentumAway=0;N.match.multAway=1;log(`${Math.round(N.match.minute)}\' GOL ${N.guestClub.short}! Momentum sıfırlandı.`)}',
'if(Math.random()<xg*attackChance("away")*4.1){N.match.away++;N.match.momentumAway=0;N.match.multAway=1;log(`${Math.round(N.match.minute)}\' GOL ${N.guestClub.short}! Momentum sıfırlandı.`)}else{const miss=Math.random();if(miss<.42)log(`${Math.round(N.match.minute)}\' ${N.guestClub.short} şutu dışarı gitti.`);else if(miss<.78)log(`${Math.round(N.match.minute)}\' ${N.guestClub.short} şutunda kaleci kurtardı.`);else log(`${Math.round(N.match.minute)}\' ${N.guestClub.short} direğe takıldı!`)}',
'online away misses');
fs.writeFileSync('online-v7.js',online);
console.log(`V8 audio wiring and match-event patches ready: ${changed} changes.`);