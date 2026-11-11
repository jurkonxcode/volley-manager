// Sprite pemain di assets/pose/. Tim saya (A, sisi dekat) dilihat dari belakang: belakang-*.png.
// Tim lawan (B, sisi jauh) dilihat dari depan: *.png, dicat ulang (jersey biru tua jadi merah tua).
export const POSE = ['siap', 'servis', 'receive', 'umpan', 'smash', 'blok', 'selebrasi', 'kecewa', 'dive'];
// Pose yang hanya ada tampak belakang (tim saya); tim lawan memakai pose depan terdekat.
const SAMA = { selebrasi: 'umpan', kecewa: 'siap', dive: 'receive' };
const DIR = 'assets/pose/', cache = { A: {}, B: {} };
const berkas = (pose, tim) => DIR + (tim === 'A' ? 'belakang-' + pose : (SAMA[pose] || pose)) + '.png';
export const spriteSrc = (pose, tim) => cache[tim][pose] || berkas(pose, tim);

function cat(im) {
  const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
  const x = c.getContext('2d'); x.drawImage(im, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    const r = p[i], g = p[i + 1], b = p[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (p[i + 3] < 8 || b !== mx || mx - mn < 30 || (mx + mn) / 510 > .38) continue;   // hanya biru tua (jersey); kulit, rambut, bola, sepatu tetap
    p[i] = b; p[i + 1] = g * .6; p[i + 2] = r;
  }
  x.putImageData(d, 0, 0); return c.toDataURL('image/png');
}
const perbarui = (tim, n) => document.querySelectorAll(`img.sprite[data-tim="${tim}"][data-pose="${n}"]`).forEach(e => { e.src = cache[tim][n]; });
// Dipanggil sekali saat game dibuka: memuat semua pose lebih dulu agar tidak berkedip, lalu mewarnai versi lawan.
export function siapkanSprite() {
  POSE.forEach(n => {
    const a = new Image(); a.onload = () => { cache.A[n] = a.src; perbarui('A', n); }; a.src = berkas(n, 'A');
    const b = new Image();
    b.onload = () => { try { cache.B[n] = cat(b); } catch (e) { cache.B[n] = b.src; } perbarui('B', n); };   // gagal (mis. dari file://): warna asli
    b.src = berkas(n, 'B');
  });
}
// Ganti pose pemain sebentar lalu kembali berdiri siaga.
export function setPose(el, pose) {
  const img = el.querySelector('img.sprite'); if (!img) return;
  clearTimeout(el._t); img.dataset.pose = pose; img.src = spriteSrc(pose, img.dataset.tim);
  el._t = setTimeout(() => { img.dataset.pose = 'siap'; img.src = spriteSrc('siap', img.dataset.tim); }, 800);
}
