// Logika murni: tidak menyentuh tampilan.
import { K } from '../inti/konfigurasi.js';
import { pengaliTaktik, FORMASI } from './taktik.js';
import { URUTAN_STAT } from '../inti/konfigurasi.js';
import { staminaSekarang, faktorStamina, kurangiStamina, biayaSet } from './stamina.js';
import { buatAcak } from '../inti/acak.js';
import { faktorCounter, pilihTaktikLawan, adaptasiLawan } from './taktik-lawan.js';
import { modSifat, kebalTekanan, bonusPemimpin, faktorForm, perbaruiForm, catatPerf, masukReli, tambahBeban } from './performa.js';
const jepit = (n, a, b) => Math.max(a, Math.min(b, n));

export function kekuatanTim(tim, now, tk) {
  const mu = tk ? pengaliTaktik(tk) : {};
  const slot = tk ? FORMASI[tk.formasi]?.slot : null;
  const eff = (p, st, i) => p[st] * faktorStamina(staminaSekarang(p, now)) * faktorForm(p) * (mu[st] || 1) * faktorPosisi(p, i, slot, st);
  const rata = st => tim.reduce((a, p, i) => a + eff(p, st, i), 0) / tim.length;
  const umpan = Math.max(...tim.map((p, i) => eff(p, 'umpan', i)));
  return 0.30 * rata('smash') + 0.15 * rata('servis') + 0.20 * rata('blok') + 0.20 * rata('receive') + 0.15 * umpan;
}
const hashStr = s => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
// opsi: { tingkatLawan, kandang: 'A' | 'B' | null, seed, tanpaForm, taktikLawan, tanpaAdaptasi }. Lawan memilih taktik di awal laga (bisa menangkal gaya manajer) dan beradaptasi tiap set.
export function buatPertandingan(skuad, susunan, lawan, level, taktik, opsi = {}) {
  const tingkat = opsi.tingkatLawan ?? 30 + level * 6, acak = buatAcak(opsi.seed ?? hashStr(lawan.map(p => p.nama + p.smash + p.blok + p.receive).join()));   // seed dari profil pemain (bukan id): taktik lawan stabil walau id dibuat ulang
  return { taktik, skuad, susunan, lawan, level, setSaya: 0, setLawan: 0, setKe: 1, riwayat: [], selesai: false, pemenang: null,
    taktikLawan: opsi.taktikLawan ?? pilihTaktikLawan(lawan, taktik, tingkat, acak), tingkatLawan: tingkat, kandang: opsi.kandang ?? null, perf: {}, tanpaForm: !!opsi.tanpaForm, tanpaAdaptasi: !!opsi.tanpaAdaptasi, catatan: null };
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
// pengali = faktor luar (penangkal gaya lawan, bonus kandang). Setiap pemain menyimpan sifat dan rujukan ke tim (untuk momentum).
function siapkan(id, tim, now, tk, pengali = 1) {
  const mu = tk ? pengaliTaktik(tk) : {}, slot = tk ? FORMASI[tk.formasi]?.slot : null, pem = bonusPemimpin(tim);
  const T = { id, n: 0, mom: 1, run: 0, toSisa: 0, toPakai: 0, tertinggal: false, t: [] };
  T.t = tim.map((p, i) => {
    const f = faktorStamina(staminaSekarang(p, now)) * faktorForm(p) * pengali * pem, o = { p, mental: p.mental ?? 50, sifat: p.sifat, tm: T };
    for (const st of URUTAN_STAT) o[st] = p[st] * f * (mu[st] || 1) * faktorPosisi(p, i, slot, st);
    return o;
  });
  return T;
}
const lawanId = id => id === 'A' ? 'B' : 'A';
const argmax = (arr, f) => arr.reduce((b, _, i) => f(arr[i]) > f(arr[b]) ? i : b, 0);

// Satu reli penuh: servis -> terima -> umpan -> smash vs blok/dig -> (balik menyerang) sampai poin.
// Mengembalikan { menang: 'A'|'B', jenis, ti, pi, qi }: ti/pi = tim & indeks pemain yang menentukan poin
// (pencetak; untuk 'salah' pembuat kesalahan), qi = indeks pemain lawan yang terlibat (penerima/pemblok/penyerang).
function reli(S, R, tek, acak) {
  // Saat poin ketat mental menaikkan/menurunkan performa (sifat Tenang kebal efek negatif; Pejuang/Pemalu/Pemberani punya efek sendiri).
  // Momentum (run poin beruntun) dan efek time-out berlaku kapan saja.
  const m = o => (tek ? (1 + (kebalTekanan(o.sifat) ? Math.max(0, o.mental - 50) : o.mental - 50) / 400) * modSifat(o.sifat, tek, o.tm.tertinggal) : 1) * o.tm.mom;
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

// Momentum: tim yang sedang run >= K.lanjut.momentum.mulai poin beruntun tampil sedikit lebih baik; time-out memutus run lawan.
function setMomentum(T, runLen, pencetak) {
  const M = K.lanjut.momentum;
  const run = pencetak && runLen >= M.mulai ? 1 + Math.min(M.maks, M.langkah * (runLen - M.mulai + 1)) : 1;
  T.mom = run * (T.toSisa > 0 ? 1 + M.timeoutBonus : 1);
}

// Mainkan satu set. Mengubah stamina semua pemain di lapangan. Mengembalikan daftar reli untuk animasi.
// Reli yang memicu time-out membawa `to: 'A' | 'B'` (tim yang meminta time-out setelah reli itu).
export function mainkanSet(m, acak, now) {
  const terakhir = m.setKe === 2 * K.set.menang - 1, M = K.lanjut.momentum;
  const target = terakhir ? K.set.poinTerakhir : K.set.poin;
  m.perf ??= {}; m.catatan = null;
  const A = timSaya(m), B = m.lawan, bonusK = s => m.kandang === s ? 1 + K.lanjut.kandang : 1;
  const cgA = m.taktik && m.taktikLawan ? faktorCounter(m.taktik.gaya, m.taktikLawan.gaya) : 1, cgB = m.taktik && m.taktikLawan ? faktorCounter(m.taktikLawan.gaya, m.taktik.gaya) : 1;
  const TA = siapkan('A', A, now, m.taktik, cgA * bonusK('A')), TB = siapkan('B', B, now, m.taktikLawan, cgB * bonusK('B')), tim = { A: TA, B: TB };
  let a = 0, b = 0, pelayan = acak() < .5 ? 'A' : 'B', run = 0, terakhirMenang = null; const rally = [];
  for (;;) {
    const tek = Math.max(a, b) >= target - 5 && Math.abs(a - b) <= 3;
    TA.tertinggal = a < b; TB.tertinggal = b < a;
    const r = reli(pelayan === 'A' ? TA : TB, pelayan === 'A' ? TB : TA, tek, acak);
    const saya = r.menang === 'A'; saya ? a++ : b++; pelayan = r.menang;   // pemenang reli melayani berikutnya
    const item = { a: saya, jenis: r.jenis, ti: r.ti, pi: r.pi, qi: r.qi };
    // Catatan kontribusi pemain saya (untuk form): semua pemain di lapangan dihitung ikut reli, pelaku mendapat poin/kesalahan.
    A.forEach(p => masukReli(m.perf, p.id));
    if (r.ti === 'A' && A[r.pi]) catatPerf(m.perf, A[r.pi].id, r.jenis, true);
    rally.push(item);
    const selesaiSet = (a >= target || b >= target) && Math.abs(a - b) >= K.set.selisih;
    // Momentum dan time-out
    run = terakhirMenang === r.menang ? run + 1 : 1; terakhirMenang = r.menang;
    TA.toSisa = Math.max(0, TA.toSisa - 1); TB.toSisa = Math.max(0, TB.toSisa - 1);
    if (!selesaiSet && run >= M.timeoutRun) {
      const T = tim[lawanId(r.menang)];   // tim yang kehilangan run meminta time-out (maks M.timeoutMaks per set, tidak selalu)
      if (T.toPakai < M.timeoutMaks && acak() < .75) { T.toPakai++; T.toSisa = 3; run = 0; item.to = T.id; }
    }
    setMomentum(TA, run, r.menang === 'A'); setMomentum(TB, run, r.menang === 'B');
    if (selesaiSet) break;
    if (rally.length > 300) { if (a === b) a++; break; }
  }
  [...A, ...B].forEach(p => kurangiStamina(p, biayaSet(p, a + b) * (m.faktorBiaya ?? 1), now));
  A.forEach(p => tambahBeban(p, now));
  a > b ? m.setSaya++ : m.setLawan++;
  m.riwayat.push({ a, b }); m.setKe++;
  if (m.setSaya === K.set.menang || m.setLawan === K.set.menang) {
    m.selesai = true; m.pemenang = m.setSaya > m.setLawan ? 'saya' : 'lawan';
    if (!m.tanpaForm) perbaruiForm(m.skuad, m.perf, m.pemenang === 'saya');
  } else adaptasiLawan(m, acak, a < b);   // lawan membaca gaya manajer di jeda antar-set
  return { rally, a, b, menangSaya: a > b, catatan: m.catatan };
}
