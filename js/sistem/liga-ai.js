// Laga antar-tim AI di liga memakai mesin laga penuh (sama dengan laga manajer), bukan lagi model peluang kasar.
// Kekuatan tim dibuat dengan generator yang sama seperti lawan manajer (buatLawan), jadi skala "tingkat" konsisten.
import { buatAcak } from '../inti/acak.js';
import { buatLawan } from './liga.js';
import { buatPertandingan, mainkanSet } from './pertandingan.js';
import { gayaDasar } from './taktik-lawan.js';

// Mengembalikan [setTuanRumah, setTamu]. Tuan rumah (A) mendapat bonus kandang; tiap tim memakai gaya dasarnya (tanpa adaptasi).
export function simulasiLagaAI(tingkatTuan, tingkatTamu, seed, now = 1e12) {
  const acak = buatAcak(seed), A = buatLawan(tingkatTuan, acak, now), B = buatLawan(tingkatTamu, acak, now);
  const m = buatPertandingan(A, A.map(p => p.id), B, 1, { formasi: '5-1', gaya: gayaDasar(A) }, {
    tingkatLawan: tingkatTamu, kandang: 'A', seed, tanpaForm: true, tanpaAdaptasi: true, taktikLawan: { formasi: '5-1', gaya: gayaDasar(B) }
  });
  while (!m.selesai) mainkanSet(m, acak, now);
  return [m.setSaya, m.setLawan];
}
