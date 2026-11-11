// Logika murni: tidak menyentuh tampilan.
import { K } from '../inti/konfigurasi.js';
import { pengaliTaktik } from './taktik.js';
import { staminaSekarang, faktorStamina, kurangiStamina, biayaSet } from './stamina.js';
const jepit = (n, a, b) => Math.max(a, Math.min(b, n));

export function kekuatanTim(tim, now, tk) {
  const mu = tk ? pengaliTaktik(tk) : {};
  const eff = (p, st) => p[st] * faktorStamina(staminaSekarang(p, now)) * (mu[st] || 1);
  const rata = st => tim.reduce((a, p) => a + eff(p, st), 0) / tim.length;
  const umpan = Math.max(...tim.map(p => eff(p, 'umpan')));
  return 0.30 * rata('smash') + 0.15 * rata('servis') + 0.20 * rata('blok') + 0.20 * rata('receive') + 0.15 * umpan;
}
export function buatPertandingan(skuad, susunan, lawan, level, taktik) {
  return { taktik, skuad, susunan, lawan, level, setSaya: 0, setLawan: 0, setKe: 1, riwayat: [], selesai: false, pemenang: null };
}
export const timSaya = m => m.susunan.map(id => m.skuad.find(p => p.id === id));

function jenisRally(acak) { const r = acak(); return r < .15 ? 'ace' : r < .35 ? 'blok' : r < .80 ? 'smash' : 'salah'; }

// Mainkan satu set. Mengubah stamina semua pemain di lapangan. Mengembalikan daftar reli untuk animasi.
export function mainkanSet(m, acak, now) {
  const terakhir = m.setKe === 2 * K.set.menang - 1;
  const target = terakhir ? K.set.poinTerakhir : K.set.poin;
  const A = timSaya(m), B = m.lawan;
  const peluang = jepit(0.5 + (kekuatanTim(A, now, m.taktik) - kekuatanTim(B, now)) * K.skalaPeluang, K.peluangMin, K.peluangMaks);
  let a = 0, b = 0; const rally = [];
  for (;;) {
    const saya = acak() < peluang;
    saya ? a++ : b++;
    rally.push({ a: saya, jenis: jenisRally(acak) });
    if ((a >= target || b >= target) && Math.abs(a - b) >= K.set.selisih) break;
    if (rally.length > 300) { if (a === b) a++; break; }
  }
  [...A, ...B].forEach(p => kurangiStamina(p, biayaSet(p, a + b), now));
  a > b ? m.setSaya++ : m.setLawan++;
  m.riwayat.push({ a, b }); m.setKe++;
  if (m.setSaya === K.set.menang || m.setLawan === K.set.menang) { m.selesai = true; m.pemenang = m.setSaya > m.setLawan ? 'saya' : 'lawan'; }
  return { rally, a, b, menangSaya: a > b };
}
