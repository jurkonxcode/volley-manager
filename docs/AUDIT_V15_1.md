# Audit v15 → v15.1

Dasar: paket `VolleyManager_v15_3D_Premium.zip` (proyek lengkap) dan `..._3D_Patch.zip` (5 file; identik byte-per-byte dengan file yang sama di Premium).

## Yang diperiksa dan hasilnya
| Pemeriksaan | Hasil |
|---|---|
| Sintaks semua modul JS, semua `import` menunjuk file + nama ekspor yang ada, semua `assets/...` yang dirujuk ada | Lolos (32 modul) |
| Mesin reli: 300 laga (48.478 reli) dan 3 musim penuh dengan kejar otomatis | Semua invarian lolos: skor set valid, pencetak/`ti`/`pi`/`qi` konsisten, stamina 0..100, jadwal 14 pekan, tabel, analitik, susunan tanpa duplikat |
| Skema state / kunci simpan (`volley-manager-v2`, `versi: 2`) | Tidak berubah; `S.pengaturan.tiga3d` opsional, default mati |
| Fallback 2D bila Three.js/WebGL gagal | Ada; diperkuat (lihat 6) |

## Temuan dan perbaikan
1. **Kebocoran memori 3D (serius).** Pemain 3D dibuat ulang tiap set, tapi geometri/material/tekstur tidak pernah di-dispose. Uji (Three.js tiruan): setelah 30 set, +25.346 geometri, +348 tekstur tertahan. Sekarang +0. (`buang()` di `arena3d.js`; efek smash juga dibuang.)
2. **Bola blok jatuh di sisi pemblok** (seharusnya sisi penyerang). Dibetulkan.
3. **Poin "kesalahan"** (~20% poin) digambar seperti smash tim pencetak. Sekarang pembuat kesalahan yang menyerang/servis dan bola keluar garis samping.
4. **Bola antar-reli saling menimpa** (reli datang tiap 150 ms, terbang .26-.38 s): gerakan lama menimpa yang baru. Sekarang gerakan lama dibatalkan. `jongkok` tidak lagi menimpa `position.y` milik `lompat`.
5. **`userData.parts.head`** menunjuk lutut (bukan kepala). Dibetulkan. **Nomor punggung** ditambahkan (kamera selalu melihat tim saya dari belakang).
6. **Renderer setengah jadi** bila rakit scene gagal: percobaan berikutnya macet. Sekarang direset dan dibuang. Ditambah penanganan `webglcontextlost/restored`.
7. **Bayangan:** semua bagian kecil pemain (jari, tali sepatu, mata, rambut...) ikut membuat bayangan. Sekarang hanya bagian besar: sekitar 922 → 382 objek di pass bayangan (perkiraan).
8. **Laga basi** (`layar/pertandingan.js`): bila pekan laga yang sedang disiapkan lewat dan dimainkan otomatis (`kejar`) saat pindah tab, menyelesaikan laga lama mencatat hasilnya ke lawan pekan berikutnya (atau error bila musim sudah selesai). Sekarang laga basi dibuang.

## Belum terverifikasi / catatan jujur
- **Tampilan 3D (cahaya, eksposur, kamera, skala) belum pernah dilihat** oleh pengaudit: Three.js tidak bisa diunduh. Uji pakai Three.js tiruan, hanya memeriksa alur kode, urutan benar/salah sisi bola, dan sumber daya.
- **Performa HP belum diukur.** Perkiraan masih ~1.100 draw call/frame (12 pemain x ~75 mesh). Bila FPS rendah: gabungkan mesh pemain per material, kurangi crowd, matikan bayangan, pixel ratio 1.0.
- Dokumen v15 asli menyebut "dioptimalkan untuk HP"; itu belum terbukti.
- Catatan desain (tidak diubah): lawan tanpa taktik/stamina; simulasi antar-AI memakai model lama; satu gaya main bisa selalu terbaik; ID pemain `p<urut>_<4 digit>` bisa kembar dengan peluang sangat kecil setelah reload.
