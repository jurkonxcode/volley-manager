// Semua timer memakai cap waktu (timestamp), jadi tetap jalan saat HP ditutup.
export const sekarang = () => Date.now();
export function durasiPendek(ms) {
  if (ms <= 0) return '0m';
  const m = Math.ceil(ms / 60000), j = Math.floor(m / 60), s = m % 60;
  return j ? `${j}j ${s}m` : `${s}m`;
}
