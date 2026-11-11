import { URUTAN_STAT } from '../inti/konfigurasi.js';
import { buatAcak } from '../inti/acak.js';
import { ASAL, SIFAT } from '../data/nama-pemain.js';
import { namaOrang, asalOrang } from '../data/negara.js';
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
// Rentang tinggi badan (cm) per posisi, supaya kartu terasa masuk akal.
const TINGGI = { S: [186, 196], OH: [188, 198], MB: [193, 206], OP: [190, 200], L: [168, 178] };
const jepit = (n, a = 10, b = 95) => Math.max(a, Math.min(b, Math.round(n)));
let urut = 0;
export function ratingPemain(p) { return Math.round(URUTAN_STAT.reduce((a, st) => a + BOBOT[p.posisi][st] * p[st], 0)); }

// Data diri: tinggi, berat, asal, sifat, dan kontrak. Dipakai juga untuk pemain lama.
function isiProfil(p, acak, now) {
  const [a, b] = TINGGI[p.posisi];
  p.tinggi = acak.int(a, b);
  p.berat = jepit(p.tinggi - 105 + acak.int(-4, 6), 60, 100);
  p.asal = p.neg && p.neg !== 'ID' ? asalOrang(p.neg, acak) : acak.pilih(ASAL);
  p.sifat = acak.pilih(SIFAT);
  p.kontrakSampai = new Date(now).getFullYear() + acak.int(1, 4);
}
// Gaji mingguan (koin) naik mengikuti rating.
export const gajiPemain = p => Math.round(ratingPemain(p) ** 2 / 200) * 10;
// Nilai pasar (koin): naik cepat dengan potensi, lebih tinggi untuk pemain muda.
export function nilaiPasar(p) {
  const faktorUmur = p.umur <= 23 ? 1.2 : p.umur >= 30 ? 0.8 : 1;
  return Math.round(Math.pow(p.potensi / 10, 3) * faktorUmur) * 1000;
}
export function buatPemain(acak, posisi, tingkat, now, neg = 'ID') {
  const p = {
    id: 'p' + (urut++) + '_' + acak.int(1000, 9999),
    nama: namaOrang(neg, acak), neg,
    posisi, umur: acak.int(17, 33), nomor: acak.int(1, 20),
    tahan: jepit(tingkat + acak.int(-12, 18), 15, 95), mental: jepit(tingkat + acak.int(-10, 15), 15, 95),
    kulit: acak.int(0, 3), rambut: acak.int(0, 3), gaya: acak.int(0, 2),
    stamina: 100, staminaTs: now
  };
  for (const st of URUTAN_STAT) p[st] = jepit(tingkat + PROFIL[posisi][st] + acak.int(-7, 7));
  p.potensi = jepit(Math.max(ratingPemain(p) + acak.int(3, 22), tingkat + 8), 20, 99);
  isiProfil(p, acak, now);
  return p;
}
export function buatSkuadAwal(acak, now, tingkat, neg = 'ID') {
  const komposisi = ['S', 'S', 'OH', 'OH', 'OH', 'MB', 'MB', 'MB', 'OP', 'OP', 'L', 'L'];
  const skuad = komposisi.map(pos => buatPemain(acak, pos, tingkat, now, neg));
  skuad.forEach((p, i) => { p.nomor = i * 2 + 1; });
  // Susunan awal: baris depan (OH, MB, OP), baris belakang (OH, L, S)
  const susunan = [skuad[2], skuad[5], skuad[8], skuad[3], skuad[10], skuad[0]].map(p => p.id);
  return { skuad, susunan };
}
function hashStr(s) { let h = 5381; for (const c of s) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0; return h; }
// Pemain dari penyimpanan lama belum punya data diri: isi dengan acak yang tetap (berdasarkan id).
export function lengkapiPemain(p, now) {
  p.neg ??= 'ID';
  if (p.tinggi === undefined) isiProfil(p, buatAcak(hashStr(p.id)), now);
  return p;
}
