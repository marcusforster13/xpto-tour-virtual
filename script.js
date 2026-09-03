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

// ---------- painel de controle (funciona pra qualquer sala) ----------
// cada sala tem sua própria lista de dispositivos e seu próprio mapa de
// imagens — a chave é a combinação de estados na ordem de "devices",
// 1 = ligado, 0 = desligado. Ex: Sala de Controle tem 3 dispositivos
// (sala, tv, totem) = 8 combinações; a Veritas só tem 2 (sala, tv) = 4.
const ROOM_CONTROLS = {
  controle: {
    devices: ["sala", "tv", "totem"],
    camLabel: "CAM 01",
    title: "Sala de Controle",
    desc: "Onde os operadores acompanham câmeras, alertas e sistemas em tempo real, 24 horas por dia.",
    images: {
      "000": "assets/controle/estado-000.jpg",
      "001": "assets/controle/estado-001.jpg",
      "010": "assets/controle/estado-010.jpg",
      "011": "assets/controle/estado-011.jpg",
      "100": "assets/controle/estado-100.jpg",
      "101": "assets/controle/estado-101.jpg",
      "110": "assets/controle/estado-110.jpg",
      "111": "assets/controle/estado-111.jpg",
    },
  },
  "reuniao-veritas": {
    devices: ["sala", "tv"],
    camLabel: "CAM 02",
    title: "Sala de Reunião 1 — Veritas",
    desc: "Espaço reservado para reuniões estratégicas, alinhamentos e apresentações a clientes.",
    images: {
      "00": "assets/veritas/estado-00.jpg",
      "01": "assets/veritas/estado-01.jpg",
      "10": "assets/veritas/estado-10.jpg",
      "11": "assets/veritas/estado-11.jpg",
    },
  },
  descanso: {
    devices: ["sala", "tv"],
    camLabel: "CAM 05",
    title: "Sala de Descanso",
    desc: "Espaço de convivência da equipe para pausas durante o turno.",
    images: {
      "00": "assets/descanso/estado-00.jpg",
      "01": "assets/descanso/estado-01.jpg",
      "10": "assets/descanso/estado-10.jpg",
      "11": "assets/descanso/estado-11.jpg",
    },
  },
};

const DEVICE_LABELS = {
  sala: "Sala",
  tv: "TV",
  totem: "Totem",
};

var controlStates = {};       // guarda o estado de cada sala separadamente
var activeControlRoomId = null;
var isControlPanelActive = false;

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

const cameraFrameImg   = document.getElementById("camera-frame-img");
const cameraFrameId    = document.getElementById("camera-frame-id");
const cameraFrameTitle = document.getElementById("camera-frame-title");
const cameraFrameDesc  = document.getElementById("camera-frame-desc");
const controlPanel     = document.getElementById("control-panel");
const controlBack      = document.getElementById("control-back");

videoEl.setAttribute("poster", HERO_IMAGE);
camCountEl.textContent = ROOMS.length;

const statCountEl = document.getElementById("stat-count");
if (statCountEl) statCountEl.textContent = String(ROOMS.length).padStart(2, "0");

// ---------- painel de controle ----------
function activeConfig() {
  return ROOM_CONTROLS[activeControlRoomId];
}

function controlKey() {
  var cfg = activeConfig();
  var state = controlStates[activeControlRoomId];
  return cfg.devices.map(function (d) { return state[d] ? "1" : "0"; }).join("");
}

function renderControlButtons() {
  var cfg = activeConfig();
  var state = controlStates[activeControlRoomId];
  var container = document.getElementById("control-buttons");
  container.innerHTML = "";

  cfg.devices.forEach(function (device) {
    var btn = document.createElement("button");
    btn.className = "control-btn" + (state[device] ? " is-on" : "");
    btn.textContent = (state[device] ? "Desligar " : "Ligar ") + DEVICE_LABELS[device];
    btn.addEventListener("click", function () {
      // "lógica certeira": só inverte o estado desse dispositivo — a
      // imagem certa é escolhida automaticamente pela combinação
      // resultante, então nunca fica com a imagem errada.
      state[device] = !state[device];
      renderControlButtons();
      updateControlFrame();
    });
    container.appendChild(btn);
  });
}

function updateControlFrame() {
  var cfg = activeConfig();
  cameraFrameImg.src = cfg.images[controlKey()];
}

function showControlPanelFor(roomId) {
  var cfg = ROOM_CONTROLS[roomId];
  if (!cfg) return;

  isControlPanelActive = true;
  activeControlRoomId = roomId;

  // sempre reabre "tudo ligado", como pedido
  var state = {};
  cfg.devices.forEach(function (d) { state[d] = true; });
  controlStates[roomId] = state;

  cameraFrameId.textContent = cfg.camLabel;
  cameraFrameTitle.textContent = cfg.title;
  cameraFrameDesc.textContent = cfg.desc;
  renderControlButtons();
  updateControlFrame();
  controlPanel.classList.add("active");
}

function hideControlPanel() {
  isControlPanelActive = false;
  activeControlRoomId = null;
  controlPanel.classList.remove("active");
  cameraFrameImg.src = HERO_IMAGE;
  cameraFrameId.textContent = "CAM 01";
  cameraFrameTitle.textContent = "Fachada — XPTO Inc.";
  cameraFrameDesc.textContent = "Vista externa do prédio da XPTO, Rio de Janeiro.";
}

controlBack.addEventListener("click", hideControlPanel);

// ---------- monta a lista do hub (uniforme — a pré-visualização
// grande já fica no quadro de câmera ao lado) ----------
ROOMS.forEach((room) => {
  const li = document.createElement("li");
  const btn = document.createElement("button");
  btn.className = "hub-item";
  btn.setAttribute("data-room", room.id);
  btn.innerHTML = `
    <span class="hub-item-id">${room.camLabel}</span>
    <span class="hub-item-name">${room.title}</span>
    <span class="hub-item-arrow">&rarr;</span>
  `;
  // salas com painel de controle (definidas em ROOM_CONTROLS) mostram
  // o painel na própria moldura da tela principal; as demais continuam
  // "entrando" no ambiente via vídeo.
  if (ROOM_CONTROLS[room.id]) {
    btn.addEventListener("click", () => showControlPanelFor(room.id));
  } else {
    btn.addEventListener("click", () => enterRoom(room));
  }
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
