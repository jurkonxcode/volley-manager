import { NEGARA } from '../data/negara.js';
// Transfer, scouting, latihan, fasilitas, dan cedera. Logika murni.
import { K } from '../inti/konfigurasi.js';
import { buatAcak } from '../inti/acak.js';
import { buatPemain, ratingPemain } from './pemain.js';
import { staminaSekarang } from './stamina.js';
import { catatKas, pesan } from './klub.js';
export const STAT_LATIHAN = ['servis', 'smash', 'blok', 'receive', 'umpan', 'tahan'];
// Fasilitas klub. maks = level tertinggi, kali = pengali biaya dan lama pembangunan.
export const FASILITAS = {
  stadion: { nama: 'Stadion', ikon: 'stadion', maks: 8, kali: 1.5, info: 'Kapasitas +500 kursi dan hadiah laga +10% per level' },
  latihan: { nama: 'Lapangan Latihan', ikon: 'smash', maks: 5, kali: 1, info: 'Sesi latihan 10% lebih cepat dan hasil lebih sering per level' },
  medis: { nama: 'Pusat Medis', ikon: 'jantung', maks: 5, kali: 1, info: 'Cedera 15% lebih singkat per level' },
  akademi: { nama: 'Akademi Muda', ikon: 'skuad', maks: 5, kali: 1.2, info: 'Level 1 membuka akademi; tiap level menghasilkan bakat lebih matang dan berpotensi tinggi' },
  toko: { nama: 'Toko Klub', ikon: 'koin', maks: 5, kali: 1, info: 'Pemasukan merchandise tiap laga liga, naik mengikuti jumlah fans' },
  parkir: { nama: 'Parkir & Kafe', ikon: 'rumah', maks: 5, kali: 1, info: 'Pemasukan tambahan tiap laga kandang, naik mengikuti jumlah penonton' }
};
export const urutFasilitas = Object.keys(FASILITAS);
export const hargaBeli = p => Math.round(ratingPemain(p) ** 2 / 8);
export const hargaJual = p => Math.round(hargaBeli(p) * 0.6);
export const biayaFasilitas = (kunci, lv) => Math.round(100 * (lv + 1) ** 2 * (FASILITAS[kunci]?.kali ?? 1) / 10) * 10;
export const menitBangun = (kunci, lv) => Math.round(15 * (lv + 1) * (FASILITAS[kunci]?.kali ?? 1));
export const biayaPercepat = (sisaMs) => Math.max(1, Math.ceil(sisaMs / 60000 / K.token.menitPercepat));
export function segarkanPasar(S, now) {
  if (S.pasar && now - S.pasar.ts < K.pasar.menitSegar * 60000) return;
  const a = buatAcak(now & 0x7fffffff), pos = ['S', 'OH', 'MB', 'OP', 'L'];
  S.pasar = { ts: now, daftar: Array.from({ length: K.pasar.jumlah }, () => { const p = buatPemain(a, a.pilih(pos), a.int(40, 56), now, a() < .6 ? (S.negara || 'ID') : a.pilih(Object.keys(NEGARA))); p.scout = false; return p; }) };
}
export function beli(S, id) {
  const p = S.pasar.daftar.find(x => x.id === id), h = hargaBeli(p);
  if (S.skuad.length >= K.pasar.maksSkuad) return 'Skuad penuh';
  if (S.koin < h) return 'Koin kurang';
  S.koin -= h; catatKas(S, 'transfer', -h); S.pasar.daftar.splice(S.pasar.daftar.indexOf(p), 1); delete p.scout; S.skuad.push(p); return null;
}
export function jual(S, id) {
  const p = S.skuad.find(x => x.id === id);
  if (S.skuad.length <= K.pasar.minSkuad) return 'Skuad minimal ' + K.pasar.minSkuad;
  if (S.susunan.includes(id)) return 'Pemain sedang di lapangan';
  S.koin += hargaJual(p); catatKas(S, 'transfer', hargaJual(p)); S.skuad.splice(S.skuad.indexOf(p), 1); return null;
}
export function scout(S, id) {
  if (S.koin < K.pasar.biayaScout) return 'Koin kurang';
  S.koin -= K.pasar.biayaScout; catatKas(S, 'transfer', -K.pasar.biayaScout); S.pasar.daftar.find(x => x.id === id).scout = true; return null;
}
export function mulaiLatihan(S, stat, now) {
  if (S.latihan) return 'Sesi masih berjalan';
  if (S.koin < K.latihan.biaya) return 'Koin kurang';
  S.koin -= K.latihan.biaya; catatKas(S, 'latihan', -K.latihan.biaya); S.latihan = { stat, selesai: now + K.latihan.menit * 60000 * (1 - 0.1 * S.fasilitas.latihan) }; return null;
}
export function naikkanFasilitas(S, kunci, now) {
  const f = S.fasilitas, lv = f[kunci] || 0, d = FASILITAS[kunci]; if (!d) return 'Fasilitas tidak dikenal';
  if (f.bangun) return 'Sedang membangun';
  if (lv >= d.maks) return 'Level maksimal';
  const b = biayaFasilitas(kunci, lv); if (S.koin < b) return 'Koin kurang';
  S.koin -= b; catatKas(S, 'bangun', -b); f.bangun = { kunci, selesai: now + menitBangun(kunci, lv) * 60000 }; return null;
}
// Token mempercepat pembangunan, latihan, atau menyegarkan pasar/akademi.
export function percepatBangun(S, now) {
  const b = S.fasilitas.bangun; if (!b) return 'Tidak ada pembangunan';
  const t = biayaPercepat(b.selesai - now); if ((S.token || 0) < t) return `Token kurang (butuh ${t})`;
  S.token -= t; b.selesai = now; prosesWaktu(S, now); return null;
}
export function percepatLatihan(S, now) {
  if (!S.latihan) return 'Tidak ada latihan'; if ((S.token || 0) < 1) return 'Token kurang';
  S.token -= 1; S.latihan.selesai = now; prosesWaktu(S, now); return null;
}
export function segarkanPaksa(S, now) {
  if ((S.token || 0) < 1) return 'Token kurang'; S.token -= 1; S.pasar = null; segarkanPasar(S, now); return null;
}
// Selesaikan latihan dan pembangunan yang waktunya sudah lewat.
export function prosesWaktu(S, now) {
  if (S.latihan && now >= S.latihan.selesai) {
    const a = buatAcak(now & 0x7fffffff), st = S.latihan.stat, p = 0.6 + 0.05 * S.fasilitas.latihan;
    S.skuad.forEach(x => { if (a() < p && x[st] < 99) x[st]++; }); S.latihan = null;
  }
  const b = S.fasilitas.bangun;
  if (b && now >= b.selesai) { S.fasilitas[b.kunci] = (S.fasilitas[b.kunci] || 0) + 1; S.fasilitas.bangun = null; pesan(S, 'Pembangunan selesai', `${FASILITAS[b.kunci].nama} naik ke level ${S.fasilitas[b.kunci]}.`); }
}
// Setelah laga: pemain di lapangan bisa cedera, lebih mungkin jika stamina rendah.
export function cederaLaga(S, acak, now) {
  const hasil = [];
  S.susunan.forEach(id => {
    const p = S.skuad.find(x => x.id === id); if (!p) return;
    if (acak() < K.cedera.dasar + (staminaSekarang(p, now) < 30 ? K.cedera.lelah : 0)) { p.cedera = now + acak.int(30, 120) * 60000 * (1 - 0.15 * S.fasilitas.medis); hasil.push(p.nama.split(' ')[0]); }
  });
  return hasil;
}
