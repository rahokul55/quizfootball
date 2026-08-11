import fs from 'node:fs';
let html=fs.readFileSync('index.html','utf8');
if(!html.includes('chairman-v7.css')) html=html.replace('<link rel="stylesheet" href="v6.css?v=600" />','<link rel="stylesheet" href="v6.css?v=600" />\n  <link rel="stylesheet" href="chairman-v7.css?v=700" />');
if(!html.includes('data-v7.js')) html=html.replace('<script src="data-v6.js?v=600"></script>','<script src="data-v6.js?v=600"></script>\n  <script src="data-v7.js?v=700"></script>');
if(!html.includes('chairman-v7.js')) html=html.replace('<script src="club-v6.js?v=600"></script>','<script src="club-v6.js?v=600"></script>\n  <script src="chairman-v7.js?v=700"></script>\n  <script src="online-v7.js?v=700"></script>');
html=html.replace(/<title>[^<]*<\/title>/,'<title>Quiz Football V7 — Chairman Mode</title>').replace('Quiz Football V6 — futbol quiz, kulüp yönetimi ve canlı maç simülasyonu.','Quiz Football V7 — kulüp başkanlığı, transfer yönetimi, hızlı maç simülasyonu ve canlı futbol quiz düelloları.');
fs.writeFileSync('index.html',html);

let chairman=fs.readFileSync('chairman-v7.js','utf8');
chairman=chairman.replace('budgetM:120,wageBudgetM:9,cashM:18','budgetM:120,wageBudgetM:18,cashM:18');
chairman=chairman.replace('const owned=new Set(S.squad),policy=S.transferPolicy,budget=Math.max(4,S.budgetM),scout=S.facilities.scouting||1,cands=Object.values(X.playerMeta).filter(p=>!owned.has(p.id)&&p.valueM<=budget*.78)', 'const owned=new Set(S.squad),policy=S.transferPolicy,budget=Math.max(4,S.budgetM),wageRoom=Math.max(0,S.wageBudgetM-squadWages()),scout=S.facilities.scouting||1,cands=Object.values(X.playerMeta).filter(p=>!owned.has(p.id)&&p.valueM<=budget*.78&&p.wageM<=wageRoom)');
chairman=chairman.replace('base=6.1+(win?0.55:match.home===match.away?.15:-.25)+', 'base=6.1+(win?0.55:(match.home===match.away?0.15:-0.25))+');
chairman=chairman.replace('if(match.fixture){applyTable("me",match.fixture[0]==="me"?match.fixture[1]:match.fixture[0],match.home,match.away);simulateOtherRound(S.schedule[match.fixtureRound??match.fixture?.round??Math.max(0,S.week-1)]||S.schedule[Math.max(0,S.week-1)])}if(match.type==="Lig"&&match.fixture){const idx=Math.max(0,S.week-1);simulateOtherRound(S.schedule[idx])}', 'if(match.type==="Lig"&&match.fixture?.fixture){const idx=match.fixture.round??Math.max(0,S.week-1),pair=match.fixture.fixture,opp=pair[0]==="me"?pair[1]:pair[0];applyTable("me",opp,match.home,match.away);simulateOtherRound(S.schedule[idx])}');
fs.writeFileSync('chairman-v7.js',chairman);

let sw=fs.readFileSync('sw-v5.js','utf8');
sw=sw.replace(/const CACHE='quizfootball-[^']+'/,"const CACHE='quizfootball-v7.0.1'");
for(const file of ['./chairman-v7.css','./data-v7.js','./chairman-v7.js','./online-v7.js']) if(!sw.includes(`'${file}'`)) sw=sw.replace("'./club-v6.js'",`'./club-v6.js','${file}'`);
fs.writeFileSync('sw-v5.js',sw);
console.log('V7 production wiring + economy/league fixes ready.');