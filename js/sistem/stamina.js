import { K } from '../inti/konfigurasi.js';
// Stamina disimpan sebagai (nilai, cap waktu). Nilai sekarang dihitung dari selisih waktu nyata.
export function staminaSekarang(p, now) {
  const lewat = Math.max(0, now - (p.staminaTs || now));
  return Math.min(100, p.stamina + lewat / 60000 / K.stamina.pulihMenitPerPersen);
}
export function faktorStamina(s) {
  if (s >= K.stamina.ambangRendah) return 1;
  return K.stamina.faktorMin + (1 - K.stamina.faktorMin) * (s / K.stamina.ambangRendah);
}
export function zonaStamina(s) { return s > K.stamina.ambangRendah ? 'baik' : s > K.stamina.ambangKritis ? 'sedang' : 'kritis'; }
export function kurangiStamina(p, jumlah, now) { p.stamina = Math.max(0, staminaSekarang(p, now) - jumlah); p.staminaTs = now; }
// Biaya satu set: tergantung posisi, panjang set, dan daya tahan pemain.
export function biayaSet(p, poinSet) { return K.biayaSet[p.posisi] * (poinSet / 40) * (1.4 - 0.006 * p.tahan); }
export function menitPulihPenuh(p, now) { return (100 - staminaSekarang(p, now)) * K.stamina.pulihMenitPerPersen; }
