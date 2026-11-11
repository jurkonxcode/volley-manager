import { muat, simpan, hapus } from './inti/simpan.js';
import { buatAcak } from './inti/acak.js';
import { sekarang } from './inti/waktu.js';
import { K } from './inti/konfigurasi.js';
import { buatSkuadAwal, lengkapiPemain } from './sistem/pemain.js';
import { buatManajer } from './sistem/manajer.js';
import { buatMusim, kejar } from './sistem/musim.js';
import { kekuatanTim, timSaya } from './sistem/pertandingan.js';
import { renderTim } from './layar/tim.js';
import { prosesWaktu } from './sistem/pasar.js';
import { bersihkanSusunan } from './sistem/taktik.js';
import { renderBeranda, renderLiga } from './layar/klub.js';
import { ikon } from './layar/gambar.js';
import { renderSkuad } from './layar/skuad.js';
import { renderPertandingan, lepasPilihan } from './layar/pertandingan.js';
import { renderProfil } from './layar/profil.js';

function gameBaru() {
  const now = sekarang(), acak = buatAcak(now & 0x7fffffff);
  const { skuad, susunan } = buatSkuadAwal(acak, now, K.skuadAwal.tingkat);
  return { versi: 2, koin: K.skuadAwal.koin, skuad, susunan, dibuat: now, manajer: buatManajer(now), pengaturan: { animasiCepat: false }, taktik: { formasi: '5-1', gaya: 'seimbang' }, musim: buatMusim(1, K.manajer.timAwal, now) };
}
// Data lama (sebelum profil ditambahkan) dilengkapi otomatis, tanpa mengulang permainan.
function lengkapi(S) {
  const now = sekarang();
  S.manajer ??= buatManajer(now);
  S.pengaturan ??= { animasiCepat: false };
  S.fasilitas ??= { latihan: 0, medis: 0, stadion: 0, bangun: null };
  S.latihan ??= null; S.pasar ??= null;
  S.taktik ??= { formasi: '5-1', gaya: 'seimbang' };
  S.musim ??= buatMusim(1, S.manajer.tim, now);
  S.skuad.forEach(p => lengkapiPemain(p, now));
  return S;
}
let S = lengkapi(muat() ?? gameBaru());
simpan(S);

const $ = s => document.querySelector(s), layar = $('#layar');
const aksi = {
  simpan: () => simpan(S),
  perbaruiKoin: () => { $('#koin').innerHTML = ikon('koin', 26) + '<span>' + S.koin + '</span>'; },
  pindah: n => tampil(n),
  reset: () => { if (confirm('Mulai dari awal? Semua data manajer dan pemain akan hilang.')) { hapus(); location.reload(); } }
};
const NAMA_TAB = { beranda: 'Beranda', liga: 'Kompetisi', tim: 'Tim', tanding: 'Laga', profil: 'Profil' };
const TAB = { beranda: ['rumah', renderBeranda], liga: ['trofi', renderLiga], tim: ['skuad', renderTim], tanding: ['jaring', renderPertandingan], profil: ['orang', renderProfil] };

$('#logo').innerHTML = ikon('bola', 28);
$('#reset').innerHTML = ikon('hapus', 22);
$('#reset').onclick = aksi.reset;
$('#nav').innerHTML = Object.entries(TAB).map(([k, [ik]]) => `<button data-tab="${k}" aria-label="${k}">${ikon(ik, 24)}<span>${NAMA_TAB[k]}</span></button>`).join('');
$('#nav').onclick = e => { const b = e.target.closest('[data-tab]'); if (b) tampil(b.dataset.tab); };

function tampil(nama) {
  lepasPilihan();
  layar.dataset.layar = nama;
  document.querySelectorAll('#nav button').forEach(b => b.setAttribute('aria-current', b.dataset.tab === nama));
  if (nama !== 'tanding') { const t = sekarang(); prosesWaktu(S, t); bersihkanSusunan(S, t); if (kejar(S, t, kekuatanTim(timSaya({ skuad: S.skuad, susunan: S.susunan }), t, S.taktik))) { simpan(S); aksi.perbaruiKoin(); } }
  TAB[nama][1](layar, S, aksi);
  layar.scrollTop = 0;
}
aksi.perbaruiKoin();
tampil('beranda');
