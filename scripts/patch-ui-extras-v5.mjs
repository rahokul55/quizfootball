import fs from 'node:fs/promises';
let html=await fs.readFile('index.html','utf8'),n=0;
if(!html.includes('extras-v5.css')){html=html.replace('<link rel="stylesheet" href="v5.css?v=500" />','<link rel="stylesheet" href="v5.css?v=500" />\n  <link rel="stylesheet" href="extras-v5.css?v=550" />');n++}else if(html.includes('extras-v5.css?v=532')){html=html.replaceAll('extras-v5.css?v=532','extras-v5.css?v=550');n++}
if(!html.includes('social-v5.css')){html=html.replace(/<link rel="stylesheet" href="extras-v5\.css\?v=\d+" \/>/,'$&\n  <link rel="stylesheet" href="social-v5.css?v=550" />');n++}else if(html.includes('social-v5.css?v=540')){html=html.replaceAll('social-v5.css?v=540','social-v5.css?v=550');n++}
if(!html.includes('custom-v5.css')){html=html.replace(/<link rel="stylesheet" href="social-v5\.css\?v=\d+" \/>/,'$&\n  <link rel="stylesheet" href="custom-v5.css?v=550" />');n++}
if(!html.includes('extras-v5.js')){html=html.replace('<script src="app-v5.js?v=500"></script>','<script src="app-v5.js?v=500"></script>\n  <script src="extras-v5.js?v=550"></script>');n++}else if(/extras-v5\.js\?v=\d+/.test(html)){html=html.replace(/extras-v5\.js\?v=\d+/g,'extras-v5.js?v=550');n++}
await fs.writeFile('index.html',html);
console.log(`UI extras wiring patches applied: ${n}`);
for(const x of ['extras-v5.css?v=550','social-v5.css?v=550','custom-v5.css?v=550','extras-v5.js?v=550'])if(!html.includes(x))throw new Error(`V5 production wiring missing ${x}`);
