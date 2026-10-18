const C='cb-v89';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','parent.html','manifest.json','icon-192.png'])))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!='GET')return;const u=new URL(e.request.url);if(u.pathname.endsWith('/api'))return;if(!(u.origin==location.origin||u.hostname=='www.gstatic.com'))return;
e.respondWith(fetch(e.request,{cache:'no-cache'}).then(r=>{const x=r.clone();caches.open(C).then(c=>c.put(e.request,x));return r}).catch(()=>caches.match(e.request)))});
