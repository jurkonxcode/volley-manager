# Volley Manager

Game manajer bola voli berbasis web. Visual dulu, teks seminimal mungkin. Tanpa framework, tanpa server.

## Menjalankan
Unggah seluruh isi folder ke repo GitHub, lalu aktifkan **Settings → Pages**. Wajib dibuka lewat https (ES modules), bukan dengan membuka `index.html` langsung dari penyimpanan.

## Struktur
- `js/inti/` konfigurasi angka, waktu nyata, simpan lokal, acak ber-seed
- `js/data/` nama pemain, jenjang liga
- `js/sistem/` logika murni (tanpa HTML): pemain, stamina, pertandingan, liga, ekonomi
- `js/layar/` tampilan saja: skuad, pertandingan, pembantu gambar

- `assets/` gambar: logo, hero, stadion, pose pemain (lihat `HANDOFF.md` untuk nama file)

## Menyeimbangkan game
Semua angka ada di `js/inti/konfigurasi.js`: laju pulih stamina, biaya per posisi, peluang poin, hadiah koin.

## Mode 3D Premium (v15, audit v15.1)
Mode pertandingan 3D memakai arena indoor procedural dengan lantai parquet, net berjaring, tribun, crowd instanced, LED perimeter, rangka atap, pemain procedural lebih detail, bola dengan panel, dan pencahayaan sinematik yang dioptimalkan untuk HP. Detail pemasangan dan batasan model ada di `docs/V15_3D_PREMIUM_UPGRADE.md`.

## Baru di v17 (skema ala Top Eleven)
- **Buat Klub** (layar awal game baru): nama manajer/klub/singkatan, negara + kota, lambang (9 pilihan), warna jersey kandang/tandang, nama stadion.
- **Tab Klub**: Stadion (kapasitas + harga tiket), Fasilitas (Latihan, Medis, Akademi, Toko, Parkir), Akademi Muda, Kas (keuangan), Identitas.
- **Persahabatan** (Kompetisi > Persahabatan): cari lawan, pilih waktu kick-off dan kandang/tandang, laga terjadwal tampil di Beranda dan layar Laga.
- Token (mempercepat pembangunan/latihan, menyegarkan pasar), semangat tim, perkembangan pemain tiap akhir musim.

## Baru di v18
- Aset merek SVG (`assets/brand/`), favicon, ikon PWA + `manifest.webmanifest`, 20 ikon baru, dan layar sambutan (onboarding) 4 slide. Detail di `HANDOFF.md`.

## Identitas & layout responsif
- Identitas merek Volley Manager memakai logo orisinal berbasis bola voli + monogram V (SVG), terpisah dari lambang klub yang dipilih pemain.
- Nama klub awal menjadi Volley Club; simpanan lama yang masih memakai nama default Garuda Muda dimigrasikan otomatis tanpa mengubah nama klub buatan pemain.
- Desktop memakai sidebar vertikal dan header lebar; ponsel tetap memakai navigasi bawah. CSS responsif dimuat terakhir melalui `css/responsive-desktop.css`.

## Baru di v19 (gabungan v18 asset pack + v19 pemain)
- Pemain 3D stylized berkerangka buatan kode (tanpa file model) dengan animasi servis, terima, umpan, smash, blok, selebrasi, dan kecewa. Pratinjau: `pemain-preview.html`.
- Paket aset GLB (`assets/models/volley-manager/`): bola, bangku tim, botol dipakai di arena; trofi, medali, peluit, dumbbell, net-system siap dipakai. Pratinjau: `asset-preview.html`. Detail: `docs/ASSET_PACK_REALISTIC_V18.md`.
- Detail di `HANDOFF.md`.

## Sudah ada
Menu utama, Kelola Tim bertab (Skuad/Strategi/Formasi/Pasar), liga 8 tim + Kompetisi bertab (klasemen, jadwal, analitik dengan grafik performa dan win rate), laga live berperspektif dengan pemain berpose, transfer + scouting, latihan, fasilitas, cedera, profil pemain & manajer.

## Riwayat & serah-terima
Lihat `HANDOFF.md` untuk riwayat versi, struktur, jebakan, dan daftar yang belum dikerjakan.

## v19.3 — Dashboard & halaman manajemen profesional
- **Beranda**: header control center dan KPI nyata untuk peringkat, rekor menang, saldo, serta fans.
- **Tim & Pemain**: ringkasan skuad, starter, overall, dan level manajer; navigasi subhalaman dibuat lebih tegas.
- **Kompetisi**: ringkasan peringkat, pertandingan selesai, pemuncak klasemen, dan pekan tersisa.
- **Manajemen Klub**: ringkasan saldo, fans, fasilitas aktif, dan komitmen gaji sebelum tab Stadion/Fasilitas/Akademi/Kas/Identitas.
- **Desktop**: grid dua kolom untuk modul manajemen, area konten lebih lapang, klasemen memanfaatkan lebar layar. **Mobile**: KPI dua kolom dan tab horizontal yang dapat digeser.
- Tidak mengubah rumus simulasi, struktur save, maupun sistem navigasi utama.
