import { NEGARA } from '../data/negara.js';
// Transfer, scouting, latihan, fasilitas, dan cedera. Logika murni.
import { K } from '../inti/konfigurasi.js';
import { buatAcak } from '../inti/acak.js';
import { buatPemain, ratingPemain } from './pemain.js';
import { staminaSekarang } from './stamina.js';
import { peluangCedera, buatCedera } from './performa.js';
import { catatKas, pesan } from './klub.js';
export const STAT_LATIHAN = ['servis', 'smash', 'blok', 'receive', 'umpan', 'tahan'];
// Fasilitas klub. maks = level tertinggi, kali = pengali biaya dan lama pembangunan.
export const FASILITAS = {
  stadion: { nama: 'Stadion', ikon: 'stadion', maks: 8, kali: 1.5, info: 'Kapasitas +500 kursi dan hadiah laga +10% per level' },
  latihan: { nama: 'Lapangan Latihan', ikon: 'smash', maks: 5, kali: 1, info: 'Sesi latihan 10% lebih cepat dan hasil lebih sering per level' },
  medis: { nama: 'Pusat Medis', ikon: 'medis', maks: 5, kali: 1, info: 'Cedera 15% lebih singkat per level' },
  akademi: { nama: 'Akademi Muda', ikon: 'akademi', maks: 5, kali: 1.2, info: 'Level 1 membuka akademi; tiap level menghasilkan bakat lebih matang dan berpotensi tinggi' },
  toko: { nama: 'Toko Klub', ikon: 'toko', maks: 5, kali: 1, info: 'Pemasukan merchandise tiap laga liga, naik mengikuti jumlah fans' },
  parkir: { nama: 'Parkir & Kafe', ikon: 'parkir', maks: 5, kali: 1, info: 'Pemasukan tambahan tiap laga kandang, naik mengikuti jumlah penonton' }
};
export const urutFasilitas = Object.keys(FASILITAS);
const faktorTabel = (tabel, umur) => (tabel.find(([maks]) => umur <= maks) || tabel[tabel.length - 1])[1];
// Harga beli: dari rating, naik untuk pemain muda yang masih punya ruang tumbuh (potensi), turun untuk veteran.
export const hargaBeli = p => Math.round(ratingPemain(p) ** 2 / 8 * faktorTabel(K.lanjut.harga.umur, p.umur ?? 25) * (1 + Math.max(0, (p.potensi ?? 0) - ratingPemain(p)) / K.lanjut.harga.potensi));
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
// Peluang satu pemain naik 1 poin dari latihan: dasar dari fasilitas, dikali umur (muda cepat, veteran lambat),
// jarak ke potensi (rating sudah mendekati potensi sulit naik), dan sifat (Pekerja Keras, Disiplin, Ambisius).
export function peluangLatih(p, levelFasilitas = 0) {
  const L = K.lanjut.latihan, dasar = 0.6 + 0.05 * levelFasilitas, dekat = ratingPemain(p) >= (p.potensi ?? 99) ? L.dekatPotensi : 1;
  return Math.min(0.95, dasar * faktorTabel(L.umur, p.umur ?? 25) * dekat * (L.sifat[p.sifat] || 1));
}
// Selesaikan latihan dan pembangunan yang waktunya sudah lewat.
export function prosesWaktu(S, now) {
  if (S.latihan && now >= S.latihan.selesai) {
    const a = buatAcak(now & 0x7fffffff), st = S.latihan.stat, naik = [];
    S.skuad.forEach(x => { if (a() < peluangLatih(x, S.fasilitas.latihan) && x[st] < 99) { x[st]++; naik.push(x.nama.split(' ')[0]); } }); S.latihan = null;
    if (naik.length) pesan(S, 'Latihan selesai', `${st[0].toUpperCase() + st.slice(1)} naik: ${naik.slice(0, 5).join(', ')}${naik.length > 5 ? ` dan ${naik.length - 5} lainnya` : ''}.`);
  }
  const b = S.fasilitas.bangun;
  if (b && now >= b.selesai) { S.fasilitas[b.kunci] = (S.fasilitas[b.kunci] || 0) + 1; S.fasilitas.bangun = null; pesan(S, 'Pembangunan selesai', `${FASILITAS[b.kunci].nama} naik ke level ${S.fasilitas[b.kunci]}.`); }
}
// Setelah laga: pemain di lapangan bisa cedera. Peluang naik karena stamina rendah, beban kerja tinggi, dan riwayat cedera;
// jenis (ringan/sedang/berat) memengaruhi lamanya, dan pusat medis memperpendeknya.
export function cederaLaga(S, acak, now, ids = S.susunan) {   // ids: pemain yang benar-benar main (laga otomatis dengan rotasi)
  const hasil = [];
  ids.forEach(id => {
    const p = S.skuad.find(x => x.id === id); if (!p || p.cedera > now) return;
    if (acak() < peluangCedera(p, staminaSekarang(p, now), now)) { const j = buatCedera(p, acak, now, S.fasilitas.medis); hasil.push(`${p.nama.split(' ')[0]} (${j.toLowerCase()})`); }
  });
  return hasil;
}
