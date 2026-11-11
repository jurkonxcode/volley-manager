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
| v10 | Aset gambar: logo Garuda Muda (header, kartu klub, hero), foto hero, latar stadion di Beranda, 6 pose sprite pemain di laga (`css/aset.css`, `js/layar/sprite.js`) |
| v11 | Tim saya dilihat dari belakang (`belakang-*.png`), tim lawan dari depan; lantai lapangan bergambar (`lantai.webp`), garis serang dipindah ke 1/3 dari jaring, angka peringkat terbaca |

## Struktur
- `js/inti/` konfigurasi (semua angka keseimbangan di `konfigurasi.js`), waktu, simpan (localStorage, kunci `volley-manager-v2`, `versi: 2`), acak ber-seed
- `js/sistem/` logika murni tanpa HTML: analitik (statistik + data grafik dari `musim.hasil`), pemain, stamina, pertandingan, musim (liga/jadwal/klasemen), taktik, pasar (transfer/latihan/fasilitas/cedera), manajer, ekonomi
- `js/layar/` tampilan: klub (beranda), kompetisi (klasemen/jadwal/analitik, grafik SVG), tim (Kelola Tim), skuad, pasar, pertandingan, profil, kartu-pemain, gambar (ikon + avatar + badan SVG)
- `css/` dasar, tata-letak, komponen, tambahan, tema, realistis, menu, kompetisi, aset (dimuat berurutan; yang belakang menimpa)
- Semua renderer berbentuk `render*(root, S, aksi)`. `aksi` = `simpan`, `perbaruiKoin`, `pindah(tab)`, `reset`.

## Aset gambar (`assets/`)
| File | Dipakai di |
|---|---|
| `assets/logo/logo-garuda-muda.png` (512, transparan) | header, kartu klub (Beranda, Tim), hero |
| `assets/hero.png` (768x1024) | foto di blok hero Beranda (dipotong CSS: kiri disembunyikan, bawah memudar) |
| `assets/stadion.webp` (720x1280) | latar Beranda (digelapkan gradasi) |
| `assets/pose/{siap,servis,receive,umpan,smash,blok}.png` (512, transparan, tampak depan) | pemain lawan (tim B, sisi jauh); dicat merah lewat kode |
| `assets/pose/belakang-{siap,servis,receive,umpan,smash,blok}.png` (512, transparan, tampak belakang) | tim saya (tim A, sisi dekat) |
| `assets/lantai.webp` (720x1440) | lantai lapangan di layar laga; garis digambar kode |
Mengganti gambar: timpa file dengan nama sama. Tidak perlu ubah kode.

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

- Pose pemain: jersey lawan dicat ulang lewat canvas di `sprite.js` (piksel biru tua jadi merah). Butuh https/localhost; dari `file://` canvas terkunci dan lawan jatuh ke warna asli (biru).
- `belakang-siap.png` masih sementara: salinan `belakang-umpan.png` (tangan di atas kepala). Timpa dengan pose siaga sungguhan dengan nama sama.
- Garis serang digambar `.separuh::after` di `css/aset.css` (66.7% atas / 33.3% bawah). Jangan ubah tinggi baris pemain (grid fr) karena lapangan berperspektif jadi tidak muat.
- `lantai.webp` dibuat dari bagian dalam gambar lapangan AI tanpa garisnya (garis AI salah: garis serang di 27,5% dan 72,3%, seharusnya 33,3% dan 66,7%).
- Semua pemain memakai gambar yang sama (nomor 10, wajah sama). Pose depan servis/receive/umpan masih menggambar bola, jadi ada dua bola (milik gambar dan bola game). Minta ulang tanpa bola.
- `hero.png` masih bergambar logo terpotong di kiri dan jersey berlogo merek; CSS menyembunyikan sisi kiri. Ganti dengan versi bersih bila ada.
- Logo klub hanya satu (Garuda Muda); jika nama tim diganti pemain, logo tetap. Logo 7 lawan belum ada.
- `badanSvg` di `gambar.js` (pemain SVG lama) tidak dipakai lagi tapi dibiarkan.

## Belum dikerjakan
Analitik lintas musim (sekarang hanya musim berjalan; riwayat musim lama belum disimpan), logo 7 tim lawan, potret pemain (kartu dan profil), pose siap tampak belakang, pose lawan khusus (jersey merah, nomor berbeda), profil pemain lebih kaya, promosi/degradasi, sponsor, gaji pemain, Supabase (online).

## Memasang (Codespace)
```bash
unzip -oq volley-manager-vN.zip -d /tmp/vN && cp -a /tmp/vN/vm/. ./ && rm -rf /tmp/vN volley-manager-vN.zip
git add -A && git commit -m "update" && git push
```
