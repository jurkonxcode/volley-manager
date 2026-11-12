// Volley Manager — registri aset GLB lokal (asal v18, disesuaikan di gabungan v18+v19).
// Semua aset ada di repo; GLTFLoader Three.js 0.160.0 dimuat dari CDN yang sama dengan renderer (butuh importmap 'three' di halaman).
const BASE = 'assets/models/volley-manager/';
const FILES = {
  volleyball: 'volleyball_pro.glb',
  trophy: 'championship_trophy.glb',
  whistle: 'referee_whistle.glb',
  dumbbell: 'training_dumbbell.glb',
  bottle: 'sports_water_bottle.glb',
  medal: 'championship_medal.glb',
  bench: 'team_bench.glb',
  netSystem: 'volleyball_net_system.glb',
};
import { muatBolaMikasa } from './bola-mikasa.js';
const cache = {};          // key -> Group | null (null = gagal dimuat, tidak dicoba ulang)
let loader = null;
// Muat hanya kunci yang diminta (arena pertandingan cuma butuh bola, bangku, botol => ~135 KB, bukan semua 8 model).
export async function muatAssetPack(THREE, kunci = Object.keys(FILES)) {
  if (!loader) { const { GLTFLoader } = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'); loader = new GLTFLoader(); }
  await Promise.all(kunci.filter(k => FILES[k] && !(k in cache)).map(async k => {
    // Bola: coba model Mikasa (FBX) dulu; gagal => volleyball_pro.glb di bawah.
    if (k === 'volleyball') {
      try {
        const b = await muatBolaMikasa(THREE, 0.22);
        b.traverse(o => { if (!o.isMesh) return; o.castShadow = true; o.receiveShadow = true; o.geometry.userData.shared = true; for (const m of [].concat(o.material || [])) m.userData.shared = true; });
        cache[k] = b; return;
      } catch (error) { console.warn('[AssetPack] bola Mikasa gagal dimuat, memakai volleyball_pro.glb:', error.message); }
    }
    try {
      const gltf = await loader.loadAsync(BASE + FILES[k]);
      gltf.scene.traverse(o => {
        if (!o.isMesh) return;
        o.castShadow = true; o.receiveShadow = true;
        // Klon berbagi geometri & material dengan cache => tandai agar arena3d.buang() tidak membuangnya.
        o.geometry.userData.shared = true;
        for (const m of [].concat(o.material || [])) m.userData.shared = true;
      });
      cache[k] = gltf.scene;
    } catch (error) { console.warn(`[AssetPack] ${FILES[k]} gagal dimuat:`, error.message); cache[k] = null; }
  }));
  return cache;
}
export function ambilAset(key) { return cache[key]?.clone(true) || null; }
export const daftarAset = () => Object.keys(FILES);
