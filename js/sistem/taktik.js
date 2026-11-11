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
  if (tk.semangat && tk.semangat !== 1) for (const k of ['servis', 'smash', 'blok', 'receive', 'umpan']) h[k] = (h[k] || 1) * tk.semangat;   // semangat tim (v17)
  return h;
}
// Pilih pemain terbaik (rating x stamina) untuk tiap slot formasi.
export function autoSusun(S, now) {
  const sehat = S.skuad.filter(p => !(p.cedera > now)), sisa = sehat.length >= 6 ? sehat : [...S.skuad], nilai = p => ratingPemain(p) * faktorStamina(staminaSekarang(p, now));
  return FORMASI[S.taktik.formasi].slot.map(pos => {
    const kand = sisa.filter(p => p.posisi === pos), pool = kand.length ? kand : sisa;
    const p = pool.reduce((x, y) => nilai(y) > nilai(x) ? y : x);
    sisa.splice(sisa.indexOf(p), 1); return p.id;
  });
}
// Ganti pemain cedera di susunan dengan pemain sehat terbaik (posisi sama dulu).
export function bersihkanSusunan(S, now) {
  const ok = p => p && !(p.cedera > now), pakai = new Set(S.susunan), slot = FORMASI[S.taktik.formasi].slot;
  S.susunan = S.susunan.map((id, i) => {
    if (ok(S.skuad.find(x => x.id === id))) return id;
    const pool = S.skuad.filter(x => ok(x) && !pakai.has(x.id)), c = pool.filter(x => x.posisi === slot[i]);
    const pil = (c.length ? c : pool).sort((a, b) => ratingPemain(b) - ratingPemain(a))[0];
    if (!pil) return id; pakai.add(pil.id); return pil.id;
  });
}
