// Laga yang dimainkan otomatis (pekan liga / persahabatan yang terlewat saat manajer tidak membuka game).
// Memakai mesin yang sama dengan laga live (`mainkanSet`), jadi stamina terkuras dan pulih mengikuti waktu
// jadwal, bukan lagi peluang kasar. Logika murni: tidak menyentuh tampilan.
import { K } from '../inti/konfigurasi.js';
import { buatAcak } from '../inti/acak.js';
import { buatLawan } from './liga.js';
import { buatPertandingan, mainkanSet } from './pertandingan.js';
import { autoSusun } from './taktik.js';

// Waktu simulasi laga: jadwal kick-off, tapi tidak mundur dari cap waktu stamina terakhir (agar tidak ada pemulihan ganda).
export const waktuLaga = (S, kickoff) => Math.max(kickoff, ...S.skuad.map(p => p.staminaTs || 0));

// Susunan untuk laga otomatis. Dengan rotasi (K.otomatis.rotasi) pemain lelah digantikan cadangan yang lebih segar,
// tanpa mengubah S.susunan milik manajer. Mengembalikan daftar id.
export function susunanOtomatis(S, now) { return K.otomatis.rotasi ? autoSusun(S, now) : S.susunan; }

// Mainkan satu laga penuh. Mengubah stamina pemain (seperti laga live). Mengembalikan { sa, sb, ids }.
export function simulasiLaga(S, tingkatLawan, level, seed, now) {
  const ids = susunanOtomatis(S, now), lawan = buatLawan(tingkatLawan, buatAcak(seed ^ 0x5bd1e995), now);
  const m = buatPertandingan(S.skuad, ids, lawan, level, S.taktik), acak = buatAcak(seed);
  m.faktorBiaya = K.otomatis.biayaStamina;   // laga otomatis menguras stamina lebih ringan dari laga live
  while (!m.selesai) mainkanSet(m, acak, now);
  return { sa: m.setSaya, sb: m.setLawan, ids };
}
