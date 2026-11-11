# HANDOFF — Volley Manager

Catatan serah-terima: apa yang sudah ada, bagaimana strukturnya, dan jebakan yang pernah terjadi.

## Riwayat versi
| Versi | Isi |
|---|---|
| v2 (awal, diunggah) | Skuad, stamina real-time, simulasi set, profil pemain & manajer, EXP |
| v3 | Fase 1 ala Top Eleven: beranda klub, liga 8 tim (14 pekan), klasemen, taktik (formasi + gaya), laga live + komentar |
| v4 | Tema visual modern (`css/tema.css`), label di navigasi bawah |
| v5 | Fase 2: Pasar (transfer + scouting), latihan, fasilitas (Latihan/Medis/Stadion), cedera |
| v6 | Realisme level 1: lapangan berperspektif, jaring berdiri, bola melambung (`css/realistis.css`) |
| v7 | Realisme level 2: pemain berbadan penuh + pose (smash/blok/servis/receive); perbaikan kotak kuning di skor dan rating terpotong |
| v8 | Menu utama (profil + hero + Mulai Game + daftar menu), Kelola Tim bertab (Skuad/Strategi/Formasi/Pasar), navigasi jadi 5 tab, HANDOFF.md |
| v9 | Kompetisi bertab (Klasemen/Jadwal/Analitik): cincin win rate, grafik poin per pekan, grafik peringkat per pekan, statistik set; menu Beranda +Analitik |

## Struktur
- `js/inti/` konfigurasi (semua angka keseimbangan di `konfigurasi.js`), waktu, simpan (localStorage, kunci `volley-manager-v2`, `versi: 2`), acak ber-seed
- `js/sistem/` logika murni tanpa HTML: analitik (statistik + data grafik dari `musim.hasil`), pemain, stamina, pertandingan, musim (liga/jadwal/klasemen), taktik, pasar (transfer/latihan/fasilitas/cedera), manajer, ekonomi
- `js/layar/` tampilan: klub (beranda), kompetisi (klasemen/jadwal/analitik, grafik SVG), tim (Kelola Tim), skuad, pasar, pertandingan, profil, kartu-pemain, gambar (ikon + avatar + badan SVG)
- `css/` dasar, tata-letak, komponen, tambahan, tema, realistis, menu, kompetisi (dimuat berurutan; yang belakang menimpa)
- Semua renderer berbentuk `render*(root, S, aksi)`. `aksi` = `simpan`, `perbaruiKoin`, `pindah(tab)`, `reset`.

## Bentuk state `S`
`koin, skuad[], susunan[6 id], taktik{formasi,gaya}, manajer, musim{ke,tim[],jadwal,hari,mulai,hasil[]}, fasilitas{latihan,medis,stadion,bangun}, latihan, pasar{ts,daftar[]}, pengaturan`. Data lama dilengkapi otomatis di `lengkapi()` pada `main.js`.

## Jebakan yang pernah terjadi
- Class `.naik` dipakai dua hal (animasi skor dan lencana level). Animasi skor sekarang `.skor-naik`.
- Sudut `34deg` perspektif lapangan muncul di banyak aturan `realistis.css`; kalau diubah, ubah semuanya.
- Gaya perspektif hanya aktif di `#layar[data-layar="tanding"]`; layar lain tidak ikut miring.
- Pemain cedera diganti otomatis oleh `bersihkanSusunan` saat laga dimulai dan saat berpindah tab.
- Tampilan baru belum selalu diverifikasi di browser oleh pembuatnya; cek visual di HP.

- Analitik dihitung ulang dari `musim.hasil` tiap dibuka, tidak disimpan. Saat `akhiriMusim` memulai musim baru, grafik kembali kosong.
- Sub-tab Kompetisi (`setSubLiga`) dan Kelola Tim (`setSub`) adalah dua variabel terpisah; menu Beranda memilih sesuai tujuan.

## Belum dikerjakan
Analitik lintas musim (sekarang hanya musim berjalan; riwayat musim lama belum disimpan), logo klub SVG, profil pemain lebih kaya, aset ilustrasi (hero, stadion), promosi/degradasi, sponsor, gaji pemain, Supabase (online).

## Memasang (Codespace)
```bash
unzip -oq volley-manager-vN.zip -d /tmp/vN && cp -a /tmp/vN/vm/. ./ && rm -rf /tmp/vN volley-manager-vN.zip
git add -A && git commit -m "update" && git push
```
