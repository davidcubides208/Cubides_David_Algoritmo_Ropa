// =====================
// 1) Datos base
// =====================

const marcas = [
  "Zara",
  "H&M",
  "Nike",
  "Adidas",
  "Pull&Bear",
  "Shein",
  "Levi's",
  "Uniqlo",
  "Tommy Hilfiger",
  "Calvin Klein"
];

const segmentos = {
  J: "Jóvenes",
  A: "Adultos",
  E: "Consumidor económico",
  P: "Consumidor premium"
};

const contextos = {
  D: "¿Cuál comprarías para uso diario?",
  C: "¿Cuál percibes como de mejor calidad?",
  E: "¿Cuál representa mejor tu estilo?",
  P: "¿Cuál vale más la pena por su precio?"
};

const RATING_INICIAL = 1000;
const K = 32;

// =====================
// 2) Estado y storage
// =====================

const STORAGE_KEY = "fashionmash_state_v1";

function defaultState() {
  const buckets = {};
  for (const s in segmentos) {
    for (const c in contextos) {
      const key = `${s}__${c}`;
      buckets[key] = {};
      marcas.forEach(m => buckets[key][m] = RATING_INICIAL);
    }
  }
  return { buckets };
}

let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// =====================
// 3) Funciones Elo
// =====================

function expectedScore(ra, rb) {
  return 1 / (1 + Math.pow(10, (rb - ra) / 400));
}

function updateElo(bucket, a, b, winner) {
  const ra = bucket[a];
  const rb = bucket[b];

  const ea = expectedScore(ra, rb);
  const eb = expectedScore(rb, ra);

  bucket[a] = ra + K * ((winner === "A" ? 1 : 0) - ea);
  bucket[b] = rb + K * ((winner === "B" ? 1 : 0) - eb);
}

// =====================
// 4) UI
// =====================

const segmentSelect = document.getElementById("segmentSelect");
const contextSelect = document.getElementById("contextSelect");
const labelA = document.getElementById("labelA");
const labelB = document.getElementById("labelB");
const questionEl = document.getElementById("question");
const topBox = document.getElementById("topBox");

let currentA = null;
let currentB = null;

function fillSelect(select, obj) {
  for (const k in obj) {
    const opt = document.createElement("option");
    opt.value = k;
    opt.textContent = obj[k];
    select.appendChild(opt);
  }
}

fillSelect(segmentSelect, segmentos);
fillSelect(contextSelect, contextos);

function newDuel() {
  currentA = marcas[Math.floor(Math.random() * marcas.length)];
  do {
    currentB = marcas[Math.floor(Math.random() * marcas.length)];
  } while (currentA === currentB);

  labelA.textContent = currentA;
  labelB.textContent = currentB;
  questionEl.textContent = contextos[contextSelect.value];
}

function vote(winner) {
  const key = `${segmentSelect.value}__${contextSelect.value}`;
  updateElo(state.buckets[key], currentA, currentB, winner);
  saveState();
  renderTop();
  newDuel();
}

function renderTop() {
  const key = `${segmentSelect.value}__${contextSelect.value}`;
  const rows = Object.entries(state.buckets[key])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  topBox.innerHTML = rows.map((r, i) => `
    <div class="toprow">
      <div><b>${i + 1}.</b> ${r[0]}</div>
      <div>${r[1].toFixed(1)}</div>
    </div>
  `).join("");
}

document.getElementById("btnA").onclick = () => vote("A");
document.getElementById("btnB").onclick = () => vote("B");
document.getElementById("btnNewPair").onclick = newDuel;
document.getElementById("btnShowTop").onclick = renderTop;

document.getElementById("btnReset").onclick = () => {
  if (!confirm("Esto borrará todos los datos guardados. ¿Continuar?")) return;
  state = defaultState();
  saveState();
  renderTop();
  newDuel();
};

// init
newDuel();
renderTop();
