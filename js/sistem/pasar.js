// Transfer, scouting, latihan, fasilitas, dan cedera. Logika murni.
import { K } from '../inti/konfigurasi.js';
import { buatAcak } from '../inti/acak.js';
import { buatPemain, ratingPemain } from './pemain.js';
import { staminaSekarang } from './stamina.js';
export const STAT_LATIHAN = ['servis', 'smash', 'blok', 'receive', 'umpan', 'tahan'];
export const FASILITAS = { latihan: ['Latihan', 'Sesi lebih cepat, hasil lebih sering'], medis: ['Medis', 'Cedera lebih singkat'], stadion: ['Stadion', 'Hadiah laga naik 10% per level'] };
export const hargaBeli = p => Math.round(ratingPemain(p) ** 2 / 8);
export const hargaJual = p => Math.round(hargaBeli(p) * 0.6);
export const biayaFasilitas = lv => 100 * (lv + 1) ** 2;
export function segarkanPasar(S, now) {
  if (S.pasar && now - S.pasar.ts < K.pasar.menitSegar * 60000) return;
  const a = buatAcak(now & 0x7fffffff), pos = ['S', 'OH', 'MB', 'OP', 'L'];
  S.pasar = { ts: now, daftar: Array.from({ length: K.pasar.jumlah }, () => { const p = buatPemain(a, a.pilih(pos), a.int(40, 56), now); p.scout = false; return p; }) };
}
export function beli(S, id) {
  const p = S.pasar.daftar.find(x => x.id === id), h = hargaBeli(p);
  if (S.skuad.length >= K.pasar.maksSkuad) return 'Skuad penuh';
  if (S.koin < h) return 'Koin kurang';
  S.koin -= h; S.pasar.daftar.splice(S.pasar.daftar.indexOf(p), 1); delete p.scout; S.skuad.push(p); return null;
}
export function jual(S, id) {
  const p = S.skuad.find(x => x.id === id);
  if (S.skuad.length <= K.pasar.minSkuad) return 'Skuad minimal ' + K.pasar.minSkuad;
  if (S.susunan.includes(id)) return 'Pemain sedang di lapangan';
  S.koin += hargaJual(p); S.skuad.splice(S.skuad.indexOf(p), 1); return null;
}
export function scout(S, id) {
  if (S.koin < K.pasar.biayaScout) return 'Koin kurang';
  S.koin -= K.pasar.biayaScout; S.pasar.daftar.find(x => x.id === id).scout = true; return null;
}
export function mulaiLatihan(S, stat, now) {
  if (S.latihan) return 'Sesi masih berjalan';
  if (S.koin < K.latihan.biaya) return 'Koin kurang';
  S.koin -= K.latihan.biaya; S.latihan = { stat, selesai: now + K.latihan.menit * 60000 * (1 - 0.1 * S.fasilitas.latihan) }; return null;
}
export function naikkanFasilitas(S, kunci, now) {
  const f = S.fasilitas, lv = f[kunci];
  if (f.bangun) return 'Sedang membangun';
  if (lv >= K.fasilitas.maks) return 'Level maksimal';
  if (S.koin < biayaFasilitas(lv)) return 'Koin kurang';
  S.koin -= biayaFasilitas(lv); f.bangun = { kunci, selesai: now + 15 * (lv + 1) * 60000 }; return null;
}
// Selesaikan latihan dan pembangunan yang waktunya sudah lewat.
export function prosesWaktu(S, now) {
  if (S.latihan && now >= S.latihan.selesai) {
    const a = buatAcak(now & 0x7fffffff), st = S.latihan.stat, p = 0.6 + 0.05 * S.fasilitas.latihan;
    S.skuad.forEach(x => { if (a() < p && x[st] < 99) x[st]++; }); S.latihan = null;
  }
  const b = S.fasilitas.bangun;
  if (b && now >= b.selesai) { S.fasilitas[b.kunci]++; S.fasilitas.bangun = null; }
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
