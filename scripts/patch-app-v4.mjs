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

const cssPath='enhancements-v4.css';
let css=await fs.readFile(cssPath,'utf8');
const marker='/* V4.3 strict logo fit */';
if(!css.includes(marker)){
  css+=`\n${marker}\n.team-logo{padding:0!important;isolation:isolate}\n.team-logo>img{position:absolute!important;inset:12px!important;width:calc(100% - 24px)!important;height:calc(100% - 24px)!important;min-width:0!important;min-height:0!important;max-width:calc(100% - 24px)!important;max-height:calc(100% - 24px)!important;object-fit:contain!important;object-position:center!important;padding:0!important;margin:0!important;transform:none!important}\n@media(max-width:620px){.team-logo>img{inset:9px!important;width:calc(100% - 18px)!important;height:calc(100% - 18px)!important;max-width:calc(100% - 18px)!important;max-height:calc(100% - 18px)!important}}\n`;
  await fs.writeFile(cssPath,css);
  console.log('strict logo CSS appended');
}
console.log(`app patches applied: ${changed}/${replacements.length}`);
if(!s.includes('for(let i=a.length-1;i>0;i--)'))throw new Error('safe shuffle patch missing');
if(!s.includes('window.QFV4Music?.start'))throw new Error('V4 music delegation patch missing');
if(!css.includes(marker))throw new Error('strict logo fit patch missing');
