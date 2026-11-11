import { muat, simpan, hapus } from './inti/simpan.js';
import { buatAcak } from './inti/acak.js';
import { sekarang } from './inti/waktu.js';
import { K } from './inti/konfigurasi.js';
import { buatSkuadAwal, lengkapiPemain } from './sistem/pemain.js';
import { buatManajer } from './sistem/manajer.js';
import { buatMusim, kejar, LIGA } from './sistem/musim.js';
import { kekuatanTim, timSaya } from './sistem/pertandingan.js';
import { renderTim } from './layar/tim.js';
import { prosesWaktu, FASILITAS } from './sistem/pasar.js';
import { bersihkanSusunan } from './sistem/taktik.js';
import { renderBeranda } from './layar/klub.js';
import { renderLiga } from './layar/kompetisi.js';
import { ikon, esc, logoTim, setIdentitasGambar } from './layar/gambar.js';
import { setSub } from './layar/tim.js';
import { setSubKlub } from './layar/klub-bangun.js';
import { setSubLiga } from './layar/kompetisi.js';
import { setBagian } from './layar/pasar.js';
import { siapkanSprite } from './layar/sprite.js';
import { renderPertandingan, lepasPilihan } from './layar/pertandingan.js';
import { lengkapiKlub, pastikanKontrak } from './sistem/klub.js';
import { renderProfil } from './layar/profil.js';
import { renderKlubBangun } from './layar/klub-bangun.js';
import { bukaBuatKlub } from './layar/buat-klub.js';
import { bukaOnboarding } from './layar/onboarding.js';
import { identitasAwal, warnaLawan } from './sistem/identitas.js';
import { lengkapiPersahabatan, kejarPersahabatan } from './sistem/persahabatan.js';
import { setWarna3D } from './layar/arena3d.js';

// Game baru dibuat dari isian layar "Buat Klub" (d). Tanpa d (mis. data uji), dipakai identitas bawaan.
function gameBaru(d) {
  const now = sekarang(), acak = buatAcak(now & 0x7fffffff), neg = d?.neg || localStorage.getItem('vm-negara') || 'ID';
  const nama = d?.klub || K.manajer.timAwal, { skuad, susunan } = buatSkuadAwal(acak, now, K.skuadAwal.tingkat, neg);
  const man = buatManajer(now); if (d) { man.nama = d.manajer; man.tim = d.klub; }
  const id = d ? { singkatan: d.singkatan, kota: d.kota, logo: d.logo, warnaA: d.warnaA, warnaB: d.warnaB, stadion: d.stadion } : identitasAwal(nama, neg);
  try { localStorage.setItem('vm-negara', neg); } catch (e) {}
  return { versi: 2, koin: K.skuadAwal.koin, token: K.token.awal, skuad, susunan, dibuat: now, manajer: man, identitas: id, pengaturan: { animasiCepat: false }, taktik: { formasi: '5-1', gaya: 'seimbang' }, negara: neg, musim: buatMusim(1, nama, now, neg) };
}
// Data lama (sebelum fitur baru ditambahkan) dilengkapi otomatis, tanpa mengulang permainan.
function lengkapi(S) {
  const now = sekarang();
  S.manajer ??= buatManajer(now);
  // Migrasi identitas bawaan lama tanpa mengubah klub yang dibuat sendiri.
  if (S.manajer.tim === 'Garuda Muda') {
    S.manajer.tim = 'Volley Club';
    if (S.musim?.tim?.[0]) S.musim.tim[0].nama = 'Volley Club';
  }
  if (S.identitas?.logo === 'garuda-muda') S.identitas.logo = 'volley-manager';
  S.pengaturan ??= { animasiCepat: false };
  S.fasilitas ??= { latihan: 0, medis: 0, stadion: 0, bangun: null };
  Object.keys(FASILITAS).forEach(k => { S.fasilitas[k] ??= 0; });
  S.latihan ??= null; S.pasar ??= null;
  S.taktik ??= { formasi: '5-1', gaya: 'seimbang' };
  S.musim ??= buatMusim(1, S.manajer.tim, now);
  S.skuad.forEach(p => lengkapiPemain(p, now));
  S.musim.liga ??= 0; S.musim.neg ??= 'ID'; lengkapiKlub(S); pastikanKontrak(S); lengkapiPersahabatan(S);
  return S;
}

const $ = s => document.querySelector(s), layar = $('#layar');
let S = null;
const NAMA_TAB = { beranda: 'Beranda', tim: 'Tim', klub: 'Klub', tanding: 'Laga', liga: 'Kompetisi', profil: 'Profil' };
const TAB = { beranda: ['rumah', renderBeranda], tim: ['skuad', renderTim], klub: ['stadion', renderKlubBangun], tanding: ['jaring', renderPertandingan], liga: ['trofi', renderLiga], profil: ['orang', renderProfil] };
// Menu sidebar desktop (gaya mockup). h = tersembunyi: hanya dipakai tombol/kartu di Beranda.
const DK = [
  ['home', 'Beranda', 'rumah', 'beranda'],
  ['club', 'Klub', 'kubus', 'klub', () => setSubKlub('identitas')],
  ['squad', 'Skuad', 'skuad', 'tim', () => setSub('skuad')],
  ['tactics', 'Taktik', 'target', 'tim', () => setSub('strategi')],
  ['training', 'Latihan', 'lompat', 'tim', () => { setSub('pasar'); setBagian('latihan'); }],
  ['comp', 'Kompetisi', 'trofi', 'liga', () => setSubLiga('klasemen')],
  ['transfer', 'Transfer', 'jabat', 'tim', () => { setSub('pasar'); setBagian('transfer'); }],
  ['scout', 'Scouting', 'mata', 'tim', () => { setSub('pasar'); setBagian('transfer'); }],
  ['fin', 'Keuangan', 'koin', 'klub', () => setSubKlub('kas')],
  ['set', 'Pengaturan', 'gerigi', 'profil'],
  ['help', 'Bantuan', 'bantuan', null],
  ['fac', '', '', 'klub', () => setSubKlub('fasilitas'), 1],
  ['jadwal', '', '', 'liga', () => setSubLiga('jadwal'), 1]
];
const KUNCI = { beranda: 'home', tim: 'squad', klub: 'club', liga: 'comp', profil: 'set' };
const aksi = {
  buka: k => {
    const it = DK.find(x => x[0] === k); if (!it) return;
    if (k === 'help') return alert('Bantuan\n\n• Beranda: ringkasan klub, laga berikutnya, klasemen, dan keuangan.\n• Skuad/Taktik: atur susunan pemain, formasi, dan gaya main.\n• Latihan/Transfer: latih tim, beli, jual, dan scout pemain.\n• Kompetisi: klasemen, jadwal, dan analitik.\n• Game tersimpan otomatis di perangkat ini.');
    it[4]?.(); tampil(it[3], k);
  },
  simpan: () => simpan(S),
  perbaruiKoin: () => {
    const E = S.klub?.ekonomi || [], u = E[E.length - 1], net = u ? u.masuk - u.keluar : 0, M = S.musim;
    const set = (id, h) => { const el = $(id); if (el) el.innerHTML = h; };
    set('#dk-klub', `${logoTim()}<span><b>${esc(S.manajer.tim)}</b><small>${LIGA[M.liga || 0]}</small></span>`);
    set('#dk-tgl', `${ikon('kalender', 24)}<span><b>Musim ${M.ke}</b><small>Pekan ${Math.min(M.hari + 1, M.jadwal.length)} / ${M.jadwal.length}</small></span>`);
    set('#dk-spd', `${ikon('main', 16)}<span>${S.pengaturan.animasiCepat ? '2×' : '1×'}</span>`);
    set('#dk-bel', `${ikon('lonceng', 24)}<i>${Math.min(S.klub?.inbox?.length || 0, 9)}</i>`);
    set('#dk-avt', esc((S.manajer.nama || 'M').slice(0, 1).toUpperCase()));
    $('#koin').innerHTML = `<span class="kn">${ikon('koin', 24)}<span>${S.koin.toLocaleString('id-ID')}</span>${net ? `<em class="dl ${net >= 0 ? 'm' : 'k'}">${net >= 0 ? '▲' : '▼'} ${Math.abs(net).toLocaleString('id-ID')}</em>` : ''}</span><span class="tkn" title="Token">${ikon('permata', 18)}<span>${S.token || 0}</span></span>`; },
  pindah: n => tampil(n),
  // Terapkan identitas klub (lambang, warna jersey 2D/3D, nama) ke seluruh tampilan, lalu simpan.
  identitas: () => {
    const I = S.identitas; setIdentitasGambar(S.manajer.tim, I);
    const lw = warnaLawan(I.warnaA); siapkanSprite({ A: I.warnaA, B: lw }); setWarna3D(I.warnaA, lw);
    $('#logo').innerHTML = `<img src="assets/brand/logo-lockup.svg" alt="Volley Manager" draggable="false">`; document.title = S.manajer.tim + ' · Volley Manager';
    simpan(S);
  },
  reset: () => { if (confirm('Mulai dari awal? Semua data klub, manajer, dan pemain akan hilang.')) { hapus(); location.reload(); } }
};

function tampil(nama, kunci) {
  lepasPilihan();
  layar.dataset.layar = nama;
  document.querySelectorAll('#nav .mb').forEach(b => b.setAttribute('aria-current', b.dataset.tab === nama));
  document.querySelectorAll('#nav .dkn').forEach(b => b.setAttribute('aria-current', b.dataset.key === (kunci || KUNCI[nama])));
  if (nama !== 'tanding') {
    const t = sekarang(); prosesWaktu(S, t); bersihkanSusunan(S, t);
    const kek = kekuatanTim(timSaya({ skuad: S.skuad, susunan: S.susunan }), t, S.taktik);
    const a = kejar(S, t, kek), b = kejarPersahabatan(S, t, kek);
    if (a || b) { simpan(S); aksi.perbaruiKoin(); }
  }
  pastikanKontrak(S);
  TAB[nama][1](layar, S, aksi);
  layar.scrollTop = 0;
}
function mulai(data) {
  S = lengkapi(data);
  aksi.identitas(); siapkanSprite();
  $('#reset').innerHTML = ikon('hapus', 22);
  $('#reset').onclick = aksi.reset;
  $('#nav').innerHTML = Object.entries(TAB).map(([k, [ik]]) => `<button class="mb" data-tab="${k}" aria-label="${NAMA_TAB[k]}">${ikon(ik, 24)}<span>${NAMA_TAB[k]}</span></button>`).join('')
    + DK.filter(x => !x[5]).map(x => `<button class="dkn" data-key="${x[0]}" aria-label="${x[1]}">${ikon(x[2], 22)}<span>${x[1]}</span></button>`).join('')
    + `<div class="dk-promo">${ikon('bola', 40)}<b>Bermimpilah Besar,<br>Menang Bersama!</b></div>`;
  $('#nav').onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.key) aksi.buka(b.dataset.key); else if (b.dataset.tab) tampil(b.dataset.tab); };
  $('#dk-klub').onclick = () => aksi.buka('club');
  $('#dk-bel').onclick = () => tampil('beranda');
  $('#dk-avt').onclick = () => aksi.buka('set');
  $('#dk-spd').onclick = () => { S.pengaturan.animasiCepat = !S.pengaturan.animasiCepat; simpan(S); aksi.perbaruiKoin(); };
  aksi.perbaruiKoin();
  tampil('beranda');
}
// Ada simpanan: lanjut. Tidak ada: onboarding (sekali), lalu layar Buat Klub.
const tersimpan = muat();
if (tersimpan) mulai(tersimpan);
else bukaOnboarding(() => bukaBuatKlub(d => { const baru = gameBaru(d); simpan(baru); mulai(baru); }));
