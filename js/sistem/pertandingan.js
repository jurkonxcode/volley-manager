// Logika murni: tidak menyentuh tampilan.
import { K } from '../inti/konfigurasi.js';
import { pengaliTaktik, FORMASI } from './taktik.js';
import { URUTAN_STAT } from '../inti/konfigurasi.js';
import { staminaSekarang, faktorStamina, kurangiStamina, biayaSet } from './stamina.js';
const jepit = (n, a, b) => Math.max(a, Math.min(b, n));

export function kekuatanTim(tim, now, tk) {
  const mu = tk ? pengaliTaktik(tk) : {};
  const slot = tk ? FORMASI[tk.formasi]?.slot : null;
  const eff = (p, st, i) => p[st] * faktorStamina(staminaSekarang(p, now)) * (mu[st] || 1) * faktorPosisi(p, i, slot, st);
  const rata = st => tim.reduce((a, p, i) => a + eff(p, st, i), 0) / tim.length;
  const umpan = Math.max(...tim.map((p, i) => eff(p, 'umpan', i)));
  return 0.30 * rata('smash') + 0.15 * rata('servis') + 0.20 * rata('blok') + 0.20 * rata('receive') + 0.15 * umpan;
}
export function buatPertandingan(skuad, susunan, lawan, level, taktik) {
  return { taktik, skuad, susunan, lawan, level, setSaya: 0, setLawan: 0, setKe: 1, riwayat: [], selesai: false, pemenang: null };
}
// Status poin krusial untuk tampilan: set point / match point (selisih harus tetap >= K.set.selisih setelah poin berikut).
export function statusPoin(a, b, setSaya, setLawan) {
  const terakhir = setSaya + setLawan === 2 * K.set.menang - 2, target = terakhir ? K.set.poinTerakhir : K.set.poin;
  const bisa = (x, y) => x + 1 >= target && x + 1 - y >= K.set.selisih, nama = sx => sx === K.set.menang - 1 ? 'MATCH POINT' : 'SET POINT';
  if (bisa(a, b)) return { teks: nama(setSaya), sisi: 'saya' };
  if (bisa(b, a)) return { teks: nama(setLawan), sisi: 'lawan' };
  return null;
}
// Poin per jenis untuk satu set: [saya, lawan]. 'salah' = poin yang datang dari kesalahan lawan.
export const statBaru = () => ({ ace: [0, 0], blok: [0, 0], smash: [0, 0], salah: [0, 0] });
export function tambahStat(st, r) { const c = st[r.jenis]; if (c) c[r.a ? 0 : 1]++; return st; }
export const timSaya = m => m.susunan.map(id => m.skuad.find(p => p.id === id));

// Pemain di slot yang bukan posisinya kena penalti; libero di baris depan tidak bisa menyerang/memblok.
function faktorPosisi(p, i, slot, st) {
  let f = slot && p.posisi !== slot[i] ? K.posisi.salah : 1;
  if (p.posisi === 'L' && i < 3 && (st === 'smash' || st === 'blok')) f *= K.posisi.liberoDepan;
  return f;
}
// Nilai efektif tiap pemain: statistik x stamina x taktik x posisi. Dihitung sekali per set.
function siapkan(id, tim, now, tk) {
  const mu = tk ? pengaliTaktik(tk) : {}, slot = tk ? FORMASI[tk.formasi]?.slot : null;
  return { id, n: 0, t: tim.map((p, i) => {
    const f = faktorStamina(staminaSekarang(p, now)), o = { p, mental: p.mental ?? 50 };
    for (const st of URUTAN_STAT) o[st] = p[st] * f * (mu[st] || 1) * faktorPosisi(p, i, slot, st);
    return o;
  }) };
}
const lawanId = id => id === 'A' ? 'B' : 'A';
const argmax = (arr, f) => arr.reduce((b, _, i) => f(arr[i]) > f(arr[b]) ? i : b, 0);

// Satu reli penuh: servis -> terima -> umpan -> smash vs blok/dig -> (balik menyerang) sampai poin.
// Mengembalikan { menang: 'A'|'B', jenis, ti, pi, qi }: ti/pi = tim & indeks pemain yang menentukan poin
// (pencetak; untuk 'salah' pembuat kesalahan), qi = indeks pemain lawan yang terlibat (penerima/pemblok/penyerang).
function reli(S, R, tek, acak) {
  const m = o => tek ? 1 + (o.mental - 50) / 400 : 1;   // saat poin ketat, mental menaikkan/menurunkan performa
  const kand = [3, 4, 5].filter(i => K.reli.liberoServis || S.t[i].p.posisi !== 'L'), si = kand.length ? kand[S.n++ % kand.length] : 3 + (S.n++ % 3), sv = S.t[si];   // libero tidak melayani (K.reli.liberoServis)
  const ri = argmax(R.t, o => o.receive * (R.t.indexOf(o) >= 3 ? 1 : .8)), rc = R.t[ri];
  const rcv = rc.receive * m(rc), srv = sv.servis * m(sv);
  const err = K.reli.servisSalah - (srv - 50) * .0004;
  if (acak() < err) return { menang: R.id, jenis: 'salah', ti: S.id, pi: si, qi: ri };
  if (acak() < Math.max(.01, Math.min(.2, K.reli.ace + (srv - rcv) * .002))) return { menang: S.id, jenis: 'ace', ti: S.id, pi: si, qi: ri };
  let X = R, Y = S, kualitas = (rcv + Math.max(...R.t.map(o => o.umpan))) / 2 / 100, pen = ri;   // kualitas umpan 0..1
  for (let k = 0; k < K.reli.maksPertukaran; k++) {
    const depanX = X.t.slice(0, 3), depanY = Y.t.slice(0, 3);
    const w = depanX.map(o => Math.max(1, o.smash)), tot = w.reduce((a, b) => a + b, 0);
    let r = acak() * tot, ai = 0; while (ai < 2 && r > w[ai]) { r -= w[ai]; ai++; }
    const at = depanX[ai], smash = at.smash * m(at) * (.85 + .3 * kualitas);
    const bl = [...depanY].map((o, i) => [o.blok * m(o), i]).sort((p, q) => q[0] - p[0]), blok = (bl[0][0] + bl[1][0]) / 2;
    const di = argmax(Y.t, o => o.receive * (Y.t.indexOf(o) >= 3 ? 1 : .6)), dg = Y.t[di], dig = dg.receive * m(dg);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const pBlok = clamp(K.reli.blok + (blok - smash) * .0022, .03, .3);
    const pSalah = clamp(K.reli.serangSalah - (smash - 50) * .0005 + (.5 - kualitas) * .08, .02, .2);
    const pSmash = clamp(K.reli.smash + (smash - (blok * .4 + dig * .6)) * .0033, .12, .62);
    const u = acak();
    if (u < pBlok) return { menang: Y.id, jenis: 'blok', ti: Y.id, pi: bl[0][1], qi: ai };
    if (u < pBlok + pSalah) return { menang: Y.id, jenis: 'salah', ti: X.id, pi: ai, qi: di };
    if (u < pBlok + pSalah + pSmash) return { menang: X.id, jenis: 'smash', ti: X.id, pi: ai, qi: di };
    // bola diselamatkan: lawan membalas serangan, kualitas umpan lebih rendah (di luar sistem)
    kualitas = ((dig + Math.max(...Y.t.map(o => o.umpan))) / 2 / 100) * K.reli.balasan;
    [X, Y] = [Y, X];
  }
  const kuatX = X.t.reduce((a, o) => a + o.smash, 0), kuatY = Y.t.reduce((a, o) => a + o.receive + o.blok, 0) / 2;   // reli sangat panjang: kekuatan yang menentukan
  const menang = acak() < .5 + (kuatX - kuatY) * .0005 ? X : Y;
  return { menang: menang.id, jenis: 'smash', ti: menang.id, pi: 0, qi: 0 };
}

// Mainkan satu set. Mengubah stamina semua pemain di lapangan. Mengembalikan daftar reli untuk animasi.
export function mainkanSet(m, acak, now) {
  const terakhir = m.setKe === 2 * K.set.menang - 1;
  const target = terakhir ? K.set.poinTerakhir : K.set.poin;
  const A = timSaya(m), B = m.lawan, TA = siapkan('A', A, now, m.taktik), TB = siapkan('B', B, now);
  let a = 0, b = 0, pelayan = acak() < .5 ? 'A' : 'B'; const rally = [];
  for (;;) {
    const tek = Math.max(a, b) >= target - 5 && Math.abs(a - b) <= 3;
    const r = reli(pelayan === 'A' ? TA : TB, pelayan === 'A' ? TB : TA, tek, acak);
    const saya = r.menang === 'A'; saya ? a++ : b++; pelayan = r.menang;   // pemenang reli melayani berikutnya
    rally.push({ a: saya, jenis: r.jenis, ti: r.ti, pi: r.pi, qi: r.qi });
    if ((a >= target || b >= target) && Math.abs(a - b) >= K.set.selisih) break;
    if (rally.length > 300) { if (a === b) a++; break; }
  }
  [...A, ...B].forEach(p => kurangiStamina(p, biayaSet(p, a + b), now));
  a > b ? m.setSaya++ : m.setLawan++;
  m.riwayat.push({ a, b }); m.setKe++;
  if (m.setSaya === K.set.menang || m.setLawan === K.set.menang) { m.selesai = true; m.pemenang = m.setSaya > m.setLawan ? 'saya' : 'lawan'; }
  return { rally, a, b, menangSaya: a > b };
}
