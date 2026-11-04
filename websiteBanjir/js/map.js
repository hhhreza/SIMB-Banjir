// ============================================================
// map.js — Leaflet map for flood risk zones
// ============================================================

let floodMap = null;
const RISK_COLORS = { 3: '#ef4444', 2: '#f59e0b', 1: '#22c55e' };
const RISK_LABELS = { 3: 'Tinggi', 2: 'Sedang', 1: 'Rendah' };
const RISK_CLASS  = { 3: 'tinggi', 2: 'sedang', 1: 'rendah' };

function initMap() {
  if (floodMap) return; // already initialized

  floodMap = L.map('map', {
    center: [-2.5, 118.0],
    zoom: 5,
    zoomControl: true,
    attributionControl: true,
  });

  // OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors | Data: BMKG/BNPB',
  }).addTo(floodMap);
}

function renderRiskZones(zones) {
  if (!floodMap) return;

  let countHigh = 0, countMed = 0, countLow = 0;

  zones.forEach(zone => {
    const color  = RISK_COLORS[zone.level_risiko] || '#6b7280';
    const label  = RISK_LABELS[zone.level_risiko] || '-';
    const cls    = RISK_CLASS[zone.level_risiko]  || '';
    const radius = zone.level_risiko === 3 ? 14 : zone.level_risiko === 2 ? 11 : 9;

    if (zone.level_risiko === 3) countHigh++;
    else if (zone.level_risiko === 2) countMed++;
    else countLow++;

    const marker = L.circleMarker(
      [zone.koordinat_lat, zone.koordinat_lng],
      {
        radius,
        fillColor: color,
        color: '#fff',
        weight: 2.5,
        opacity: 1,
        fillOpacity: 0.85,
        className: 'risk-marker',
      }
    ).addTo(floodMap);

    const faktorHTML = (zone.faktor_risiko || [])
      .map(f => `<span class="popup-tag">${f}</span>`)
      .join('');

    marker.bindPopup(`
      <div class="popup-title">📍 ${zone.kabupaten}</div>
      <div class="text-xs text-gray-500 mb-1">${zone.provinsi}</div>
      <span class="popup-badge ${cls}">Risiko ${label}</span>
      <div class="popup-row mt-2"><strong>Faktor Risiko:</strong></div>
      <div class="mb-1">${faktorHTML}</div>
      <div class="popup-rec">✅ ${zone.rekomendasi}</div>
    `, { maxWidth: 280 });

    marker.on('mouseover', function() { this.openPopup(); });
  });

  // Update counters
  const elHigh = document.getElementById('count-high');
  const elMed  = document.getElementById('count-medium');
  const elLow  = document.getElementById('count-low');
  if (elHigh) elHigh.textContent = countHigh;
  if (elMed)  elMed.textContent  = countMed;
  if (elLow)  elLow.textContent  = countLow;

  // Also add flood event markers (smaller, different icon)
  addFloodEventLayer();
}

async function addFloodEventLayer() {
  const events = await window.floodDB.getAll('flood_events');

  // Group by provinsi → pick the risk zone coord for that provinsi
  const zones = await window.floodDB.getAll('risk_zones');
  const coordByProvince = {};
  zones.forEach(z => {
    if (!coordByProvince[z.provinsi]) {
      coordByProvince[z.provinsi] = [z.koordinat_lat, z.koordinat_lng];
    }
  });

  // Extra coords for provinces not in risk_zones
  const extraCoords = {
    'DKI Jakarta':       [-6.2088, 106.8456],
    'Jawa Barat':        [-6.9147, 107.6098],
    'Jawa Tengah':       [-7.1509, 110.1403],
    'Jawa Timur':        [-7.5360, 112.2384],
    'Kalimantan Selatan':[-3.0926, 115.2838],
    'Sulawesi Selatan':  [-5.1477, 119.4327],
    'Sumatera Barat':    [-0.7399, 100.8000],
    'Aceh':              [4.6951, 96.7494],
    'Papua':             [-4.2699, 138.0804],
    'NTT':               [-8.6573, 121.0794],
    'Banten':            [-6.4058, 106.0640],
    'Kalimantan Tengah': [-1.6814, 113.3823],
    'Kalimantan Timur':  [0.5387, 116.4194],
    'Riau':              [0.2933, 101.7068],
    'Sumatera Utara':    [2.1154, 99.5451],
    'Lampung':           [-4.5586, 105.4068],
    'Sulawesi Tengah':   [-1.4300, 121.4456],
    'Maluku':            [-3.6956, 128.1814],
  };

  Object.assign(coordByProvince, extraCoords);

  events.forEach(ev => {
    const coord = coordByProvince[ev.provinsi];
    if (!coord) return;

    // Slightly jitter so events in same province don't overlap perfectly
    const jitter = () => (Math.random() - 0.5) * 0.8;
    const lat = coord[0] + jitter();
    const lng = coord[1] + jitter();

    const hasVictims = ev.korban_jiwa > 0;
    const fillColor  = hasVictims ? '#7c3aed' : '#3b82f6';

    const m = L.circleMarker([lat, lng], {
      radius: 6,
      fillColor,
      color: '#fff',
      weight: 1.5,
      fillOpacity: 0.75,
    }).addTo(floodMap);

    const tgl = new Date(ev.tanggal).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });

    m.bindPopup(`
      <div class="popup-title">🌊 Kejadian Banjir</div>
      <div class="text-xs text-gray-500 mb-2">${ev.kabupaten}, ${ev.provinsi}</div>
      <div class="popup-row">📅 ${tgl}</div>
      <div class="popup-row">Jenis: <strong>${ev.jenis_banjir}</strong></div>
      <div class="popup-row">Ketinggian air: <strong>${ev.ketinggian_cm} cm</strong></div>
      <div class="popup-row">💀 Korban jiwa: <strong style="color:#dc2626">${ev.korban_jiwa} orang</strong></div>
      <div class="popup-row">🤕 Luka-luka: <strong>${ev.luka_luka} orang</strong></div>
      <div class="popup-row">🏠 Pengungsi: <strong>${ev.pengungsi.toLocaleString('id-ID')} orang</strong></div>
      <div class="popup-row">💰 Kerugian: <strong>Rp ${ev.kerugian_juta_rupiah.toLocaleString('id-ID')} juta</strong></div>
      <div class="popup-row text-xs text-gray-400 mt-1">Sumber: ${ev.sumber_data}</div>
    `, { maxWidth: 260 });
  });

  // Add legend for event markers
  addEventLegend();
}

function addEventLegend() {
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function() {
    const div = L.DomUtil.create('div', 'bg-white rounded-xl shadow-lg p-3 text-xs');
    div.style.cssText = 'background:white;padding:10px 14px;border-radius:10px;box-shadow:0 2px 12px rgba(0,0,0,0.15);font-size:12px;line-height:1.8;';
    div.innerHTML = `
      <div style="font-weight:800;color:#1a3a5c;margin-bottom:6px;">LEGENDA PETA</div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;"><span style="width:12px;height:12px;border-radius:50%;background:#ef4444;display:inline-block;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.2)"></span> Zona Risiko Tinggi</div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;"><span style="width:12px;height:12px;border-radius:50%;background:#f59e0b;display:inline-block;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.2)"></span> Zona Risiko Sedang</div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;"><span style="width:12px;height:12px;border-radius:50%;background:#22c55e;display:inline-block;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.2)"></span> Zona Risiko Rendah</div>
      <div style="border-top:1px solid #e5e7eb;margin:6px 0;"></div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;"><span style="width:10px;height:10px;border-radius:50%;background:#7c3aed;display:inline-block;border:2px solid white;"></span> Kejadian (ada korban jiwa)</div>
      <div style="display:flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;border-radius:50%;background:#3b82f6;display:inline-block;border:2px solid white;"></span> Kejadian (tanpa korban jiwa)</div>
    `;
    return div;
  };
  legend.addTo(floodMap);
}

window.floodMap = { initMap, renderRiskZones };
