import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const C=require('../game-core-v4.js');
const raw=fs.readFileSync(new URL('../data.js',import.meta.url),'utf8'),sandbox={window:{}};
vm.createContext(sandbox);vm.runInContext(raw,sandbox);const D=sandbox.window.QF_DATA;
let n=0;const ok=(cond,msg)=>{if(!cond)throw new Error(msg);n++};
ok(D.cards.length>=100,`expected >=100 cards, got ${D.cards.length}`);
const ids=new Set(),pairs=new Set(),answers=new Set();
for(const c of D.cards){
  ok(!ids.has(c.id),`duplicate card id ${c.id}`);ids.add(c.id);
  const pair=[c.teamA,c.teamB].sort().join('|');ok(!pairs.has(pair),`duplicate team pair ${pair}`);pairs.add(pair);
  ok(!answers.has(c.answer),`duplicate correct player ${c.answer}`);answers.add(c.answer);
  const errs=C.validateCard(D,c);ok(!errs.length,`${c.id}: ${errs.join(', ')}`);
  for(const count of [4,6,8]){const opts=C.buildOptions(D,c,count,'qa-seed');ok(opts.length===count,`${c.id}: ${count} options expected, got ${opts.length}`);ok(new Set(opts).size===opts.length,`${c.id}: duplicate options`);ok(opts.filter(x=>x===c.answer).length===1,`${c.id}: answer missing/duplicate`);for(const id of opts)if(id!==c.answer)ok(C.safeDistractor(D,c,id),`${c.id}: unsafe distractor ${id}`)}
}
const players={a:{id:'a',active:true,score:0,wrong:0,streak:0,bestStreak:0},b:{id:'b',active:true,score:0,wrong:0,streak:0,bestStreak:0}},state={players,selections:{},options:['x','y','ans'],answer:'ans',locked:false,winnerId:null};
ok(C.applyPick(state,'a','x').status==='wrong','wrong selection failed');ok(players.a.score===0,'wrong selection awarded score');ok(C.applyPick(state,'b','ans').status==='correct','correct selection failed');ok(players.b.score===1&&players.a.score===0,'only first correct may score');ok(state.locked&&state.winnerId==='b','round must lock on first correct');ok(C.applyPick(state,'a','ans').status==='ignored','late answer must be ignored');
const state2={players:{a:{id:'a',active:true,wrong:0},b:{id:'b',active:true,wrong:0}},selections:{},options:['x','y','ans'],answer:'ans',locked:false};C.applyPick(state2,'a','x');const r=C.applyPick(state2,'b','y');ok(r.allSpent===true,'all-wrong must close round');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');ok(!/Rahim/i.test(html),'personal placeholder Rahim present');for(const x of [4,6,8])ok(html.includes(`data-choice="${x}"`),`choice ${x} missing`);ok(html.includes('musicVolume'),'music volume control missing');
const app=fs.readFileSync(new URL('../app-v4.js',import.meta.url),'utf8');ok(app.includes('startMatchMusic'),'continuous match music missing');ok(app.includes('lastCardKey'),'answer-grid render de-dup missing');ok(app.includes('imagePromises'),'image request de-dup missing');
console.log(`QA PASS: ${n} assertions, ${D.cards.length} cards, ${pairs.size} unique pairs, ${answers.size} unique correct players.`);
