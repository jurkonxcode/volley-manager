# Volley Manager v18 — Realistic 3D Asset Pack

## Included

### GLB props (`assets/models/volley-manager/`)
- `volleyball_pro.glb` — match ball with composite shell and panel seams.
- `volleyball_net_system.glb` — net, posts, padding and top tape.
- `championship_trophy.glb` — metallic cup trophy with base and handles.
- `championship_medal.glb` — medal and ribbon.
- `referee_whistle.glb` — whistle with mouthpiece and lanyard ring.
- `training_dumbbell.glb` — rubberized training weight and chrome bar.
- `sports_water_bottle.glb` — reusable sideline bottle.
- `team_bench.glb` — team sideline bench.

### PBR maps
Tidak disertakan di build gabungan v18+v19 (lihat catatan di bawah).

### Pemain
Pemain 3D kini `js/tiga-d/player-gaya.js` (v19, berkerangka buatan kode). FBX Kenney tetap ada di `assets/models/kenney/` sebagai fallback (`GAYA = false` di `arena3d.js`).

## Runtime integration
`js/tiga-d/asset-pack.js` loads the bundled GLB files through Three.js 0.160.0 `GLTFLoader`. `js/layar/arena3d.js` memuat hanya `volleyball`, `bench`, `bottle` dan memakai bola, bangku (x=0, z=6.0, di depan papan LED z=7.0) dan dua botol in the 3D match scene. If a GLB fails to load, the game keeps its procedural ball and arena fallback.

All paths are relative to the project root and should be deployed with the rest of the `assets/` folder. Keep filenames and folder names unchanged unless updating `FILES` in `asset-pack.js`.

## Technical notes
- GLB assets are static meshes, not rigged characters.
- The GLB models are lightweight game props. The net GLB is intended for close-up / facility use; the existing procedural arena net remains the live match net to avoid duplicate geometry.
- Peta PBR v18 dihapus dari gabungan: tidak terhubung ke GLB mana pun (GLB tanpa gambar), peta roughness/metallic hanya warna rata (~1 KB) dan basecolor ±255 KB x5 tidak dipakai kode.
- Model trofi, medali, peluit, dumbbell, dan net-system belum dipakai layar mana pun (disiapkan untuk layar Kompetisi/Latihan/Fasilitas). Muat dengan `muatAssetPack(T, ['trophy'])` lalu `ambilAset('trophy')`.

## Validation checklist
- Confirm all GLB files load from the deployed project root over HTTPS.
- Test the 3D match on a low-memory Android device and check frame pacing.
- Confirm the sideline props do not overlap the court or camera framing on portrait screens.
- Keep `renderer.setPixelRatio` capped for mobile devices.
