import fs from 'node:fs';import vm from 'node:vm';
const ctx={window:{}};vm.createContext(ctx);for(const f of ['data-v5.js','data-v5-plus.js','data-v5-arcade.js','data-v5-custom.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);const V=ctx.window.QF_V5;let n=0;const ok=(v,m)=>{if(!v)throw new Error(m);n++};
ok(Object.keys(V.modes).length>=45,`expected >=45 modes, got ${Object.keys(V.modes).length}`);const c=V.modes.custom;ok(!!c,'custom mode missing');ok(c.custom===true,'custom flag missing');ok(c.rated===false,'custom mode must not affect global rating');ok(c.content==='mixed','custom default content should be mixed');
const app=fs.readFileSync('app-v5.js','utf8');for(const x of ['installCustomControls','customEndValue','applyCustomControls','targetScore:+m.targetScore','S.settings.scoring||cfg.scoring','S.settings.targetScore||+cfg.targetScore'])ok(app.includes(x),`custom runtime missing ${x}`);
const html=fs.readFileSync('index.html','utf8');ok(html.includes('data-v5-custom.js'),'custom data package not wired');ok(html.includes('custom-v5.css'),'custom CSS not wired');
const sw=fs.readFileSync('sw-v5.js','utf8');ok(sw.includes('data-v5-custom.js'),'custom data not cached');ok(sw.includes('custom-v5.css'),'custom CSS not cached');
console.log(`CUSTOM QA PASS: ${n} assertions, ${Object.keys(V.modes).length} total modes.`);
