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
| v12 | Mode 3D opsional di layar laga (Three.js, dari asset pack ChatGPT): `js/tiga-d/` (arena, pemain, bola, efek bawaan pack) + `js/layar/arena3d.js` (penghubung). Tombol "3D" di pojok lapangan; aktif saat set berjalan, mode atur susunan tetap 2D. Gagal muat Three/WebGL => otomatis 2D. Ikon SVG pack disalin ke `assets/ui/` (belum dipakai) |
| v13 | Mesin reli berbasis statistik (`sistem/pertandingan.js`): servis vs receive, umpan, smash vs blok/dig, balas menyerang; penalti pemain di posisi salah; mental berpengaruh saat skor ketat; komentar dan pose memakai pemain yang benar-benar mencetak poin |
| v14 | Jeda antar-set: ganti formasi/gaya/susun otomatis langsung di layar laga, batas pergantian per jeda (`K.ganti.maks` = 3), banding kekuatan live; perbaikan susunan basi setelah susun otomatis |
| v15 | Upgrade visual mode 3D premium procedural: arena parquet, net detail, tribun/crowd instanced, LED, rangka atap, pemain 3D lebih anatomis, bola panel, efek impact, lighting/tone mapping dan kamera isometric mobile. Detail: `docs/V15_3D_PREMIUM_UPGRADE.md`. |
| v15.1 | Audit v15 (logika + kode): kebocoran memori 3D ditutup (dispose), arah bola blok dan animasi "kesalahan" dibetulkan, bola antar-reli tidak lagi saling menimpa, nomor punggung, bayangan pemain dikurangi (~58%), pemulihan saat WebGL gagal/konteks hilang, guard laga basi di layar laga. Detail dan hal yang belum terverifikasi: `docs/AUDIT_V15_1.md`. |

| v15.4 | Pacing laga: tiap reli bertahap (servis, terima, umpan, serangan; ~2-3 dtk per poin di 3D, 1x/2x/Lewati set), label aksi, papan skor bernama + SET/JEDA, hasil set tidak lagi bocor sebelum diputar. Kartu kelangkaan N/R/SR/SSR dari rating (`js/layar/rarity.js`, ambang bisa diubah). Polesan UI semua tab (`css/pro.css`), kartu pra-laga, kolom Form klasemen. Pemain 3D dari FBX Kenney (`assets/models/kenney/`). Belum diuji di HP: rangkaian animasi 3D. |

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
- `belakang-siap.png` sudah pose siaga sungguhan (merunduk, tangan di depan paha), tinggi 287 px menyamai `belakang-receive.png`.
- Garis serang digambar `.separuh::after` di `css/aset.css` (66.7% atas / 33.3% bawah). Jangan ubah tinggi baris pemain (grid fr) karena lapangan berperspektif jadi tidak muat.
- `lantai.webp` dibuat dari bagian dalam gambar lapangan AI tanpa garisnya (garis AI salah: garis serang di 27,5% dan 72,3%, seharusnya 33,3% dan 66,7%).
- Semua pemain memakai gambar yang sama (nomor 10, wajah sama). Pose depan servis/receive/umpan masih menggambar bola, jadi ada dua bola (milik gambar dan bola game). Minta ulang tanpa bola.
- `hero.png` masih bergambar logo terpotong di kiri dan jersey berlogo merek; CSS menyembunyikan sisi kiri. Ganti dengan versi bersih bila ada.
- Logo klub hanya satu (Garuda Muda); jika nama tim diganti pemain, logo tetap. Logo 7 lawan belum ada.
- `badanSvg` di `gambar.js` (pemain SVG lama) tidak dipakai lagi tapi dibiarkan.

## Belum dikerjakan
Analitik lintas musim (sekarang hanya musim berjalan; riwayat musim lama belum disimpan), logo 7 tim lawan, potret pemain (kartu dan profil), pose lawan khusus (jersey merah, nomor berbeda), profil pemain lebih kaya, promosi/degradasi, sponsor, gaji pemain, Supabase (online).

## Memasang (Codespace)
```bash
unzip -oq volley-manager-vN.zip -d /tmp/vN && cp -a /tmp/vN/vm/. ./ && rm -rf /tmp/vN volley-manager-vN.zip
git add -A && git commit -m "update" && git push
```


## Aset tambahan (v11.2)
- `assets/pose/{siap,servis,receive,umpan,smash,blok}.png`: pose lawan baru (jersey merah, nomor 7), dipotong dari lembar ChatGPT dengan skala sama.
- `assets/pose/belakang-{selebrasi,kecewa,dive}.png`: pose tim saya. Dipakai sprite.js (tim lawan memakai pose depan terdekat: umpan, siap, receive). Dipicu di `beriPose` (pertandingan.js).
- `assets/pose/libero-depan.png`: libero jersey kuning, tampak DEPAN (ChatGPT tidak membuatnya dari belakang). Belum dipakai.
- `assets/potret/p01..p12.png`: 12 wajah; dipilih dari id pemain lewat `potret(p)` (gambar.js), tampil di kartu lengkap pemain.
- `assets/logo/logo-{elang,banteng,petir,naga,api,ombak,bintang,singa}.png`: logo 7 tim lawan (peta nama di `LOGO_TIM`, gambar.js) tampil di klasemen dan jadwal. `bintang` cadangan.


## Mode 3D (v12)
- Three.js 0.160 dimuat lewat `import()` dari jsdelivr saat tombol 3D dipakai pertama kali (`THREE_URL` di `arena3d.js`). Untuk offline/PWA: unduh `three.module.js` ke `js/tiga-d/` lalu ubah `THREE_URL`.
- Disimpan di `S.pengaturan.tiga3d` (default mati). `arena3d.reli(r)` dipanggil dari `gambarRally`; logika skor tidak disentuh.
- Pemain 3D masih placeholder primitif bawaan pack (tanpa animasi lengan, hanya lompat/jongkok). Ganti nanti dengan model .glb lewat `createPlayer()` di `js/tiga-d/player.js`.
- Belum diuji dengan Three.js asli di browser sungguhan oleh pembuatnya (sandbox tanpa CDN): cek visual di HP, terutama posisi kamera (`ukuran()` di `arena3d.js`) dan performa.
- `assets/ui/*.svg` (ikon + template kartu dari pack) belum dipakai; ikon game tetap dari `gambar.js`.


## Mesin reli (v13)
- Satu reli = servis (bisa salah/ace) -> terima -> umpan -> smash vs blok & dig -> bila bola diselamatkan, lawan membalas menyerang (maks `K.reli.maksPertukaran`). Pemenang reli melayani berikutnya.
- Pencetak poin ada di `rally[i]`: `{a, jenis, ti, pi, qi}` (tim & indeks pemain pelaku; `qi` = lawan yang terlibat). Dipakai komentar, `beriPose`, dan `arena3d.reli`.
- Penalti: pemain di slot bukan posisinya x`K.posisi.salah`; libero di baris depan x`K.posisi.liberoDepan` untuk smash/blok. Berlaku juga di `kekuatanTim` (angka kekuatan di layar).
- Mental: saat poin ketat (salah satu tim dalam 5 poin dari target dan selisih <=3) performa dikali `1 + (mental-50)/400`.
- Disimulasikan 1500 laga per kasus: seimbang 50%; +3 kekuatan ~72% menang laga, +6 ~86%, +10 ~96%. Poin: ace ~5%, blok ~11%, kesalahan ~20%. Angka ada di `K.reli`.
- Simulasi antar-AI di `musim.js` masih memakai model peluang lama (`K.skalaPeluang`), bukan mesin ini. Sensitivitasnya mirip, tapi belum identik.
- Opponent: stamina penuh dan tanpa taktik (belum diubah).


## Jeda antar-set (v14)
- Di fase `siap` layar laga: chip formasi/gaya/auto + hitungan pergantian + kekuatan saya vs lawan (`taktikBaris` di `pertandingan.js`).
- Pergantian = pemain di susunan yang tidak main di set terakhir (`m.kickoff`, diisi di `mainkan`). Sebelum set 1 bebas; tiap jeda lanjutan maks `K.ganti.maks`. Tukar posisi sesama lapangan tidak dihitung. Hook `izin`/`ditolak` di `pasangTukar` (skuad.js).
- Bug yang diperbaiki: `autoSusun`/`bersihkanSusunan` membuat array `S.susunan` baru sehingga `m.susunan` laga basi. `tampilLapangan` kini menyamakan `m.susunan` dan `m.taktik` tiap render.
- Catatan desain: efek taktik ke angka kekuatan kecil (sekitar +-1) dan lawan belum punya gaya, jadi satu gaya bisa selalu terbaik. Langkah berikut: gaya lawan + saling menguntungkan.


## Mode 3D Premium (v15)
- File visual diperbarui: `js/tiga-d/arena.js`, `player.js`, `volleyball.js`, `effects.js`, dan `js/layar/arena3d.js`.
- Tetap memakai Three.js 0.160 CDN dan tidak mengubah mesin simulasi.
- Pemain masih procedural mesh (belum GLB rigged); animasi masih jump/squat grup.
- Lihat `docs/V15_3D_PREMIUM_UPGRADE.md`, `docs/ASSET_MANIFEST_V15.json`, dan `docs/CLAUDE_INTEGRATION_PROMPT.md`.


## Audit v15.1
- Perubahan hanya di: `js/layar/arena3d.js`, `js/tiga-d/player.js`, `js/layar/pertandingan.js` (guard laga basi). Mesin reli, musim, skema state, dan kunci simpan TIDAK diubah.
- Jebakan baru: Three.js tidak membebaskan memori GPU saat objek hanya dilepas dari scene. Apa pun yang dibuat per set (pemain, efek) harus di-`dispose` (`buang()` di `arena3d.js`). Bila menambah objek 3D baru yang dibuat berulang, buang juga.
- `reli()` di `arena3d.js` bergantung pada arti kolom reli: untuk `ace/smash/blok`, `ti` = tim pencetak; untuk `salah`, `ti` = tim PEMBUAT KESALAHAN (lawan pencetak), `pi` >= 3 berarti servis. Jangan diubah di `sistem/pertandingan.js` tanpa menyesuaikan arena3d.
- Belum terverifikasi: tampilan/cahaya/kamera 3D dan FPS di HP (Three.js tidak bisa diunduh di lingkungan audit; uji hanya dengan Three.js tiruan). Lihat `docs/AUDIT_V15_1.md`.

## v16 — Tema "Malam Pertandingan"
- Hanya menambah `css/v16.css` (dimuat paling akhir) dan mengubah `index.html` (font Barlow Condensed + link CSS). Logika, state, dan aset tidak diubah. Untuk membatalkan: hapus baris `<link>` v16.
- Arah: siaran olahraga. Palet ink #070A14, lime #C6FF3D (aksen), oranye lapangan #FF7A1A (garis kartu klub/papan skor), font angka Barlow Condensed. Tombol/chip berpotongan miring (`--potong`).
- Belum diuji di HP oleh pembuatnya: cek kontras teks di atas gambar hero dan ukuran angka papan skor (76px).

## v16.1 — Fitur klub + negara
- Beranda jadi dashboard (laga terakhir/berikutnya, klasemen, pesan staf, ekonomi mingguan, evolusi tim, pencapaian). `js/layar/klub.js`.
- `js/sistem/klub.js`: fans, sponsor (target peringkat + bonus), ekonomi per laga (tiket kandang + sponsor - gaji/20), inbox, pencapaian (`CAPAI`), `gantiNegara`. State baru: `S.klub`, `S.riwayat`, `S.negara`; data lama dilengkapi di `lengkapiKlub`.
- Promosi/degradasi: `musim.js` (`LIGA`, peringkat <=2 naik, >=7 turun; lawan +7 tingkat per liga). Riwayat musim tersimpan di `S.riwayat`.
- Nama per negara: `js/data/negara.js` (ID, JP, BR, IT, PL, TR, KR). Pemain punya `neg`; klub lawan dibuat dari kota x pola; logo lawan dipilih dari hash nama. Negara diganti di Profil; nama pemain berubah langsung, klub lawan di musim berikutnya (atau langsung bila belum ada laga). Pilihan disimpan juga di localStorage `vm-negara` agar tetap saat reset.
- Belum: analitik lintas musim (data sudah di `S.riwayat`, belum ada grafik), gaji tidak benar-benar dibayar per pemain, tidak ada kontrak habis.
- Diuji di Chromium headless (390x844): Beranda, Kompetisi, Profil, akhir musim + promosi. Font Google tidak termuat di sandbox, jadi tampilan memakai font cadangan.

## v16.2 — Kontrak, lintas musim, skuad NPC
- Kontrak: `p.kM` = musim terakhir kontrak (`pastikanKontrak` mengisi pemain lama). Perpanjang +2 musim lewat kartu pemain (biaya 0,7x gaji). Saat `akhiriMusim`, pemain `kM <= musim` pergi, kecuali skuad tinggal `K.pasar.minSkuad` (diperpanjang 1 musim gratis); susunan disusun ulang otomatis.
- NPC: `js/sistem/lawan.js` membuat 14 pemain per tim secara deterministik (tidak disimpan): 70% negara liga, sisanya asing, ada bintang tiap 5 pemain, profil lengkap. Ketuk baris tim di Klasemen -> `js/layar/tim-lawan.js` -> ketuk pemain untuk kartu profil.
- Analitik: grafik peringkat tiap musim (10 musim terakhir) + daftar promosi/degradasi dari `S.riwayat`.
- Pasar transfer: `K.pasar.jumlah` 6 -> 10 (berlaku saat pasar disegarkan).
- Diuji headless: 2 musim penuh (promosi, degradasi, kontrak habis, susunan tetap 6 unik), lembar NPC, perpanjang kontrak (koin berkurang 70).
- Belum: NPC belum dipakai di laga live (kekuatan lawan masih dari `tingkat` tim), pemain NPC belum bisa dibeli.

## v16.3 — Stadion Pro (3D)
- `js/tiga-d/arena.js` ditulis ulang (backup versi lama: `docs/arena_v15_backup.js`). Antarmuka sama (`createArena(THREE, opsi)`), jadi `arena3d.js` hanya ditambah 3 baris: simpan arena di `sc.userData.arena`, panggil `update(dt)` tiap frame, dan `hype=1` tiap reli.
- Isi: lantai satu tekstur (zona bebas biru + parket + garis resmi, serang 3 m), net + tiang, papan sponsor LED bergulir (nama sponsor game), papan skor gantung 4 sisi (`userData.setSkor(a,b,namaA,namaB,set)`; belum dipanggil dari laga), kursi wasit, hakim garis, meja skor, bangku pemain, tribun landai 4 sisi (~1.500 kursi), penonton instanced (badan+kepala, warna kulit/baju bervariasi, ombak yang makin liar saat `hype` tinggi), dinding penonton jauh, rangka atap + 15 lampu + berkas cahaya.
- `arena-preview.html` di akar repo: lihat arena saja (seret = putar, tombol "Sorak!").
- BELUM DIUJI VISUAL: sandbox tanpa Three.js. Hanya diuji sintaks dan jalan-tanpa-error dengan Three.js tiruan. Cek di HP: FPS (penonton diperbarui tiap 3 frame; kurangi `R`/`pj` di array `sisi` bila berat), kecerahan tekstur lantai, posisi kamera `ukuran()` di arena3d.js.


## v17 — Skema ala Top Eleven (buat klub, bangun, jadwal tanding)
Referensi: alur Top Eleven (buat klub: nama/negara/kota/lambang/warna; stadion + fasilitas dengan timer pembangunan; harga tiket; akademi; token; laga persahabatan; keuangan).
- **Buat Klub**: `js/layar/buat-klub.js` (3 langkah). Muncul hanya bila tidak ada simpanan. `main.js` `gameBaru(d)` memakai isiannya. Simpanan lama tetap jalan: `lengkapi()` + `lengkapiKlub()` mengisi bawaan (identitas Garuda Muda, token 3, dll.).
- **State baru**: `S.identitas {singkatan,kota,logo,warnaA,warnaB,stadion}`, `S.token`, `S.klub.{tiket{liga,persahabatan},semangat,buku[]}`, `S.fasilitas.{akademi,toko,parkir}`, `S.akademi {ts,daftar[]}`, `S.persahabatan {daftar[],tawaran,selesai[]}`, `S.taktik.semangat` (turunan, dihitung ulang).
- **Identitas ke tampilan**: `aksi.identitas()` di `main.js` menerapkan lambang (`setIdentitasGambar` di gambar.js), warna jersey 2D (`siapkanSprite({A,B})` di sprite.js: cat ulang jersey navy tim kita dan jersey MERAH lawan; lawan otomatis kuning bila warna kandang kita mirip merah) dan 3D (`setWarna3D`).
- **Stadion & tiket**: `sistem/stadion.js` `pemasukanLaga(S, jenis, kandang)`; kapasitas = 600 + 500/level; harga tiket 4 tingkat (`K.tiket`), penonton = fans x minat x pengali harga, dibatasi kapasitas. Toko = merch tiap laga liga, Parkir = tiap laga kandang. `akhirLaga` (klub.js) memakainya.
- **Fasilitas**: `FASILITAS` di `sistem/pasar.js` kini objek `{nama, ikon, maks, kali, info}`; satu pembangunan dalam satu waktu; token mempercepat (`biayaPercepat`). Fasilitas dipindah dari tab Pasar ke tab Klub.
- **Akademi**: `sistem/akademi.js`; level 0 = terkunci. Pemain muda berpotensi tinggi, diangkat gratis. `perkembanganMusim` (dipanggil `akhiriMusim`): umur +1, pemain <=23 berkembang, >=31 menurun.
- **Persahabatan**: `sistem/persahabatan.js` + `layar/persahabatan.js`. Maks 3 terjadwal, 8 per 24 jam. Laga yang lewat 30 menit dari kick-off dimainkan otomatis (`kejarPersahabatan`, dipanggil di `tampil()` bersama `kejar`). Tidak masuk klasemen/catatan karier; memberi hadiah 50%, EXP 50%, fans, semangat. Layar Laga punya tab Liga/Persahabatan (`pilihTab` di pertandingan.js; `P.jenis`, `P.fid`).
- **Semangat tim** (10-100, awal 50): menang liga +5, kalah -5, persahabatan +4/+2. Bonus +-3% semua statistik di ujung skala lewat `pengaliTaktik` (`tk.semangat`).
- **Token**: awal 3; +1 per pencapaian; akhir musim +5 (juara) / +3 (top 3) / +1. Dipakai: percepat bangun, percepat latihan, segarkan pasar/akademi/lawan.
- **Buku kas**: `catatKas(S, kategori, jumlah)` di klub.js; 150 catatan terakhir, dilihat di Klub > Kas. Tambahkan panggilan `catatKas` bila menambah sumber uang baru.
- Jebakan: `#layar` dipakai bersama semua tab, jadi handler klik harus dipasang pada elemen di dalam layar (bukan `root.onclick`), kalau tidak ikut menempel ke tab lain (bug ini sempat terjadi di tab Klub).
- Diuji di Chromium headless (390x844): buat klub, ganti warna, bangun + percepat, akademi, jadwalkan + main persahabatan, laga liga, simpanan lama (field v17 dihapus), auto-main persahabatan terlewat, akhir musim. Belum diuji: Mode 3D dengan warna klub (sandbox tanpa Three.js), tampilan di HP sungguhan.
- Belum: piala/knockout, tawaran transfer ke pemain kita, pelatih/staf, kontrak sponsor yang bisa dipilih, laga online antar-manajer (Supabase).

## v18 — Aset merek, ikon, onboarding
- **Merek (`assets/brand/`)**: `logo-mark.svg` (ikon app, bola voli + jejak koral), `favicon.svg` (versi tebal agar terbaca di 16px), `logo-lockup.svg` (mark + teks VOLLEY MANAGER; teks memakai `textLength` agar muat walau font Barlow tidak termuat). Dibuat dengan kode, bukan gambar AI.
- **Ikon app (`assets/icons/`)**: `icon-192/512.png`, `icon-maskable-512.png` (isi penuh untuk Android), `apple-touch-icon.png`, `favicon-32.png`. Dirender dari SVG lewat Chrome headless. `manifest.webmanifest` + tag di `index.html` (siap dipasang ke layar utama / PWA; belum ada service worker).
- **Ikon baru** di `IKON` (`js/layar/gambar.js`): tambah, cek, info, bantuan, lonceng, kunci, panah, toko, parkir, medis, akademi, tiket, sponsor, grafik, target, bendera, mata, unduh, lokasi, peluit. Fasilitas Medis/Akademi/Toko/Parkir kini memakai ikon sendiri (`FASILITAS` di `sistem/pasar.js`).
- **Onboarding**: `js/layar/onboarding.js` + `css/v18.css`. 4 slide (sambutan, taktik, laga, trofi), bisa digeser, tombol Lewati. Tampil sekali sebelum Buat Klub (kunci `localStorage vm-onboard`; hapus kunci itu untuk melihat lagi, atau panggil `bukaOnboarding(fn, {paksa:true})`). Ilustrasi inline SVG di file yang sama.
- Diuji di Chromium headless 390x844: 4 slide, alur ke Buat Klub, masuk game, tab Klub; tanpa error konsol dan tanpa respons 404. Belum diuji di HP sungguhan. Font Google tidak termuat di sandbox (pakai font cadangan).
- Jebakan: `file://` tidak bisa memuat ES module; uji lewat server (`python3 -m http.server`).

## v19 — 3D sesi 1: pemain stylized berkerangka (buatan kode)
- **File baru `js/tiga-d/player-gaya.js`**: `createPlayerGaya(THREE, opsi)`. Rangka sendi (pinggul, tulang belakang, bahu/siku, paha/lutut, leher) dengan bentuk halus (kapsul/bola), garis tepi tipis (inverted hull, matikan dengan `opsi.garis=false`), ikat kepala, 3 gaya rambut (`p.gaya`), warna rambut/kulit dari data pemain, nomor punggung. Libero (`role 'L'`) otomatis berjersey kuning. Tinggi sekitar 2,3 (sama seperti pemain lama).
- **Animasi** = pose per sendi yang dicampur halus (`KLIP` di file itu): `terima, lompat, servis, umpan, smash, blok, rayakan, kecewa`, ditambah napas/goyang saat siaga. API: `g.userData.main(nama, durasiDtk)`; pembaruan per frame lewat `g.userData.mixer.update(dt)` (sudah dipanggil `putar()` di arena3d). Kanal dan konvensi sudut dijelaskan di kepala file (`rotation.x` negatif = ayun ke depan; bahu memakai urutan Euler `ZXY`).
- **`js/layar/arena3d.js`**: konstanta `GAYA = true` memilih pemain ini (false = FBX Kenney/pemain lama; backup file lama: `docs/arena3d_v17_backup.js`). Dengan `GAYA`, FBX Kenney (~2 MB) tidak diunduh. `lompat(g, tinggi, d, tunda, aksi)` kini menerima nama klip; servis/smash/blok/umpan dipicu dari reli; `reaksi(menang, kalah)` membuat 2 pencetak merayakan dan 2 lawan kecewa setelah tiap poin. Squash `scale.y` pada `jongkok` dilewati untuk pemain berkerangka.
- **`pemain-preview.html`**: halaman pratinjau (seret = putar), tombol per animasi, saklar garis tepi. Buka lewat https/localhost.
- **Pengujian (tanpa Three.js asli)**: `_uji/` berisi Three.js tiruan + mini-renderer 2D (`uji-pose.html?klip=smash&depan=1` untuk melihat pose) + uji integrasi (`integrasi.html`, 6 jenis reli, 12 pemain, tanpa NaN/error). Ini memeriksa bentuk pose dan alur kode, BUKAN tampilan cahaya/material/FPS. Folder `_uji/` boleh dihapus saat rilis.
- **Belum terverifikasi**: tampilan sungguhan di HP (warna/cahaya/garis tepi), FPS dengan 12 pemain (sekitar 500 draw call; bila berat set `garis:false` di `isiPemain` atau kurangi bagian kecil), waktu pukulan servis/smash terhadap bola (tween bola dan klip dicocokkan kira-kira: smash ~70%, servis ~28% klip).

## v19.1 — Penggabungan v18 asset pack + v19 pemain berkerangka
- Basis = v19 (pemain `player-gaya.js`, `reaksi`, klip animasi). Dari v18.1 diambil: 8 GLB (`assets/models/volley-manager/`), `js/tiga-d/asset-pack.js`, `asset-preview.html`, `docs/ASSET_*_V18.*`.
- **Tidak diambil**: `assets/textures/pbr/` (15 PNG, ±1,3 MB berguna 0: tidak terhubung ke GLB mana pun) dan perubahan `player.js` v18 (peta roughness untuk pemain lama yang tak terpakai saat `GAYA = true`).
- `asset-pack.js` diubah: `muatAssetPack(T, kunci)` hanya memuat kunci diminta (arena: `volleyball`, `bench`, `bottle`), geometri/material GLB ditandai `userData.shared`.
- `arena3d.js` (gabungan): `buang()` melewati material bersama dan membuang tekstur sekali; bola memakai GLB bila ada; bangku GLB di (0, .08, **6.0**) dan botol di atas dudukan. Di v18 bangku di z=7.0 = persis papan LED (W+2.5) dan botol melayang ±9 cm; dipindah.
- `asset-preview.html`: ditambahkan importmap `three` (di v18 `GLTFLoader` gagal karena specifier 'three' tak terselesaikan).
- **Belum terverifikasi di perangkat**: tampilan bangku/botol vs kamera, FPS dengan 12 pemain (+ ±444-600 mesh), bentrok visual dengan bangku prosedural di arena.js.
