// Taktik lawan: gaya main dasar dari komposisi skuad, penangkal (counter) gaya manajer, dan adaptasi antar-set.
// Logika murni, deterministik lewat acak ber-seed. Tidak menyentuh tampilan.
import { K } from '../inti/konfigurasi.js';
import { GAYA } from './taktik.js';

// Segitiga gaya: serang mengalahkan seimbang, seimbang mengalahkan bertahan, bertahan mengalahkan serang.
const MENGALAHKAN = { serang: 'seimbang', seimbang: 'bertahan', bertahan: 'serang' };
// Gaya yang menangkal gaya g (kebalikan dari tabel di atas).
export const penangkal = g => Object.keys(MENGALAHKAN).find(k => MENGALAHKAN[k] === g) || 'seimbang';
// Pengali semua statistik untuk tim bergaya `saya` melawan tim bergaya `lawan`.
export function faktorCounter(saya, lawan) {
  const c = K.lanjut.counter;
  if (MENGALAHKAN[saya] === lawan) return 1 + c;
  if (MENGALAHKAN[lawan] === saya) return 1 - c;
  return 1;
}
// Gaya bawaan sebuah tim: menyerang bila daya serang jauh di atas pertahanan, bertahan bila sebaliknya.
export function gayaDasar(tim) {
  const rata = st => tim.reduce((a, p) => a + p[st], 0) / tim.length;
  const serang = rata('smash') * 0.6 + rata('servis') * 0.4, tahan = rata('blok') * 0.5 + rata('receive') * 0.5;
  return serang - tahan > 4 ? 'serang' : tahan - serang > 4 ? 'bertahan' : 'seimbang';
}
// Peluang lawan memilih gaya penangkal: tim kuat lebih cermat membaca manajer.
export const peluangAdaptasi = tingkat => Math.min(K.lanjut.adaptasi.maks, Math.max(0.05, K.lanjut.adaptasi.dasar + Math.max(0, tingkat - 35) * K.lanjut.adaptasi.perTingkat));
// Taktik lawan di awal laga: gaya dasar, atau penangkal gaya manajer bila "membaca" lawannya.
export function pilihTaktikLawan(tim, taktikSaya, tingkat, acak) {
  const dasar = gayaDasar(tim);
  const gaya = taktikSaya?.gaya && acak() < peluangAdaptasi(tingkat) ? penangkal(taktikSaya.gaya) : dasar;
  return { formasi: '5-1', gaya };
}
// Antar-set: lawan yang kalah set mempertimbangkan beralih (peluang lebih besar), yang menang cenderung bertahan dengan gayanya.
// Mengubah m.taktikLawan dan mengisi m.catatan bila berganti gaya. Mengembalikan true bila berganti.
export function adaptasiLawan(m, acak, lawanMenangSet) {
  if (!m.taktikLawan || !m.taktik || m.tanpaAdaptasi) return false;
  const p = peluangAdaptasi(m.tingkatLawan ?? 40) * (lawanMenangSet ? 0.35 : 1.4), sasaran = penangkal(m.taktik.gaya);
  if (m.taktikLawan.gaya === sasaran || acak() >= Math.min(0.9, p)) return false;
  m.taktikLawan = { ...m.taktikLawan, gaya: sasaran };
  m.catatan = `Lawan beralih ke gaya ${GAYA[sasaran].nama}`;
  return true;
}
// Laporan scouting untuk layar pra-laga.
export function laporanLawan(tim) {
  const g = gayaDasar(tim);
  return { gaya: g, nama: GAYA[g].nama, saran: penangkal(g), namaSaran: GAYA[penangkal(g)].nama };
}
