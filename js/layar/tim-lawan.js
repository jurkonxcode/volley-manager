// Lembar profil tim NPC: daftar pemain lengkap, ketuk pemain untuk kartu profilnya.
import { logoMini, esc } from './gambar.js';
import { rarity } from './rarity.js';
import { bukaKartu } from './kartu-pemain.js';
import { NEGARA } from '../data/negara.js';
import { K } from '../inti/konfigurasi.js';
import { ratingPemain } from '../sistem/pemain.js';
import { skuadLawan, } from '../sistem/lawan.js';
import { LIGA } from '../sistem/musim.js';
export function bukaTimLawan(M, i, now) {
  const t = M.tim[i], daftar = skuadLawan(M, i), rata = Math.round(daftar.reduce((a, p) => a + ratingPemain(p), 0) / daftar.length);
  const el = document.createElement('div'); el.className = 'modal'; el.setAttribute('role', 'dialog');
  el.innerHTML = `<article class="kartu-lengkap tim-lawan"><button class="tutup" data-tutup aria-label="Tutup">✕</button>
<header class="tl-kepala">${logoMini(t.nama)}<div><div class="kl-nama">${esc(t.nama)}</div><small>${LIGA[M.liga || 0]} · ${NEGARA[M.neg]?.bendera || ''} ${NEGARA[M.neg]?.nama || ''}</small></div><div class="rating-besar">${rata}</div></header>
<div class="tl-daftar">${daftar.map((p, k) => { const r = rarity(p); return `<button class="tl-baris" data-k="${k}"><i class="lencana" style="--w:${K.warnaPosisi[p.posisi]}">${p.posisi}</i><span><b>${esc(p.nama)}</b><small>${NEGARA[p.neg]?.bendera || ''} #${p.nomor} · ${p.umur} th · ${p.tinggi} cm · ${esc(p.sifat)}</small></span><em class="r-${r.kode}">${r.kode}</em><strong>${ratingPemain(p)}</strong></button>`; }).join('')}</div></article>`;
  el.onclick = e => { if (e.target === el || e.target.closest('[data-tutup]')) return el.remove(); const b = e.target.closest('[data-k]'); if (b) bukaKartu(daftar[+b.dataset.k], now); };
  document.body.appendChild(el);
}
