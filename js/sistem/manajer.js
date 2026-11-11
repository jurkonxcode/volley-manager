// Profil manajer: nama, tim, EXP, level, dan catatan pertandingan. Logika murni.
import { K } from '../inti/konfigurasi.js';

export function buatManajer(now) {
  return { nama: K.manajer.namaAwal, tim: K.manajer.timAwal, exp: 0, main: 0, menang: 0, kalah: 0, dibuat: now };
}
// EXP yang dibutuhkan untuk naik dari level l ke l+1.
const expUntuk = l => K.exp.dasar + (l - 1) * K.exp.tambahPerLevel;
// Dari EXP total, hitung level sekarang, sisa EXP di level ini, dan kebutuhannya.
export function levelDari(exp) {
  let level = 1, sisa = exp;
  while (sisa >= expUntuk(level)) { sisa -= expUntuk(level); level++; }
  const butuh = expUntuk(level);
  return { level, sisa, butuh, persen: (sisa / butuh) * 100 };
}
export function expPertandingan(menang, levelLawan) {
  return (menang ? K.exp.menang : K.exp.kalah) + K.exp.perLevelLawan * levelLawan;
}
// Mencatat hasil. Mengembalikan level baru jika manajer naik level, atau 0.
export function catatHasil(m, menang, exp) {
  m.main++;
  menang ? m.menang++ : m.kalah++;
  const sebelum = levelDari(m.exp).level;
  m.exp += exp;
  const sesudah = levelDari(m.exp).level;
  return sesudah > sebelum ? sesudah : 0;
}
