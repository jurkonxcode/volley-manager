// Bola voli dari model FBX + tekstur lokal (assets/models/mikasa/). Logo/teks merek sudah dihapus dari tekstur warna dan kekasaran.
// Dimuat lewat FBXLoader Three.js 0.160.0 (CDN yang sama dengan renderer). Gagal => asset-pack.js memakai volleyball_pro.glb lalu bola prosedural.
const BASE = 'assets/models/mikasa/';
export async function muatBolaMikasa(THREE, radius = 0.22) {
  const { FBXLoader } = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/FBXLoader.js');
  const fbx = await new FBXLoader().loadAsync(BASE + 'bola-mikasa.fbx');
  const tl = new THREE.TextureLoader();
  const tex = (f, warna) => { const t = tl.load(BASE + f); if (warna) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  // Normal map bawaan berpola lekukan halus; kekuatan dikecilkan agar tidak terlihat berbintik di layar kecil.
  const kulit = new THREE.MeshStandardMaterial({ map: tex('bola-warna.jpg', true), roughnessMap: tex('bola-kasar.jpg'), roughness: 1, normalMap: tex('bola-normal.webp'), normalScale: new THREE.Vector2(0.5, 0.5), metalness: 0 });
  // Katup: tekstur warna aslinya tidak ikut terunduh, jadi diberi warna abu-abu gelap.
  const katup = new THREE.MeshStandardMaterial({ color: 0x3c3c3c, roughnessMap: tex('katup-kasar.png'), roughness: 1, normalMap: tex('katup-normal.png'), metalness: 0.4 });
  fbx.traverse(o => {
    if (!o.isMesh) return;
    const ganti = m => String(m?.name || '').toLowerCase().includes('pimpa') ? katup : kulit;
    o.material = Array.isArray(o.material) ? o.material.map(ganti) : ganti(o.material);
  });
  // Pusatkan dan skalakan supaya diameter = 2 x radius (sama dengan bola GLB/prosedural, jadi arena3d.js tidak perlu diubah).
  const kotak = new THREE.Box3().setFromObject(fbx), ukuran = kotak.getSize(new THREE.Vector3()), pusat = kotak.getCenter(new THREE.Vector3());
  fbx.position.sub(pusat);
  const bola = new THREE.Group(); bola.name = 'BolaMikasa'; bola.add(fbx);
  bola.scale.setScalar((radius * 2) / Math.max(ukuran.x, ukuran.y, ukuran.z));
  bola.userData.radius = radius;
  return bola;
}
