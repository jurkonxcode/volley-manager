// Beranda klub dan layar liga (klasemen + jadwal).
import { ikon, esc } from './gambar.js';
import { sekarang, durasiPendek } from '../inti/waktu.js';
import { tabel, fixtureSaya, kickoff, akhiriMusim } from '../sistem/musim.js';

function hasilSaya(M) {
  return M.hasil.filter(r => r.i === 0 || r.j === 0).map(r => { const k = r.i === 0, sa = k ? r.s1 : r.s2, sb = k ? r.s2 : r.s1; return { sa, sb, lw: M.tim[k ? r.j : r.i].nama, menang: sa > sb }; });
}
export function renderBeranda(root, S, aksi) {
  const M = S.musim, now = sekarang(), t = tabel(M), pos = t.findIndex(x => x.i === 0) + 1, me = t[pos - 1], f = fixtureSaya(M);
  const riwayat = hasilSaya(M).slice(-5).reverse();
  let kartu;
  if (!f) kartu = `<button class="tombol-besar" data-ke="liga">${ikon('trofi', 30)}</button>`;
  else { const buka = kickoff(M, f.hari);
    kartu = `<div class="laga-depan"><small>Pekan ${f.hari + 1} / ${M.jadwal.length}</small><div class="vs"><b>${esc(S.manajer.tim)}</b><span>vs</span><b>${esc(M.tim[f.lawan].nama)}</b></div><button class="tombol-besar" data-ke="tanding">${now >= buka ? ikon('main', 30) : ikon('jam', 26) + ' ' + durasiPendek(buka - now)}</button></div>`; }
  root.innerHTML = `<section class="kartu-klub"><div class="km-kepala"><div class="km-avatar">${esc((S.manajer.tim[0] || 'T').toUpperCase())}</div><div class="km-id"><div class="km-nama">${esc(S.manajer.tim)}</div><div class="km-tim">Musim ${M.ke}</div></div><div class="km-level"><small>PERINGKAT</small><b>${pos}</b></div></div>
<div class="km-statistik"><div><b>${me.m}</b><span>Main</span></div><div><b class="m">${me.mn}</b><span>Menang</span></div><div><b class="k">${me.k}</b><span>Kalah</span></div><div><b>${me.poin}</b><span>Poin</span></div></div></section>
${kartu}
<section class="pengaturan"><h2>Hasil terakhir</h2><div class="riwayat">${riwayat.map(r => `<span class="hc ${r.menang ? 'm' : 'k'}">${r.sa}-${r.sb}<small>${esc(r.lw)}</small></span>`).join('') || '<small>Belum ada laga</small>'}</div></section>`;
  root.querySelectorAll('[data-ke]').forEach(b => b.onclick = () => aksi.pindah(b.dataset.ke));
}
export function renderLiga(root, S, aksi) {
  const M = S.musim, t = tabel(M), selesai = M.hari >= M.jadwal.length, pekan = Math.max(0, M.hari - 1);
  const baris = t.map((x, n) => `<tr class="${x.i === 0 ? 'saya' : ''}"><td>${n + 1}</td><td class="tn">${esc(M.tim[x.i].nama)}</td><td>${x.m}</td><td>${x.mn}</td><td>${x.k}</td><td>${x.sm - x.sk}</td><td><b>${x.poin}</b></td></tr>`).join('');
  const jadwal = M.jadwal[pekan].map(([i, j]) => { const r = M.hasil.find(r => r.h === pekan && r.i === i); return `<div class="jd ${i === 0 || j === 0 ? 'saya' : ''}"><span>${esc(M.tim[i].nama)}</span><b>${r ? r.s1 + ' - ' + r.s2 : '-'}</b><span>${esc(M.tim[j].nama)}</span></div>`; }).join('');
  root.innerHTML = `<section class="pengaturan"><table class="tabel"><thead><tr><th>#</th><th class="tn">Tim</th><th>M</th><th>Mn</th><th>K</th><th>Sel</th><th>Poin</th></tr></thead><tbody>${baris}</tbody></table></section>
<section class="pengaturan"><h2>Pekan ${pekan + 1}</h2>${jadwal}</section>${selesai ? `<button class="tombol-besar" id="baru">${ikon('trofi', 30)}</button>` : ''}`;
  const b = root.querySelector('#baru');
  if (b) b.onclick = () => { const r = akhiriMusim(S, sekarang()); aksi.simpan(); aksi.perbaruiKoin(); alert(`Peringkat ${r.rank}. Hadiah ${r.koin} koin. Musim baru dimulai!`); renderLiga(root, S, aksi); };
}
