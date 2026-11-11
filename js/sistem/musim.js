// Musim liga: 8 tim, dua putaran (14 pekan). Logika murni.
import { K } from '../inti/konfigurasi.js';
import { buatAcak } from '../inti/acak.js';
import { hadiahPertandingan } from './ekonomi.js';
import { cederaLaga } from './pasar.js';
import { expPertandingan, catatHasil } from './manajer.js';
import { namaKlub } from '../data/negara.js';
import { akhirLaga, pesan, buatSponsor, pastikanKontrak, kontrakSelesai } from './klub.js';
const NAMA = ['Elang Sakti', 'Badai Timur', 'Macan Putih', 'Naga Laut', 'Rajawali', 'Banteng Muda', 'Cakra Biru'];
export const LIGA = ['Liga Kelurahan', 'Liga Kota', 'Liga Provinsi', 'Liga Nasional'];
const jepit = (n, a, b) => Math.max(a, Math.min(b, n));
const peluang = d => jepit(0.5 + d * K.skalaPeluang, K.peluangMin, K.peluangMaks);
function putaran(n) {
  const t = [...Array(n).keys()], ps = [];
  for (let r = 0; r < n - 1; r++) { ps.push(Array.from({ length: n / 2 }, (_, i) => [t[i], t[n - 1 - i]])); t.splice(1, 0, t.pop()); }
  return ps;
}
export function buatMusim(ke, namaSaya, now, neg = 'ID', liga = 0) {
  const acak = buatAcak(ke * 7717 + 1 + liga * 131 + neg.charCodeAt(0) * 17), p1 = putaran(8), nm = neg === 'ID' && liga === 0 && ke === 1 ? NAMA : namaKlub(neg, acak, 7, namaSaya);
  const tim = [{ nama: namaSaya, tingkat: K.skuadAwal.tingkat }, ...nm.map((nama, i) => ({ nama, tingkat: 38 + liga * 7 + i * 2 + acak.int(0, 2) }))];
  return { ke, liga, neg, tim, jadwal: [...p1, ...p1.map(h => h.map(([a, b]) => [b, a]))], hari: 0, mulai: now, hasil: [] };
}
export const kickoff = (M, h) => M.mulai + h * K.musim.menitAntarPekan * 60000;
export const levelLawan = tingkat => jepit(Math.round((tingkat - 34) / 6), 1, 3);
export function fixtureSaya(M) {
  if (M.hari >= M.jadwal.length) return null;
  const f = M.jadwal[M.hari].find(x => x.includes(0));
  return { hari: M.hari, lawan: f[0] === 0 ? f[1] : f[0], kandang: f[0] === 0 };
}
function simSet(p, acak, target) { let a = 0, b = 0; while (!((a >= target || b >= target) && Math.abs(a - b) >= 2) && a + b < 200) acak() < p ? a++ : b++; return a > b; }
function simLaga(p, acak) { let a = 0, b = 0; while (a < 3 && b < 3) simSet(p, acak, a + b === 4 ? 15 : 25) ? a++ : b++; return [a, b]; }
// Catat hasil laga saya (set menang, set kalah), simulasikan laga tim lain di pekan itu, lalu maju satu pekan.
export function catatLaga(S, sa, sb) {
  const M = S.musim, h = M.hari, acak = buatAcak(M.ke * 7919 + h), f = fixtureSaya(M), lw = M.tim[f.lawan];
  M.jadwal[h].forEach(([i, j]) => {
    let s1, s2;
    if (i === 0) [s1, s2] = [sa, sb]; else if (j === 0) [s2, s1] = [sa, sb];
    else [s1, s2] = simLaga(peluang(M.tim[i].tingkat - M.tim[j].tingkat), acak);
    M.hasil.push({ h, i, j, s1, s2 });
  });
  M.hari++;
  const menang = sa > sb, level = levelLawan(lw.tingkat), koin = Math.round(hadiahPertandingan(menang, level) * (1 + 0.1 * (S.fasilitas?.stadion || 0))), exp = expPertandingan(menang, level);
  S.koin += koin;
  const ek = akhirLaga(S, f, menang, level, h);
  pesan(S, (menang ? 'Menang ' : 'Kalah ') + sa + '-' + sb + ' vs ' + lw.nama, `Hadiah ${koin} koin. Pemasukan ${ek.masuk}, gaji ${ek.gaji} koin pekan ini.`);
  return { menang, koin, exp, naik: catatHasil(S.manajer, menang, exp), cedera: S.fasilitas ? cederaLaga(S, acak, Date.now()) : [] };
}
// Pekan yang terlewat (kick-off pekan berikutnya sudah lewat) dimainkan otomatis dengan susunan saat ini.
export function kejar(S, now, kekSaya) {
  const M = S.musim; let n = 0;
  while (M.hari < M.jadwal.length && now >= kickoff(M, M.hari + 1)) {
    const f = fixtureSaya(M), [sa, sb] = simLaga(peluang(kekSaya - M.tim[f.lawan].tingkat), buatAcak(M.ke * 31 + M.hari));
    catatLaga(S, sa, sb); n++;
  }
  return n;
}
export function tabel(M) {
  const t = M.tim.map((x, i) => ({ i, m: 0, mn: 0, k: 0, poin: 0, sm: 0, sk: 0 }));
  M.hasil.forEach(({ i, j, s1, s2 }) => {
    const A = t[i], B = t[j]; A.m++; B.m++; A.sm += s1; A.sk += s2; B.sm += s2; B.sk += s1;
    const w = s1 > s2 ? A : B, l = w === A ? B : A, sl = Math.min(s1, s2);
    w.mn++; l.k++; w.poin += sl === 2 ? 2 : 3; l.poin += sl === 2 ? 1 : 0;
  });
  return t.sort((a, b) => b.poin - a.poin || b.mn - a.mn || (b.sm - b.sk) - (a.sm - a.sk));
}
export function akhiriMusim(S, now) {
  const rank = tabel(S.musim).findIndex(x => x.i === 0) + 1, koin = K.musim.hadiahPeringkat[rank - 1] || 100;
  const M = S.musim, sp = S.klub.sponsor, ok = rank <= sp.target, bonus = ok ? sp.bonus : 0, liga = rank <= 2 && M.liga < LIGA.length - 1 ? M.liga + 1 : rank >= 7 && M.liga > 0 ? M.liga - 1 : M.liga;
  S.koin += koin + bonus; S.riwayat.push({ ke: M.ke, liga: M.liga, rank, poin: tabel(M).find(x => x.i === 0).poin, naik: liga > M.liga, turun: liga < M.liga });
  S.klub.sponsor = buatSponsor(liga, rank); pastikanKontrak(S); const kt = kontrakSelesai(S, now);
  let ket = liga > M.liga ? 'Promosi ke ' + LIGA[liga] : liga < M.liga ? 'Degradasi ke ' + LIGA[liga] : 'Bertahan di ' + LIGA[liga];
  if (kt.pergi.length) ket += `. ${kt.pergi.length} pemain habis kontrak dan pergi`;
  pesan(S, `Musim ${M.ke} selesai: peringkat ${rank}`, ket + (ok ? `. Target sponsor tercapai, bonus ${bonus} koin.` : `. Target sponsor (peringkat ${sp.target}) belum tercapai.`));
  S.musim = buatMusim(M.ke + 1, S.manajer.tim, now, S.negara, liga);
  return { rank, koin: koin + bonus, ket };
}
