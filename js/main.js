import { muat, simpan, hapus } from './inti/simpan.js';
import { buatAcak } from './inti/acak.js';
import { sekarang } from './inti/waktu.js';
import { K } from './inti/konfigurasi.js';
import { buatSkuadAwal } from './sistem/pemain.js';
import { ikon } from './layar/gambar.js';
import { renderSkuad } from './layar/skuad.js';
import { renderPertandingan, lepasPilihan } from './layar/pertandingan.js';

function gameBaru() {
  const now = sekarang(), acak = buatAcak(now & 0x7fffffff);
  const { skuad, susunan } = buatSkuadAwal(acak, now, K.skuadAwal.tingkat);
  return { versi: 1, koin: K.skuadAwal.koin, skuad, susunan, dibuat: now };
}
let S = muat();
if (!S) { S = gameBaru(); simpan(S); }

const $ = s => document.querySelector(s), layar = $('#layar');
const aksi = { simpan: () => simpan(S), perbaruiKoin: () => { $('#koin').innerHTML = ikon('koin', 26) + '<span>' + S.koin + '</span>'; } };
const TAB = { skuad: ['skuad', renderSkuad], tanding: ['jaring', renderPertandingan] };

$('#logo').innerHTML = ikon('bola', 28);
$('#reset').innerHTML = ikon('hapus', 22);
$('#reset').onclick = () => { if (confirm('Mulai dari awal?')) { hapus(); location.reload(); } };
$('#nav').innerHTML = Object.entries(TAB).map(([k, [ik]]) => `<button data-tab="${k}" aria-label="${k}">${ikon(ik, 28)}</button>`).join('');
$('#nav').onclick = e => { const b = e.target.closest('[data-tab]'); if (b) tampil(b.dataset.tab); };

function tampil(nama) {
  lepasPilihan();
  layar.dataset.layar = nama;
  document.querySelectorAll('#nav button').forEach(b => b.setAttribute('aria-current', b.dataset.tab === nama));
  TAB[nama][1](layar, S, aksi);
  layar.scrollTop = 0;
}
aksi.perbaruiKoin();
tampil('skuad');
