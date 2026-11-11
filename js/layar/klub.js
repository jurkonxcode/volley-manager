// Beranda klub dan layar liga (klasemen + jadwal).
import { ikon, esc, logoTim, LOGO } from './gambar.js';
import { sekarang, durasiPendek } from '../inti/waktu.js';
import { levelDari } from '../sistem/manajer.js';
import { setSub } from './tim.js';
import { tabel, fixtureSaya, kickoff } from '../sistem/musim.js';
import { setSubLiga } from './kompetisi.js';

function hasilSaya(M) {
  return M.hasil.filter(r => r.i === 0 || r.j === 0).map(r => { const k = r.i === 0, sa = k ? r.s1 : r.s2, sb = k ? r.s2 : r.s1; return { sa, sb, lw: M.tim[k ? r.j : r.i].nama, menang: sa > sb }; });
}
function menuAtas(S) {
  const L = levelDari(S.manajer.exp);
  const baris = [['tim', 'skuad', 'Kelola Tim', 'skuad'], ['tim', 'koin', 'Transfer Pemain', 'pasar'], ['liga', 'trofi', 'Peringkat', 'klasemen'], ['liga', 'bintang', 'Analitik', 'analitik'], ['profil', 'gerigi', 'Pengaturan', '']]
    .map(([ke, ik, nama, sub]) => `<button class="menu-baris" data-ke="${ke}" ${sub ? `data-sub="${sub}"` : ''}>${ikon(ik, 22)}<span>${nama}</span>${ikon('kembali', 18)}</button>`).join('');
  return `<section class="profil-atas"><div class="km-avatar">${esc((S.manajer.nama[0] || 'M').toUpperCase())}</div><div class="pa-id"><b>${esc(S.manajer.nama)}</b><small>Level ${L.level}</small><div class="batang exp-batang"><i style="width:${L.persen.toFixed(0)}%"></i></div></div></section>
<section class="hero"><div class="hero-foto"><img src="assets/hero.png" alt="" draggable="false"></div><img class="hero-logo" src="${LOGO}" alt="" draggable="false"><div class="hero-isi"><h1>VOLLEY<br>MANAGER</h1><p>Build. Manage. Win.</p><button class="tombol-besar" data-ke="tanding">Mulai Game ${ikon('main', 22)}</button></div></section><div class="menu-daftar">${baris}</div>`;
}
export function renderBeranda(root, S, aksi) {
  const M = S.musim, now = sekarang(), t = tabel(M), pos = t.findIndex(x => x.i === 0) + 1, me = t[pos - 1], f = fixtureSaya(M);
  const riwayat = hasilSaya(M).slice(-5).reverse();
  let kartu;
  if (!f) kartu = `<button class="tombol-besar" data-ke="liga">${ikon('trofi', 30)}</button>`;
  else { const buka = kickoff(M, f.hari);
    kartu = `<div class="laga-depan"><small>Pekan ${f.hari + 1} / ${M.jadwal.length}</small><div class="vs"><b>${esc(S.manajer.tim)}</b><span>vs</span><b>${esc(M.tim[f.lawan].nama)}</b></div><button class="tombol-besar" data-ke="tanding">${now >= buka ? ikon('main', 30) : ikon('jam', 26) + ' ' + durasiPendek(buka - now)}</button></div>`; }
  root.innerHTML = `${menuAtas(S)}<section class="kartu-klub"><div class="km-kepala"><div class="km-avatar logo">${logoTim()}</div><div class="km-id"><div class="km-nama">${esc(S.manajer.tim)}</div><div class="km-tim">Musim ${M.ke}</div></div><div class="km-level"><small>PERINGKAT</small><b>${pos}</b></div></div>
<div class="km-statistik"><div><b>${me.m}</b><span>Main</span></div><div><b class="m">${me.mn}</b><span>Menang</span></div><div><b class="k">${me.k}</b><span>Kalah</span></div><div><b>${me.poin}</b><span>Poin</span></div></div></section>
${kartu}
<section class="pengaturan"><h2>Hasil terakhir</h2><div class="riwayat">${riwayat.map(r => `<span class="hc ${r.menang ? 'm' : 'k'}">${r.sa}-${r.sb}<small>${esc(r.lw)}</small></span>`).join('') || '<small>Belum ada laga</small>'}</div></section>`;
  root.querySelectorAll('[data-ke]').forEach(b => b.onclick = () => { if (b.dataset.sub) (b.dataset.ke === 'liga' ? setSubLiga : setSub)(b.dataset.sub); aksi.pindah(b.dataset.ke); });
}
