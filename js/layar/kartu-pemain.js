// Kartu profil lengkap pemain, tampil sebagai lembar di atas layar.
import { figur, radar, chipStat, ikon, esc } from './gambar.js';
import { K } from '../inti/konfigurasi.js';
import { ratingPemain, gajiPemain, nilaiPasar } from '../sistem/pemain.js';
import { staminaSekarang, zonaStamina } from '../sistem/stamina.js';

const rp = n => n.toLocaleString('id-ID');
const sel = (label, nilai) => `<div class="sel"><span>${label}</span><b>${nilai}</b></div>`;

export function bukaKartu(p, now) {
  const s = staminaSekarang(p, now), r = ratingPemain(p);
  const el = document.createElement('div');
  el.className = 'modal';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.innerHTML = `<article class="kartu-lengkap" style="--w:${K.warnaPosisi[p.posisi]}">
<button class="tutup" data-tutup aria-label="Tutup">${ikon('silang', 20)}</button>
<header class="kl-kepala">${figur(p, 'A', now)}<div><div class="kl-nama">${esc(p.nama)}</div><div class="sub"><i class="lencana">${p.posisi}</i><span>#${p.nomor} · ${p.umur} tahun</span></div><div class="kl-sifat">${esc(p.sifat)}</div></div><div class="rating-besar">${r}</div></header>
${radar(p)}
${chipStat(p)}
<section class="data-diri">
${sel('Tinggi', p.tinggi + ' cm')}${sel('Berat', p.berat + ' kg')}${sel('Asal', esc(p.asal))}${sel('Kontrak s.d.', p.kontrakSampai)}${sel('Gaji', rp(gajiPemain(p)) + ' / minggu')}${sel('Nilai pasar', rp(nilaiPasar(p)) + ' koin')}
</section>
<section class="kl-batang">
<div class="baris-info">${ikon('jam', 20)}<div class="batang zona-${zonaStamina(s)}"><i style="width:${s.toFixed(0)}%"></i></div><b>${Math.round(s)}%</b></div>
<div class="baris-info">${ikon('jantung', 20)}<div class="batang tahan"><i style="width:${p.tahan}%"></i></div><b>${p.tahan}</b></div>
<div class="baris-info">${ikon('bintang', 20)}<div class="batang potensi"><i style="width:${p.potensi}%"></i></div><b>${p.potensi}</b></div>
</section>
</article>`;
  el.onclick = e => { if (e.target === el || e.target.closest('[data-tutup]')) el.remove(); };
  document.body.appendChild(el);
}
