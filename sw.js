/* Replaced with the content hash and the complete asset list during build. */
const VERSION = "78ec5ca619b78a27";
const FILES = ["index.html","assets/index-C3UjpAzl.css","assets/index-B3vfRqt3.js","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png"];
const PREFIX = `panel-rpg:${self.registration.scope}:`;
const CACHE = PREFIX + VERSION;
const urls = FILES.map(file => new URL(file, self.registration.scope).href);
const shell = new URL('index.html', self.registration.scope).href;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // A partial download must not replace an existing working installation.
    await cache.addAll(urls.map(url => new Request(url, { cache: 'reload' })));
  })());
  // Wait until old clients close; activating mid-battle could mix app versions.
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(self.registration.scope)) return;
  const url = new URL(request.url);
  url.search = '';
  const key = request.mode === 'navigate' ? shell : url.href;
  if (request.mode !== 'navigate' && !urls.includes(key)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    return (await cache.match(key)) ?? fetch(request);
  })());
});
