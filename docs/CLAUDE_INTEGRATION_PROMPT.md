# Prompt untuk Claude AI — Integrasi Volley Manager v15 3D

Project ini sudah berisi upgrade visual 3D v15. Tolong integrasikan ke repository GitHub Volley Manager dengan ketentuan berikut.

1. Baca `HANDOFF.md`, `README.md`, dan `docs/V15_3D_PREMIUM_UPGRADE.md`.
2. Pertahankan seluruh sistem game v14: simulasi pertandingan, stamina, liga, transfer, latihan, taktik, save data, navigasi, dan UI 2D.
3. Gunakan file v15 berikut sebagai implementasi visual utama:
   - `js/tiga-d/arena.js`
   - `js/tiga-d/player.js`
   - `js/tiga-d/volleyball.js`
   - `js/tiga-d/effects.js`
   - `js/layar/arena3d.js`
4. Jangan menulis ulang `js/sistem/pertandingan.js` dan jangan mengubah schema state atau localStorage.
5. Pastikan tombol mode 3D tetap opsional dan fallback 2D tetap bekerja jika Three.js atau WebGL tidak tersedia.
6. Uji melalui HTTPS di Chrome Android. Periksa portrait dan landscape, resize layar, masuk/keluar mode 3D, pindah tab, mulai set baru, dan beberapa reli beruntun.
7. Periksa console untuk error, memory leak, dan loop requestAnimationFrame yang tidak berhenti setelah layar pertandingan ditutup.
8. Jika performa HP rendah, optimalkan jumlah crowd dan shadow/pixel ratio tanpa menghapus detail utama lapangan atau pemain.
9. Jangan mengklaim model pemain sudah rigged/GLB; pada versi ini karakter masih procedural mesh.
10. Laporkan file yang diubah, hasil pengujian, error yang ditemukan, dan performa pada perangkat/browser yang benar-benar diuji.

Tujuan: mempertahankan game yang sudah ada sambil meningkatkan kualitas visual mode pertandingan 3D.
