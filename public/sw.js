const CACHE = "bounty-v2";

const OFFLINE_HTML = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Offline · Bounty</title>
<style>body{margin:0;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:#0a0913;color:#f3f1ff;font-family:system-ui}
.c{font-size:48px}.t{font-size:13px;color:#9b96bd;letter-spacing:.2em;text-transform:uppercase}</style></head>
<body><div class="c">🪙</div><div class="t">You're offline</div>
<div style="font-size:13px;color:#9b96bd">Expenses you log will sync when you reconnect.</div></body></html>`;

self.addEventListener("install", (e) => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return; // never touch mutations
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // skip Supabase / cross-origin

  // In-app navigations (RSC payloads): never cache — Next's client Router
  // Cache handles reuse. Caching here is what served stale/empty data.
  if (req.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) return;

  // Full-document loads: network-first, fall back to cache then offline page.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then(
            (r) =>
              r ||
              new Response(OFFLINE_HTML, {
                headers: { "Content-Type": "text/html" },
              }),
          ),
        ),
    );
    return;
  }

  // Static build assets only: cache-first (content-hashed, safe to keep).
  if (
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:css|js|woff2?|png|jpe?g|gif|svg|webp|ico)$/.test(url.pathname)
  ) {
    e.respondWith(
      caches.match(req).then(
        (r) =>
          r ||
          fetch(req).then((res) => {
            if (res.ok && res.type === "basic") {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Everything else → straight to network (no respondWith).
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Bounty", {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url || "/dashboard" },
      tag: data.tag,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const c of list)
          if (c.url.includes(url) && "focus" in c) return c.focus();
        return self.clients.openWindow(url);
      }),
  );
});
