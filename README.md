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

## Sudah ada (Fase 1, gaya Top Eleven)
- Beranda klub: peringkat, laga berikutnya + hitung mundur, hasil terakhir
- Liga 8 tim, 14 pekan (dua putaran), klasemen, jadwal, hadiah akhir musim; pekan terlewat dimainkan otomatis
- Taktik: formasi (5-1, 4-2, Tembok), gaya main, susun otomatis; ganti pemain di jeda set
- Laga live poin demi poin dengan komentar
- Profil pemain, profil manajer, EXP

## Tahap berikutnya
Fase 2: transfer + scouting, latihan, cedera, fasilitas, sponsor, promosi/degradasi. Fase 3: Supabase.
Interval antar pekan: `K.musim.menitAntarPekan` di konfigurasi.js (20 menit; naikkan untuk ritme harian).
