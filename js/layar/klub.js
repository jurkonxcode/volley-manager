// Beranda klub dan layar liga (klasemen + jadwal).
import { ikon, esc, logoTim, LOGO } from './gambar.js';
import { sekarang, durasiPendek } from '../inti/waktu.js';
import { levelDari } from '../sistem/manajer.js';
import { setSub } from './tim.js';
import { tabel, fixtureSaya, kickoff, LIGA } from '../sistem/musim.js';
import { CAPAI, gajiMingguan } from '../sistem/klub.js';
import { logoMini } from './gambar.js';
import { setSubLiga } from './kompetisi.js';

function hasilSaya(M) {
  return M.hasil.filter(r => r.i === 0 || r.j === 0).map(r => { const k = r.i === 0, sa = k ? r.s1 : r.s2, sb = k ? r.s2 : r.s1; return { sa, sb, lw: M.tim[k ? r.j : r.i].nama, menang: sa > sb }; });
}
let idxPesan = 0;
const lg = n => logoMini(n);
function ekoBar(E) {
  if (!E.length) return '<small class="redup">Belum ada data. Mainkan laga pertama.</small>';
  const mx = Math.max(...E.map(e => Math.max(e.masuk, e.keluar)), 1), w = 300 / 8;
  return `<svg class="db-eko" viewBox="0 0 300 70" role="img" aria-label="Pemasukan dan gaji per pekan">${E.map((e, n) => `<rect x="${n * w + 3}" y="${35 - e.masuk / mx * 32}" width="${w / 2 - 4}" height="${e.masuk / mx * 32}" fill="var(--baik)"/><rect x="${n * w + w / 2 - 1}" y="35" width="${w / 2 - 4}" height="${e.keluar / mx * 32}" fill="var(--kritis)"/>`).join('')}<line x1="0" x2="300" y1="35" y2="35" stroke="rgba(255,255,255,.2)"/></svg>`;
}
export function renderBeranda(root, S, aksi) {
  const M = S.musim, now = sekarang(), t = tabel(M), pos = t.findIndex(x => x.i === 0) + 1, f = fixtureSaya(M), K = S.klub, inbox = K.inbox;
  const hs = M.hasil.filter(r => r.i === 0 || r.j === 0).slice(-1)[0];
  let last = '<div class="db-kosong">Belum ada laga</div>';
  if (hs) { const k = hs.i === 0, sa = k ? hs.s1 : hs.s2, sb = k ? hs.s2 : hs.s1, lw = M.tim[k ? hs.j : hs.i].nama;
    last = `<div class="db-vs">${lg(S.manajer.tim)}<b class="${sa > sb ? 'm' : 'k'}">${sa} : ${sb}</b>${lg(lw)}</div><span class="db-nm">${esc(lw)}</span><small>Pekan ${hs.h + 1}</small>`; }
  let next = `<button class="tombol-besar" data-ke="liga">${ikon('trofi', 26)}</button>`;
  if (f) { const buka = kickoff(M, f.hari), lw = M.tim[f.lawan].nama;
    next = `<div class="db-vs">${lg(S.manajer.tim)}<b>VS</b>${lg(lw)}</div><span class="db-nm">${esc(lw)}</span><button class="tombol-besar" data-ke="tanding">${now >= buka ? ikon('main', 24) + ' Main' : ikon('jam', 22) + ' ' + durasiPendek(buka - now)}</button>`; }
  const klas = t.map((x, n) => `<div class="db-k ${x.i === 0 ? 'saya' : ''}"><i>${n + 1}</i>${lg(M.tim[x.i].nama)}<span>${esc(M.tim[x.i].nama)}</span><b>${x.poin}</b></div>`).join('');
  const msg = inbox[Math.min(idxPesan, inbox.length - 1)] || { judul: '-', isi: '' };
  const sp = K.sponsor, ok = pos <= sp.target, E = K.ekonomi, last8 = E[E.length - 1], net = last8 ? last8.masuk - last8.keluar : 0;
  const n = CAPAI.filter(([nm]) => K.capai[nm]).length;
  root.innerHTML = `<section class="kartu-klub"><div class="km-kepala"><div class="km-avatar logo">${logoTim()}</div><div class="km-id"><div class="km-nama">${esc(S.manajer.tim)}</div><div class="km-tim">${LIGA[M.liga || 0]} · Musim ${M.ke}</div></div><div class="km-level"><small>PERINGKAT</small><b>${pos}</b></div></div></section>
<div class="db-dua"><section class="db-kartu"><h3>Laga terakhir</h3>${last}</section><section class="db-kartu"><h3>Laga berikutnya</h3>${next}</section></div>
<section class="pengaturan"><h2>Klasemen</h2><div class="db-klas">${klas}</div></section>
<section class="pengaturan"><h2>Pesan staf</h2><div class="db-pesan"><b>${esc(msg.judul)}</b><p>${esc(msg.isi)}</p><div class="db-nav"><button data-p="-1" aria-label="Sebelumnya">${ikon('kembali', 18)}</button><span>${Math.min(idxPesan, inbox.length - 1) + 1} / ${inbox.length}</span><button data-p="1" aria-label="Berikutnya" class="maju">${ikon('kembali', 18)}</button></div></div></section>
<section class="pengaturan"><h2>Ekonomi mingguan</h2><div class="db-ek3"><div><small>Gaji pemain</small><b class="k">${gajiMingguan(S)}</b></div><div><small>Sponsor</small><b class="m">${sp.bayar}</b></div><div><small>Pekan lalu</small><b class="${net >= 0 ? 'm' : 'k'}">${net >= 0 ? '+' : ''}${net}</b></div></div>${ekoBar(E)}</section>
<section class="pengaturan"><h2>Evolusi tim</h2><div class="db-evo"><div>${ikon('trofi', 20)}<span>Target sponsor: peringkat ${sp.target}<small>${esc(sp.nama)} · bonus ${sp.bonus}</small></span><b class="${ok ? 'm' : 'k'}">${ok ? 'Aman' : 'Belum'}</b></div><div>${ikon('skuad', 20)}<span>Fans</span><b>${K.fans.toLocaleString('id-ID')}</b></div><div>${ikon('bintang', 20)}<span>Musim selesai</span><b>${S.riwayat.length}</b></div></div>
<details class="db-capai"><summary><span>Pencapaian</span><b>${n} / ${CAPAI.length}</b></summary><div>${CAPAI.map(([nm]) => `<i class="${K.capai[nm] ? 'on' : ''}">${nm}</i>`).join('')}</div></details></section>`;
  root.querySelectorAll('[data-ke]').forEach(b => b.onclick = () => aksi.pindah(b.dataset.ke));
  root.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { idxPesan = Math.max(0, Math.min(inbox.length - 1, idxPesan + +b.dataset.p)); renderBeranda(root, S, aksi); });
}
