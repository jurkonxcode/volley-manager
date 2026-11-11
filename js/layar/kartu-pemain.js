// Kartu profil lengkap pemain, tampil sebagai lembar di atas layar.
import { potret, radar, chipStat, ikon, esc } from './gambar.js';
import { rarity } from './rarity.js';
import { NEGARA } from '../data/negara.js';
import { biayaPerpanjang, perpanjang } from '../sistem/klub.js';
import { K } from '../inti/konfigurasi.js';
import { ratingPemain, gajiPemain, nilaiPasar } from '../sistem/pemain.js';
import { staminaSekarang, zonaStamina } from '../sistem/stamina.js';

const rp = n => n.toLocaleString('id-ID');
const sel = (label, nilai) => `<div class="sel"><span>${label}</span><b>${nilai}</b></div>`;

export function bukaKartu(p, now, S, aksi) {
  const own = !!S && S.skuad.includes(p), sisa = p.kM && S ? p.kM - S.musim.ke : null;
  const kontrak = p.kM ? `<section class="kontrak"><div><small>Kontrak</small><b>Musim ${p.kM}${sisa === null ? '' : sisa <= 0 ? ' · habis musim ini' : ` · ${sisa} musim lagi`}</b></div>${own && sisa <= 1 ? `<button class="tombol-besar" data-perpanjang>Perpanjang +2 musim · ${biayaPerpanjang(p)} koin</button>` : ''}</section>` : '';
  const s = staminaSekarang(p, now), r = ratingPemain(p), rr = rarity(p);
  const el = document.createElement('div');
  el.className = 'modal';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.innerHTML = `<article class="kartu-lengkap r-${rr.kode}" style="--w:${K.warnaPosisi[p.posisi]}">
<button class="tutup" data-tutup aria-label="Tutup">${ikon('silang', 20)}</button>
<div class="kl-rar"><b>${rr.kode}</b><span>${'★'.repeat(rr.bintang)}${'☆'.repeat(5 - rr.bintang)}</span></div>
<header class="kl-kepala">${potret(p)}<div><div class="kl-nama">${esc(p.nama)}</div><div class="sub"><i class="lencana">${p.posisi}</i><span>#${p.nomor} · ${p.umur} tahun</span></div><div class="kl-sifat">${esc(p.sifat)}</div></div><div class="rating-besar">${r}</div></header>
${radar(p)}
${chipStat(p)}
<section class="data-diri">
${sel('Tinggi', p.tinggi + ' cm')}${sel('Berat', p.berat + ' kg')}${sel('Asal', (NEGARA[p.neg]?.bendera || '') + ' ' + esc(p.asal))}${sel('Kontrak s.d.', p.kM ? 'Musim ' + p.kM : p.kontrakSampai)}${sel('Gaji', rp(gajiPemain(p)) + ' / minggu')}${sel('Nilai pasar', rp(nilaiPasar(p)) + ' koin')}
</section>
${kontrak}
<section class="kl-batang">
<div class="baris-info">${ikon('jam', 20)}<div class="batang zona-${zonaStamina(s)}"><i style="width:${s.toFixed(0)}%"></i></div><b>${Math.round(s)}%</b></div>
<div class="baris-info">${ikon('jantung', 20)}<div class="batang tahan"><i style="width:${p.tahan}%"></i></div><b>${p.tahan}</b></div>
<div class="baris-info">${ikon('bintang', 20)}<div class="batang potensi"><i style="width:${p.potensi}%"></i></div><b>${p.potensi}</b></div>
</section>
</article>`;
  el.onclick = e => { if (e.target.closest('[data-perpanjang]')) { const er = perpanjang(S, p); if (er) return alert(er); aksi?.simpan(); aksi?.perbaruiKoin(); el.remove(); return bukaKartu(p, now, S, aksi); } if (e.target === el || e.target.closest('[data-tutup]')) el.remove(); };
  document.body.appendChild(el);
}
