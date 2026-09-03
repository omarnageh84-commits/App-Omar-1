const CACHE = 'app-omar-v15-fast';
const CORE = [
  './',
  './index.html?v=15',
  './daily.html?v=15',
  './manifest.json?v=15',
  './themes.js',
  './icon_192.png',
  './icon_512.png'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  const url = new URL(e.request.url);
  // Network first for html
  if(url.pathname.endsWith('.html')){
    e.respondWith(fetch(e.request).then(r=>{
      const clone = r.clone();
      caches.open(CACHE).then(c=>c.put(e.request, clone));
      return r;
    }).catch(()=>caches.match(e.request)));
    return;
  }
  // Cache first for others
  e.respondWith(caches.match(e.request).then(cached=>{
    return cached || fetch(e.request).then(r=>{
      if(r.ok){
        const clone = r.clone();
        caches.open(CACHE).then(c=>c.put(e.request, clone));
      }
      return r;
    });
  }));
});
