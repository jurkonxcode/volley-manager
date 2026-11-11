// Formasi menentukan posisi tiap slot (3 depan, 3 belakang). Gaya main mengubah bobot statistik.
import { ratingPemain } from './pemain.js';
import { staminaSekarang, faktorStamina } from './stamina.js';
export const FORMASI = {
  '5-1': { slot: ['OH', 'MB', 'OP', 'OH', 'L', 'S'], m: {} },
  '4-2': { slot: ['OH', 'MB', 'S', 'OH', 'L', 'S'], m: { umpan: 1.06, receive: 1.02, smash: 0.97, blok: 0.98 } },
  'Tembok': { slot: ['OH', 'MB', 'MB', 'OH', 'L', 'S'], m: { blok: 1.06, smash: 0.97 } }
};
export const GAYA = {
  serang: { nama: 'Serang', m: { smash: 1.06, receive: 0.96 } },
  seimbang: { nama: 'Seimbang', m: {} },
  bertahan: { nama: 'Bertahan', m: { blok: 1.05, receive: 1.04, smash: 0.94 } }
};
export function pengaliTaktik(tk) {
  const a = FORMASI[tk.formasi]?.m || {}, b = GAYA[tk.gaya]?.m || {}, h = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) h[k] = (a[k] || 1) * (b[k] || 1);
  return h;
}
// Pilih pemain terbaik (rating x stamina) untuk tiap slot formasi.
export function autoSusun(S, now) {
  const sisa = [...S.skuad], nilai = p => ratingPemain(p) * faktorStamina(staminaSekarang(p, now));
  return FORMASI[S.taktik.formasi].slot.map(pos => {
    const kand = sisa.filter(p => p.posisi === pos), pool = kand.length ? kand : sisa;
    const p = pool.reduce((x, y) => nilai(y) > nilai(x) ? y : x);
    sisa.splice(sisa.indexOf(p), 1); return p.id;
  });
}
