import fs from 'node:fs';

function rw(path, fn) {
  const old = fs.readFileSync(path, 'utf8');
  const next = fn(old);
  if (next !== old) fs.writeFileSync(path, next);
}

rw('match3d-v13.js', s => {
  if (s.includes('V14_FRAME_PACING')) return s;

  s = s.replace(
    'let cfg=load(),scene=null,canvas=null,sourceCanvas=null,raf=0,last=performance.now(),lastRender=0,level=2,avgIntervals=[],lastQualityChange=0,lastMoment=null,oldSolo=null,oldOnline=null,bypassInstalled=false;',
    'let cfg=load(),scene=null,canvas=null,sourceCanvas=null,raf=0,last=performance.now(),lastRender=0,level=2,avgIntervals=[],lastQualityChange=0,lastMoment=null,oldSolo=null,oldOnline=null,bypassInstalled=false,sizeCache=null,matrixPool=[],matrixPoolIndex=0,lastHudUpdate=0,lastHudText="";'
  );

  s = s.replace(
    'function mat4(){return new Float32Array(16)}',
    'function mat4(){const i=matrixPoolIndex++;return matrixPool[i]||(matrixPool[i]=new Float32Array(16))}'
  );

  s = s.replace(/function gpuMesh\(gl,m\)\{[\s\S]*?return\{vao,inst,count:m\.i\.length\}\}/,
`function gpuMesh(gl,m){const vao=gl.createVertexArray();gl.bindVertexArray(vao);const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);const inter=new Float32Array((m.p.length/3)*6);for(let a=0,b=0;a<m.p.length;a+=3,b+=6){inter[b]=m.p[a];inter[b+1]=m.p[a+1];inter[b+2]=m.p[a+2];inter[b+3]=m.n[a];inter[b+4]=m.n[a+1];inter[b+5]=m.n[a+2]}gl.bufferData(gl.ARRAY_BUFFER,inter,gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,m.i,gl.STATIC_DRAW);const inst=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,inst);gl.bufferData(gl.ARRAY_BUFFER,21*4*512,gl.DYNAMIC_DRAW);const stride=21*4;for(let c=0;c<4;c++){const loc=2+c;gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,4,gl.FLOAT,false,stride,c*16);gl.vertexAttribDivisor(loc,1)}gl.enableVertexAttribArray(6);gl.vertexAttribPointer(6,4,gl.FLOAT,false,stride,64);gl.vertexAttribDivisor(6,1);gl.bindVertexArray(null);return{vao,inst,count:m.i.length,cpu:new Float32Array(21*512)}}`);

  s = s.replace(/function uploadDraw\(s,mesh,items\)\{[\s\S]*?stats\.drawCalls\+\+;stats\.instances\+=items\.length\}/,
`function uploadDraw(s,mesh,items){if(!items.length)return;const gl=s.gl,need=items.length*21;if(mesh.cpu.length<need)mesh.cpu=new Float32Array(Math.max(need,mesh.cpu.length*2));const data=mesh.cpu;let o=0;for(const it of items){data.set(it.m,o);o+=16;data[o++]=it.c[0];data[o++]=it.c[1];data[o++]=it.c[2];data[o++]=it.c[3]??1;data[o++]=0}gl.bindVertexArray(mesh.vao);gl.bindBuffer(gl.ARRAY_BUFFER,mesh.inst);gl.bufferSubData(gl.ARRAY_BUFFER,0,data.subarray(0,need));gl.drawElementsInstanced(gl.TRIANGLES,mesh.count,gl.UNSIGNED_SHORT,0,items.length);stats.drawCalls++;stats.instances+=items.length}`);

  s = s.replace(/function advance\(v,dt\)\{[\s\S]*?\}\nfunction installBypass/,
`function advance(v,dt){if(!v?.visual)return;dt=Math.min(.034,Math.max(.001,dt||.016));for(const p of[...(v.visual.home||[]),...(v.visual.away||[])]){const stamina=clamp((p.stamina||100)/100,.55,1),a=1-Math.exp(-dt*(7.4*stamina));p.x+=(p.tx-p.x)*a;p.y+=(p.ty-p.y)*a}const b=v.visual.ball;if(b){const a=1-Math.exp(-dt*12.5);b.x+=(b.tx-b.x)*a;b.y+=(b.ty-b.y)*a}const f=v.visual.focus;if(f){const a=1-Math.exp(-dt*5.8);f.x+=(f.targetX-f.x)*a;f.y+=(f.targetY-f.y)*a}}\nfunction installBypass`);

  s = s.replace(/advance\(v,\.016\);return true/g, 'return true');

  s = s.replace(/function resize\(\)\{[\s\S]*?\}\nfunction norm/,
`function resize(force=false){if(!force&&sizeCache&&canvas?.isConnected&&sourceCanvas?.isConnected)return sizeCache;if(!canvas||!sourceCanvas||!scene)return null;const r=sourceCanvas.getBoundingClientRect(),pr=sourceCanvas.parentElement?.getBoundingClientRect();if(!pr||r.width<10||r.height<10)return null;canvas.style.left=\`${'${r.left-pr.left}'}px\`;canvas.style.top=\`${'${r.top-pr.top}'}px\`;canvas.style.width=\`${'${r.width}'}px\`;canvas.style.height=\`${'${r.height}'}px\`;const base=level===2?1.0:level===1?.82:.64,dpr=Math.min(devicePixelRatio||1,base),w=Math.max(480,Math.round(r.width*dpr)),h=Math.max(270,Math.round(r.height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}sizeCache={w,h,cssW:r.width,cssH:r.height};return sizeCache}\nfunction norm`);

  s = s.replace(/function render\(src,t,dt\)\{[\s\S]*?\}\nfunction adapt/,
`const V14_LIGHT=new Float32Array([-.25,.88,.38]);\nfunction render(src,t,dt){matrixPoolIndex=0;advance(src.v,dt);const sz=resize();if(!sz||!scene)return;const s=scene,g=s.gl,start=performance.now();g.viewport(0,0,sz.w,sz.h);g.clearColor(.008,.017,.026,1);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);g.useProgram(s.pr);g.uniformMatrix4fv(s.uP,false,perspective(Math.PI/5.05,sz.w/sz.h,.1,220));const cam=camera(src);g.uniformMatrix4fv(s.uV,false,lookAt(cam.eye,cam.target));g.uniform3fv(s.uLight,V14_LIGHT);stats.drawCalls=0;stats.instances=0;const inst=sceneInstances(src,t);uploadDraw(s,s.cube,inst.C);uploadDraw(s,s.sphere,inst.S);uploadDraw(s,s.cyl,inst.Y);stats.renderMs=+(performance.now()-start).toFixed(2);stats.frames++;stats.level=level;stats.targetFps=60;if(t-lastHudUpdate>500){lastHudUpdate=t;const hud=document.getElementById("v13Perf"),text=\`${'${Math.round(stats.avgFps)}'} FPS • ${'${level===2?"YÜKSEK":level===1?"DENGELİ":"PERFORMANS"}'}\`;if(hud&&text!==lastHudText){hud.textContent=text;lastHudText=text}}}\nfunction adapt`);

  s = s.replace(/function loop\(t\)\{[\s\S]*?raf=requestAnimationFrame\(loop\)\}\nwindow\.addEventListener\("qf:v11-commentary"/,
`function loop(t){const interval=Math.max(1,Math.min(50,t-last));last=t;installBypass();const src=source();if(!cfg.enabled||!src){if(scene||canvas)detach();raf=requestAnimationFrame(loop);return}attach(src);if(!scene){raf=requestAnimationFrame(loop);return}adapt(interval);lastRender=t;render(src,t,interval/1000);raf=requestAnimationFrame(loop)}\nwindow.addEventListener("qf:v11-commentary"`);

  s = s.replace('window.addEventListener("resize",()=>{if(canvas&&sourceCanvas)resize()});',
    'window.addEventListener("resize",()=>{sizeCache=null;if(canvas&&sourceCanvas)resize(true)});');
  s = s.replace('scene=null;canvas=null;sourceCanvas=null}', 'scene=null;canvas=null;sourceCanvas=null;sizeCache=null}');
  s += '\n/* V14_FRAME_PACING: every RAF renders; quality only changes resolution/detail, never animation cadence. */\n';
  return s;
});

rw('runtime-v13.js', s => s
  .replace(/V13\.2/g, 'V14')
  .replace(/13\.2\.1/g, '14.0.0')
);

rw('index.html', s => {
  s = s.replace(/Quiz Football V13\.2/g, 'Quiz Football V14');
  s = s.replace(/V13\.2/g, 'V14');
  s = s.replace(/\s*<script src="match-details-v10\.js\?v=\d+"><\/script>/g, '');
  s = s.replace(/\s*<script src="commentary-v13\.js\?v=\d+"><\/script>/g, '');
  s = s.replace(/\s*<script src="commentary-v14\.js\?v=\d+"><\/script>/g, '');
  s = s.replace(/<script src="match-flow-v11\.js\?v=1100"><\/script>/,
    '<script src="match-details-v10.js?v=1000"></script>\n  <script src="match-flow-v11.js?v=1100"></script>');
  s = s.replace(/<script src="match3d-v13\.js\?v=\d+"><\/script>/,
    '<script src="match3d-v13.js?v=1400"></script>\n  <script src="commentary-v14.js?v=1400"></script>');
  s = s.replace(/audio-v13\.js\?v=\d+/g, 'audio-v13.js?v=1400');
  s = s.replace(/runtime-v13\.js\?v=\d+/g, 'runtime-v13.js?v=1400');
  s = s.replace(/v13\.css\?v=\d+/g, 'v13.css?v=1400');
  return s;
});

rw('sw-v5.js', s => {
  s = s.replace(/const CACHE='quizfootball-[^']+'/, "const CACHE='quizfootball-v14.0.0'");
  if (!s.includes("'./commentary-v14.js'")) s = s.replace("'./runtime-v13.js'", "'./runtime-v13.js','./commentary-v14.js'");
  return s;
});

console.log('V14 production patch applied: zero deliberate frame skipping, pooled WebGL buffers/matrices, cached layout, single match-details runtime and V14 commentary wiring.');
