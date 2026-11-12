// Semua angka keseimbangan game ada di sini. Ubah di satu tempat saja.
export const K = {
  stamina: { pulihMenitPerPersen: 10, ambangRendah: 50, ambangKritis: 20, faktorMin: 0.75 },
  biayaSet: { S: 6, OH: 9, MB: 7, OP: 9, L: 4 },      // % stamina per set (untuk 40 poin, daya tahan 50)
  set: { menang: 3, poin: 25, poinTerakhir: 15, selisih: 2 },
  skalaPeluang: 0.006, peluangMin: 0.2, peluangMaks: 0.8,   // dipakai simulasi liga antar-AI (musim.js); laga live memakai K.reli
  reli: { liberoServis: false, servisSalah: .06, ace: .09, blok: .07, serangSalah: .09, smash: .34, balasan: .9, maksPertukaran: 5 },
  ganti: { maks: 3 },   // pergantian pemain (dari bangku) yang boleh dilakukan di tiap jeda antar-set
  posisi: { salah: .92, liberoDepan: .5 },   // pemain di slot bukan posisinya x0.92; libero di baris depan menyerang/memblok x0.5
  hadiah: { menang: 100, kalah: 30, perLevel: 40 },
  skuadAwal: { koin: 500, tingkat: 44 },
  exp: { dasar: 100, tambahPerLevel: 40, menang: 50, kalah: 20, perLevelLawan: 15 },
  manajer: { namaAwal: 'Manajer Baru', timAwal: 'Volley Club' },
  warnaPosisi: { S: '#8E7CF0', OH: '#F4C430', MB: '#46C17B', OP: '#EF5B4A', L: '#4DB6E8' },
  musim: { menitAntarPekan: 20, hadiahPeringkat: [1500, 900, 600, 400, 300, 200, 150, 100] },
  pasar: { jumlah: 10, menitSegar: 30, maksSkuad: 18, minSkuad: 10, biayaScout: 40 },
  latihan: { biaya: 80, menit: 10 }, cedera: { dasar: 0.04, lelah: 0.06 }, fasilitas: { maks: 5 },
  // v17 (ala Top Eleven): token, stadion & tiket, toko/parkir, akademi, persahabatan, semangat tim
  token: { awal: 3, juara: 5, tiga: 3, lain: 1, capai: 1, menitPercepat: 15 },
  stadion: { kapAwal: 600, kapPerLevel: 500, minat: { liga: 0.4, persahabatan: 0.25 } },
  tiket: [{ n: 'Murah', h: 1, m: 1.35 }, { n: 'Normal', h: 2, m: 1 }, { n: 'Mahal', h: 3, m: 0.72 }, { n: 'Premium', h: 4, m: 0.45 }],   // h = koin per 10 tiket, m = pengali minat penonton
  toko: { perLevel: 2 }, parkir: { perLevel: 3 },
  akademi: { menitSegar: 45, jumlah: 3 },
  persahabatan: { maksJadwal: 3, maksPerHari: 4, menitTunggu: 30, menitSegar: 30, slot: [0, 10, 30, 60, 180], hadiah: 0.35, exp: 0.5 },
  // v25.2 (Tahap 3): laga otomatis memakai mesin penuh; rotasi = pemain lelah digantikan cadangan (tidak mengubah susunan manajer)
  otomatis: { rotasi: true, biayaStamina: 0.3 },   // biayaStamina: pengali biaya stamina laga otomatis (1 = sama seperti laga live)
  ekonomi: { gajiPembagi: 10 },   // gaji mingguan = jumlah gaji pemain / pembagi (dulu 20)
  semangat: { awal: 50, bonusMaks: 0.03, menang: 5, kalah: -5, fMenang: 4, fKalah: 2 },
  // v26 (logika lanjutan): semua angka baru ada di sini supaya mudah diseimbangkan.
  lanjut: {
    counter: 0.01,              // gaya yang unggul (serang > seimbang > bertahan > serang) x(1+c), yang kalah x(1-c)
    adaptasi: { dasar: 0.08, perTingkat: 0.008, maks: 0.5 },   // peluang lawan memilih gaya penangkal; naik mengikuti tingkat tim lawan. Gaya aktif lawan disembunyikan: hanya scouting pra-laga dan pengumuman saat lawan beralih
    kandang: 0.01,              // bonus semua statistik untuk tuan rumah (suporter)
    momentum: { mulai: 3, langkah: 0.006, maks: 0.025, timeoutRun: 4, timeoutMaks: 2, timeoutBonus: 0.01 },   // run >= mulai poin beruntun menaikkan performa; timeout memutus run lawan
    sifat: { tenang: 1, pejuang: 0.02, pemalu: -0.02, pemimpin: 0.005, pemberani: 0.015 },
    form: { pengali: 0.002, maks: 10, peluruh: 0.8, bangku: 0.9 },   // form -10..+10 => +-2% statistik; bangku memudar ke 0
    beban: { perSet: 5, pulihMenit: 6, ambang: 40, risiko: 0.0008, rotasi: 400 },   // beban kerja 0-100: risiko cedera naik di atas ambang, autoSusun merotasi pemain berbeban tinggi
    cederaJenis: [{ n: 'Ringan', p: 0.6, menit: [20, 60] }, { n: 'Sedang', p: 0.3, menit: [60, 240] }, { n: 'Berat', p: 0.1, menit: [240, 720] }],
    cederaBerulang: 0.15,       // tiap cedera sebelumnya menambah 15% peluang cedera lagi
    latihan: { umur: [[22, 1.25], [27, 1], [30, 0.75], [99, 0.5]], dekatPotensi: 0.25, sifat: { 'Pekerja Keras': 1.2, 'Disiplin': 1.1, 'Ambisius': 1.1 } },
    harga: { umur: [[22, 1.25], [27, 1], [30, 0.85], [99, 0.65]], potensi: 120 }   // harga beli naik untuk pemain muda berpotensi, turun untuk veteran
  },
  kunciSimpan: 'volley-manager-v2'
};
export const URUTAN_STAT = ['servis', 'smash', 'blok', 'receive', 'umpan'];
export const WARNA_STAT = { servis: '#4DB6E8', smash: '#EF5B4A', blok: '#46C17B', receive: '#8E7CF0', umpan: '#F4C430' };
