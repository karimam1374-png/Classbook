const C='cb-v137';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','manifest.json','icon-192.png','icon-512.png'])))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!='GET')return;const u=new URL(e.request.url);if(u.pathname.endsWith('/api')||u.pathname.endsWith('parent.html'))return;if(u.origin!=location.origin)return;
e.respondWith(fetch(e.request,{cache:'no-cache'}).then(r=>{if(r&&r.ok){const x=r.clone();caches.open(C).then(c=>c.put(e.request,x))}return r}).catch(()=>caches.match(e.request).then(r=>r||(e.request.mode=='navigate'?caches.match('index.html'):undefined))))});
