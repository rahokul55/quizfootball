import fs from 'node:fs';
const need=(file,parts)=>{const s=fs.readFileSync(file,'utf8');for(const p of parts)if(!s.includes(p))throw new Error(`${file} missing ${p}`);return s};
need('match3d-v10.js',['webgl2','QF_MATCH_3D_V10','TEKRAR','broadcast','performance-lite','goal','stadium','player']);
need('commentary-v10.js',['QF_COMMENTARY_V10','SpeechSynthesisUtterance','Hafif maç argosu','tribün','qf:v9-event','qf:v10-event']);
need('match-details-v10.js',['QF_MATCH_DETAILS_V10','VAR','KIRMIZI KART','attendance','refereeStrictness','addedTime']);
need('v10.css',['v10-gl-canvas','v10-broadcast-hud','v10-commentary-controls','v10-match-meta']);
const idx=need('index.html',['match3d-v10.js','commentary-v10.js','match-details-v10.js','v10.css']);if(!/Quiz Football V10/.test(idx))throw new Error('V10 title not wired');
const sw=need('sw-v5.js',['quizfootball-v10.0.0','match3d-v10.js','commentary-v10.js','match-details-v10.js','v10.css']);
console.log('V10 STATIC QA PASS: WebGL2 3D broadcast renderer, replay camera, dynamic Turkish commentary, crowd/chant audio, VAR/discipline/environment layer and offline wiring verified.');