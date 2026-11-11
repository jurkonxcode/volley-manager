// Skuad NPC: dibuat deterministik dari musim + tim (tidak disimpan), jadi nama dan profil selalu sama untuk tim yang sama.
import { buatPemain, ratingPemain } from './pemain.js';
import { buatAcak } from '../inti/acak.js';
import { NEGARA } from '../data/negara.js';
const POS = ['S', 'S', 'OH', 'OH', 'OH', 'MB', 'MB', 'MB', 'OP', 'OP', 'L', 'L', 'OH', 'MB'], URUT = { S: 0, OH: 1, MB: 2, OP: 3, L: 4 };
const hash = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const simpan = new Map();
export function skuadLawan(M, i) {
  const t = M.tim[i], kunci = `${M.ke}|${M.neg}|${M.liga}|${i}|${t.nama}`;
  if (simpan.has(kunci)) return simpan.get(kunci);
  const a = buatAcak(hash(kunci)), negs = Object.keys(NEGARA), h = hash(kunci).toString(36);
  const daftar = POS.map((pos, k) => {
    const bintang = k % 5 === 0 ? 7 : 0, neg = a() < .7 ? (M.neg || 'ID') : a.pilih(negs);
    const p = buatPemain(a, pos, Math.max(25, t.tingkat + a.int(-6, 5) + bintang), M.mulai, neg);
    p.id = `n${h}_${k}`; p.nomor = k + 1 + (k > 8 ? 4 : 0); p.kM = M.ke + a.int(0, 2); p.lawan = true;
    return p;
  }).sort((x, y) => URUT[x.posisi] - URUT[y.posisi] || ratingPemain(y) - ratingPemain(x));
  simpan.set(kunci, daftar); return daftar;
}
