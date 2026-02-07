window.addEventListener("DOMContentLoaded", () => {
console.log("app.js loaded");
/* ============
   State
============ */
let rawRows = [];          // all rows loaded from CSV
let viewRows = [];         // rows after filtering/search
let activeFilters = {
  chartFilterType: "status",  // "status" | "stage"
  chartFilterValue: null,     // e.g. "Passing"
  search: "",
};
let sortState = { key: "team", dir: "asc" }; // asc|desc
let chartHitZones = []; // for click detection on bars

/* ============
   DOM
============ */
const csvInput = document.getElementById("csvInput");
const loadSampleBtn = document.getElementById("loadSampleBtn");

const kpiOnTrack = document.getElementById("kpiOnTrack");
const kpiAtRisk  = document.getElementById("kpiAtRisk");
const kpiBehind  = document.getElementById("kpiBehind");
const kpiAvgScore = document.getElementById("kpiAvgScore");

const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("searchInput");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");

const detailPanel = document.getElementById("detailPanel");
const detailTitle = document.getElementById("detailTitle");
const detailBody  = document.getElementById("detailBody");
const closePanelBtn = document.getElementById("closePanelBtn");

const chartCanvas = document.getElementById("chartCanvas");
const ctx = chartCanvas.getContext("2d");
const segButtons = document.querySelectorAll(".seg-btn");

let activeChart = "status"; // "status" | "stage"

rawRows = [
  { team: "Team Atlas", stage: "Prototype", last_update: "2026-01-28", avg_score: 94, status: "Stellar" },
  { team: "Team Orion", stage: "Personas", last_update: "2026-01-20", avg_score: 74, status: "Acceptable" },
  { team: "Team Helios", stage: "Wireframes", last_update: "2026-01-22", avg_score: 90, status: "Stellar" },
  { team: "Team Ciri", stage: "High Fidelity", last_update: "2026-01-22", avg_score: 88, status: "Stellar" },
  { team: "Team Nova", stage: "Personas", last_update: "2026-01-18", avg_score: 65, status: "Needs Attention" },
  { team: "Team Zephyr", stage: "High Fidelity", last_update: "2026-01-22", avg_score: 86, status: "Stellar" },
  { team: "Team Ganymede", stage: "Personas", last_update: "2026-01-18", avg_score: 70, status: "Acceptable" },
  { team: "Team Io", stage: "High Fidelity", last_update: "2026-01-22", avg_score: 82, status: "Acceptable" },
  { team: "Team Juno", stage: "Prototype", last_update: "2026-01-22", avg_score: 98, status: "Stellar" },
];

segButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    segButtons.forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    activeChart = btn.dataset.chart;
    renderChart();
  });
});


function computeView() {
  viewRows = [...rawRows];
}

function renderKPIs() {
  const total = rawRows.length;
  if (!total) return;

  const counts = { "Stellar": 0, "Acceptable": 0, "Needs Attention": 0 };
  let scoreSum = 0;

  rawRows.forEach(r => {
    counts[r.status] = (counts[r.status] || 0) + 1;
    scoreSum += r.avg_score || 0;
  });

  kpiOnTrack.textContent = Math.round((counts["Stellar"] / total) * 100) + "%";
  kpiAtRisk.textContent  = Math.round((counts["Acceptable"] / total) * 100) + "%";
  kpiBehind.textContent  = Math.round((counts["Needs Attention"] / total) * 100) + "%";
  kpiAvgScore.textContent = Math.round(scoreSum / total);
}

function renderTable() {
  tableBody.innerHTML = "";

  viewRows.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.team}</td>
      <td>${r.stage}</td>
      <td>${r.last_update}</td>
      <td>${r.avg_score}</td>
      <td>${r.status}</td>
    `;
    tableBody.appendChild(tr);
  });
}

function renderChart() {
  ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

  const counts = {};
  rawRows.forEach(r => {
    const key = activeChart === "status" ? r.status : r.stage;
    counts[key] = (counts[key] || 0) + 1;
  });

  const labels = Object.keys(counts);
  const values = Object.values(counts);

  const max = Math.max(...values, 1);
  const barWidth = 100;
  const gap = 30;
  const baseY = 180;

  ctx.font = "14px system-ui";

  labels.forEach((label, i) => {
    const x = 60 + i * (barWidth + gap);
    const h = (values[i] / max) * 120;

    ctx.fillStyle = "#4b5563";
    ctx.fillRect(x, baseY - h, barWidth, h);

    ctx.fillStyle = "#111827";
    ctx.fillText(label, x, baseY + 20);
    ctx.fillText(values[i], x + barWidth / 2 - 4, baseY - h - 8);
  });
}



function renderAll() {
  computeView();
  renderKPIs();
  renderTable();
  renderChart();
}

function openDetail(row) {
  detailTitle.textContent = row.team;
  detailBody.innerHTML = `
    <p><strong>Status:</strong> ${row.status}</p>
    <p><strong>Stage:</strong> ${row.stage}</p>
    <p><strong>Last update:</strong> ${row.last_update}</p>
    <p><strong>Avg score:</strong> ${row.avg_score}</p>
  `;
}

function renderTable() {
  tableBody.innerHTML = "";

  viewRows.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.team}</td>
      <td>${r.stage}</td>
      <td>${r.last_update}</td>
      <td>${r.avg_score}</td>
      <td>${r.status}</td>
    `;
    tr.addEventListener("click", () => openDetail(r));
    tableBody.appendChild(tr);
  });
}

closePanelBtn.addEventListener("click", () => {
  detailTitle.textContent = "Team details";
  detailBody.innerHTML = `<p class="muted">Click a row to view details.</p>`;
});


console.log("rawRows length:", rawRows.length);

renderAll();

if (rawRows.length) openDetail(rawRows[0]); // show first team on load


})

