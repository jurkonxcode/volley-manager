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

## Sudah ada
Menu utama, Kelola Tim bertab (Skuad/Strategi/Formasi/Pasar), liga 8 tim + Kompetisi bertab (klasemen, jadwal, analitik dengan grafik performa dan win rate), laga live berperspektif dengan pemain berpose, transfer + scouting, latihan, fasilitas, cedera, profil pemain & manajer.

## Riwayat & serah-terima
Lihat `HANDOFF.md` untuk riwayat versi, struktur, jebakan, dan daftar yang belum dikerjakan.
