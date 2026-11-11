import { buatPemain } from './pemain.js';
export function buatLawan(tingkat, acak, now) {
  const tim = ['OH', 'MB', 'OP', 'OH', 'L', 'S'].map(pos => buatPemain(acak, pos, tingkat, now));
  tim.forEach((p, i) => { p.nomor = i * 3 + 2; });
  return tim;
}
