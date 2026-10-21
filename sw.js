/* Hablá música: funciona sin conexión una vez abierto */
const V='pulso-v12';
const FILES=['./','index.html','manifest.webmanifest','bricolage-latin.woff2','bricolage-latin-ext.woff2','noto-music.woff2','icon.svg','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  const u=new URL(r.url);
  /* la API de grupos y el panel docente nunca pasan por la copia guardada */
  if(r.method!=='GET'||u.origin!==location.origin||u.pathname.indexOf('/api/')===0||u.pathname.indexOf('/docente')===0)return;
  /* la página: red primero, así los cambios llegan; si no hay red, la copia guardada */
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put('index.html',cp));return res}).catch(()=>caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res})));
});
