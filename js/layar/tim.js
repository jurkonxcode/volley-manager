// Kelola Tim: kartu ringkasan + tab Skuad / Strategi / Formasi / Pasar.
import { ikon, esc } from './gambar.js';
import { renderSkuad } from './skuad.js';
import { renderPasar } from './pasar.js';
import { levelDari } from '../sistem/manajer.js';
import { ratingPemain } from '../sistem/pemain.js';
import { FORMASI, GAYA, autoSusun } from '../sistem/taktik.js';
import { K } from '../inti/konfigurasi.js';
import { sekarang } from '../inti/waktu.js';
let sub = 'skuad';
export const setSub = s => { sub = s; };
const SUB = { skuad: 'Skuad', strategi: 'Strategi', formasi: 'Formasi', pasar: 'Pasar' };
const persen = m => Object.entries(m).map(([k, v]) => `${k} ${v > 1 ? '+' : ''}${Math.round((v - 1) * 100)}%`).join(' · ') || 'Netral';
function ringkas(S) {
  const L = S.susunan.map(id => S.skuad.find(p => p.id === id)).filter(Boolean), r = f => Math.round(L.reduce((a, p) => a + f(p), 0) / (L.length || 1));
  return { atk: r(p => (p.smash * 2 + p.servis) / 3), def: r(p => (p.blok + p.receive) / 2), ovr: r(ratingPemain) };
}
const strategi = S => Object.entries(GAYA).map(([k, g]) => `<button class="opsi ${S.taktik.gaya === k ? 'on' : ''}" data-gaya="${k}"><b>${g.nama}</b><small>${persen(g.m)}</small></button>`).join('');
const formasi = S => Object.entries(FORMASI).map(([k, f]) => {
  const d = i => `<i style="--w:${K.warnaPosisi[f.slot[i]]}">${f.slot[i]}</i>`;
  return `<button class="opsi formasi ${S.taktik.formasi === k ? 'on' : ''}" data-formasi="${k}"><b>${k}</b><div class="mini"><div>${[0, 1, 2].map(d).join('')}</div><div>${[3, 4, 5].map(d).join('')}</div></div><small>${persen(f.m)}</small></button>`;
}).join('') + `<button class="tombol-besar sekunder" data-auto>${ikon('ulang', 24)} Susun otomatis</button>`;
export function renderTim(root, S, aksi) {
  const L = levelDari(S.manajer.exp), st = ringkas(S);
  root.innerHTML = `<section class="kartu-klub"><div class="km-kepala"><div class="km-avatar">${esc((S.manajer.tim[0] || 'T').toUpperCase())}</div><div class="km-id"><div class="km-nama">${esc(S.manajer.tim)}</div><div class="batang exp-batang"><i style="width:${L.persen.toFixed(0)}%"></i></div></div><div class="km-level"><small>LV</small><b>${L.level}</b></div></div>
<div class="km-statistik tiga"><div><b>${st.atk}</b><span>Attack</span></div><div><b>${st.def}</b><span>Defense</span></div><div><b>${st.ovr}</b><span>Overall</span></div></div></section>
<div class="tab-sub">${Object.entries(SUB).map(([k, n]) => `<button class="${sub === k ? 'on' : ''}" data-sub="${k}">${n}</button>`).join('')}</div><div id="isi"></div>`;
  const isi = root.querySelector('#isi');
  root.querySelector('.tab-sub').onclick = e => { const b = e.target.closest('[data-sub]'); if (b) { sub = b.dataset.sub; renderTim(root, S, aksi); } };
  if (sub === 'skuad') return renderSkuad(isi, S, aksi, { taktik: false });
  if (sub === 'pasar') return renderPasar(isi, S, aksi);
  isi.innerHTML = sub === 'strategi' ? strategi(S) : formasi(S);
  isi.onclick = e => {
    const b = e.target.closest('[data-gaya],[data-formasi],[data-auto]'); if (!b) return;
    if (b.dataset.gaya) S.taktik.gaya = b.dataset.gaya;
    if (b.dataset.formasi) S.taktik.formasi = b.dataset.formasi;
    if (!b.dataset.gaya) S.susunan = autoSusun(S, sekarang());
    aksi.simpan(); renderTim(root, S, aksi);
  };
}
