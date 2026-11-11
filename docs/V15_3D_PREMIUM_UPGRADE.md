# Volley Manager v15 — Premium Procedural 3D Upgrade

## Ringkasan
Upgrade ini memperbarui mode pertandingan 3D yang sudah ada di v14. Tidak ada framework baru dan tidak ada perubahan pada mesin reli, sistem liga, ekonomi, stamina, atau penyimpanan.

### File yang diperbarui
- `js/tiga-d/arena.js` — arena indoor premium procedural: lantai parquet dari CanvasTexture, garis lapangan, net berjaring, antena, tiang ber-padding, kursi wasit, LED perimeter, tribun bertingkat, kursi instanced, crowd low-poly instanced, kolom dan rangka atap.
- `js/tiga-d/player.js` — atlet 3D lebih detail: torso jersey, celana pendek, lengan dan tungkai, lutut, kaus kaki, sepatu, wajah, rambut berlapis, mata, dan nomor jersey yang dirender ke CanvasTexture.
- `js/tiga-d/volleyball.js` — bola dengan shell, panel/seam melengkung, dan material lebih realistis.
- `js/tiga-d/effects.js` — efek impact smash yang lebih kaya dan efek debu pendaratan yang bisa dipakai pada iterasi berikutnya.
- `js/layar/arena3d.js` — tone mapping, color space, pencahayaan fill/rim, bayangan, kamera isometric, dan pixel-ratio yang dibatasi untuk perangkat mobile.

## Kompatibilitas
- Three.js 0.160.0 (tetap menggunakan CDN yang sudah dipakai v14).
- Vanilla JavaScript ES modules.
- Tidak membutuhkan npm, bundler, framework, file GLB, atau request asset tambahan.
- GitHub Pages tetap didukung selama dibuka melalui HTTPS.
- Mode 2D dan fallback ketika WebGL/Three.js gagal tetap dipertahankan.

## Batasan yang perlu diketahui
Model atlet pada paket ini adalah **procedural 3D mesh**, bukan model GLB rigged. Animasi yang tersedia masih memakai gerakan grup (jump/squat) dari sistem v14. Upgrade ini meningkatkan bentuk, material, pencahayaan, arena, dan presentasi visual, tetapi belum menyediakan skeleton humanoid, skinning, facial rig, atau animation clips profesional. Itu bisa menjadi tahap berikutnya dengan model GLB khusus.

## Catatan performa mobile
- Renderer membatasi pixel ratio maksimum 1.35.
- Crowd dan kursi menggunakan `InstancedMesh` agar jumlah draw call lebih rendah.
- Crowd tidak menerima bayangan individual.
- Jika perangkat kelas bawah mengalami frame drop, langkah optimasi berikutnya adalah mengurangi jumlah crowd, menonaktifkan shadow map, dan menurunkan pixel ratio menjadi 1.0.

## Pemasangan
Jika memakai ZIP project lengkap, unggah isi folder `vm/` ke root repository GitHub (mengikuti struktur repo yang sudah dipakai).

Jika ingin patch manual, ganti file berikut saja:
1. `js/tiga-d/arena.js`
2. `js/tiga-d/player.js`
3. `js/tiga-d/volleyball.js`
4. `js/tiga-d/effects.js`
5. `js/layar/arena3d.js`

Jangan mengubah `js/sistem/pertandingan.js` untuk upgrade visual ini. Mesin simulasi v14 tetap menjadi sumber hasil reli.

## Verifikasi
- Sintaks modul JavaScript diperiksa dengan `node --check`.
- Paket tetap memakai import Three.js CDN yang sudah ada di v14.
- Rendering 3D akhir tetap perlu dites pada browser HP melalui HTTPS karena lingkungan build ini tidak memiliki akses jaringan ke CDN dan tidak dapat memverifikasi GPU perangkat pengguna.
