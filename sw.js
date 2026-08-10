const APP_CACHE="quiz-football-app-v5";
const MEDIA_CACHE="quiz-football-media-v2";
const LOCAL=["./","./index.html","./styles.css","./data.js","./app.js","./icon.svg","./manifest.webmanifest"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(APP_CACHE).then(cache=>cache.addAll(LOCAL)));self.skipWaiting()});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>![APP_CACHE,MEDIA_CACHE].includes(k)).map(k=>caches.delete(k)))));self.clients.claim()});
async function networkFirst(req,cacheName){const cache=await caches.open(cacheName);try{const res=await fetch(req);if(res&&res.ok)cache.put(req,res.clone());return res}catch{const cached=await cache.match(req);return cached||Response.error()}}
async function cacheFirst(req,cacheName){const cache=await caches.open(cacheName),cached=await cache.match(req);if(cached)return cached;const res=await fetch(req);if(res&&(res.ok||res.type==="opaque"))cache.put(req,res.clone());return res}
async function staleWhileRevalidate(req,cacheName){const cache=await caches.open(cacheName),cached=await cache.match(req);const fresh=fetch(req).then(res=>{if(res&&(res.ok||res.type==="opaque"))cache.put(req,res.clone());return res}).catch(()=>null);return cached||await fresh||Response.error()}
self.addEventListener("fetch",event=>{const req=event.request,url=new URL(req.url);if(req.method!=="GET")return;
  if(req.mode==="navigate"){event.respondWith(networkFirst(req,APP_CACHE));return}
  if(url.origin===self.location.origin){event.respondWith(staleWhileRevalidate(req,APP_CACHE));return}
  if(url.hostname==="upload.wikimedia.org"){event.respondWith(cacheFirst(req,MEDIA_CACHE));return}
  if(url.hostname==="en.wikipedia.org"&&url.pathname.includes("/w/api.php")){event.respondWith(staleWhileRevalidate(req,MEDIA_CACHE));return}
  if(url.hostname==="cdn.jsdelivr.net"){event.respondWith(cacheFirst(req,MEDIA_CACHE))}
});
