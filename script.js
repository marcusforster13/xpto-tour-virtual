/* =========================================================
   XPTO — Tour Virtual — lógica
   =========================================================
   CONCEITO: a imagem principal (assets/sala-controle.png) é o
   "frame zero" compartilhado por todos os ambientes — é o
   ponto de partida visual do tour, e serve de poster/fallback
   pra todos os vídeos, já que cada vídeo de entrada começa
   visualmente a partir dessa mesma cena.

   COMO ADICIONAR UM AMBIENTE DE VERDADE:
   1. Coloque o vídeo de entrada em  assets/videos/NOME.mp4
      (o vídeo deve começar visualmente parecido com a imagem
      HERO_IMAGE definida abaixo, já que é o frame comum).
   2. Adicione um objeto no array ROOMS abaixo, com título,
      descrição e caminho do vídeo.

   startTime = em que segundo do vídeo a reprodução deve
               começar, caso o arquivo tenha um trecho "morto"
               no início.
   ========================================================= */

const HERO_IMAGE = "assets/sala-controle.png";
const FEATURED_CARD_IMAGE = "assets/sala-controle-card.jpg"; // recorte sem a TV da parede, específico pro card do menu

const ROOMS = [
  {
    id: "controle",
    camLabel: "CAM 01",
    title: "Sala de Controle",
    description: "Onde os operadores acompanham câmeras, alertas e sistemas em tempo real, 24 horas por dia.",
    video: "assets/videos/sala-controle.mp4",
    startTime: 0,
  },
  {
    id: "reuniao-veritas",
    camLabel: "CAM 02",
    title: "Sala de Reunião 1 — Veritas",
    description: "Espaço reservado para reuniões estratégicas, alinhamentos e apresentações a clientes.",
    video: "assets/videos/sala-reuniao-veritas.mp4",
    startTime: 0,
  },
  {
    id: "reuniao-tikvah",
    camLabel: "CAM 03",
    title: "Sala de Reunião 2 — Tikvah",
    description: "Ambiente para reuniões internas, treinamentos e alinhamentos de equipe.",
    video: "assets/videos/sala-reuniao-tikvah.mp4",
    startTime: 0,
  },
  {
    id: "equipamentos",
    camLabel: "CAM 04",
    title: "Equipamentos",
    description: "A estrutura técnica por trás da operação: servidores, racks e sistemas de gravação.",
    video: "assets/videos/equipamentos.mp4",
    startTime: 0,
  },
  {
    id: "descanso",
    camLabel: "CAM 05",
    title: "Sala de Descanso",
    description: "Espaço de convivência da equipe para pausas durante o turno.",
    video: "assets/videos/sala-descanso.mp4",
    startTime: 0,
  },
];

// ---------- elementos ----------
const hubList        = document.getElementById("hub-list");
const camCountEl     = document.getElementById("cam-count");
const menuScreen     = document.getElementById("menu-screen");
const roomScreen     = document.getElementById("room-screen");
const videoEl        = document.getElementById("tour-video");
const fallbackImg    = document.getElementById("tour-fallback");
const infoBox        = document.getElementById("info-box");
const infoClose      = document.getElementById("info-close");
const roomTitleEl    = document.getElementById("room-title");
const roomDescEl     = document.getElementById("room-desc");
const roomTagEl      = document.getElementById("room-tag");
const roomTag2El     = document.getElementById("room-tag-2");
const roomStatusEl   = document.getElementById("room-status");
const backBtn        = document.getElementById("back-btn");
const topbarClock    = document.getElementById("topbar-clock");

videoEl.setAttribute("poster", HERO_IMAGE);
camCountEl.textContent = ROOMS.length;

const statCountEl = document.getElementById("stat-count");
if (statCountEl) statCountEl.textContent = String(ROOMS.length).padStart(2, "0");

// ---------- monta a lista do hub ----------
// o primeiro ambiente vira um card em destaque (com imagem),
// os demais entram como lista compacta abaixo.
ROOMS.forEach((room, index) => {
  const li = document.createElement("li");
  const btn = document.createElement("button");
  const isFeatured = index === 0;

  btn.className = "hub-item" + (isFeatured ? " hub-item--featured" : "");
  btn.setAttribute("data-room", room.id);

  if (isFeatured) {
    btn.style.backgroundImage = `linear-gradient(180deg, rgba(10,13,16,0.55) 0%, rgba(10,13,16,0.95) 60%), url(${FEATURED_CARD_IMAGE})`;
    btn.style.backgroundPosition = "center";
    btn.innerHTML = `
      <span class="hub-item-id">${room.camLabel} — PRINCIPAL</span>
      <span class="hub-item-name">${room.title}</span>
      <span class="hub-item-desc">${room.description}</span>
    `;
  } else {
    btn.innerHTML = `
      <span class="hub-item-id">${room.camLabel}</span>
      <span class="hub-item-name">${room.title}</span>
      <span class="hub-item-arrow">&rarr;</span>
    `;
  }

  btn.addEventListener("click", () => enterRoom(room));
  li.appendChild(btn);
  hubList.appendChild(li);
});

// ---------- relógio no topo (efeito HUD) ----------
function tickClock() {
  const now = new Date();
  topbarClock.textContent = now.toLocaleTimeString("pt-BR", { hour12: false });
}
tickClock();
setInterval(tickClock, 1000);

// ---------- entrar num ambiente ----------
function enterRoom(room) {
  roomTitleEl.textContent = room.title;
  roomDescEl.textContent = room.description;
  roomTagEl.textContent = `${room.camLabel} — AO VIVO`;
  roomTag2El.textContent = room.camLabel;
  roomStatusEl.textContent = "Conectando ao feed…";
  infoBox.classList.remove("hidden");

  menuScreen.classList.remove("active");
  roomScreen.classList.add("active");

  playRoom(room);
}

// ---------- fechar caixa de descrição (sem sair do ambiente) ----------
infoClose.addEventListener("click", () => {
  infoBox.classList.add("hidden");
});

// ---------- voltar ao mapa ----------
backBtn.addEventListener("click", () => {
  videoEl.pause();
  videoEl.removeAttribute("src");
  videoEl.load();
  fallbackImg.classList.remove("zooming");
  fallbackImg.style.display = "none";
  videoEl.style.display = "block";

  roomScreen.classList.remove("active");
  menuScreen.classList.add("active");
});

// ---------- reprodução do vídeo de entrada ----------
function playRoom(room) {
  videoEl.style.display = "block";
  fallbackImg.style.display = "none";
  fallbackImg.classList.remove("zooming");

  videoEl.src = room.video;
  videoEl.currentTime = room.startTime || 0;

  const useFallback = () => {
    videoEl.style.display = "none";
    fallbackImg.src = HERO_IMAGE;
    fallbackImg.style.display = "block";
    // força reflow pra animação reiniciar sempre
    void fallbackImg.offsetWidth;
    fallbackImg.classList.add("zooming");
    roomStatusEl.textContent = "Pré-visualização — vídeo de entrada ainda não configurado";
  };

  videoEl.oncanplay = () => {
    roomStatusEl.textContent = "Ao vivo";
    videoEl.play().catch(useFallback);
  };

  videoEl.onended = () => {
    // congela no último frame dando a sensação de "chegou"
    videoEl.pause();
  };

  videoEl.onerror = useFallback;

  // se depois de um curto tempo o navegador não conseguiu nem
  // começar a carregar (ex: arquivo não existe), cai no fallback
  setTimeout(() => {
    if (videoEl.readyState === 0) useFallback();
  }, 700);
}
