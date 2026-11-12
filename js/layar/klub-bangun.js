// Tab Klub: Stadion (kapasitas + harga tiket), Fasilitas, Akademi, Kas (keuangan), Identitas.
import { ikon, esc, figur, logoTim } from './gambar.js';
import { sekarang, durasiPendek } from '../inti/waktu.js';
import { K } from '../inti/konfigurasi.js';
import { ratingPemain } from '../sistem/pemain.js';
import * as P from '../sistem/pasar.js';
import { kapasitas, pemasukanLaga, idxTiket } from '../sistem/stadion.js';
import { segarkanAkademi, angkat } from '../sistem/akademi.js';
import { catatKas, gajiMingguan } from '../sistem/klub.js';
import { htmlLambang, pasangLambang } from './buat-klub.js';
import { NEGARA } from '../data/negara.js';
import { singkat } from '../sistem/identitas.js';

let sub = 'stadion', pesan = '', ticker = 0;
export const setSubKlub = s => { sub = s; };
export const getSubKlub = () => sub;
const SUB = { stadion: 'Stadion', fasilitas: 'Fasilitas', akademi: 'Akademi', kas: 'Kas', identitas: 'Klub' };
const koin = n => `${ikon('koin', 14)} ${n}`, token = n => `${ikon('permata', 14)} ${n}`;
const dots = (lv, maks) => `<div class="titik-set fas-dot">${Array.from({ length: maks }, (_, i) => `<i class="${i < lv ? 'isi' : ''}"></i>`).join('')}</div>`;

// Ilustrasi stadion dari atas: makin tinggi level, makin banyak lapis tribun.
function gambarStadion(S) {
  const lv = S.fasilitas.stadion || 0, A = S.identitas.warnaA, B = S.identitas.warnaB, W = 320, H = 190, pw = 120, ph = 62, cx = W / 2, cy = H / 2;
  const p = pemasukanLaga(S, 'liga', true), isi = Math.min(1, p.hadir / Math.max(1, p.kap));
  const luar = 8 + lv * 7, ow = pw + luar * 2, oh = ph + luar * 2;
  const cincin = Array.from({ length: lv + 1 }, (_, i) => { const k = lv - i, g = 8 + k * 7, w = pw + g * 2, h = ph + g * 2; return `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${16 + k * 3}" fill="${k % 2 ? B : A}" opacity="${.6 + .4 * (1 - k / (lv + 1))}" stroke="rgba(0,0,0,.4)"/>`; }).join('');
  const lampu = lv >= 3 ? [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => { const x = cx + a * (ow / 2 + 6), y = cy + b * (oh / 2 + 2); return `<circle cx="${x}" cy="${y}" r="9" fill="#FFE9A8" opacity=".22"/><circle cx="${x}" cy="${y}" r="3.5" fill="#FFF3C4"/>`; }).join('') : '';
  return `<svg class="st-gambar" viewBox="0 0 ${W} ${H}" role="img" aria-label="Stadion level ${lv}, keterisian ${Math.round(isi * 100)} persen"><defs><radialGradient id="stbg" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#143A9A"/><stop offset="1" stop-color="#06143F"/></radialGradient><pattern id="stk" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.5" fill="#fff"/></pattern><mask id="stm"><rect x="${cx - ow / 2}" y="${cy - oh / 2}" width="${ow}" height="${oh}" rx="${16 + lv * 3}" fill="#fff"/><rect x="${cx - pw / 2 - 4}" y="${cy - ph / 2 - 4}" width="${pw + 8}" height="${ph + 8}" fill="#000"/></mask></defs><rect width="${W}" height="${H}" rx="14" fill="url(#stbg)"/>${cincin}<rect x="${cx - ow / 2}" y="${cy - oh / 2}" width="${ow}" height="${oh}" fill="url(#stk)" opacity="${(.12 + .55 * isi).toFixed(2)}" mask="url(#stm)"/><rect x="${cx - pw / 2}" y="${cy - ph / 2}" width="${pw}" height="${ph}" rx="4" fill="#E58A3A" stroke="#F6F2E8" stroke-width="2"/><path d="M${cx} ${cy - ph / 2}V${cy + ph / 2}M${cx - pw / 6} ${cy - ph / 2}V${cy + ph / 2}M${cx + pw / 6} ${cy - ph / 2}V${cy + ph / 2}" stroke="#F6F2E8" stroke-width="1.5" fill="none"/>${lampu}</svg>`;
}
function tiketBaris(S, jenis, judul) {
  const i = idxTiket(S, jenis), p = pemasukanLaga(S, jenis, true, i);
  const petunjuk = p.penuh ? '<span class="m">Stadion penuh: coba naikkan harga</span>' : p.hadir < p.kap * .6 ? '<span class="k">Banyak kursi kosong: coba turunkan harga</span>' : '<span>Hampir penuh</span>';
  return `<div class="tk-blok"><div class="tk-judul"><b>${judul}</b><em>${p.hadir.toLocaleString('id-ID')} / ${p.kap.toLocaleString('id-ID')} hadir · ${koin(p.tiket)}</em></div>
<div class="taktik tk-chip">${K.tiket.map((t, n) => `<button class="chip-t ${i === n ? 'on' : ''}" data-tiket="${jenis}:${n}">${t.n}<small> ${t.h}</small></button>`).join('')}</div><small class="tk-info">${petunjuk}</small></div>`;
}
function stadion(S, now) {
  const lv = S.fasilitas.stadion || 0, d = P.FASILITAS.stadion;
  return `<section class="pengaturan st-kartu"><div class="st-foto"><div class="st-judul"><span class="st-lv">${ikon('stadion', 16)} Level ${lv} / ${d.maks}</span><h2>${esc(S.identitas.stadion)}</h2></div></div>
<div class="st-bawah">${gambarStadion(S)}<div class="st-info"><div><b>${kapasitas(S).toLocaleString('id-ID')}</b><small>Kapasitas</small></div><div><b>${S.klub.fans.toLocaleString('id-ID')}</b><small>Fans</small></div><div><b>${Math.round(Math.min(1, pemasukanLaga(S, 'liga', true).hadir / kapasitas(S)) * 100)}%</b><small>Keterisian laga liga</small></div><div><b>${lv}/${d.maks}</b><small>Level</small></div></div></div></section>
<section class="pengaturan"><h2>Harga tiket</h2>${tiketBaris(S, 'liga', 'Laga liga')}${tiketBaris(S, 'persahabatan', 'Persahabatan')}<small class="redup">Angka kecil = koin per 10 tiket. Harga mahal menghasilkan lebih banyak per tiket, tapi penonton berkurang. Cari harga terbaik: naikkan sampai stadion tidak lagi penuh.</small></section>
${kartuFasilitas(S, now, 'stadion')}`;
}
function kartuFasilitas(S, now, k) {
  const f = S.fasilitas, d = P.FASILITAS[k], lv = f[k] || 0, b = f.bangun, sedang = b?.kunci === k, penuh = lv >= d.maks;
  let aksi = '';
  if (sedang) aksi = `<div class="fas-bangun">${ikon('palu', 18)}<span data-sisa="${b.selesai}">${durasiPendek(b.selesai - now)}</span><button class="chip-t on" data-a="cepat">${token(P.biayaPercepat(b.selesai - now))} Percepat</button></div>`;
  else if (penuh) aksi = '<small class="m">Level maksimal</small>';
  else aksi = `<button class="chip-t on" data-a="naik:${k}">${ikon('palu', 14)} Tingkatkan ${koin(P.biayaFasilitas(k, lv))}</button><small class="redup"> ${durasiPendek(P.menitBangun(k, lv) * 60000)}</small>`;
  return `<section class="pengaturan fas"><h2>${ikon(d.ikon, 16)} ${d.nama} · level ${lv}/${d.maks}</h2><small>${d.info}</small>${dots(lv, d.maks)}<div class="fas-aksi">${aksi}</div></section>`;
}
function fasilitas(S, now) {
  const b = S.fasilitas.bangun;
  return `${b ? `<div class="komentar">Sedang dibangun: ${P.FASILITAS[b.kunci].nama} (satu pembangunan dalam satu waktu)</div>` : ''}${P.urutFasilitas.filter(k => k !== 'stadion').map(k => kartuFasilitas(S, now, k)).join('')}`;
}
function akademi(S, now) {
  const lv = S.fasilitas.akademi || 0;
  if (!lv) return `<section class="pengaturan"><h2>${ikon('skuad', 16)} Akademi Muda</h2><div class="kosong-kartu">${ikon('skuad', 40)}<p>Akademi belum dibangun. Bangun level 1 di tab Fasilitas untuk mulai mencari bakat muda yang berkembang tiap musim.</p><button class="chip-t on" data-sub="fasilitas">Ke Fasilitas</button></div></section>`;
  segarkanAkademi(S, now);
  const A = S.akademi, sisa = A.ts + K.akademi.menitSegar * 60000 - now;
  return `<section class="pengaturan"><h2>Akademi Muda · level ${lv}</h2><small>Bakat baru tiap ${K.akademi.menitSegar} menit. Yang tidak diangkat akan hilang saat daftar diperbarui. Pemain muda berkembang menuju potensi di akhir musim.</small>
${A.daftar.map(p => `<div class="pk"><span class="pk-f">${figur(p, 'A', now)}</span><div class="pk-i"><b>${esc(p.nama)}</b><small>${p.posisi} · ${p.umur} th · Potensi ${p.potensi}</small></div><b class="pk-r">${ratingPemain(p)}</b><div class="pk-a"><button class="chip-t on" data-a="angkat:${p.id}">Angkat ke skuad</button></div></div>`).join('') || '<small class="redup">Semua bakat sudah diangkat.</small>'}
<div class="fas-aksi"><small class="redup">Daftar baru dalam <span data-sisa="${A.ts + K.akademi.menitSegar * 60000}">${durasiPendek(sisa)}</span></small><button class="chip-t" data-a="cariBakat">${token(1)} Cari sekarang</button></div></section>`;
}
const KATEGORI = { tiket: 'Tiket', sponsor: 'Sponsor', hadiah: 'Hadiah', merch: 'Merchandise', parkir: 'Parkir & kafe', gaji: 'Gaji pemain', bangun: 'Pembangunan', transfer: 'Transfer', kontrak: 'Kontrak', latihan: 'Latihan' };
function kas(S) {
  const B = S.klub.buku, masuk = {}, keluar = {};
  B.forEach(x => { const t = x.j >= 0 ? masuk : keluar; t[x.k] = (t[x.k] || 0) + Math.abs(x.j); });
  const sum = o => Object.values(o).reduce((a, b) => a + b, 0), tm = sum(masuk), tk = sum(keluar), mx = Math.max(...Object.values(masuk), ...Object.values(keluar), 1);
  const bar = (o, cls) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div class="kas-b"><span>${KATEGORI[k] || k}</span><i><b class="${cls}" style="width:${(v / mx * 100).toFixed(0)}%"></b></i><em>${v.toLocaleString('id-ID')}</em></div>`).join('') || '<small class="redup">Belum ada data.</small>';
  const ek = pemasukanLaga(S, 'liga', true);
  return `<section class="pengaturan"><h2>Keuangan</h2><div class="db-ek3"><div><small>Saldo</small><b>${S.koin.toLocaleString('id-ID')}</b></div><div><small>Pemasukan</small><b class="m">${tm.toLocaleString('id-ID')}</b></div><div><small>Pengeluaran</small><b class="k">${tk.toLocaleString('id-ID')}</b></div></div><small class="redup">Dari ${B.length} catatan terakhir.</small></section>
<section class="pengaturan"><h2>Pemasukan</h2>${bar(masuk, 'm')}</section><section class="pengaturan"><h2>Pengeluaran</h2>${bar(keluar, 'k')}</section>
<section class="pengaturan"><h2>Perkiraan laga kandang liga</h2><div class="kas-baris"><span>Tiket (${ek.hadir.toLocaleString('id-ID')} penonton)</span><b>+${ek.tiket}</b></div><div class="kas-baris"><span>Parkir & kafe</span><b>+${ek.parkir}</b></div><div class="kas-baris"><span>Merchandise</span><b>+${ek.merch}</b></div><div class="kas-baris"><span>Sponsor ${esc(S.klub.sponsor.nama)}</span><b>+${S.klub.sponsor.bayar}</b></div><div class="kas-baris"><span>Gaji pemain</span><b class="k">-${gajiMingguan(S)}</b></div><div class="kas-baris tot"><span>Bersih per laga</span><b class="${ek.tiket + ek.parkir + ek.merch + S.klub.sponsor.bayar - gajiMingguan(S) >= 0 ? 'm' : 'k'}">${ek.tiket + ek.parkir + ek.merch + S.klub.sponsor.bayar - gajiMingguan(S)}</b></div></section>
<section class="pengaturan"><h2>Catatan terakhir</h2>${B.slice(-10).reverse().map(x => `<div class="kas-baris"><span>${KATEGORI[x.k] || x.k}</span><b class="${x.j >= 0 ? 'm' : 'k'}">${x.j >= 0 ? '+' : ''}${x.j}</b></div>`).join('') || '<small class="redup">Belum ada catatan.</small>'}</section>`;
}
function identitas(S) {
  const I = S.identitas, n = NEGARA[S.negara] || NEGARA.ID;
  return `<section class="pengaturan"><h2>Identitas klub</h2>
<label class="isian"><span>Nama klub</span><input id="ik" maxlength="22" value="${esc(S.manajer.tim)}" autocomplete="off"></label>
<label class="isian"><span>Singkatan</span><input id="is" maxlength="3" value="${esc(I.singkatan)}" autocomplete="off" style="text-transform:uppercase"></label>
<label class="isian"><span>Kota</span><select id="ic">${n.kota.map(c => `<option ${c === I.kota ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label>
<label class="isian"><span>Nama stadion</span><input id="ist" maxlength="26" value="${esc(I.stadion)}" autocomplete="off"></label></section>
<section class="pengaturan"><h2>Lambang & warna</h2>${htmlLambang({ ...I, singkatan: I.singkatan })}</section>`;
}
export function renderKlubBangun(root, S, aksi) {
  const now = sekarang(); P.prosesWaktu(S, now);
  const fasilitasAktif = Object.entries(S.fasilitas).filter(([k,v]) => k !== 'bangun' && v > 0).length;
  const totalFasilitas = Object.keys(P.FASILITAS).length;
  const gaji = gajiMingguan(S);
  root.innerHTML = `<div id="kb"><header class="page-head"><div><span class="eyebrow">CLUB OPERATIONS</span><h1>Manajemen Klub</h1><p>Bangun infrastruktur, kembangkan akademi, atur keuangan, dan kelola identitas klub.</p></div><span class="head-meta">${esc(S.identitas.kota)} · ${esc(S.identitas.stadion)}</span></header>
<div class="page-kpis"><div class="page-kpi"><small>Saldo tersedia</small><b>${S.koin.toLocaleString('id-ID')}</b><em>Keuangan klub</em></div><div class="page-kpi"><small>Fans</small><b>${S.klub.fans.toLocaleString('id-ID')}</b><em>Basis pendukung</em></div><div class="page-kpi"><small>Fasilitas aktif</small><b>${fasilitasAktif}/${totalFasilitas}</b><em>Telah ditingkatkan</em></div><div class="page-kpi"><small>Gaji mingguan</small><b>${gaji.toLocaleString('id-ID')}</b><em>Komitmen skuad</em></div></div>
<section class="kartu-klub"><div class="km-kepala"><div class="km-avatar logo">${logoTim()}</div><div class="km-id"><div class="km-nama">${esc(S.manajer.tim)}</div><div class="km-tim">${esc(S.identitas.stadion)} · ${esc(S.identitas.kota)}</div></div><div class="km-level"><small>SEMANGAT</small><b>${Math.round(S.klub.semangat)}</b></div></div></section>
<div class="tab-sub tab-scroll">${Object.entries(SUB).map(([k, n]) => `<button class="${sub === k ? 'on' : ''}" data-sub="${k}">${n}</button>`).join('')}</div>${pesan ? `<div class="komentar">${pesan}</div>` : ''}<div id="isi">${{ stadion, fasilitas, akademi, kas, identitas }[sub](S, now)}</div></div>`;
  pesan = ''; if (sub === 'akademi') aksi.simpan();   // daftar bakat baru ikut tersimpan
  const ulang = () => { aksi.simpan(); aksi.perbaruiKoin(); renderKlubBangun(root, S, aksi); };
  const kb = root.querySelector('#kb');   // handler hanya di dalam layar Klub (root dipakai bersama tab lain)
  kb.onclick = e => {
    const b = e.target.closest('[data-sub],[data-a],[data-tiket]'); if (!b) return;
    if (b.dataset.sub) { sub = b.dataset.sub; return renderKlubBangun(root, S, aksi); }
    if (b.dataset.tiket) { const [j, n] = b.dataset.tiket.split(':'); S.klub.tiket[j] = +n; return ulang(); }
    const [a, v] = b.dataset.a.split(':'), t = sekarang();   // eslint-disable-line
    pesan = { naik: () => P.naikkanFasilitas(S, v, t), cepat: () => P.percepatBangun(S, t), angkat: () => angkat(S, v, t), cariBakat: () => (S.token || 0) < 1 ? 'Token kurang' : (S.token--, segarkanAkademi(S, t, true), null) }[a]() || '';
    ulang();
  };
  if (sub === 'identitas') {
    const I = S.identitas, q = s => root.querySelector(s);
    q('#ik').onchange = e => { const v = e.target.value.trim(); if (v.length < 3) { e.target.value = S.manajer.tim; return; } S.manajer.tim = v; S.musim.tim[0].nama = v; I.singkatan = singkat(v); aksi.identitas(); ulang(); };
    q('#is').onchange = e => { I.singkatan = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) || singkat(S.manajer.tim); aksi.identitas(); ulang(); };
    q('#ic').onchange = e => { I.kota = e.target.value; aksi.simpan(); };
    q('#ist').onchange = e => { I.stadion = e.target.value.trim() || 'Stadion ' + I.kota; ulang(); };
    pasangLambang(root, I, () => { aksi.identitas(); ulang(); });
  }
  // Hitung mundur hidup (tanpa render ulang penuh); berhenti saat layar ditinggalkan.
  clearInterval(ticker);
  if (root.querySelector('[data-sisa]')) ticker = setInterval(() => {
    if (!root.isConnected || root.dataset.layar !== 'klub') return clearInterval(ticker);
    const t = sekarang(); let habis = false;
    root.querySelectorAll('[data-sisa]').forEach(e => { const s = +e.dataset.sisa - t; if (s <= 0) habis = true; else e.textContent = durasiPendek(s); });
    if (habis) { P.prosesWaktu(S, t); aksi.simpan(); renderKlubBangun(root, S, aksi); }
  }, 5000);
}
