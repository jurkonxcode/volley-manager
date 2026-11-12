// Uji logika murni (tanpa browser):  node tes/logika.mjs
// Memeriksa: keseimbangan mesin laga, segitiga gaya, momentum/time-out, form, cedera, latihan, harga, liga AI, satu musim penuh, save lama.
import { buatAcak } from '../js/inti/acak.js';
import { K } from '../js/inti/konfigurasi.js';
import { buatLawan } from '../js/sistem/liga.js';
import { buatSkuadAwal, buatPemain, ratingPemain } from '../js/sistem/pemain.js';
import { buatManajer } from '../js/sistem/manajer.js';
import * as P from '../js/sistem/pertandingan.js';
import { penangkal, faktorCounter, gayaDasar } from '../js/sistem/taktik-lawan.js';
import { buatMusim, kejar, akhiriMusim, tabel } from '../js/sistem/musim.js';
import { simulasiLagaAI } from '../js/sistem/liga-ai.js';
import { lengkapiKlub, pastikanKontrak } from '../js/sistem/klub.js';
import { peluangLatih, hargaBeli, cederaLaga, FASILITAS } from '../js/sistem/pasar.js';
import { buatCedera, peluangCedera, faktorForm, bebanSekarang, tambahBeban } from '../js/sistem/performa.js';
import { autoSusun } from '../js/sistem/taktik.js';
import { lengkapiPersahabatan } from '../js/sistem/persahabatan.js';

const NOW = 1e12; let gagal = 0;
const cek = (nama, ok, info = '') => { console.log((ok ? 'PASS' : 'FAIL') + '  ' + nama + (info ? '  [' + info + ']' : '')); if (!ok) gagal++; };
const pulih = (...t) => t.flat().forEach(p => { p.stamina = 100; p.staminaTs = NOW; });
function laga({ tA = 44, tB = 44, gs = 'seimbang', gl, seed = 1, opsi = {} }) {
  const a = buatAcak(1000 + seed), { skuad, susunan } = buatSkuadAwal(buatAcak(5 + seed), NOW, tA), lawan = buatLawan(tB, buatAcak(77 + seed), NOW);
  const m = P.buatPertandingan(skuad, susunan, lawan, 1, { formasi: '5-1', gaya: gs }, { tingkatLawan: tB, ...opsi });
  if (gl) { m.taktikLawan = { formasi: '5-1', gaya: gl }; m.tanpaAdaptasi = true; }
  const sets = [];
  while (!m.selesai) { sets.push(P.mainkanSet(m, a, NOW)); pulih(skuad, lawan); }
  return { m, sets, skuad, lawan };
}
const winrate = (n, f) => { let w = 0; for (let k = 0; k < n; k++) if (laga(f(k)).m.pemenang === 'saya') w++; return w / n; };

// 1. Determinisme
{ const x = laga({ seed: 7 }).m.riwayat, y = laga({ seed: 7 }).m.riwayat; cek('Determinisme: seed sama => skor sama', JSON.stringify(x) === JSON.stringify(y)); }

// 2. Keseimbangan mesin (gaya seimbang vs lawan adaptif)
{ const w = [0, 3, 6, 10].map(d => winrate(400, k => ({ tA: 44 + d, seed: k })));
  cek('Gaya seimbang pasif melawan lawan adaptif: 42-56% (sedikit dirugikan karena lawan membaca gaya)', w[0] > .42 && w[0] < .56, w[0].toFixed(2));
  // Manajer jeli: awal laga memakai penangkal gaya dasar (laporan scouting), dan membalas tiap kali lawan mengumumkan peralihan gaya.
  const cerdas = (() => { let w = 0, n = 500; for (let k = 0; k < n; k++) {
    const a = buatAcak(1000 + k), { skuad, susunan } = buatSkuadAwal(buatAcak(5 + k), NOW, 44), lawan = buatLawan(44, buatAcak(77 + k), NOW);
    const m = P.buatPertandingan(skuad, susunan, lawan, 1, { formasi: '5-1', gaya: penangkal(gayaDasar(lawan)) }, { tingkatLawan: 44 });
    while (!m.selesai) { const r = P.mainkanSet(m, a, NOW); if (r.catatan) m.taktik.gaya = penangkal(m.taktikLawan.gaya); pulih(skuad, lawan); }
    if (m.pemenang === 'saya') w++; } return w / n; })();
  cek('Manajer jeli (scouting + membalas peralihan lawan) menang >= 53%', cerdas >= .53, cerdas.toFixed(2));
  cek('Lebih kuat => lebih sering menang (monoton)', w[0] < w[1] && w[1] < w[2] && w[2] < w[3], w.map(x => x.toFixed(2)).join(' < '));
  cek('+10 kekuatan tetap sangat unggul tapi bukan mutlak (90-99%)', w[3] > .9 && w[3] < .995, w[3].toFixed(3)); }

// 3. Segitiga gaya
{ const G = ['serang', 'seimbang', 'bertahan'];
  cek('penangkal(): bertahan>serang, serang>seimbang, seimbang>bertahan', penangkal('serang') === 'bertahan' && penangkal('seimbang') === 'serang' && penangkal('bertahan') === 'seimbang');
  cek('faktorCounter simetris', G.every(a => G.every(b => Math.abs(faktorCounter(a, b) * faktorCounter(b, a) - (a === b || (faktorCounter(a, b) === 1) ? 1 : 1 - K.lanjut.counter ** 2)) < 1e-9)));
  const n = 500, wr = (s, l) => winrate(n, k => ({ gs: s, gl: l, seed: k }));
  const menang = wr('bertahan', 'serang'), kalah = wr('serang', 'bertahan'), netral = wr('seimbang', 'seimbang');
  cek('Gaya penangkal menang jelas (>54%)', menang > .54, menang.toFixed(2));
  cek('Gaya yang ditangkal kalah jelas (<46%)', kalah < .46, kalah.toFixed(2));
  cek('Gaya sama => ~50%', netral > .45 && netral < .55, netral.toFixed(2)); }

// 4. Momentum & time-out
{ let totalTO = 0, maksTO = 0, valid = true, runMaks = 0;
  for (let k = 0; k < 150; k++) { const { sets } = laga({ seed: k }); sets.forEach(s => {
    const per = { A: 0, B: 0 }; s.rally.forEach(r => { if (r.to) { per[r.to]++; totalTO++; if (r.to !== 'A' && r.to !== 'B') valid = false; } }); maksTO = Math.max(maksTO, per.A, per.B);
    let run = 0, last = null; s.rally.forEach(r => { const w = r.a ? 'A' : 'B'; run = w === last ? run + 1 : 1; last = w; runMaks = Math.max(runMaks, run); });
  }); }
  cek('Time-out terjadi', totalTO > 20, 'total ' + totalTO);
  cek('Time-out maks ' + K.lanjut.momentum.timeoutMaks + ' per tim per set', maksTO <= K.lanjut.momentum.timeoutMaks, 'maks ' + maksTO);
  cek('Kode tim time-out valid', valid);
  cek('Set tetap berakhir sah (skor 25+ selisih 2)', (() => { const { sets } = laga({ seed: 3 }); return sets.every((s, i) => { const t = i === 4 ? 15 : 25; return Math.max(s.a, s.b) >= t && Math.abs(s.a - s.b) >= 2; }); })()); }

// 5. Form pemain
{ const { m, skuad } = laga({ tA: 52, tB: 44, seed: 11 });
  cek('Form dalam batas -10..10', skuad.every(p => Math.abs(p.form || 0) <= K.lanjut.form.maks));
  cek('Form berubah setelah laga', skuad.some(p => (p.form || 0) !== 0));
  const dm = laga({ tA: 52, tB: 44, seed: 11 }).skuad, rata = dm.filter(p => p.form).reduce((a, p) => a + p.form, 0) / Math.max(1, dm.filter(p => p.form).length);
  cek('Form rata-rata positif setelah menang telak', rata > 0, rata.toFixed(2));
  const p0 = skuad[0]; p0.form = 10; const f10 = faktorForm(p0); p0.form = -10; cek('Form +-10 => +-2% statistik', Math.abs(f10 - 1.02) < 1e-9 && Math.abs(faktorForm(p0) - .98) < 1e-9); }

// 6. Cedera berjenjang & beban kerja
{ const a = buatAcak(5), jum = { Ringan: 0, Sedang: 0, Berat: 0 }; let n = 6000, lamaRingan = 0, lamaBerat = 0, cR = 0, cB = 0;
  for (let k = 0; k < n; k++) { const p = buatPemain(a, 'OH', 45, NOW); p.tahan = 50; const j = buatCedera(p, a, NOW, 0); jum[j]++; const mnt = (p.cedera - NOW) / 6e4; if (j === 'Ringan') { lamaRingan += mnt; cR++; } if (j === 'Berat') { lamaBerat += mnt; cB++; } }
  cek('Distribusi cedera ~60/30/10%', Math.abs(jum.Ringan / n - .6) < .04 && Math.abs(jum.Sedang / n - .3) < .04 && Math.abs(jum.Berat / n - .1) < .03, `${(jum.Ringan / n).toFixed(2)}/${(jum.Sedang / n).toFixed(2)}/${(jum.Berat / n).toFixed(2)}`);
  cek('Cedera berat jauh lebih lama dari ringan', lamaBerat / cB > 4 * lamaRingan / cR, `${(lamaRingan / cR).toFixed(0)}m vs ${(lamaBerat / cB).toFixed(0)}m`);
  const lemah = buatPemain(a, 'OH', 45, NOW), kuat = buatPemain(a, 'OH', 45, NOW); lemah.tahan = 15; kuat.tahan = 95; let bl = 0, bk = 0;
  for (let k = 0; k < 4000; k++) { if (buatCedera(lemah, a, NOW) === 'Berat') bl++; if (buatCedera(kuat, a, NOW) === 'Berat') bk++; }
  cek('Daya tahan rendah => lebih sering cedera berat', bl > bk * 1.5, `${bl} vs ${bk}`);
  const p = buatPemain(a, 'OH', 45, NOW); const dasar = peluangCedera(p, 100, NOW); p.beban = 90; p.bebanTs = NOW; const lelah = peluangCedera(p, 100, NOW); p.cederaN = 3; const rawan = peluangCedera(p, 100, NOW);
  cek('Beban tinggi dan riwayat cedera menaikkan risiko', dasar < lelah && lelah < rawan, `${dasar.toFixed(3)} < ${lelah.toFixed(3)} < ${rawan.toFixed(3)}`);
  const q = buatPemain(a, 'OH', 45, NOW); tambahBeban(q, NOW, 4); const b0 = bebanSekarang(q, NOW), b1 = bebanSekarang(q, NOW + 60 * 6e4);
  cek('Beban naik tiap set dan pulih seiring waktu', b0 > 15 && b1 < b0, `${b0.toFixed(0)} -> ${b1.toFixed(0)}`); }

// 7. Latihan & harga
{ const a = buatAcak(2), muda = buatPemain(a, 'OH', 45, NOW), tua = buatPemain(a, 'OH', 45, NOW); muda.umur = 19; tua.umur = 33; muda.potensi = tua.potensi = 90; muda.sifat = tua.sifat = 'Tenang';
  cek('Pemain muda lebih cepat berkembang dari veteran', peluangLatih(muda, 0) > peluangLatih(tua, 0), `${peluangLatih(muda, 0).toFixed(2)} vs ${peluangLatih(tua, 0).toFixed(2)}`);
  const puncak = { ...muda, potensi: 10 }; cek('Rating di atas potensi sulit naik', peluangLatih(puncak, 0) < peluangLatih(muda, 0) / 2);
  const rj = { ...muda, sifat: 'Pekerja Keras' }; cek('Pekerja Keras berlatih lebih efektif', peluangLatih(rj, 0) > peluangLatih(muda, 0));
  cek('Fasilitas latihan menaikkan peluang', peluangLatih(muda, 5) > peluangLatih(muda, 0));
  const m2 = { ...muda, umur: 19, potensi: 90 }, v2 = { ...muda, umur: 33, potensi: ratingPemain(muda) };
  cek('Harga: muda berpotensi > veteran dengan rating sama', hargaBeli(m2) > hargaBeli(v2), `${hargaBeli(m2)} vs ${hargaBeli(v2)}`); }

// 8. Liga AI dengan mesin penuh
{ const N = 500, w = d => { let k = 0; for (let i = 0; i < N; i++) { const [x, y] = simulasiLagaAI(44 + d, 44, 900 + i * 13 + d); if (x > y) k++; } return k / N; };
  const a = w(-8), b = w(0), c = w(8);
  cek('Liga AI: tingkat lebih tinggi menang lebih sering', a < b && b < c, [a, b, c].map(x => x.toFixed(2)).join(' < '));
  cek('Liga AI: tuan rumah sedikit diuntungkan', b > .5 && b < .62, b.toFixed(2));
  cek('Liga AI deterministik', JSON.stringify(simulasiLagaAI(40, 46, 5)) === JSON.stringify(simulasiLagaAI(40, 46, 5))); }

// 9. Satu musim penuh dengan state lengkap + beberapa musim + serialisasi
function buatState(seed = 1) {
  const a = buatAcak(seed), { skuad, susunan } = buatSkuadAwal(a, NOW, K.skuadAwal.tingkat, 'ID'), man = buatManajer(NOW); man.tim = 'Uji FC';
  const S = { versi: 2, koin: 5000, token: 3, skuad, susunan, dibuat: NOW, manajer: man, pengaturan: {}, taktik: { formasi: '5-1', gaya: 'seimbang' }, negara: 'ID',
    fasilitas: { latihan: 0, medis: 0, stadion: 0, bangun: null }, musim: buatMusim(1, 'Uji FC', NOW) };
  Object.keys(FASILITAS).forEach(k => { S.fasilitas[k] ??= 0; }); S.latihan = null; S.pasar = null; S.musim.liga = 0; S.musim.neg = 'ID'; lengkapiKlub(S); pastikanKontrak(S); lengkapiPersahabatan(S);
  return S;
}
{ const S = buatState(); let t = NOW + 1000, ok = true, err = '';
  try {
    for (let musim = 0; musim < 4; musim++) {
      t += S.musim.jadwal.length * K.musim.menitAntarPekan * 6e4 + 6e4;
      const n = kejar(S, t); if (S.musim.hari < S.musim.jadwal.length) { S.musim.hari = S.musim.jadwal.length; }
      const tb = tabel(S.musim), total = tb.reduce((q, x) => q + x.poin, 0);
      if (musim === 0) cek('Musim penuh: 14 pekan dimainkan otomatis', n >= 12, 'n=' + n);
      if (musim === 0) cek('Tabel konsisten (semua tim 14 laga)', tb.every(x => x.m === 14), tb.map(x => x.m).join(','));
      if (musim === 0) cek('Tabel: ada selisih kekuatan antar tim (juara > juru kunci)', tb[0].poin > tb[7].poin, `${tb[0].poin} vs ${tb[7].poin}`);
      const r = akhiriMusim(S, t);
      if (musim === 0) cek('Riwayat musim lebih kaya (juara, podium, rekor)', S.riwayat[0].juara && S.riwayat[0].podium.length === 3 && S.riwayat[0].mn + S.riwayat[0].k === 14, JSON.stringify(S.riwayat[0]).slice(0, 110));
      S.skuad.forEach(p => { p.cedera = 0; });
    }
  } catch (e) { ok = false; err = e.stack.split('\n').slice(0, 3).join(' | '); }
  cek('4 musim berturut-turut tanpa galat', ok, err);
  let json = ''; try { json = JSON.stringify(S); } catch (e) { json = ''; } cek('State dapat diserialisasi (tanpa referensi melingkar)', json.length > 1000, json.length + ' byte');
  cek('Field baru pemain bernilai angka sah', S.skuad.every(p => Number.isFinite(p.form ?? 0) && Number.isFinite(p.beban ?? 0))); }

// 10. Save lama (tanpa field baru) tetap jalan
{ const S = buatState(3); S.skuad.forEach(p => { delete p.form; delete p.beban; delete p.bebanTs; delete p.cederaN; delete p.cederaJenis; });
  let ok = true; try { const ids = autoSusun(S, NOW); const r = cederaLaga(S, buatAcak(1), NOW, ids); const m = P.buatPertandingan(S.skuad, ids, buatLawan(40, buatAcak(1), NOW), 1, S.taktik); while (!m.selesai) P.mainkanSet(m, buatAcak(2), NOW); } catch (e) { ok = false; console.log(e.stack); }
  cek('Save lama tanpa field baru dimuat dan dimainkan', ok); }

// 11. Rotasi: pemain berbeban tinggi dikesampingkan bila ada pengganti sepadan
{ const S = buatState(4), idsAwal = autoSusun(S, NOW), bintang = S.skuad.find(p => p.id === idsAwal[0]);
  S.skuad.forEach(p => { p.stamina = 100; p.staminaTs = NOW; }); bintang.beban = 100; bintang.bebanTs = NOW;
  const ids = autoSusun(S, NOW); const pengganti = S.skuad.find(p => p.posisi === bintang.posisi && p.id !== bintang.id);
  const selisih = ratingPemain(bintang) - ratingPemain(pengganti);
  cek('Rotasi: pemain berbeban 100 dikesampingkan bila selisih rating kecil', selisih > 10 || !ids.includes(bintang.id), 'selisih rating ' + selisih); }

console.log(gagal ? `\n${gagal} UJI GAGAL` : '\nSemua uji lulus'); process.exit(gagal ? 1 : 0);
