/* JESSIE LIFE OS — cache shutdown worker */
self.addEventListener("install",event=>event.waitUntil(self.skipWaiting()));
self.addEventListener("activate",event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.map(k=>caches.delete(k)));
  await self.clients.claim();
  await self.registration.unregister();
  const clients=await self.clients.matchAll({type:"window",includeUncontrolled:true});
  clients.forEach(client=>client.postMessage({type:"JESSIE_CACHE_PURGED"}));
})()));
self.addEventListener("fetch",event=>event.respondWith(fetch(event.request)));
