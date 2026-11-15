const STORAGE_KEY = "dj-defkilla-mixes-v1";
const starterMixes = [];
let mixes = loadMixes();
let activeGenre = "Tous";

function loadMixes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : starterMixes;
  } catch { return starterMixes; }
}
function saveMixes() { localStorage.setItem(STORAGE_KEY, JSON.stringify(mixes)); }
function safeText(value) {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function render() {
  const list = mixes.filter(m => activeGenre === "Tous" || m.genre === activeGenre);
  const grid = document.getElementById("mixGrid");
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state"><p class="eyebrow">BIENTÔT ICI</p><h3>TES MIXTAPES ARRIVENT.</h3><p class="small-note">Ajoute ton premier lien Mixcloud dans la section ci-dessous.</p></div>`;
    return;
  }
  grid.innerHTML = list.map(m => `
    <article class="mix-card">
      <div><div class="mix-art">DFK</div><h3>${safeText(m.title)}</h3><div class="mix-meta">${safeText(m.genre)} · DJ DEFKILLA</div></div>
      <div class="card-actions">
        <button class="play-btn" data-play="${safeText(m.id)}">▶ ÉCOUTER</button>
        <button class="share-btn" data-share="${safeText(m.id)}">Partager ↗</button>
      </div>
    </article>`).join("");
}
function mixcloudFeed(url) {
  try {
    const u = new URL(url);
    if (!["mixcloud.com","www.mixcloud.com"].includes(u.hostname)) return null;
    let path = u.pathname;
    if (!path.endsWith("/")) path += "/";
    return "https://www.mixcloud.com/widget/iframe/?hide_cover=1&light=0&feed=" + encodeURIComponent(path);
  } catch { return null; }
}
document.getElementById("mixForm").addEventListener("submit", e => {
  e.preventDefault();
  const title = document.getElementById("mixTitle").value.trim();
  const genre = document.getElementById("mixGenre").value;
  const url = document.getElementById("mixUrl").value.trim();
  const feed = mixcloudFeed(url);
  if (!feed) { alert("Entre un lien de mix publié sur Mixcloud (https://www.mixcloud.com/...)."); return; }
  mixes.unshift({id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), title, genre, url});
  saveMixes(); render(); e.target.reset();
  alert("Mix ajouté à cette liste sur cet appareil !");
});
document.getElementById("filters").addEventListener("click", e => {
  const btn = e.target.closest("[data-genre]");
  if (!btn) return;
  activeGenre = btn.dataset.genre;
  document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b === btn));
  render();
});
document.getElementById("mixGrid").addEventListener("click", async e => {
  const play = e.target.closest("[data-play]");
  const share = e.target.closest("[data-share]");
  const id = (play || share)?.dataset.play || share?.dataset.share;
  const mix = mixes.find(m => m.id === id);
  if (!mix) return;
  if (play) {
    const feed = mixcloudFeed(mix.url);
    if (!feed) return;
    document.getElementById("playerTitle").textContent = mix.title;
    document.getElementById("playerFrame").innerHTML = `<iframe title="Lecteur Mixcloud" allow="autoplay" src="${feed}"></iframe>`;
    const modal = document.getElementById("playerModal");
    modal.classList.add("open"); modal.setAttribute("aria-hidden","false");
  }
  if (share) {
    try {
      if (navigator.share) await navigator.share({title: mix.title, text: "Écoute ce mix de DJ DEFKILLA", url: mix.url});
      else { await navigator.clipboard.writeText(mix.url); alert("Lien copié !"); }
    } catch {}
  }
});
document.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", () => {
  const modal = document.getElementById("playerModal");
  modal.classList.remove("open"); modal.setAttribute("aria-hidden","true");
  document.getElementById("playerFrame").innerHTML = "";
}));
document.getElementById("year").textContent = new Date().getFullYear();
render();

let deferredPrompt;
const installBtn = document.getElementById("installBtn");
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault(); deferredPrompt = e; installBtn.hidden = false;
});
installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; installBtn.hidden = true;
});
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(()=>{}));
