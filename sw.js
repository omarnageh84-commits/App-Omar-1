const CACHE='app-omar-v17';
const CORE=['./','./index.html?v=17','./daily.html?v=17','./attendance.html?v=17','./tasks.html?v=17','./manifest.json?v=17','./icon_192.png','./icon_512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET') return;
 const url=new URL(e.request.url);
 if(url.pathname.endsWith('.html')){
  e.respondWith(fetch(e.request).then(r=>{caches.open(CACHE).then(c=>c.put(e.request,r.clone()));return r;}).catch(()=>caches.match(e.request)));
  return;
 }
 e.respondWith(caches.match(e.request).then(ch=>ch||fetch(e.request).then(r=>{if(r.ok){caches.open(CACHE).then(c=>c.put(e.request,r.clone()));}return r;})));
});
