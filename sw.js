const CACHE='app-omar-v21-no-splash';
const CORE=['./','./index.html?v=21','./daily.html?v=21','./manifest.json?v=21','./icon_192.png','./icon_512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET') return;
 const u=new URL(e.request.url);
 if(u.pathname.endsWith('.html')){
  e.respondWith(fetch(e.request).then(r=>{caches.open(CACHE).then(c=>c.put(e.request,r.clone()));return r;}).catch(()=>caches.match(e.request)));
  return;
 }
 e.respondWith(caches.match(e.request).then(m=>m||fetch(e.request).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put(e.request,r.clone()));return r;})));
});
self.addEventListener('notificationclick', e=>{
  e.notification.close();
  const action = e.action || 'daily';
  let url = './index.html?v=21#'+action;
  e.waitUntil(clients.openWindow(url));
});
