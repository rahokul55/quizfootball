import fs from 'node:fs';import vm from 'node:vm';
const Dctx={window:{}};vm.createContext(Dctx);vm.runInContext(fs.readFileSync('data.js','utf8'),Dctx);const D=Dctx.window.QF_DATA;
const ctx={window:{}};vm.createContext(ctx);for(const f of ['data-v5.js','data-v5-plus.js','data-v5-arcade.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);const V=ctx.window.QF_V5;
let n=0;const ok=(v,m)=>{if(!v)throw new Error(m);n++};
const modes=Object.values(V.modes),usedPools=new Set(modes.map(m=>m.pool).filter(Boolean));ok(modes.length>=44,`need >=44 modes, got ${modes.length}`);
ok(modes.filter(m=>m.timeLimit>0).length>=20,'timed-mode variety too small');ok(modes.filter(m=>m.group==='solo').length>=9,'solo variety too small');ok(modes.filter(m=>m.group==='chill').length>=6,'chill variety too small');ok(modes.filter(m=>m.rated).length>=10,'rated variety too small');ok(modes.filter(m=>m.targetScore).length>=5,'target-score modes missing');ok(modes.filter(m=>m.scoring==='streak').length>=2,'combo modes missing');ok(modes.filter(m=>m.daily).length>=2,'daily modes missing');
for(const [pool,clubs] of Object.entries(V.pools||{})){ok(clubs.length>=2,`${pool} too small`);const allowed=new Set(clubs);for(const c of clubs)ok(!!D.teams[c],`${pool}: unknown ${c}`);if(usedPools.has(pool))ok(D.cards.filter(c=>allowed.has(c.teamA)&&allowed.has(c.teamB)).length>=2,`${pool}: active mode pool lacks player cards`)}
for(const m of modes){if(m.pool)ok(!!V.pools[m.pool],`${m.id}: missing pool ${m.pool}`);if(m.targetScore)ok(m.targetScore>=5&&m.targetScore<=50,`${m.id}: invalid target`)}
const app=fs.readFileSync('app-v5.js','utf8');for(const x of ['cfg.daily?rng','finishMatch("target")','V.pools?.[poolId]'])ok(app.includes(x),`runtime patch missing: ${x}`);ok(app.includes('scoring=S.settings.scoring||cfg.scoring')||app.includes('cfg.scoring==="streak"'),'combo scoring runtime missing');
const html=fs.readFileSync('index.html','utf8');ok(html.includes('data-v5-plus.js'),'plus pack not wired');ok(html.includes('data-v5-arcade.js'),'arcade pack not wired');
const report=JSON.parse(fs.readFileSync('manager-image-report-v5.json','utf8'));ok(report.found===report.total,`manager images ${report.found}/${report.total}`);
console.log(`ADVANCED QA PASS: ${n} assertions, ${modes.length} modes, ${usedPools.size} active league pools, ${Object.keys(V.pools).length} defined pools.`);
