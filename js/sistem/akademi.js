// Akademi muda dan perkembangan pemain antar-musim. Logika murni.
import { K } from '../inti/konfigurasi.js';
import { buatAcak } from '../inti/acak.js';
import { buatPemain, ratingPemain } from './pemain.js';
import { URUTAN_STAT } from '../inti/konfigurasi.js';
import { pesan } from './klub.js';
const jepit = (n, a, b) => Math.max(a, Math.min(b, Math.round(n)));
const POS = ['S', 'OH', 'MB', 'OP', 'L', 'OH', 'MB'];
export const segarAkademi = (S, now) => !S.akademi || now - S.akademi.ts >= K.akademi.menitSegar * 60000;
// Level 0 = akademi belum dibangun. Tiap level: bakat lebih matang dan potensi lebih tinggi.
export function segarkanAkademi(S, now, paksa = false) {
  const lv = S.fasilitas.akademi || 0; if (!lv) return;
  if (!paksa && !segarAkademi(S, now)) return;
  const a = buatAcak((now ^ 0x5bd1e995) & 0x7fffffff), neg = S.negara || 'ID';
  S.akademi = { ts: now, daftar: Array.from({ length: K.akademi.jumlah }, () => {
    const p = buatPemain(a, a.pilih(POS), 16 + lv * 5, now, neg);
    p.umur = a.int(15, 17); p.potensi = jepit(ratingPemain(p) + a.int(14 + lv * 2, 26 + lv * 4), 30, 99); p.muda = true; p.nomor = 0;
    return p;
  }) };
}
export function angkat(S, id, now) {
  const p = S.akademi?.daftar.find(x => x.id === id); if (!p) return 'Pemain tidak ditemukan';
  if (S.skuad.length >= K.pasar.maksSkuad) return 'Skuad penuh';
  const pakai = new Set(S.skuad.map(x => x.nomor)); let n = 1; while (pakai.has(n)) n++;
  p.nomor = n; p.kM = S.musim.ke + 3; p.stamina = 100; p.staminaTs = now; delete p.muda;
  S.akademi.daftar.splice(S.akademi.daftar.indexOf(p), 1); S.skuad.push(p);
  pesan(S, 'Lulusan akademi', `${p.nama} (${p.umur} th, potensi ${p.potensi}) bergabung ke skuad utama.`); return null;
}
// Akhir musim: semua pemain bertambah umur. Yang muda berkembang menuju potensi, yang tua mulai menurun.
export function perkembanganMusim(S, seed) {
  const a = buatAcak(seed), naik = [], turun = [];
  S.skuad.forEach(p => {
    p.umur++;
    if (p.umur <= 23 && ratingPemain(p) < p.potensi) { URUTAN_STAT.forEach(st => { p[st] = jepit(p[st] + a.int(0, 3), 10, 95); }); p.tahan = jepit(p.tahan + a.int(0, 2), 15, 95); naik.push(p.nama.split(' ')[0]); }
    else if (p.umur >= 31) { URUTAN_STAT.forEach(st => { p[st] = jepit(p[st] - a.int(0, 2), 10, 95); }); turun.push(p.nama.split(' ')[0]); }
  });
  if (naik.length || turun.length) pesan(S, 'Perkembangan pemain', (naik.length ? `Berkembang: ${naik.slice(0, 5).join(', ')}${naik.length > 5 ? ' dan lainnya' : ''}. ` : '') + (turun.length ? `Mulai menurun karena usia: ${turun.slice(0, 4).join(', ')}.` : ''));
  return { naik: naik.length, turun: turun.length };
}
