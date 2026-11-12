// Performa pemain di luar angka dasar: sifat, form, beban kerja, dan cedera berjenjang. Logika murni.
import { K } from '../inti/konfigurasi.js';
const jepit = (n, a, b) => Math.max(a, Math.min(b, n));

// --- Sifat: pengali performa saat poin ketat (tek) dan saat tertinggal.
export function modSifat(sifat, tek, tertinggal) {
  const s = K.lanjut.sifat;
  switch (sifat) {
    case 'Pejuang': return tek && tertinggal ? 1 + s.pejuang : 1;
    case 'Pemalu': return tek ? 1 + s.pemalu : 1;
    case 'Pemberani': return tek && !tertinggal ? 1 + s.pemberani : 1;
    default: return 1;
  }
}
// Sifat Tenang kebal terhadap tekanan: efek mental negatif saat poin ketat dihapus (yang positif tetap berlaku).
export const kebalTekanan = sifat => sifat === 'Tenang';
// Sifat Pemimpin di lapangan memberi bonus kecil ke seluruh tim.
export const bonusPemimpin = tim => tim.some(p => p.sifat === 'Pemimpin') ? 1 + K.lanjut.sifat.pemimpin : 1;

// --- Form: -10 (buruk) .. +10 (prima). Memengaruhi semua statistik +-K.lanjut.form.pengali per poin.
export const faktorForm = p => 1 + jepit(p.form || 0, -K.lanjut.form.maks, K.lanjut.form.maks) * K.lanjut.form.pengali;
export const labelForm = f => f >= 6 ? 'Prima' : f >= 2 ? 'Bagus' : f > -2 ? 'Normal' : f > -6 ? 'Menurun' : 'Buruk';
// Kontribusi per reli dari catatan laga: poin (ace/smash/blok) dikurangi 1,2x kesalahan, dibanding harapan per posisi.
const HARAP = { OH: .075, OP: .09, MB: .07, S: .03, L: 0 };
// perf = { [idPemain]: { pts, err, reli } }. Dipanggil sekali saat laga selesai; mengubah p.form pemain skuad saya.
export function perbaruiForm(skuad, perf, menang) {
  const L = K.lanjut.form;
  skuad.forEach(p => {
    const t = perf[p.id], f = p.form || 0;
    if (!t || !t.reli) { p.form = Math.round(f * L.bangku * 10) / 10; return; }
    const nilai = (t.pts - 1.2 * t.err) / t.reli, rating = jepit(Math.round((nilai - (HARAP[p.posisi] ?? .05)) * 45), -3, 3) + (menang ? 1 : -1);
    p.form = Math.round(jepit(f * L.peluruh + rating, -L.maks, L.maks) * 10) / 10;
  });
}
// Catat satu reli ke perf (dipanggil mesin laga untuk tim saya).
export const masukReli = (perf, id) => { (perf[id] ??= { pts: 0, err: 0, reli: 0 }).reli++; };
export function catatPerf(perf, id, jenis, pelaku) {
  const t = perf[id] ??= { pts: 0, err: 0, reli: 0 };
  if (pelaku) jenis === 'salah' ? t.err++ : t.pts++;
}

// --- Beban kerja 0..100: naik tiap set dimainkan, pulih mengikuti waktu nyata.
export function bebanSekarang(p, now) {
  const lewat = Math.max(0, now - (p.bebanTs || now));
  return jepit((p.beban || 0) - lewat / 60000 / K.lanjut.beban.pulihMenit, 0, 100);
}
export function tambahBeban(p, now, set = 1) { p.beban = jepit(bebanSekarang(p, now) + K.lanjut.beban.perSet * set, 0, 100); p.bebanTs = now; }
// Pengali nilai pemilihan susunan: pemain berbeban tinggi sedikit dikesampingkan (rotasi).
export const faktorRotasi = (p, now) => 1 - Math.max(0, bebanSekarang(p, now) - 60) / K.lanjut.beban.rotasi;

// --- Cedera berjenjang.
// Peluang cedera: dasar + kelelahan + beban kerja di atas ambang, dikali riwayat cedera pemain (rawan).
export function peluangCedera(p, stamina, now) {
  const b = K.lanjut.beban, dasar = K.cedera.dasar + (stamina < 30 ? K.cedera.lelah : 0) + Math.max(0, bebanSekarang(p, now) - b.ambang) * b.risiko;
  return Math.min(0.5, dasar * (1 + (p.cederaN || 0) * K.lanjut.cederaBerulang));
}
// Pilih jenis dan lama cedera. Pemain berdaya tahan rendah cenderung cedera lebih berat; pusat medis memperpendek.
export function buatCedera(p, acak, now, medis = 0) {
  const J = K.lanjut.cederaJenis, geser = (50 - (p.tahan ?? 50)) / 700;   // tahan 15 => +5% ke arah cedera berat, tahan 95 => -6% (u lebih besar melewati kategori ringan)
  let u = acak() + geser, j = J[J.length - 1];
  for (const x of J) { if (u < x.p) { j = x; break; } u -= x.p; }
  const menit = acak.int(j.menit[0], j.menit[1]) * (1 - 0.15 * medis);
  p.cedera = now + Math.max(5, menit) * 60000; p.cederaJenis = j.n; p.cederaN = (p.cederaN || 0) + 1;
  return j.n;
}
