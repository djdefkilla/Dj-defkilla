// Official DJ DEFKILLA mix selection.
// New mixes are added to this list by updating the published app; visitors cannot submit mixes.
const mixes = [
  // Example entry format:
  // { id: "mix-001", title: "My new mix", genre: "Hip-hop", url: "https://www.mixcloud.com/..." }
];
let activeGenre = "Tous";
function safeText(value) {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function render() {
  const list = mixes.filter(m => activeGenre === "Tous" || m.genre === activeGenre);
  const grid = document.getElementById("mixGrid");
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state"><p class="eyebrow">DJ DEFKILLA</p><h3>${translations[document.documentElement.lang || "fr"].emptyMix}</h3></div>`;
    return;
  }
  grid.innerHTML = list.map(m => `
    <article class="mix-card">
      <div><div class="mix-art">DFK</div><h3>${safeText(m.title)}</h3><div class="mix-meta">${safeText(m.genre)} · DJ DEFKILLA</div></div>
      <div class="card-actions">
        <button class="play-btn" data-play="${safeText(m.id)}">${translations[document.documentElement.lang || "fr"].play}</button>
        <button class="share-btn" data-share="${safeText(m.id)}">${translations[document.documentElement.lang || "fr"].share}</button>
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
      else { await navigator.clipboard.writeText(mix.url); alert(translations[document.documentElement.lang || "fr"].copied); }
    } catch {}
  }
});
document.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", () => {
  const modal = document.getElementById("playerModal");
  modal.classList.remove("open"); modal.setAttribute("aria-hidden","true");
  document.getElementById("playerFrame").innerHTML = "";
}));
document.getElementById("year").textContent = new Date().getFullYear();

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

window.addEventListener("load", () => { const splash = document.getElementById("splash"); if (splash) setTimeout(() => splash.remove(), 3400); });


// Automatic language: use the visitor's browser language, with a manual FR/EN/ES switch.
const translations = {
  fr: {
    install:"Installer l'app", heroCopy:"Des sélections qui font monter la température, même en hiver. 🎄",
    enterUniverse:"ENTRER DANS L'UNIVERS", holidaySub:"GOOD MUSIC • GOOD ENERGY • HOLIDAY SEASON",
    yourSelection:"TA SÉLECTION", mixes:"LES MIXES", emptyMix:"LES PROCHAINS MIXES ARRIVENT BIENTÔT. Reste connecté à DJ DEFKILLA.", online:"● EN LIGNE", all:"Tous",
    mixHint:"Tous les mixes de cette sélection sont choisis et publiés par DJ DEFKILLA.",
    yourDjSpace:"TON ESPACE DJ", addMix:"AJOUTER UN MIX", mixName:"Nom du mix",
    musicStyle:"Style musical", mixcloudLink:"Lien de ton mix Mixcloud", addToList:"AJOUTER À MA LISTE",
    localNote:"Note : les mixes ajoutés ici sont enregistrés dans ce navigateur uniquement. Pour les afficher automatiquement chez tous tes auditeurs, il faudra ensuite connecter une base de données ou un espace d'administration en ligne.",
    aboutEyebrow:"QUI EST DERRIÈRE LES PLATINES ?", aboutText:"Hip-hop, R&B, Dancehall et Reggaeton. Une sélection, une énergie, une signature.",
    contact:"CONTACTER LE DJ ↗", playerNote:"La lecture est fournie par Mixcloud et nécessite une connexion Internet.",
    close:"Fermer", play:"▶ ÉCOUTER", share:"Partager ↗", invalid:"Entre un lien de mix publié sur Mixcloud (https://www.mixcloud.com/...).",
    added:"Mix ajouté à cette liste sur cet appareil !", copied:"Lien copié !"
  },
  en: {
    install:"Install app", heroCopy:"The selections that turn up the heat, even in winter. 🎄",
    enterUniverse:"ENTER THE EXPERIENCE", holidaySub:"GOOD MUSIC • GOOD ENERGY • HOLIDAY SEASON",
    yourSelection:"YOUR SELECTION", mixes:"MIXES", emptyMix:"NEW MIXES COMING SOON. Stay tuned to DJ DEFKILLA.", online:"● ONLINE", all:"All",
    mixHint:"Every mix in this selection is chosen and published by DJ DEFKILLA.",
    yourDjSpace:"YOUR DJ SPACE", addMix:"ADD A MIX", mixName:"Mix title",
    musicStyle:"Music style", mixcloudLink:"Your Mixcloud mix link", addToList:"ADD TO MY LIST",
    localNote:"Note: mixes added here are saved only in this browser. To show them automatically to all listeners, a shared online database or admin area will be needed.",
    aboutEyebrow:"WHO'S BEHIND THE DECKS?", aboutText:"Hip-hop, R&B, Dancehall and Reggaeton. One selection, one energy, one signature.",
    contact:"CONTACT THE DJ ↗", playerNote:"Playback is provided by Mixcloud and requires an internet connection.",
    close:"Close", play:"▶ LISTEN", share:"Share ↗", invalid:"Enter a Mixcloud mix URL (https://www.mixcloud.com/...).",
    added:"Mix added to this list on this device!", copied:"Link copied!"
  },
  es: {
    install:"Instalar la app", heroCopy:"Selecciones que suben la temperatura, incluso en invierno. 🎄",
    enterUniverse:"ENTRAR EN EL UNIVERSO", holidaySub:"BUENA MÚSICA • BUENA ENERGÍA • TEMPORADA FESTIVA",
    yourSelection:"TU SELECCIÓN", mixes:"SESIONES", emptyMix:"NUEVAS SESIONES MUY PRONTO. Sigue conectado con DJ DEFKILLA.", online:"● EN LÍNEA", all:"Todos",
    mixHint:"Todas las sesiones de esta selección son elegidas y publicadas por DJ DEFKILLA.",
    yourDjSpace:"TU ESPACIO DJ", addMix:"AÑADIR UNA SESIÓN", mixName:"Nombre de la sesión",
    musicStyle:"Estilo musical", mixcloudLink:"Enlace de tu sesión en Mixcloud", addToList:"AÑADIR A MI LISTA",
    localNote:"Nota: las sesiones añadidas aquí se guardan solo en este navegador. Para mostrarlas automáticamente a todos los oyentes, hará falta una base de datos compartida o un área de administración en línea.",
    aboutEyebrow:"¿QUIÉN ESTÁ DETRÁS DE LOS PLATOS?", aboutText:"Hip-hop, R&B, Dancehall y Reggaeton. Una selección, una energía, una firma.",
    contact:"CONTACTAR CON EL DJ ↗", playerNote:"La reproducción se ofrece mediante Mixcloud y requiere conexión a Internet.",
    close:"Cerrar", play:"▶ ESCUCHAR", share:"Compartir ↗", invalid:"Introduce un enlace de Mixcloud (https://www.mixcloud.com/...).",
    added:"¡Sesión añadida a esta lista en este dispositivo!", copied:"¡Enlace copiado!"
  }
};
function applyLanguage(lang) {
  const chosen = translations[lang] ? lang : "fr";
  document.documentElement.lang = chosen;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const value = translations[chosen][el.dataset.i18n];
    if (value) el.textContent = value;
  });
  const install = document.getElementById("installBtn");
  if (install) install.textContent = translations[chosen].install;
  const close = document.querySelector(".close");
  if (close) close.setAttribute("aria-label", translations[chosen].close);
  localStorage.setItem("dj-defkilla-language", chosen);
  const select = document.getElementById("languageSelect");
  if (select) select.value = chosen;
  render();
}
const languageSelect = document.getElementById("languageSelect");
const savedLanguage = localStorage.getItem("dj-defkilla-language");
const browserLanguage = (navigator.language || "fr").slice(0,2).toLowerCase();
applyLanguage(savedLanguage || (translations[browserLanguage] ? browserLanguage : "fr"));
languageSelect?.addEventListener("change", () => applyLanguage(languageSelect.value));



// DJ DEFKILLA background music — resilient tap-to-play controls.
document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("backgroundAudio");
  const toggle = document.getElementById("soundToggle");
  const volume = document.getElementById("soundVolume");
  const status = document.getElementById("soundStatus");
  if (!audio || !toggle || !volume || !status) return;

  audio.loop = true;
  audio.preload = "auto";
  audio.volume = Number(volume.value || 0.22);

  const setState = (playing, message) => {
    toggle.textContent = playing ? "Ⅱ PAUSE" : "▶ ÉCOUTER";
    toggle.classList.toggle("is-playing", playing);
    toggle.setAttribute("aria-pressed", playing ? "true" : "false");
    status.textContent = message || (playing ? "Ambiance activée" : "Musique désactivée");
  };

  toggle.addEventListener("click", async (event) => {
    event.preventDefault();
    if (!audio.paused) {
      audio.pause();
      setState(false, "Musique en pause");
      return;
    }
    setState(false, "Chargement de la musique…");
    try {
      audio.currentTime = 0;
      await audio.play();
      setState(true, "Ambiance activée");
    } catch (error) {
      console.error("DJ DEFKILLA audio playback error:", error);
      setState(false, "Lecture impossible : vérifie ta connexion puis réessaie");
    }
  });

  volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
  });

  audio.addEventListener("play", () => setState(true, "Ambiance activée"));
  audio.addEventListener("pause", () => setState(false, "Musique en pause"));
  audio.addEventListener("ended", () => setState(false, "Musique terminée"));
  audio.addEventListener("error", () => {
    setState(false, "Fichier audio introuvable — vérifie le dépôt GitHub");
  });
});
