const CACHE='app-omar-v14';
const ASSETS=['./','./index.html','./home.html','./daily.html','./attendance.html','./tasks.html','./themes.js','./drive-sync.js','./manifest.json','./icon_192.png','./icon_512.png'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  const url = e.request.url;
  if(url.includes('themes.js') || url.includes('script.google.com') || url.includes('script.googleusercontent.com') || url.includes('googleapis.com') || url.includes('drive.google.com')) return;
  e.respondWith(
    caches.match(e.request).then(r=>{
      if(r) return r;
      return fetch(e.request).then(res=>{
        if(e.request.method==='GET' && res.status===200 && e.request.url.startsWith(self.location.origin)){
          let clone=res.clone(); caches.open(CACHE).then(c=>c.put(e.request, clone));
        }
        return res;
      }).catch(()=>r);
    })
  );
});
