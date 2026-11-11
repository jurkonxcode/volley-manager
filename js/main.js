import { muat, simpan, hapus } from './inti/simpan.js';
import { buatAcak } from './inti/acak.js';
import { sekarang } from './inti/waktu.js';
import { K } from './inti/konfigurasi.js';
import { buatSkuadAwal, lengkapiPemain } from './sistem/pemain.js';
import { buatManajer } from './sistem/manajer.js';
import { buatMusim, kejar } from './sistem/musim.js';
import { kekuatanTim, timSaya } from './sistem/pertandingan.js';
import { renderTim } from './layar/tim.js';
import { prosesWaktu, FASILITAS } from './sistem/pasar.js';
import { bersihkanSusunan } from './sistem/taktik.js';
import { renderBeranda } from './layar/klub.js';
import { renderLiga } from './layar/kompetisi.js';
import { ikon, setIdentitasGambar } from './layar/gambar.js';
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
const aksi = {
  simpan: () => simpan(S),
  perbaruiKoin: () => { $('#koin').innerHTML = `<span class="kn">${ikon('koin', 24)}<span>${S.koin.toLocaleString('id-ID')}</span></span><span class="tkn" title="Token">${ikon('permata', 18)}<span>${S.token || 0}</span></span>`; },
  pindah: n => tampil(n),
  // Terapkan identitas klub (lambang, warna jersey 2D/3D, nama) ke seluruh tampilan, lalu simpan.
  identitas: () => {
    const I = S.identitas; setIdentitasGambar(S.manajer.tim, I);
    const lw = warnaLawan(I.warnaA); siapkanSprite({ A: I.warnaA, B: lw }); setWarna3D(I.warnaA, lw);
    $('#logo').innerHTML = `<img src="assets/logo/logo-${I.logo}.png" alt="" height="36" draggable="false">`; document.title = S.manajer.tim + ' · Volley Manager';
    simpan(S);
  },
  reset: () => { if (confirm('Mulai dari awal? Semua data klub, manajer, dan pemain akan hilang.')) { hapus(); location.reload(); } }
};

function tampil(nama) {
  lepasPilihan();
  layar.dataset.layar = nama;
  document.querySelectorAll('#nav button').forEach(b => b.setAttribute('aria-current', b.dataset.tab === nama));
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
  $('#nav').innerHTML = Object.entries(TAB).map(([k, [ik]]) => `<button data-tab="${k}" aria-label="${NAMA_TAB[k]}">${ikon(ik, 24)}<span>${NAMA_TAB[k]}</span></button>`).join('');
  $('#nav').onclick = e => { const b = e.target.closest('[data-tab]'); if (b) tampil(b.dataset.tab); };
  aksi.perbaruiKoin();
  tampil('beranda');
}
// Ada simpanan: lanjut. Tidak ada: onboarding (sekali), lalu layar Buat Klub.
const tersimpan = muat();
if (tersimpan) mulai(tersimpan);
else bukaOnboarding(() => bukaBuatKlub(d => { const baru = gameBaru(d); simpan(baru); mulai(baru); }));
