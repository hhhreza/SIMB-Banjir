// ============================================================
// missing.js — Missing persons search & report feature
// ============================================================

let allMissing = [];

// ── RENDER RESULT CARDS ──────────────────────────────────────

function renderMissingCards(data) {
  const container = document.getElementById('hilang-results');
  if (!container) return;

  if (data.length === 0) {
    container.innerHTML = `
      <div class="text-center text-gray-400 py-8 bg-white rounded-2xl shadow">
        <div class="text-4xl mb-2">🔍</div>
        <div class="font-semibold">Tidak ditemukan data yang sesuai.</div>
        <div class="text-sm mt-1">Coba ubah kata kunci pencarian.</div>
      </div>`;
    return;
  }

  container.innerHTML = data.map(p => {
    const statusClass = {
      hilang:    'status-hilang',
      ditemukan: 'status-ditemukan',
      meninggal: 'status-meninggal',
    }[p.status] || 'status-hilang';

    const statusEmoji = { hilang:'🔴', ditemukan:'🟢', meninggal:'⚫' }[p.status] || '🔴';
    const genderEmoji = p.jenis_kelamin === 'P' ? '👩' : '👨';
    const avatarBg    = { hilang:'#fee2e2', ditemukan:'#dcfce7', meninggal:'#f3f4f6' }[p.status] || '#fee2e2';

    const tgl = p.terakhir_terlihat_tanggal
      ? new Date(p.terakhir_terlihat_tanggal).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })
      : '-';

    return `<div class="missing-card">
      <div class="missing-avatar" style="background:${avatarBg}">${genderEmoji}</div>
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2 flex-wrap">
          <div class="font-bold text-primary text-sm">${p.nama_lengkap}</div>
          <span class="${statusClass}">${statusEmoji} ${p.status.charAt(0).toUpperCase()+p.status.slice(1)}</span>
        </div>
        <div class="text-xs text-gray-500 mt-1">${p.usia} tahun · ${p.provinsi} · ${p.kabupaten}</div>
        <div class="text-xs text-gray-500 mt-1">📍 Terakhir terlihat: <span class="font-medium text-gray-700">${p.terakhir_terlihat_lokasi}</span></div>
        <div class="text-xs text-gray-400 mt-0.5">🗓️ ${tgl}</div>
        ${p.keterangan ? `<div class="text-xs text-blue-700 bg-blue-50 rounded px-2 py-1 mt-2">${p.keterangan}</div>` : ''}
        <div class="text-xs text-gray-400 mt-2">📞 Pelapor: ${p.pelapor_nama} · ${p.pelapor_telp}</div>
      </div>
    </div>`;
  }).join('');
}

// ── SEARCH LOGIC ─────────────────────────────────────────────

function searchMissing() {
  const nama     = (document.getElementById('search-nama')?.value    || '').toLowerCase().trim();
  const nik      = (document.getElementById('search-nik')?.value     || '').trim();
  const provinsi = (document.getElementById('search-provinsi')?.value || '');
  const status   = (document.getElementById('search-status-hilang')?.value || '');

  const filtered = allMissing.filter(p => {
    const matchNama     = !nama     || p.nama_lengkap.toLowerCase().includes(nama);
    const matchNik      = !nik      || p.nik.includes(nik);
    const matchProvinsi = !provinsi || p.provinsi === provinsi;
    const matchStatus   = !status   || p.status === status;
    return matchNama && matchNik && matchProvinsi && matchStatus;
  });

  renderMissingCards(filtered);
}

// ── POPULATE PROVINSI DROPDOWNS ──────────────────────────────

function populateProvinsiDropdowns(missing, events) {
  const provinsiSet = new Set([
    ...missing.map(p => p.provinsi),
    ...events.map(e => e.provinsi),
  ]);
  const sorted = [...provinsiSet].sort();

  const selSearch = document.getElementById('search-provinsi');
  const selForm   = document.querySelector('#form-lapor select[name="provinsi"]');

  sorted.forEach(prov => {
    const opt1 = new Option(prov, prov);
    const opt2 = new Option(prov, prov);
    selSearch?.add(opt1);
    selForm?.add(opt2);
  });
}

// ── REPORT FORM ───────────────────────────────────────────────

function bindReportForm() {
  const form = document.getElementById('form-lapor');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const record = {
      nama_lengkap:              fd.get('nama_lengkap'),
      nik:                       fd.get('nik') || String(Date.now()),
      usia:                      parseInt(fd.get('usia')) || 0,
      jenis_kelamin:             fd.get('jenis_kelamin'),
      provinsi:                  fd.get('provinsi'),
      kabupaten:                 '',
      terakhir_terlihat_tanggal: fd.get('terakhir_terlihat_tanggal'),
      terakhir_terlihat_lokasi:  fd.get('terakhir_terlihat_lokasi'),
      foto_url:                  '',
      pelapor_nama:              fd.get('pelapor_nama'),
      pelapor_telp:              fd.get('pelapor_telp'),
      status:                    'hilang',
      keterangan:                fd.get('keterangan'),
    };

    try {
      await window.floodDB.addRecord('missing_persons', record);
      allMissing = await window.floodDB.getAll('missing_persons');
      renderMissingCards(allMissing);
      form.reset();
      showToast('✅ Laporan berhasil dikirim! Data orang hilang telah tercatat.', 'success');
    } catch (err) {
      showToast('❌ Gagal mengirim laporan. Cek NIK tidak duplikat.', 'error');
      console.error(err);
    }
  });
}

// ── INIT ──────────────────────────────────────────────────────

async function initMissing() {
  allMissing = await window.floodDB.getAll('missing_persons');
  const events = await window.floodDB.getAll('flood_events');

  renderMissingCards(allMissing);
  populateProvinsiDropdowns(allMissing, events);
  bindReportForm();

  document.getElementById('btn-search-hilang')?.addEventListener('click', searchMissing);

  // Real-time search on any input change
  ['search-nama','search-nik','search-provinsi','search-status-hilang'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', searchMissing);
    document.getElementById(id)?.addEventListener('change', searchMissing);
  });
}

window.floodMissing = { initMissing };
