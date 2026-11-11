// Sprite pemain: 6 pose PNG di assets/pose/. Tim lawan memakai versi yang dicat ulang (jersey biru tua jadi merah tua).
export const POSE = ['siap', 'servis', 'receive', 'umpan', 'smash', 'blok'];
const DIR = 'assets/pose/', cache = { A: {}, B: {} };
export const spriteSrc = (pose, tim) => cache[tim][pose] || DIR + pose + '.png';

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
// Dipanggil sekali saat game dibuka: memuat semua pose lebih dulu agar tidak berkedip, lalu mewarnai versi lawan.
export function siapkanSprite() {
  POSE.forEach(n => {
    const im = new Image();
    im.onload = () => {
      cache.A[n] = im.src;
      try { cache.B[n] = cat(im); } catch (e) { cache.B[n] = im.src; }   // gagal (mis. dibuka dari file://): pakai warna asli
      document.querySelectorAll(`img.sprite[data-tim="B"][data-pose="${n}"]`).forEach(e => { e.src = cache.B[n]; });
    };
    im.src = DIR + n + '.png';
  });
}
// Ganti pose pemain sebentar lalu kembali berdiri siaga.
export function setPose(el, pose) {
  const img = el.querySelector('img.sprite'); if (!img) return;
  clearTimeout(el._t); img.dataset.pose = pose; img.src = spriteSrc(pose, img.dataset.tim);
  el._t = setTimeout(() => { img.dataset.pose = 'siap'; img.src = spriteSrc('siap', img.dataset.tim); }, 800);
}
