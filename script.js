/* =========================================================
   XPTO — Tour Virtual — lógica
   =========================================================
   COMO ADICIONAR UM AMBIENTE DE VERDADE:
   1. Coloque o vídeo de entrada em  assets/videos/NOME.mp4
   2. Coloque uma imagem de capa em  assets/NOME.png
   3. Adicione um objeto no array ROOMS abaixo.

   startTime  = em que segundo do vídeo a reprodução deve
                começar (útil se o vídeo tiver um trecho
                "morto" no início e você quiser pular direto
                pro frame que casa com o clique).
   loopFrame  = se true, ao terminar o vídeo ele congela no
                último frame (dá a sensação de "chegou e parou
                olhando o ambiente"). Se quiser um vídeo em
                loop contínuo dentro do ambiente, troque
                video.loop = true lá na função playRoom().
   ========================================================= */

const ROOMS = [
  {
    id: "controle",
    camLabel: "CAM 01",
    title: "Sala de Controle",
    cover: "assets/sala-controle.png",
    video: "assets/videos/sala-controle.mp4",
    startTime: 0,
  },
  {
    id: "reuniao-veritas",
    camLabel: "CAM 02",
    title: "Sala de Reunião 1 — Veritas",
    cover: "",
    video: "assets/videos/sala-reuniao-veritas.mp4",
    startTime: 0,
  },
  {
    id: "reuniao-tikvah",
    camLabel: "CAM 03",
    title: "Sala de Reunião 2 — Tikvah",
    cover: "",
    video: "assets/videos/sala-reuniao-tikvah.mp4",
    startTime: 0,
  },
  {
    id: "equipamentos",
    camLabel: "CAM 04",
    title: "Equipamentos",
    cover: "",
    video: "assets/videos/equipamentos.mp4",
    startTime: 0,
  },
  {
    id: "descanso",
    camLabel: "CAM 05",
    title: "Sala de Descanso",
    cover: "",
    video: "assets/videos/sala-descanso.mp4",
    startTime: 0,
  },
];

// ---------- elementos ----------
const grid          = document.getElementById("grid");
const menuScreen     = document.getElementById("menu-screen");
const roomScreen      = document.getElementById("room-screen");
const videoEl         = document.getElementById("tour-video");
const fallbackImg     = document.getElementById("tour-fallback");
const roomTitleEl    = document.getElementById("room-title");
const roomTagEl      = document.getElementById("room-tag");
const roomStatusEl   = document.getElementById("room-status");
const backBtn         = document.getElementById("back-btn");
const topbarClock    = document.getElementById("topbar-clock");

// ---------- monta os tiles do painel ----------
ROOMS.forEach((room) => {
  const tile = document.createElement("button");
  tile.className = "feed-tile" + (room.cover ? "" : " placeholder");
  if (room.cover) tile.style.backgroundImage = `url(${room.cover})`;
  tile.setAttribute("data-room", room.id);
  tile.innerHTML = `
    <div class="feed-hud">
      <span class="feed-id">${room.camLabel}</span>
      <span class="feed-rec"><i class="dot"></i>REC</span>
    </div>
    <div class="feed-label">${room.title}</div>
  `;
  tile.addEventListener("click", () => enterRoom(room));
  grid.appendChild(tile);
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
  roomTagEl.textContent = `${room.camLabel} — AO VIVO`;
  roomStatusEl.textContent = "Conectando ao feed…";

  menuScreen.classList.remove("active");
  roomScreen.classList.add("active");

  playRoom(room);
}

// ---------- voltar ao painel ----------
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
    if (room.cover) {
      fallbackImg.src = room.cover;
      fallbackImg.style.display = "block";
      // força reflow pra animação reiniciar sempre
      void fallbackImg.offsetWidth;
      fallbackImg.classList.add("zooming");
    }
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
