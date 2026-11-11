// Sprite pemain di assets/pose/. Tim saya (A, sisi dekat) dilihat dari belakang: belakang-*.png.
// Tim lawan (B, sisi jauh) dilihat dari depan: *.png. Jersey biru tua dicat ulang ke warna klub kita (A) dan warna lawan (B).
export const POSE = ['siap', 'servis', 'receive', 'umpan', 'smash', 'blok', 'selebrasi', 'kecewa', 'dive'];
// Pose yang hanya ada tampak belakang (tim saya); tim lawan memakai pose depan terdekat.
const SAMA = { selebrasi: 'umpan', kecewa: 'siap', dive: 'receive' };
const DIR = 'assets/pose/', cache = { A: {}, B: {} };
const berkas = (pose, tim) => DIR + (tim === 'A' ? 'belakang-' + pose : (SAMA[pose] || pose)) + '.png';
export const spriteSrc = (pose, tim) => cache[tim][pose] || berkas(pose, tim);

// Jersey di gambar asli: tim kita (tampak belakang) navy gelap, tim lawan (tampak depan) merah tua. Cat ulang: tiap piksel jersey diberi
// warna target dengan terang-gelapnya (lipatan, bayangan) tetap terjaga. Kulit, rambut, sepatu, dan bola tidak disentuh.
const ASLI = '#1B2F6B';
let WARNA = { A: ASLI, B: '#C8283C' };
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const JERSEY = {
  biru: (r, g, b, mx, mn) => b === mx && mx - mn >= 30 && (mx + mn) / 510 <= .38,
  merah: (r, g, b) => r > 90 && g < r * .5 && b < r * .55
};
function cat(im, hex, jenis) {
  const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
  const x = c.getContext('2d'); x.drawImage(im, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height), p = d.data, [R, G, B] = rgb(hex), ya = JERSEY[jenis];
  for (let i = 0; i < p.length; i += 4) {
    const r = p[i], g = p[i + 1], b = p[i + 2];
    if (p[i + 3] < 8 || !ya(r, g, b, Math.max(r, g, b), Math.min(r, g, b))) continue;
    const f = Math.min(2.2, (r * .3 + g * .59 + b * .11) / 255 / .21);   // terang relatif terhadap jersey asli
    p[i] = Math.min(255, R * f); p[i + 1] = Math.min(255, G * f); p[i + 2] = Math.min(255, B * f);
  }
  x.putImageData(d, 0, 0); return c.toDataURL('image/png');
}
const perbarui = (tim, n) => document.querySelectorAll(`img.sprite[data-tim="${tim}"][data-pose="${n}"]`).forEach(e => { e.src = cache[tim][n]; });
// Dipanggil sekali saat game dibuka: memuat semua pose lebih dulu agar tidak berkedip, lalu mewarnai versi lawan.
// warna = { A: warna jersey kita, B: warna jersey lawan }. Dipanggil lagi bila warna klub diganti.
export function siapkanSprite(warna) {
  if (warna) WARNA = { ...WARNA, ...warna };
  POSE.forEach(n => {
    const a = new Image(); a.onload = () => { try { cache.A[n] = WARNA.A.toUpperCase() === ASLI ? a.src : cat(a, WARNA.A, 'biru'); } catch (e) { cache.A[n] = a.src; } perbarui('A', n); }; a.src = berkas(n, 'A');
    const b = new Image();
    b.onload = () => { try { cache.B[n] = WARNA.B.toUpperCase() === '#C8283C' ? b.src : cat(b, WARNA.B, 'merah'); } catch (e) { cache.B[n] = b.src; } perbarui('B', n); };   // gagal (mis. dari file://): warna asli
    b.src = berkas(n, 'B');
  });
}
// Ganti pose pemain sebentar lalu kembali berdiri siaga.
export function setPose(el, pose) {
  const img = el.querySelector('img.sprite'); if (!img) return;
  clearTimeout(el._t); img.dataset.pose = pose; img.src = spriteSrc(pose, img.dataset.tim);
  el._t = setTimeout(() => { img.dataset.pose = 'siap'; img.src = spriteSrc('siap', img.dataset.tim); }, 800);
}
