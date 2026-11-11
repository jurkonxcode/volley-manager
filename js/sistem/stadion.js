// Stadion, harga tiket, dan pemasukan hari laga. Logika murni.
import { K } from '../inti/konfigurasi.js';
export const kapasitas = S => K.stadion.kapAwal + K.stadion.kapPerLevel * (S.fasilitas?.stadion || 0);
export const idxTiket = (S, jenis) => Math.max(0, Math.min(K.tiket.length - 1, S.klub.tiket?.[jenis] ?? 1));
// Perkiraan penonton dan pemasukan untuk satu laga. idx = pilihan harga (default: harga yang sedang dipasang).
export function pemasukanLaga(S, jenis, kandang = true, idx = idxTiket(S, jenis)) {
  const t = K.tiket[idx], k = S.klub, kap = kapasitas(S), sem = ((k.semangat ?? 50) - 50) / 250;
  const minta = Math.round(k.fans * K.stadion.minat[jenis] * t.m * (1 + sem)), hadir = kandang ? Math.min(kap, minta) : 0;
  return {
    kap, minta, hadir, penuh: kandang && minta >= kap, harga: t.h,
    tiket: Math.round(hadir * t.h / 10),
    parkir: kandang ? Math.round(hadir / 100 * K.parkir.perLevel * (S.fasilitas?.parkir || 0)) : 0,
    merch: jenis === 'liga' ? Math.round(k.fans / 100 * K.toko.perLevel * (S.fasilitas?.toko || 0)) : 0
  };
}
