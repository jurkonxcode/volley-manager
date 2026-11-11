// Analitik musim: statistik, win rate, dan data grafik dari hasil laga. Logika murni.
import { tabel } from './musim.js';

const poinLaga = (sa, sb) => sa > sb ? (sb === 2 ? 2 : 3) : (sa === 2 ? 1 : 0);
// Laga tim saya di musim ini, berurutan per pekan.
export function lagaSaya(M) {
  return M.hasil.filter(r => r.i === 0 || r.j === 0).map(r => {
    const k = r.i === 0, sa = k ? r.s1 : r.s2, sb = k ? r.s2 : r.s1;
    return { h: r.h, lw: k ? r.j : r.i, sa, sb, menang: sa > sb, poin: poinLaga(sa, sb) };
  }).sort((a, b) => a.h - b.h);
}
export function analitik(M) {
  const L = lagaSaya(M), n = L.length, mn = L.filter(x => x.menang).length;
  const sm = L.reduce((a, x) => a + x.sa, 0), sk = L.reduce((a, x) => a + x.sb, 0), poin = L.reduce((a, x) => a + x.poin, 0);
  const rank = L.map(x => tabel({ tim: M.tim, hasil: M.hasil.filter(r => r.h <= x.h) }).findIndex(t => t.i === 0) + 1);
  let streak = 0; for (let i = n - 1; i >= 0 && L[i].menang === L[n - 1].menang; i--) streak++;
  return {
    L, n, mn, kalah: n - mn, rank,
    winRate: n ? Math.round(mn / n * 100) : 0,
    setRate: sm + sk ? Math.round(sm / (sm + sk) * 100) : 0,
    sm, sk, poin, rataPoin: n ? (poin / n).toFixed(1) : '0.0',
    streak: n ? { menang: L[n - 1].menang, n: streak } : null
  };
}
