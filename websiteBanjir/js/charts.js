// ============================================================
// charts.js — Chart.js visualizations
// ============================================================

const CHART_COLORS = {
  blue:   '#3b82f6',
  orange: '#e85d04',
  red:    '#ef4444',
  yellow: '#f59e0b',
  green:  '#22c55e',
  purple: '#7c3aed',
  teal:   '#0d9488',
  pink:   '#ec4899',
};

const CHART_TEXT_COLOR = 'rgba(255,255,255,0.85)';
const CHART_GRID_COLOR = 'rgba(255,255,255,0.12)';

Chart.defaults.color = CHART_TEXT_COLOR;
Chart.defaults.font.family = "-apple-system, 'Segoe UI', sans-serif";

function pulau(provinsi) {
  const map = {
    'Jawa': ['DKI Jakarta','Jawa Barat','Jawa Tengah','Jawa Timur','DI Yogyakarta','Banten'],
    'Sumatera': ['Aceh','Sumatera Utara','Sumatera Barat','Riau','Jambi','Sumatera Selatan','Bengkulu','Lampung','Kepulauan Bangka Belitung','Kepulauan Riau'],
    'Kalimantan': ['Kalimantan Barat','Kalimantan Tengah','Kalimantan Selatan','Kalimantan Timur','Kalimantan Utara'],
    'Sulawesi': ['Sulawesi Utara','Sulawesi Tengah','Sulawesi Selatan','Sulawesi Tenggara','Gorontalo','Sulawesi Barat'],
    'Papua': ['Papua','Papua Barat','Papua Selatan','Papua Tengah','Papua Pegunungan','Papua Barat Daya'],
    'Nusa Tenggara': ['Bali','Nusa Tenggara Barat','NTT','NTB'],
    'Maluku': ['Maluku','Maluku Utara'],
  };
  for (const [island, provinces] of Object.entries(map)) {
    if (provinces.some(p => provinsi.includes(p) || p.includes(provinsi))) return island;
  }
  return 'Lainnya';
}

async function initCharts() {
  const events = await window.floodDB.getAll('flood_events');

  buildChartPerTahun(events);
  buildChartPulau(events);
  buildChartKorban(events);
  buildChartJenis(events);
  buildChartProvinsi(events);
  buildChartPengungsi(events);
}

// 1. Kejadian per Tahun (Bar)
function buildChartPerTahun(events) {
  const years = ['2020','2021','2022','2023','2024'];
  const counts = years.map(y => events.filter(e => e.tanggal.startsWith(y)).length);

  new Chart(document.getElementById('chart-pertahun'), {
    type: 'bar',
    data: {
      labels: years,
      datasets: [{
        label: 'Jumlah Kejadian',
        data: counts,
        backgroundColor: years.map((_, i) => [
          CHART_COLORS.blue, CHART_COLORS.orange, CHART_COLORS.red,
          CHART_COLORS.yellow, CHART_COLORS.purple
        ][i]),
        borderRadius: 6,
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: CHART_GRID_COLOR }, ticks: { stepSize: 1 } },
        x: { grid: { color: 'transparent' } },
      }
    }
  });
}

// 2. Sebaran per Pulau (Pie)
function buildChartPulau(events) {
  const pulauCount = {};
  events.forEach(e => {
    const p = pulau(e.provinsi);
    pulauCount[p] = (pulauCount[p] || 0) + 1;
  });

  const labels = Object.keys(pulauCount);
  const data   = Object.values(pulauCount);
  const colors = [CHART_COLORS.blue, CHART_COLORS.orange, CHART_COLORS.green, CHART_COLORS.purple, CHART_COLORS.yellow, CHART_COLORS.red, CHART_COLORS.teal];

  new Chart(document.getElementById('chart-pulau'), {
    type: 'pie',
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#1a3a5c' }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } }
      }
    }
  });
}

// 3. Korban Jiwa per Tahun (Line)
function buildChartKorban(events) {
  const years = ['2020','2021','2022','2023','2024'];
  const jiwa     = years.map(y => events.filter(e => e.tanggal.startsWith(y)).reduce((s,e) => s+e.korban_jiwa, 0));
  const luka     = years.map(y => events.filter(e => e.tanggal.startsWith(y)).reduce((s,e) => s+e.luka_luka, 0));

  new Chart(document.getElementById('chart-korban'), {
    type: 'line',
    data: {
      labels: years,
      datasets: [
        {
          label: 'Korban Jiwa',
          data: jiwa,
          borderColor: CHART_COLORS.red,
          backgroundColor: 'rgba(239,68,68,0.15)',
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: CHART_COLORS.red,
        },
        {
          label: 'Luka-luka',
          data: luka,
          borderColor: CHART_COLORS.orange,
          backgroundColor: 'rgba(232,93,4,0.10)',
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: CHART_COLORS.orange,
        }
      ]
    },
    options: {
      plugins: { legend: { position: 'top' } },
      scales: {
        y: { grid: { color: CHART_GRID_COLOR } },
        x: { grid: { color: 'transparent' } },
      }
    }
  });
}

// 4. Jenis Banjir (Doughnut)
function buildChartJenis(events) {
  const jenisCounts = {};
  events.forEach(e => { jenisCounts[e.jenis_banjir] = (jenisCounts[e.jenis_banjir] || 0) + 1; });

  new Chart(document.getElementById('chart-jenis'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(jenisCounts),
      datasets: [{
        data: Object.values(jenisCounts),
        backgroundColor: [CHART_COLORS.red, CHART_COLORS.blue, CHART_COLORS.pink],
        borderWidth: 2,
        borderColor: '#1a3a5c',
      }]
    },
    options: {
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } } },
      cutout: '60%',
    }
  });
}

// 5. Top 5 Provinsi terdampak (Horizontal Bar)
function buildChartProvinsi(events) {
  const provKorban = {};
  events.forEach(e => {
    if (!provKorban[e.provinsi]) provKorban[e.provinsi] = { kejadian: 0, korban: 0 };
    provKorban[e.provinsi].kejadian++;
    provKorban[e.provinsi].korban += e.korban_jiwa;
  });

  const sorted = Object.entries(provKorban)
    .sort((a, b) => b[1].korban - a[1].korban)
    .slice(0, 5);

  new Chart(document.getElementById('chart-provinsi'), {
    type: 'bar',
    data: {
      labels: sorted.map(s => s[0]),
      datasets: [{
        label: 'Korban Jiwa',
        data: sorted.map(s => s[1].korban),
        backgroundColor: CHART_COLORS.red,
        borderRadius: 6,
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: CHART_GRID_COLOR } },
        y: { grid: { color: 'transparent' }, ticks: { font: { size: 11 } } },
      }
    }
  });
}

// 6. Total Pengungsi per Tahun (Bar)
function buildChartPengungsi(events) {
  const years  = ['2020','2021','2022','2023','2024'];
  const totals = years.map(y =>
    events.filter(e => e.tanggal.startsWith(y)).reduce((s, e) => s + e.pengungsi, 0)
  );

  new Chart(document.getElementById('chart-pengungsi'), {
    type: 'bar',
    data: {
      labels: years,
      datasets: [{
        label: 'Jumlah Pengungsi',
        data: totals,
        backgroundColor: CHART_COLORS.teal,
        borderRadius: 6,
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: {
          grid: { color: CHART_GRID_COLOR },
          ticks: { callback: v => v >= 1000 ? (v/1000)+'rb' : v }
        },
        x: { grid: { color: 'transparent' } },
      }
    }
  });
}

window.floodCharts = { initCharts };
