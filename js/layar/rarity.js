// Tingkat kelangkaan kartu pemain (gaya gacha), dihitung dari rating. Ubah ambang di TINGKAT sesuai keseimbangan game.
// Skuad awal berkisar 43-59, jadi SSR (62+) sengaja baru tercapai lewat latihan atau transfer.
import { ratingPemain } from '../sistem/pemain.js';
export const TINGKAT = [
  { kode: 'SSR', min: 62, bintang: 5 },
  { kode: 'SR', min: 54, bintang: 4 },
  { kode: 'R', min: 48, bintang: 3 },
  { kode: 'N', min: 0, bintang: 2 },
];
export const rarity = p => { const r = ratingPemain(p); return TINGKAT.find(t => r >= t.min); };
