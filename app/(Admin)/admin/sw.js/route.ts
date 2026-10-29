const serviceWorker = String.raw`
const OFFLINE_CACHE = "admin-offline-v1";
const OFFLINE_KEY = new URL("/__admin_offline__", self.location.origin).toString();
const OFFLINE_PAGE = ` + "`" + String.raw`<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#1c2b48">
    <title>Sin conexión | Portal Médico</title>
    <style>
      * { box-sizing: border-box; }
      body { min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 24px; background: #e8ecef; color: #1c2b48; font: 16px/1.5 system-ui, sans-serif; }
      main { width: min(100%, 440px); padding: 32px; border-radius: 24px; background: white; box-shadow: 0 12px 40px #1c2b4818; }
      h1 { margin: 0 0 12px; font-size: 1.5rem; }
      p { margin: 0 0 24px; }
      button { border: 0; border-radius: 999px; padding: 12px 20px; background: #1c2b48; color: white; font: inherit; font-weight: 600; cursor: pointer; }
    </style>
  </head>
  <body>
    <main>
      <h1>Sin conexión a internet</h1>
      <p>El portal necesita conexión para cargar pacientes y expedientes. Vuelve a conectarte e inténtalo de nuevo.</p>
      <button type="button" onclick="location.reload()">Intentar de nuevo</button>
    </main>
  </body>
</html>` + "`" + String.raw`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) =>
      cache.put(OFFLINE_KEY, new Response(OFFLINE_PAGE, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith("admin-offline-") && key !== OFFLINE_CACHE)
        .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    request.mode !== "navigate" ||
    url.origin !== self.location.origin ||
    !url.pathname.startsWith("/admin/")
  ) return;

  event.respondWith(
    fetch(request).catch(async () => {
      const cache = await caches.open(OFFLINE_CACHE);
      return (await cache.match(OFFLINE_KEY)) || Response.error();
    })
  );
});
`;

export function GET() {
  return new Response(serviceWorker, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Service-Worker-Allowed": "/admin/",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
