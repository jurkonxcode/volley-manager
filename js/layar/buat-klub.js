// Buat Klub (layar awal game baru) + bagian lambang/warna yang dipakai ulang di tab Klub > Identitas.
import { esc, ikon, logoKode } from './gambar.js';
import { NEGARA } from '../data/negara.js';
import { LOGO_PILIHAN, PALET, singkat, warnaTeks, WARNA_ASLI } from '../sistem/identitas.js';
import { K } from '../inti/konfigurasi.js';

// Jersey sederhana (SVG) untuk pratinjau warna.
export function jerseySvg(warna, singk = 'KLB', ukuran = 84) {
  return `<svg class="jersey" width="${ukuran}" height="${ukuran}" viewBox="0 0 100 100" role="img" aria-label="Jersey"><path d="M30 12l-22 14 9 17 11-6v47h44V37l11 6 9-17L70 12c-3 7-9 10-20 10S33 19 30 12z" fill="${warna}" stroke="rgba(0,0,0,.35)" stroke-width="2" stroke-linejoin="round"/><path d="M30 12c3 7 9 10 20 10s17-3 20-10" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="3"/><text x="50" y="62" text-anchor="middle" font-family="Barlow Condensed,sans-serif" font-weight="800" font-size="22" fill="${warnaTeks(warna)}">${esc(singk)}</text></svg>`;
}
const swatch = (kunci, aktif) => PALET.map(([n, h]) => `<button type="button" class="sw ${aktif.toLowerCase() === h.toLowerCase() ? 'on' : ''}" data-w="${kunci}:${h}" style="--c:${h}" aria-label="${n}"></button>`).join('');
// Bagian lambang + warna. d = { logo, warnaA, warnaB, singkatan }.
export const htmlLambang = d => `<div class="lw-pratinjau"><div class="lw-jersey">${jerseySvg(d.warnaA, d.singkatan)}<small>Kandang</small></div><div class="lw-jersey">${jerseySvg(d.warnaB, d.singkatan)}<small>Tandang</small></div></div>
<h3 class="wz-sub">Lambang</h3><div class="lw-logo">${LOGO_PILIHAN.map(k => `<button type="button" class="${d.logo === k ? 'on' : ''}" data-l="${k}" aria-label="Lambang ${k}">${logoKode(k)}</button>`).join('')}</div>
<h3 class="wz-sub">Warna kandang</h3><div class="lw-warna">${swatch('A', d.warnaA)}</div>
<h3 class="wz-sub">Warna tandang</h3><div class="lw-warna">${swatch('B', d.warnaB)}</div>`;
// Pasang klik lambang/warna; ubah() dipanggil setelah d diperbarui (pemanggil menggambar ulang).
export function pasangLambang(root, d, ubah) {
  root.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { d.logo = b.dataset.l; ubah(); });
  root.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { const [k, h] = b.dataset.w.split(':'); d['warna' + k] = h; ubah(); });
}

const LANGKAH = ['Klub', 'Lambang', 'Stadion'];
// Layar buat klub. onSelesai(d) dipanggil dengan data klub baru.
export function bukaBuatKlub(onSelesai) {
  const d = { manajer: '', klub: '', singkatan: '', singkatanManual: false, neg: 'ID', kota: NEGARA.ID.kota[0], logo: 'garuda-muda', warnaA: WARNA_ASLI, warnaB: '#F2F2F2', stadion: '', stadionManual: false };
  const el = document.createElement('div'); el.className = 'wz'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Buat klub');
  document.body.appendChild(el);
  let langkah = 0, galat = '';
  const kosong = () => !d.klub.trim() || d.klub.trim().length < 3;
  function gambar() {
    if (!d.stadionManual) d.stadion = 'Stadion ' + d.kota;
    const n = NEGARA[d.neg], titik = LANGKAH.map((t, i) => `<i class="${i === langkah ? 'on' : i < langkah ? 'ok' : ''}"><b>${i + 1}</b><span>${t}</span></i>`).join('');
    let isi = '';
    if (langkah === 0) isi = `<h2>Bangun klub impianmu</h2><p class="wz-p">Beri nama klub, pilih negara asal dan kotamu. Negara menentukan nama pemain dan lawan di liga.</p>
<label class="isian"><span>Nama manajer</span><input id="wm" maxlength="24" placeholder="Nama kamu" value="${esc(d.manajer)}" autocomplete="off"></label>
<label class="isian"><span>Nama klub</span><input id="wk" maxlength="22" placeholder="Contoh: Garuda Muda" value="${esc(d.klub)}" autocomplete="off"></label>
<label class="isian"><span>Singkatan (3 huruf)</span><input id="ws" maxlength="3" value="${esc(d.singkatan)}" autocomplete="off" style="text-transform:uppercase"></label>
<h3 class="wz-sub">Negara</h3><div class="wz-negara">${Object.entries(NEGARA).map(([k, v]) => `<button type="button" class="${d.neg === k ? 'on' : ''}" data-n="${k}"><span>${v.bendera}</span><small>${v.nama}</small></button>`).join('')}</div>
<label class="isian"><span>Kota asal</span><select id="wc">${n.kota.map(c => `<option ${c === d.kota ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label>`;
    else if (langkah === 1) isi = `<h2>Lambang & warna</h2><p class="wz-p">Lambang tampil di klasemen dan jadwal. Warna jersey ikut terpakai di lapangan 2D dan 3D.</p>${htmlLambang(d)}`;
    else isi = `<h2>Stadion & ringkasan</h2><p class="wz-p">Stadionmu mulai kecil. Perluas lewat tab Klub agar muat lebih banyak penonton.</p>
<label class="isian"><span>Nama stadion</span><input id="wst" maxlength="26" value="${esc(d.stadion)}" autocomplete="off"></label>
<div class="wz-ringkas"><div class="wz-kepala">${logoKode(d.logo)}<div><b>${esc(d.klub.trim() || 'Klub Baru')}</b><small>${esc(d.singkatan)} · ${esc(d.kota)}, ${n.bendera} ${n.nama}</small></div></div>
<div class="lw-pratinjau kecil"><div class="lw-jersey">${jerseySvg(d.warnaA, d.singkatan, 64)}</div><div class="lw-jersey">${jerseySvg(d.warnaB, d.singkatan, 64)}</div></div>
<ul><li>${ikon('skuad', 18)}<span>Skuad awal</span><b>12 pemain</b></li><li>${ikon('koin', 18)}<span>Modal awal</span><b>${K.skuadAwal.koin} koin</b></li><li>${ikon('permata', 18)}<span>Token</span><b>${K.token.awal}</b></li><li>${ikon('stadion', 18)}<span>Kapasitas stadion</span><b>${K.stadion.kapAwal} kursi</b></li><li>${ikon('trofi', 18)}<span>Liga awal</span><b>Liga Kelurahan</b></li></ul></div>`;
    el.innerHTML = `<div class="wz-kartu"><div class="wz-langkah">${titik}</div><div class="wz-isi">${isi}${galat ? `<div class="wz-galat">${galat}</div>` : ''}</div>
<div class="wz-aksi">${langkah ? `<button type="button" class="tombol-besar sekunder" id="wz-kembali">${ikon('kembali', 20)} Kembali</button>` : ''}<button type="button" class="tombol-besar" id="wz-lanjut">${langkah === 2 ? 'Mulai karier' : 'Lanjut'}</button></div></div>`;
    pasang();
  }
  function pasang() {
    const q = s => el.querySelector(s);
    if (langkah === 0) {
      q('#wm').oninput = e => { d.manajer = e.target.value; };
      q('#wk').oninput = e => { d.klub = e.target.value; galat = ''; el.querySelector('.wz-galat')?.remove(); if (!d.singkatanManual) { d.singkatan = singkat(d.klub); q('#ws').value = d.singkatan; } };
      q('#ws').oninput = e => { d.singkatan = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); d.singkatanManual = true; e.target.value = d.singkatan; };
      q('#wc').onchange = e => { d.kota = e.target.value; };
      el.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { d.neg = b.dataset.n; d.kota = NEGARA[d.neg].kota[0]; galat = ''; gambar(); });
    }
    if (langkah === 1) pasangLambang(el, d, gambar);
    if (langkah === 2) q('#wst').oninput = e => { d.stadion = e.target.value; d.stadionManual = true; };
    const kb = q('#wz-kembali'); if (kb) kb.onclick = () => { galat = ''; langkah--; gambar(); };
    q('#wz-lanjut').onclick = () => {
      galat = '';
      if (langkah === 0 && kosong()) { galat = 'Nama klub minimal 3 huruf.'; return gambar(); }
      if (langkah === 0 && d.singkatan.length < 2) d.singkatan = singkat(d.klub);
      if (langkah < 2) { langkah++; return gambar(); }
      d.manajer = d.manajer.trim() || 'Manajer Baru'; d.klub = d.klub.trim(); d.stadion = d.stadion.trim() || 'Stadion ' + d.kota; d.singkatan = (d.singkatan || singkat(d.klub)).slice(0, 3);
      el.remove(); onSelesai(d);
    };
  }
  gambar();
}
