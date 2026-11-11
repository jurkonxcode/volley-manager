# Volley Manager

Game manajer bola voli berbasis web. Visual dulu, teks seminimal mungkin. Tanpa framework, tanpa server.

## Menjalankan
Unggah seluruh isi folder ke repo GitHub, lalu aktifkan **Settings → Pages**. Wajib dibuka lewat https (ES modules), bukan dengan membuka `index.html` langsung dari penyimpanan.

## Struktur
- `js/inti/` konfigurasi angka, waktu nyata, simpan lokal, acak ber-seed
- `js/data/` nama pemain, jenjang liga
- `js/sistem/` logika murni (tanpa HTML): pemain, stamina, pertandingan, liga, ekonomi
- `js/layar/` tampilan saja: skuad, pertandingan, pembantu gambar

## Menyeimbangkan game
Semua angka ada di `js/inti/konfigurasi.js`: laju pulih stamina, biaya per posisi, peluang poin, hadiah koin.

## Sudah ada
- Profil pemain lengkap (tinggi, berat, asal, sifat, kontrak, gaji, nilai pasar), dibuka dari panel detail skuad
- Profil manajer: nama, nama tim, level, EXP, statistik, dan pengaturan
- EXP dari setiap pertandingan, dengan notifikasi kenaikan level

## Tahap berikutnya
Rekrut + scouting, basecamp (upgrade waktu nyata), jenjang liga naik, cedera.
