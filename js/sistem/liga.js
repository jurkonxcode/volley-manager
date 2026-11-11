import { JENJANG } from '../data/jenjang-liga.js';
import { buatPemain } from './pemain.js';
export function buatLawan(level, acak, now) {
  const tingkat = JENJANG[0].lawan[level - 1].tingkat;
  const tim = ['OH', 'MB', 'OP', 'OH', 'L', 'S'].map(pos => buatPemain(acak, pos, tingkat, now));
  tim.forEach((p, i) => { p.nomor = i * 3 + 2; });
  return tim;
}
