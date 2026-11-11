import { URUTAN_STAT } from '../inti/konfigurasi.js';
import { NAMA_DEPAN, NAMA_BELAKANG } from '../data/nama-pemain.js';
const PROFIL = {
  S:  { servis: 0,  smash: -10, blok: -4,  receive: 4,   umpan: 18 },
  OH: { servis: 4,  smash: 10,  blok: -2,  receive: 8,   umpan: -8 },
  MB: { servis: 0,  smash: 6,   blok: 16,  receive: -10, umpan: -6 },
  OP: { servis: 6,  smash: 16,  blok: 2,   receive: -12, umpan: -8 },
  L:  { servis: -2, smash: -20, blok: -18, receive: 20,  umpan: 6 }
};
const BOBOT = {
  S:  { servis: .15, smash: .10, blok: .10, receive: .20, umpan: .45 },
  OH: { servis: .20, smash: .30, blok: .15, receive: .25, umpan: .10 },
  MB: { servis: .15, smash: .25, blok: .40, receive: .05, umpan: .15 },
  OP: { servis: .20, smash: .40, blok: .20, receive: .10, umpan: .10 },
  L:  { servis: .10, smash: .05, blok: .10, receive: .50, umpan: .25 }
};
const jepit = (n, a = 10, b = 95) => Math.max(a, Math.min(b, Math.round(n)));
let urut = 0;
export function ratingPemain(p) { return Math.round(URUTAN_STAT.reduce((a, st) => a + BOBOT[p.posisi][st] * p[st], 0)); }
export function buatPemain(acak, posisi, tingkat, now) {
  const p = {
    id: 'p' + (urut++) + '_' + acak.int(1000, 9999),
    nama: acak.pilih(NAMA_DEPAN) + ' ' + acak.pilih(NAMA_BELAKANG),
    posisi, umur: acak.int(17, 33), nomor: acak.int(1, 20),
    tahan: jepit(tingkat + acak.int(-12, 18), 15, 95), mental: jepit(tingkat + acak.int(-10, 15), 15, 95),
    kulit: acak.int(0, 3), rambut: acak.int(0, 3), gaya: acak.int(0, 2),
    stamina: 100, staminaTs: now
  };
  for (const st of URUTAN_STAT) p[st] = jepit(tingkat + PROFIL[posisi][st] + acak.int(-7, 7));
  p.potensi = jepit(Math.max(ratingPemain(p) + acak.int(3, 22), tingkat + 8), 20, 99);
  return p;
}
export function buatSkuadAwal(acak, now, tingkat) {
  const komposisi = ['S', 'S', 'OH', 'OH', 'OH', 'MB', 'MB', 'MB', 'OP', 'OP', 'L', 'L'];
  const skuad = komposisi.map(pos => buatPemain(acak, pos, tingkat, now));
  skuad.forEach((p, i) => { p.nomor = i * 2 + 1; });
  // Susunan awal: baris depan (OH, MB, OP), baris belakang (OH, L, S)
  const susunan = [skuad[2], skuad[5], skuad[8], skuad[3], skuad[10], skuad[0]].map(p => p.id);
  return { skuad, susunan };
}
