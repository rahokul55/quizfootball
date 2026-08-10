import fs from 'node:fs/promises';
const path='app.js';
let s=await fs.readFile(path,'utf8');
const replacements=[
  ['function shuf(a,r=Math.random){a=[...a];for(let i=a.length-1;i;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}',
   'function shuf(a,r=Math.random){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}'],
  ['function startAnthem(force=false){if(!sound||anthem||(!force&&S.status!=="playing"))return;ensureAudio();let ch=[[131,196,262],[104,156,208],[117,175,233],[98,147,196]],i=0;const play=()=>{ch[i++%4].forEach((f,j)=>tone(f,3.5,j?0.018:0.035,j*.02))};play();anthem=setInterval(play,3700)}',
   'function startAnthem(force=false){if(window.QFV4Music?.start)window.QFV4Music.start()}'],
  ['function stopAnthem(){if(anthem)clearInterval(anthem);anthem=null}',
   'function stopAnthem(){if(window.QFV4Music?.stop)window.QFV4Music.stop();if(anthem)clearInterval(anthem);anthem=null}']
];
let changed=0;
for(const [oldText,newText] of replacements){if(s.includes(oldText)){s=s.replace(oldText,newText);changed++}}
await fs.writeFile(path,s);
console.log(`app patches applied: ${changed}/${replacements.length}`);
if(!s.includes('for(let i=a.length-1;i>0;i--)'))throw new Error('safe shuffle patch missing');
if(!s.includes('window.QFV4Music?.start'))throw new Error('V4 music delegation patch missing');
