// Pemain 3D dari model GLB beranimasi (Quaternius / Kenney, dll). Bila file model tidak ada atau gagal dimuat,
// pemanggil memakai createPlayer() prosedural lama, jadi game tetap jalan.
// Konvensi sama dengan player.js: pusat grup di telapak kaki, depan = +Z, facing 'left'/'right' memutar Y.

// UBAH DI SINI sesuai model yang kamu pakai.
// Mode FBX (paket Kenney): model + animasi terpisah + satu tekstur kulit.
export const SUMBER = {
  model: 'assets/models/kenney/model.fbx',
  klip: { idle: 'assets/models/kenney/idle.fbx', lompat: 'assets/models/kenney/jump.fbx', lari: 'assets/models/kenney/run.fbx' },
  kulit: 'assets/models/kenney/kulit.png',
};
export const TINGGI = 2.3;          // tinggi pemain di dunia game (pemain prosedural ~2.4)
export const HADAP_OFFSET = 0;      // bila pemain tampak membelakangi jaring / miring, coba Math.PI, Math.PI/2 atau -Math.PI/2
export const WARNA_TIM = .45;       // 0 = kulit asli, 1 = penuh warna tim (seluruh tekstur ikut diwarnai)
export const REGEX_KLIP = {         // nama klip -> aksi game
  idle:    /idle/i,
  lompat:  /jump|lompat/i,
  terima:  /duck|crouch|dodge|hit|react/i,
  rayakan: /victory|cheer|wave|dance|yes|win|lompat|jump/i,   // paket Kenney tak punya klip rayakan: pakai lompat
};

let templat = null;

export async function muatModel(THREE, url = SUMBER.model) {
  if (templat) return templat;
  const base = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/';
  const [{ FBXLoader }, SU] = await Promise.all([import(base + 'loaders/FBXLoader.js'), import(base + 'utils/SkeletonUtils.js')]);
  const fl = new FBXLoader();
  const scene = await fl.loadAsync(url);
  const klip = [];
  for (const [nama, u] of Object.entries(SUMBER.klip)) {
    try { const a = (await fl.loadAsync(u)).animations[0]; if (a) { a.name = nama; klip.push(a); } } catch (e) { console.warn('[FBX] klip gagal:', nama, e.message); }
  }
  const tex = await new THREE.TextureLoader().loadAsync(SUMBER.kulit); tex.colorSpace = THREE.SRGBColorSpace;
  scene.traverse(o => { if (o.isMesh) { o.geometry.userData.shared = true; [].concat(o.material).forEach(m => { m.map = tex; m.color?.set(0xffffff); m.needsUpdate = true; }); } });
  const box = new THREE.Box3().setFromObject(scene), tinggiAsli = box.max.y - box.min.y || 1;
  console.info('[GLB] klip:', klip.map(a => a.name), '| tinggi asli:', tinggiAsli.toFixed(2));
  templat = { THREE, SU, scene, klip, skala: TINGGI / tinggiAsli, alas: -box.min.y, tex };
  return templat;
}


// Pewarnaan tekstur (bukan menimpa warna seluruh model): hanya kaus (abu kebiruan) jadi warna tim, dan kulit disesuaikan per pemain.
// Sepatu, celana, dan rambut tidak disentuh. Hasilnya di-cache per kombinasi (jersey, kulit).
export function warnaiPiksel(p, jersey, kulit) {
  const R = (jersey >> 16) & 255, G = (jersey >> 8) & 255, B = jersey & 255, rata = [0, 0, 0]; let n = 0;
  const lum = (r, g, b) => (r * .3 + g * .59 + b * .11) / 255;
  for (let i = 0; i < p.length; i += 4) { const r = p[i], g = p[i + 1], b = p[i + 2]; if (p[i + 3] > 8 && r - b >= 18 && lum(r, g, b) > .45) { rata[0] += r; rata[1] += g; rata[2] += b; n++; } }
  const k = n && kulit != null ? [0, 1, 2].map(j => Math.max(.2, Math.min(1.25, ((kulit >> (16 - 8 * j)) & 255) / (rata[j] / n)))) : [1, 1, 1];
  for (let i = 0; i < p.length; i += 4) {
    if (p[i + 3] < 8) continue;
    const r = p[i], g = p[i + 1], b = p[i + 2], l = lum(r, g, b);
    if (b - r >= 9 && l > .5 && l < .95) { const f = Math.min(2.2, l / .78); p[i] = Math.min(255, R * f); p[i + 1] = Math.min(255, G * f); p[i + 2] = Math.min(255, B * f); }
    else if (r - b >= 18 && l > .45) { p[i] = Math.min(255, r * k[0]); p[i + 1] = Math.min(255, g * k[1]); p[i + 2] = Math.min(255, b * k[2]); }
  }
}
const cacheTekstur = {};
function texTim(THREE, tex, jersey, kulit) {
  const kunci = jersey + '-' + kulit;
  if (kunci in cacheTekstur) return cacheTekstur[kunci];
  try {
    const im = tex.image, c = document.createElement('canvas'); c.width = im.naturalWidth || im.width; c.height = im.naturalHeight || im.height;
    const x = c.getContext('2d'); x.drawImage(im, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height); warnaiPiksel(d.data, jersey, kulit); x.putImageData(d, 0, 0);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.shared = true;   // shared: jangan di-dispose saat pemain dibuang
    return (cacheTekstur[kunci] = t);
  } catch (e) { console.warn('[GLB] pewarnaan tekstur gagal, pakai tint biasa:', e.message); return (cacheTekstur[kunci] = null); }
}

export const modelSiap = () => !!templat;

export function createPlayerGLB(options = {}) {
  const { THREE, SU, scene, klip, skala, alas } = templat;
  const group = new THREE.Group(); group.name = `Player_${options.number ?? 7}`;
  const model = SU.clone(scene); model.scale.setScalar(skala); model.position.y = alas * skala; model.rotation.y = HADAP_OFFSET;
  // Material dikloning per pemain supaya warna tim tidak menimpa pemain lain.
  const tm = options.jerseyColor != null ? texTim(THREE, templat.tex, options.jerseyColor, options.skinColor) : null;
  model.traverse(o => {
    if (!o.isMesh) return;
    o.castShadow = true; o.receiveShadow = false; o.frustumCulled = false;
    o.material = [].concat(o.material).map(m => { const c = m.clone(); if (tm) { c.map = tm; c.color.set(0xffffff); } else if (options.jerseyColor != null) c.color.set(options.jerseyColor).lerp(new THREE.Color(0xffffff), 1 - WARNA_TIM); c.needsUpdate = true; return c; });
    if (o.material.length === 1) o.material = o.material[0];
  });
  group.add(model);
  const mixer = new THREE.AnimationMixer(model), aksi = {};
  for (const [k, re] of Object.entries(REGEX_KLIP)) { const c = klip.find(a => re.test(a.name)); if (c) aksi[k] = mixer.clipAction(c); }
  const dasar = aksi.idle || (klip[0] && mixer.clipAction(klip[0]));
  if (dasar) { dasar.time = Math.random() * dasar.getClip().duration; dasar.play(); }   // acak fase supaya tidak serempak
  // Aksi sekali jalan (lompat, terima, rayakan): lalu kembali ke idle.
  group.userData.main = nama => {
    const a = aksi[nama]; if (!a) return;
    a.reset().setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = false; a.play();
    if (dasar) a.crossFadeFrom(dasar, .12, false);
    const selesai = e => { if (e.action !== a) return; mixer.removeEventListener('finished', selesai); if (dasar) dasar.reset().play().crossFadeFrom(a, .15, false); };
    mixer.addEventListener('finished', selesai);
  };
  group.userData.mixer = mixer; group.userData.number = String(options.number ?? 7); group.userData.role = options.role ?? 'OH';
  if (options.facing === 'left') group.rotation.y = Math.PI / 2;
  if (options.facing === 'right') group.rotation.y = -Math.PI / 2;
  return group;
}
