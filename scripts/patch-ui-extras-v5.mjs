import fs from 'node:fs/promises';let html=await fs.readFile('index.html','utf8'),n=0;
if(!html.includes('extras-v5.css')){html=html.replace('<link rel="stylesheet" href="v5.css?v=500" />','<link rel="stylesheet" href="v5.css?v=500" />\n  <link rel="stylesheet" href="extras-v5.css?v=532" />');n++}
if(!html.includes('social-v5.css')){html=html.replace('<link rel="stylesheet" href="extras-v5.css?v=532" />','<link rel="stylesheet" href="extras-v5.css?v=532" />\n  <link rel="stylesheet" href="social-v5.css?v=540" />');n++}
if(!html.includes('extras-v5.js')){html=html.replace('<script src="app-v5.js?v=500"></script>','<script src="app-v5.js?v=500"></script>\n  <script src="extras-v5.js?v=540"></script>');n++}
await fs.writeFile('index.html',html);console.log(`UI extras wiring patches applied: ${n}`);if(!html.includes('extras-v5.css?v=532')||!html.includes('social-v5.css?v=540')||!html.includes('extras-v5.js?v=540'))throw new Error('V5 extras wiring failed');
