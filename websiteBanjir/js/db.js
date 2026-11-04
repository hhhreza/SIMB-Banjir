// ============================================================
// db.js — IndexedDB init + complete seed data
// Sumber data: diadaptasi dari data BMKG/BNPB (dummy/ilustratif)
// ============================================================

const DB_NAME = 'banjirDB';
const DB_VERSION = 1;
let db;

// ── SEED DATA ───────────────────────────────────────────────

const SEED_FLOOD_EVENTS = [
  { id:1,  provinsi:'DKI Jakarta',         kabupaten:'Jakarta Utara',      tanggal:'2020-01-01', jenis_banjir:'Genangan',  ketinggian_cm:120, luas_ha:1250, korban_jiwa:3,  luka_luka:12, pengungsi:4500, rumah_terendam:1800, kerugian_juta_rupiah:28000, sumber_data:'BPBD DKI', status:'selesai' },
  { id:2,  provinsi:'DKI Jakarta',         kabupaten:'Jakarta Timur',      tanggal:'2020-01-02', jenis_banjir:'Genangan',  ketinggian_cm:80,  luas_ha:900,  korban_jiwa:1,  luka_luka:5,  pengungsi:2100, rumah_terendam:900,  kerugian_juta_rupiah:15000, sumber_data:'BPBD DKI', status:'selesai' },
  { id:3,  provinsi:'Jawa Barat',          kabupaten:'Bandung',            tanggal:'2020-02-15', jenis_banjir:'Genangan',  ketinggian_cm:60,  luas_ha:500,  korban_jiwa:0,  luka_luka:3,  pengungsi:800,  rumah_terendam:320,  kerugian_juta_rupiah:5400,  sumber_data:'BMKG',     status:'selesai' },
  { id:4,  provinsi:'Jawa Barat',          kabupaten:'Bekasi',             tanggal:'2020-03-10', jenis_banjir:'Bandang',   ketinggian_cm:200, luas_ha:1800, korban_jiwa:7,  luka_luka:30, pengungsi:12000,rumah_terendam:4500, kerugian_juta_rupiah:42000, sumber_data:'BNPB',     status:'selesai' },
  { id:5,  provinsi:'Jawa Tengah',         kabupaten:'Semarang',           tanggal:'2020-03-25', jenis_banjir:'Rob',       ketinggian_cm:90,  luas_ha:700,  korban_jiwa:0,  luka_luka:0,  pengungsi:1500, rumah_terendam:600,  kerugian_juta_rupiah:8200,  sumber_data:'BMKG',     status:'selesai' },
  { id:6,  provinsi:'Jawa Timur',          kabupaten:'Sidoarjo',           tanggal:'2020-04-05', jenis_banjir:'Genangan',  ketinggian_cm:70,  luas_ha:400,  korban_jiwa:0,  luka_luka:2,  pengungsi:600,  rumah_terendam:250,  kerugian_juta_rupiah:3100,  sumber_data:'BPBD Jatim',status:'selesai' },
  { id:7,  provinsi:'Kalimantan Selatan',  kabupaten:'Banjarmasin',        tanggal:'2021-01-13', jenis_banjir:'Bandang',   ketinggian_cm:280, luas_ha:5000, korban_jiwa:21, luka_luka:90, pengungsi:45000,rumah_terendam:18000,kerugian_juta_rupiah:135000,sumber_data:'BNPB',     status:'selesai' },
  { id:8,  provinsi:'Kalimantan Selatan',  kabupaten:'Banjar',             tanggal:'2021-01-14', jenis_banjir:'Bandang',   ketinggian_cm:310, luas_ha:6200, korban_jiwa:15, luka_luka:65, pengungsi:38000,rumah_terendam:14000,kerugian_juta_rupiah:98000, sumber_data:'BNPB',     status:'selesai' },
  { id:9,  provinsi:'Sulawesi Selatan',    kabupaten:'Luwu Utara',         tanggal:'2020-07-13', jenis_banjir:'Bandang',   ketinggian_cm:350, luas_ha:4800, korban_jiwa:38, luka_luka:145,pengungsi:28000,rumah_terendam:9800, kerugian_juta_rupiah:112000,sumber_data:'BNPB',     status:'selesai' },
  { id:10, provinsi:'Sulawesi Selatan',    kabupaten:'Makassar',           tanggal:'2021-02-22', jenis_banjir:'Genangan',  ketinggian_cm:110, luas_ha:2100, korban_jiwa:2,  luka_luka:18, pengungsi:7800, rumah_terendam:3100, kerugian_juta_rupiah:22000, sumber_data:'BMKG',     status:'selesai' },
  { id:11, provinsi:'Sumatera Barat',      kabupaten:'Padang',             tanggal:'2020-06-08', jenis_banjir:'Bandang',   ketinggian_cm:180, luas_ha:1400, korban_jiwa:9,  luka_luka:40, pengungsi:5500, rumah_terendam:2200, kerugian_juta_rupiah:35000, sumber_data:'BMKG',     status:'selesai' },
  { id:12, provinsi:'Sumatera Barat',      kabupaten:'Agam',               tanggal:'2024-05-11', jenis_banjir:'Bandang',   ketinggian_cm:400, luas_ha:8000, korban_jiwa:67, luka_luka:180,pengungsi:18000,rumah_terendam:6700, kerugian_juta_rupiah:185000,sumber_data:'BNPB',     status:'selesai' },
  { id:13, provinsi:'Aceh',               kabupaten:'Aceh Utara',          tanggal:'2021-11-01', jenis_banjir:'Genangan',  ketinggian_cm:150, luas_ha:3200, korban_jiwa:5,  luka_luka:22, pengungsi:14000,rumah_terendam:5600, kerugian_juta_rupiah:48000, sumber_data:'BMKG',     status:'selesai' },
  { id:14, provinsi:'Aceh',               kabupaten:'Aceh Tamiang',        tanggal:'2022-12-05', jenis_banjir:'Genangan',  ketinggian_cm:200, luas_ha:4100, korban_jiwa:3,  luka_luka:11, pengungsi:22000,rumah_terendam:8900, kerugian_juta_rupiah:62000, sumber_data:'BNPB',     status:'selesai' },
  { id:15, provinsi:'Papua',              kabupaten:'Jayapura',             tanggal:'2020-03-16', jenis_banjir:'Bandang',   ketinggian_cm:250, luas_ha:2700, korban_jiwa:11, luka_luka:55, pengungsi:8000, rumah_terendam:3200, kerugian_juta_rupiah:55000, sumber_data:'BNPB',     status:'selesai' },
  { id:16, provinsi:'NTT',                kabupaten:'Flores Timur',         tanggal:'2021-04-04', jenis_banjir:'Bandang',   ketinggian_cm:320, luas_ha:3800, korban_jiwa:72, luka_luka:220,pengungsi:15000,rumah_terendam:5100, kerugian_juta_rupiah:142000,sumber_data:'BNPB',     status:'selesai' },
  { id:17, provinsi:'NTT',                kabupaten:'Kupang',               tanggal:'2022-03-20', jenis_banjir:'Bandang',   ketinggian_cm:180, luas_ha:1900, korban_jiwa:8,  luka_luka:35, pengungsi:4200, rumah_terendam:1800, kerugian_juta_rupiah:28000, sumber_data:'BMKG',     status:'selesai' },
  { id:18, provinsi:'Jawa Barat',         kabupaten:'Cianjur',              tanggal:'2022-01-08', jenis_banjir:'Bandang',   ketinggian_cm:220, luas_ha:2300, korban_jiwa:5,  luka_luka:28, pengungsi:9500, rumah_terendam:3800, kerugian_juta_rupiah:58000, sumber_data:'BNPB',     status:'selesai' },
  { id:19, provinsi:'Jawa Tengah',        kabupaten:'Demak',                tanggal:'2024-02-01', jenis_banjir:'Rob',       ketinggian_cm:130, luas_ha:8500, korban_jiwa:0,  luka_luka:0,  pengungsi:22000,rumah_terendam:8800, kerugian_juta_rupiah:75000, sumber_data:'BMKG',     status:'selesai' },
  { id:20, provinsi:'Jawa Tengah',        kabupaten:'Pekalongan',           tanggal:'2023-01-12', jenis_banjir:'Rob',       ketinggian_cm:100, luas_ha:1200, korban_jiwa:0,  luka_luka:1,  pengungsi:3400, rumah_terendam:1400, kerugian_juta_rupiah:18000, sumber_data:'BMKG',     status:'selesai' },
  { id:21, provinsi:'Kalimantan Tengah',  kabupaten:'Palangka Raya',        tanggal:'2021-09-15', jenis_banjir:'Genangan',  ketinggian_cm:160, luas_ha:3500, korban_jiwa:0,  luka_luka:4,  pengungsi:6500, rumah_terendam:2500, kerugian_juta_rupiah:32000, sumber_data:'BPBD Kalteng',status:'selesai' },
  { id:22, provinsi:'Kalimantan Timur',   kabupaten:'Samarinda',            tanggal:'2022-06-11', jenis_banjir:'Genangan',  ketinggian_cm:140, luas_ha:2200, korban_jiwa:1,  luka_luka:8,  pengungsi:5200, rumah_terendam:2100, kerugian_juta_rupiah:29000, sumber_data:'BMKG',     status:'selesai' },
  { id:23, provinsi:'Riau',               kabupaten:'Pekanbaru',            tanggal:'2021-03-06', jenis_banjir:'Genangan',  ketinggian_cm:95,  luas_ha:1600, korban_jiwa:0,  luka_luka:5,  pengungsi:3800, rumah_terendam:1550, kerugian_juta_rupiah:19000, sumber_data:'BMKG',     status:'selesai' },
  { id:24, provinsi:'Sumatera Utara',     kabupaten:'Medan',                tanggal:'2020-10-04', jenis_banjir:'Genangan',  ketinggian_cm:85,  luas_ha:1300, korban_jiwa:1,  luka_luka:9,  pengungsi:2900, rumah_terendam:1200, kerugian_juta_rupiah:16000, sumber_data:'BMKG',     status:'selesai' },
  { id:25, provinsi:'Jawa Timur',         kabupaten:'Malang',               tanggal:'2021-11-22', jenis_banjir:'Bandang',   ketinggian_cm:190, luas_ha:1700, korban_jiwa:4,  luka_luka:21, pengungsi:6800, rumah_terendam:2700, kerugian_juta_rupiah:41000, sumber_data:'BNPB',     status:'selesai' },
  { id:26, provinsi:'Banten',             kabupaten:'Lebak',                tanggal:'2020-01-01', jenis_banjir:'Bandang',   ketinggian_cm:260, luas_ha:3100, korban_jiwa:16, luka_luka:70, pengungsi:21000,rumah_terendam:8200, kerugian_juta_rupiah:88000, sumber_data:'BNPB',     status:'selesai' },
  { id:27, provinsi:'Sulawesi Tengah',    kabupaten:'Palu',                 tanggal:'2023-05-18', jenis_banjir:'Bandang',   ketinggian_cm:210, luas_ha:2000, korban_jiwa:3,  luka_luka:15, pengungsi:4100, rumah_terendam:1600, kerugian_juta_rupiah:25000, sumber_data:'BMKG',     status:'selesai' },
  { id:28, provinsi:'Maluku',             kabupaten:'Ambon',                tanggal:'2022-07-09', jenis_banjir:'Bandang',   ketinggian_cm:170, luas_ha:1100, korban_jiwa:2,  luka_luka:10, pengungsi:2200, rumah_terendam:880,  kerugian_juta_rupiah:14000, sumber_data:'BNPB',     status:'selesai' },
  { id:29, provinsi:'Lampung',            kabupaten:'Bandar Lampung',       tanggal:'2023-11-30', jenis_banjir:'Genangan',  ketinggian_cm:75,  luas_ha:900,  korban_jiwa:0,  luka_luka:2,  pengungsi:1800, rumah_terendam:720,  kerugian_juta_rupiah:9500,  sumber_data:'BMKG',     status:'selesai' },
  { id:30, provinsi:'DKI Jakarta',        kabupaten:'Jakarta Barat',        tanggal:'2024-02-18', jenis_banjir:'Genangan',  ketinggian_cm:105, luas_ha:1100, korban_jiwa:1,  luka_luka:7,  pengungsi:3600, rumah_terendam:1400, kerugian_juta_rupiah:21000, sumber_data:'BPBD DKI', status:'selesai' },
  { id:31, provinsi:'Jawa Barat',         kabupaten:'Garut',                tanggal:'2022-09-17', jenis_banjir:'Bandang',   ketinggian_cm:300, luas_ha:2600, korban_jiwa:12, luka_luka:48, pengungsi:11000,rumah_terendam:4400, kerugian_juta_rupiah:72000, sumber_data:'BNPB',     status:'selesai' },
  { id:32, provinsi:'Jawa Tengah',        kabupaten:'Cilacap',              tanggal:'2023-03-07', jenis_banjir:'Rob',       ketinggian_cm:80,  luas_ha:750,  korban_jiwa:0,  luka_luka:0,  pengungsi:1200, rumah_terendam:480,  kerugian_juta_rupiah:7200,  sumber_data:'BMKG',     status:'selesai' },
];

const SEED_RISK_ZONES = [
  { id:1,  provinsi:'DKI Jakarta',        kabupaten:'Jakarta Utara',     koordinat_lat:-6.1200, koordinat_lng:106.8900, level_risiko:3, faktor_risiko:['Rob','Permukaan tanah rendah','Padat penduduk'],         rekomendasi:'Pembangunan tanggul laut, sistem pompanisasi' },
  { id:2,  provinsi:'DKI Jakarta',        kabupaten:'Jakarta Barat',     koordinat_lat:-6.1680, koordinat_lng:106.7630, level_risiko:3, faktor_risiko:['Drainase buruk','Aliran Kali Angke'],                   rekomendasi:'Normalisasi sungai, biopori massal' },
  { id:3,  provinsi:'Jawa Barat',         kabupaten:'Bekasi',            koordinat_lat:-6.2383, koordinat_lng:106.9756, level_risiko:3, faktor_risiko:['DAS Citarum','Alih fungsi lahan','Deforestasi hulu'],    rekomendasi:'Penghijauan hulu Citarum, retarding basin' },
  { id:4,  provinsi:'Jawa Barat',         kabupaten:'Bandung',           koordinat_lat:-6.9175, koordinat_lng:107.6191, level_risiko:2, faktor_risiko:['Cekungan Bandung','Curah hujan tinggi'],                 rekomendasi:'Kolam retensi, sumur resapan' },
  { id:5,  provinsi:'Jawa Tengah',        kabupaten:'Semarang',          koordinat_lat:-6.9932, koordinat_lng:110.4203, level_risiko:3, faktor_risiko:['Penurunan muka tanah','Rob laut Jawa'],                 rekomendasi:'Tanggul rob, rumah panggung' },
  { id:6,  provinsi:'Jawa Tengah',        kabupaten:'Demak',             koordinat_lat:-6.8936, koordinat_lng:110.6384, level_risiko:3, faktor_risiko:['Rob ekstrem','Abrasi pantai','Penurunan tanah'],         rekomendasi:'Relokasi pemukiman, mangrove restoration' },
  { id:7,  provinsi:'Jawa Timur',         kabupaten:'Sidoarjo',          koordinat_lat:-7.4478, koordinat_lng:112.7184, level_risiko:2, faktor_risiko:['DAS Brantas','Limpasan tambak'],                         rekomendasi:'Normalisasi Kali Porong' },
  { id:8,  provinsi:'Kalimantan Selatan', kabupaten:'Banjarmasin',       koordinat_lat:-3.3186, koordinat_lng:114.5944, level_risiko:3, faktor_risiko:['Dataran rendah','Deforestasi masif','Curah hujan 3000mm/th'], rekomendasi:'Reboisasi, sistem peringatan dini BMKG' },
  { id:9,  provinsi:'Kalimantan Selatan', kabupaten:'Hulu Sungai Tengah',koordinat_lat:-2.7191, koordinat_lng:115.3936, level_risiko:3, faktor_risiko:['DAS Barito','Topografi cekung'],                        rekomendasi:'Early warning system, jalur evakuasi' },
  { id:10, provinsi:'Sulawesi Selatan',   kabupaten:'Luwu Utara',        koordinat_lat:-2.5637, koordinat_lng:120.4036, level_risiko:3, faktor_risiko:['Lereng curam','Curah hujan > 2500mm','Erosi tinggi'],    rekomendasi:'Check dam, terasering, mitigasi longsor' },
  { id:11, provinsi:'Sulawesi Selatan',   kabupaten:'Makassar',          koordinat_lat:-5.1477, koordinat_lng:119.4327, level_risiko:2, faktor_risiko:['Drainase perkotaan','Luapan Sungai Jeneberang'],          rekomendasi:'Normalisasi drainase, bendungan pengendali' },
  { id:12, provinsi:'Sumatera Barat',     kabupaten:'Padang',            koordinat_lat:-0.9471, koordinat_lng:100.4172, level_risiko:2, faktor_risiko:['Bukit Barisan','Curah hujan tinggi','Sungai pendek terjal'],rekomendasi:'Sistem EWS di hulu sungai' },
  { id:13, provinsi:'Sumatera Barat',     kabupaten:'Agam',              koordinat_lat:-0.2184, koordinat_lng:100.0672, level_risiko:3, faktor_risiko:['Gunung Marapi aktif','Lahar hujan','DAS sempit'],         rekomendasi:'Jalur evakuasi lahar, sabo dam' },
  { id:14, provinsi:'Aceh',              kabupaten:'Aceh Utara',          koordinat_lat:5.1842,  koordinat_lng:97.0910,  level_risiko:2, faktor_risiko:['DAS Krueng Peusangan','Pasang surut'],                  rekomendasi:'Normalisasi sungai, penataan sempadan' },
  { id:15, provinsi:'Papua',             kabupaten:'Jayapura',            koordinat_lat:-2.5916, koordinat_lng:140.6690, level_risiko:2, faktor_risiko:['Curah hujan > 3000mm','Lereng Cycloop','Sungai Anafre'], rekomendasi:'EWS berbasis BMKG, jalur evakuasi komunitas' },
  { id:16, provinsi:'NTT',               kabupaten:'Flores Timur',        koordinat_lat:-8.3724,  koordinat_lng:122.8760, level_risiko:3, faktor_risiko:['Siklon tropis','Topografi curam','Lahan kritis'],       rekomendasi:'Peta jalur evakuasi, shelter tinggi' },
  { id:17, provinsi:'Banten',            kabupaten:'Lebak',               koordinat_lat:-6.5628,  koordinat_lng:106.2481, level_risiko:3, faktor_risiko:['DAS Ciberang','Deforestasi Halimun','Longsor'],         rekomendasi:'Reboisasi hutan Halimun, EWS sungai' },
  { id:18, provinsi:'Jawa Barat',        kabupaten:'Garut',               koordinat_lat:-7.2097,  koordinat_lng:107.9076, level_risiko:3, faktor_risiko:['Sungai Cimanuk','Curah hujan > 2000mm','Lereng Papandayan'], rekomendasi:'Normalisasi Cimanuk, sabo dam' },
  { id:19, provinsi:'Kalimantan Tengah', kabupaten:'Kapuas',              koordinat_lat:-2.9931,  koordinat_lng:114.3897, level_risiko:2, faktor_risiko:['DAS Kapuas besar','Rawa gambut'],                       rekomendasi:'Pemantauan debit BMKG, jalur evakuasi air' },
  { id:20, provinsi:'Jawa Tengah',       kabupaten:'Cilacap',             koordinat_lat:-7.7188,  koordinat_lng:109.0155, level_risiko:1, faktor_risiko:['Genangan musiman','Muara Serayu'],                      rekomendasi:'Pompanisasi, normalisasi muara' },
  { id:21, provinsi:'Sumatera Utara',    kabupaten:'Deli Serdang',        koordinat_lat:3.6154,   koordinat_lng:98.7931,  level_risiko:2, faktor_risiko:['DAS Deli','Kawasan industri padat'],                   rekomendasi:'RTH, drainase terpadu' },
  { id:22, provinsi:'Riau',              kabupaten:'Pekanbaru',           koordinat_lat:0.5071,   koordinat_lng:101.4478, level_risiko:1, faktor_risiko:['Sungai Siak','Curah hujan sedang'],                     rekomendasi:'Monitoring debit sungai' },
];

const SEED_MISSING_PERSONS = [
  { id:1,  nama_lengkap:'Ahmad Fauzi',        nik:'3201010101800001', usia:43, jenis_kelamin:'L', provinsi:'Kalimantan Selatan', kabupaten:'Banjarmasin',    terakhir_terlihat_tanggal:'2021-01-13', terakhir_terlihat_lokasi:'Jl. Pangeran Antasari RT 05', foto_url:'', pelapor_nama:'Siti Fauzi',    pelapor_telp:'081234567801', status:'ditemukan',  keterangan:'Ditemukan di pengungsian SMAN 1 Banjarmasin' },
  { id:2,  nama_lengkap:'Dewi Rahayu',         nik:'3301010101900002', usia:34, jenis_kelamin:'P', provinsi:'Kalimantan Selatan', kabupaten:'Banjar',         terakhir_terlihat_tanggal:'2021-01-14', terakhir_terlihat_lokasi:'Desa Sungai Tabuk',           foto_url:'', pelapor_nama:'Budi Rahayu',   pelapor_telp:'081234567802', status:'hilang',     keterangan:'Terakhir bersama 2 anak, pakaian baju merah' },
  { id:3,  nama_lengkap:'Muhamad Ridwan',      nik:'7301010101850003', usia:38, jenis_kelamin:'L', provinsi:'Sulawesi Selatan',   kabupaten:'Luwu Utara',     terakhir_terlihat_tanggal:'2020-07-13', terakhir_terlihat_lokasi:'Masamba kec. Baebunta',       foto_url:'', pelapor_nama:'Andi Ridwan',   pelapor_telp:'081234567803', status:'meninggal',  keterangan:'Ditemukan meninggal dunia di Sungai Masamba' },
  { id:4,  nama_lengkap:'Sinta Agustina',      nik:'3601010101950004', usia:28, jenis_kelamin:'P', provinsi:'Banten',             kabupaten:'Lebak',          terakhir_terlihat_tanggal:'2020-01-01', terakhir_terlihat_lokasi:'Kp. Sinar Galih Ds. Warung',  foto_url:'', pelapor_nama:'Agus Santoso',  pelapor_telp:'081234567804', status:'ditemukan',  keterangan:'Berhasil diselamatkan tim SAR setelah 2 hari' },
  { id:5,  nama_lengkap:'Yusuf Mahendra',      nik:'5301010101780005', usia:45, jenis_kelamin:'L', provinsi:'NTT',                kabupaten:'Flores Timur',   terakhir_terlihat_tanggal:'2021-04-04', terakhir_terlihat_lokasi:'Desa Ile Kerin',              foto_url:'', pelapor_nama:'Fatima Mahendra',pelapor_telp:'081234567805', status:'meninggal',  keterangan:'Korban banjir bandang Seroja, ditemukan 3 hari kemudian' },
  { id:6,  nama_lengkap:'Nurul Hikmah',        nik:'1301010101000006', usia:23, jenis_kelamin:'P', provinsi:'Sumatera Barat',     kabupaten:'Agam',           terakhir_terlihat_tanggal:'2024-05-11', terakhir_terlihat_lokasi:'Nagari Sungai Pua',           foto_url:'', pelapor_nama:'Ridwan Hikmah', pelapor_telp:'081234567806', status:'hilang',     keterangan:'Terakhir terlihat saat evakuasi warga RT 03' },
  { id:7,  nama_lengkap:'Bagas Prasetyo',      nik:'3501010101020007', usia:21, jenis_kelamin:'L', provinsi:'Jawa Timur',         kabupaten:'Malang',         terakhir_terlihat_tanggal:'2021-11-22', terakhir_terlihat_lokasi:'Jl. Soekarno Hatta Malang',  foto_url:'', pelapor_nama:'Tri Prasetyo',  pelapor_telp:'081234567807', status:'ditemukan',  keterangan:'Ditemukan selamat di wilayah Karangploso' },
  { id:8,  nama_lengkap:'Halimah Tusadiah',    nik:'1101010101650008', usia:58, jenis_kelamin:'P', provinsi:'Aceh',               kabupaten:'Aceh Tamiang',   terakhir_terlihat_tanggal:'2022-12-05', terakhir_terlihat_lokasi:'Kampung Baru Kec. Bendahara', foto_url:'', pelapor_nama:'Zulkifli',      pelapor_telp:'081234567808', status:'ditemukan',  keterangan:'Ditemukan di pengungsian Masjid Al-Ikhlas' },
  { id:9,  nama_lengkap:'Rizal Efendi',        nik:'6101010101800009', usia:43, jenis_kelamin:'L', provinsi:'Kalimantan Barat',   kabupaten:'Pontianak',      terakhir_terlihat_tanggal:'2023-03-15', terakhir_terlihat_lokasi:'Jl. Gajah Mada RT 12',       foto_url:'', pelapor_nama:'Marlina Efendi', pelapor_telp:'081234567809', status:'hilang',     keterangan:'Pria berkulit sawo matang, tinggi ±170cm, rambut pendek' },
  { id:10, nama_lengkap:'Tiara Wulandari',     nik:'3101010101030010', usia:20, jenis_kelamin:'P', provinsi:'DKI Jakarta',        kabupaten:'Jakarta Utara',  terakhir_terlihat_tanggal:'2024-02-18', terakhir_terlihat_lokasi:'Penjaringan, Pluit',          foto_url:'', pelapor_nama:'Wahyu Wulandari',pelapor_telp:'081234567810', status:'ditemukan',  keterangan:'Berhasil dievakuasi ke GOR Tanjung Priok' },
  { id:11, nama_lengkap:'Supriadi',             nik:'1801010101700011', usia:53, jenis_kelamin:'L', provinsi:'Lampung',            kabupaten:'Bandar Lampung', terakhir_terlihat_tanggal:'2023-11-30', terakhir_terlihat_lokasi:'Jl. Raden Intan, Way Halim',  foto_url:'', pelapor_nama:'Maryani',        pelapor_telp:'081234567811', status:'ditemukan',  keterangan:'Selamat, mengungsi ke rumah kerabat di Natar' },
  { id:12, nama_lengkap:'Komarudin Saleh',     nik:'3201010101760012', usia:47, jenis_kelamin:'L', provinsi:'Jawa Barat',         kabupaten:'Garut',          terakhir_terlihat_tanggal:'2022-09-17', terakhir_terlihat_lokasi:'Kp. Pasir Pogor Kec. Tarogong',foto_url:'', pelapor_nama:'Yeni Saleh',    pelapor_telp:'081234567812', status:'meninggal',  keterangan:'Tertimbun material longsor yang menyertai banjir' },
  { id:13, nama_lengkap:'Marwah Hasanah',      nik:'7301010101980013', usia:25, jenis_kelamin:'P', provinsi:'Sulawesi Selatan',   kabupaten:'Makassar',       terakhir_terlihat_tanggal:'2021-02-22', terakhir_terlihat_lokasi:'Perumnas Antang Blok 12',     foto_url:'', pelapor_nama:'Hasanah Sr.',    pelapor_telp:'081234567813', status:'ditemukan',  keterangan:'Ditemukan di pos pengungsian Unhas' },
  { id:14, nama_lengkap:'Eko Budiyanto',       nik:'3501010101850014', usia:38, jenis_kelamin:'L', provinsi:'Jawa Tengah',        kabupaten:'Demak',          terakhir_terlihat_tanggal:'2024-02-01', terakhir_terlihat_lokasi:'Desa Sriwulan Kec. Sayung',   foto_url:'', pelapor_nama:'Sri Budiyanto',  pelapor_telp:'081234567814', status:'ditemukan',  keterangan:'Ditemukan selamat, pindah ke rumah kerabat Semarang' },
  { id:15, nama_lengkap:'Putri Handayani',     nik:'9101010101010015', usia:19, jenis_kelamin:'P', provinsi:'Papua',              kabupaten:'Jayapura',       terakhir_terlihat_tanggal:'2020-03-16', terakhir_terlihat_lokasi:'Jl. Raya Entrop Jayapura',    foto_url:'', pelapor_nama:'Handayani Sr.',  pelapor_telp:'081234567815', status:'hilang',     keterangan:'Mahasiswi, terakhir dikontak via WhatsApp sebelum evakuasi' },
];

// ── IndexedDB INIT ───────────────────────────────────────────

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const database = e.target.result;

      if (!database.objectStoreNames.contains('flood_events')) {
        const store = database.createObjectStore('flood_events', { keyPath: 'id' });
        store.createIndex('provinsi', 'provinsi', { unique: false });
        store.createIndex('tanggal',  'tanggal',  { unique: false });
        store.createIndex('jenis_banjir', 'jenis_banjir', { unique: false });
      }

      if (!database.objectStoreNames.contains('risk_zones')) {
        const store = database.createObjectStore('risk_zones', { keyPath: 'id' });
        store.createIndex('provinsi',     'provinsi',     { unique: false });
        store.createIndex('level_risiko', 'level_risiko', { unique: false });
      }

      if (!database.objectStoreNames.contains('missing_persons')) {
        const store = database.createObjectStore('missing_persons', { keyPath: 'id' });
        store.createIndex('nama_lengkap', 'nama_lengkap', { unique: false });
        store.createIndex('nik',          'nik',          { unique: true  });
        store.createIndex('status',       'status',       { unique: false });
        store.createIndex('provinsi',     'provinsi',     { unique: false });
      }
    };

    request.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };

    request.onerror = (e) => reject(e.target.error);
  });
}

function seedStore(storeName, data) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    // Only seed if empty
    const countReq = store.count();
    countReq.onsuccess = () => {
      if (countReq.result === 0) {
        data.forEach(item => store.put(item));
        console.log(`[DB] Seeded ${data.length} records into '${storeName}'`);
      } else {
        console.log(`[DB] '${storeName}' already has data, skipping seed.`);
      }
    };

    tx.oncomplete = resolve;
    tx.onerror = (e) => reject(e.target.error);
  });
}

async function setupDB() {
  await initDB();
  await seedStore('flood_events',    SEED_FLOOD_EVENTS);
  await seedStore('risk_zones',      SEED_RISK_ZONES);
  await seedStore('missing_persons', SEED_MISSING_PERSONS);
  console.log('[DB] Database ready.');
  return db;
}

// ── QUERY HELPERS ────────────────────────────────────────────

function getAll(storeName) {
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req   = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = (e) => reject(e.target.error);
  });
}

function getByIndex(storeName, indexName, value) {
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    const req   = index.getAll(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = (e) => reject(e.target.error);
  });
}

function addRecord(storeName, record) {
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    // Auto-generate ID if not set
    if (!record.id) {
      const countReq = store.count();
      countReq.onsuccess = () => {
        record.id = countReq.result + Date.now();
        const addReq = store.add(record);
        addReq.onsuccess = () => resolve(addReq.result);
        addReq.onerror   = (e) => reject(e.target.error);
      };
    } else {
      const addReq = store.add(record);
      addReq.onsuccess = () => resolve(addReq.result);
      addReq.onerror   = (e) => reject(e.target.error);
    }
  });
}

// Export for use in other modules
window.floodDB = { setupDB, getAll, getByIndex, addRecord, db: () => db };
