// 野球記録 service worker — アプリ本体を端末に保存し、圏外でも起動できるようにする
//
// 方針：アプリ本体は「保存してあるものをすぐ出す。裏で新しいものを取りに行って
// 次回に備える」。毎回ネットを待たないので、開いた瞬間に出る。
// そのぶん、更新は「次に開いたとき」に反映される（開き直せば入る）。
const CACHE = "hsp-s2-toyotaej-v1";
const PREFIX = CACHE.replace(/v\d+$/, "");   // 例）hsp-s2-aomoriyamada-
const SHELL = ["./", "./index.html", "./mod-physical.js", "./mod-trackman.js", "./mod-session.js", "./mod-login.js",
               "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  // 1つ落とせなくても残りは入れる（部品が増えたときに全滅させない）
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(SHELL.map(u =>
      c.add(new Request(u, { cache: "reload" })).catch(() => c.add(u).catch(() => {})))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    // 消すのは自分のアプリの古い版だけ（同じサイトにある別チームのアプリの保存分には触らない）
    .then(keys => Promise.all(keys.filter(k => k !== CACHE && k.indexOf(PREFIX) === 0).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// 裏でこっそり取り直して、次回のために保存しておく
function refresh(req, cache) {
  return fetch(req).then(res => {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
}

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;                        // API送信はそのまま
  if (url.hostname.includes("script.google.com") || url.hostname.includes("googleusercontent.com")) return;

  if (url.origin === location.origin) {
    e.respondWith(caches.open(CACHE).then(cache =>
      cache.match(e.request, { ignoreSearch: true }).then(hit => {
        if (hit) { e.waitUntil(refresh(e.request, cache)); return hit; }   // 保存済みを即返す
        return refresh(e.request, cache).then(res => res ||
          (e.request.mode === "navigate" ? cache.match("./index.html") : new Response("", { status: 504 })));
      })
    ));
    return;
  }
  // フォントなど外部：キャッシュ優先
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return res;
  }).catch(() => new Response("", { status: 503 }))));
});
