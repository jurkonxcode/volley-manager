// Laga persahabatan: cari lawan, buat jadwal, catat hasil. Logika murni (tidak menyentuh tampilan).
import { K } from '../inti/konfigurasi.js';
import { buatAcak } from '../inti/acak.js';
import { NEGARA, namaKlub } from '../data/negara.js';
import { levelDari, expPertandingan } from './manajer.js';
import { hadiahPertandingan } from './ekonomi.js';
import { pemasukanLaga } from './stadion.js';
import { catatKas, pesan } from './klub.js';
import { levelLawan } from './musim.js';
import { simulasiLaga, waktuLaga } from './otomatis.js';
const hash = s => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
export const lengkapiPersahabatan = S => { S.persahabatan ??= { daftar: [], tawaran: null, selesai: [] }; };
const hariIni = (S, now) => S.persahabatan.selesai.filter(x => now - x.t < 864e5).length + S.persahabatan.daftar.length;
// Daftar calon lawan, diperbarui tiap K.persahabatan.menitSegar menit: 3 klub se-liga + 3 klub luar negeri dengan kekuatan sekitar tim kita.
export function segarkanTawaran(S, now, kekSaya, paksa = false) {
  lengkapiPersahabatan(S); const T = S.persahabatan.tawaran;
  if (!paksa && T && now - T.ts < K.persahabatan.menitSegar * 60000) return;
  const a = buatAcak((now ^ 0x9e3779b1) & 0x7fffffff), M = S.musim, ada = new Set(S.persahabatan.daftar.map(f => f.lawan.nama)), daftar = [];
  const rival = M.tim.slice(1).map((t, i) => ({ ...t, i: i + 1 })).sort(() => a() - .5).slice(0, 3);
  rival.forEach(t => daftar.push({ nama: t.nama, tingkat: t.tingkat, neg: M.neg }));
  const asing = Object.keys(NEGARA).filter(k => k !== (M.neg || S.negara)).sort(() => a() - .5).slice(0, 3);
  [-6, 1, 8].forEach((off, i) => { const neg = asing[i % asing.length], [nama] = namaKlub(neg, a, 1, S.manajer.tim); daftar.push({ nama, tingkat: Math.max(30, Math.round(kekSaya) + off + a.int(-1, 1)), neg }); });
  S.persahabatan.tawaran = { ts: now, daftar: daftar.filter(c => !ada.has(c.nama)).map((c, k) => ({ ...c, id: 'c' + (now % 1e6) + k, level: levelLawan(c.tingkat) })) };
}
export function jadwalkan(S, cand, slotMenit, kandang, now) {
  lengkapiPersahabatan(S); const P = S.persahabatan;
  if (P.daftar.length >= K.persahabatan.maksJadwal) return `Maksimal ${K.persahabatan.maksJadwal} laga terjadwal`;
  if (hariIni(S, now) >= K.persahabatan.maksPerHari) return `Batas ${K.persahabatan.maksPerHari} persahabatan per 24 jam tercapai`;
  P.daftar.push({ id: cand.id + '_' + now % 100000, lawan: { nama: cand.nama, tingkat: cand.tingkat, neg: cand.neg, level: cand.level }, kickoff: now + slotMenit * 60000, kandang });
  P.daftar.sort((x, y) => x.kickoff - y.kickoff);
  if (P.tawaran) P.tawaran.daftar = P.tawaran.daftar.filter(c => c.id !== cand.id);
  return null;
}
export function batalkan(S, id) { const P = S.persahabatan; P.daftar = P.daftar.filter(f => f.id !== id); }
// Hasil laga: hadiah dan tiket (bila kandang), EXP separuh, fans dan semangat naik sedikit. Tidak masuk catatan karier atau klasemen.
export function catatPersahabatan(S, id, sa, sb, now = Date.now()) {
  const P = S.persahabatan, f = P.daftar.find(x => x.id === id); if (!f) return null;
  P.daftar = P.daftar.filter(x => x !== f);
  const menang = sa > sb, lv = f.lawan.level, hadiah = Math.round(hadiahPertandingan(menang, lv) * K.persahabatan.hadiah), inc = pemasukanLaga(S, 'persahabatan', f.kandang), tambah = inc.tiket + inc.parkir;
  S.koin += hadiah + tambah; catatKas(S, 'hadiah', hadiah); if (inc.tiket) catatKas(S, 'tiket', inc.tiket); if (inc.parkir) catatKas(S, 'parkir', inc.parkir);
  const m = S.manajer, exp = Math.round(expPertandingan(menang, lv) * K.persahabatan.exp), sebelum = levelDari(m.exp).level; m.exp += exp;
  const naik = levelDari(m.exp).level > sebelum ? levelDari(m.exp).level : 0;
  S.klub.fans += menang ? 12 + lv * 3 : 2; S.klub.semangat = Math.max(10, Math.min(100, (S.klub.semangat ?? 50) + (menang ? K.semangat.fMenang : K.semangat.fKalah)));
  P.selesai.unshift({ t: now, nama: f.lawan.nama, neg: f.lawan.neg, sa, sb, kandang: f.kandang, koin: hadiah + tambah }); P.selesai.length = Math.min(P.selesai.length, 12);
  pesan(S, `Persahabatan: ${menang ? 'menang' : 'kalah'} ${sa}-${sb} vs ${f.lawan.nama}`, `Hadiah ${hadiah} koin${tambah ? `, tiket ${tambah}` : ''}. Semangat tim ${menang ? 'naik' : 'naik sedikit'}.`);
  return { menang, koin: hadiah + tambah, exp, naik, cedera: [] };
}
// Laga yang lewat K.persahabatan.menitTunggu menit dari kick-off dimainkan otomatis dengan susunan saat ini.
export function kejarPersahabatan(S, now) {
  lengkapiPersahabatan(S); let n = 0;
  S.persahabatan.daftar.filter(f => now >= f.kickoff + K.persahabatan.menitTunggu * 60000).forEach(f => {
    const { sa, sb } = simulasiLaga(S, f.lawan.tingkat, f.lawan.level ?? levelLawan(f.lawan.tingkat), hash(f.id), waktuLaga(S, f.kickoff)); catatPersahabatan(S, f.id, sa, sb, now); n++;
  });
  return n;
}
