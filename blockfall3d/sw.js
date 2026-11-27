const CACHE='blockfall3d-v1';
const ASSETS=['./','./index.html','./style.css','./app.mjs','./engine.mjs','./storage.mjs','./view.mjs','./vendor/three.min.js','./icon.svg','./apple-touch-icon.png','./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('blockfall3d-')&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url),base=new URL('./',self.location.href);if(e.request.method!=='GET'||u.origin!==base.origin||!u.pathname.startsWith(base.pathname))return;
 // A running version uses one coherent asset set. A newer worker waits until
 // all old tabs close before replacing it, so updates cannot mix game engines.
 e.respondWith(caches.open(CACHE).then(async cache=>{const key=e.request.mode==='navigate'?'./index.html':e.request;const hit=await cache.match(key);if(hit)return hit;return fetch(e.request)}));
});
