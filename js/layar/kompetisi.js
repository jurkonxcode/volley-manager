// Kompetisi: tab Klasemen / Jadwal / Analitik. Grafik dibuat dengan SVG.
import { ikon, esc, logoMini } from './gambar.js';
import { sekarang } from '../inti/waktu.js';
import { bukaTimLawan } from './tim-lawan.js';
import { tabel, akhiriMusim, LIGA } from '../sistem/musim.js';
import { analitik } from '../sistem/analitik.js';
import { renderPersahabatan } from './persahabatan.js';

let sub = 'klasemen';
export const setSubLiga = s => { sub = s; };
const SUB = { klasemen: 'Klasemen', jadwal: 'Jadwal', persahabatan: 'Persahabatan', analitik: 'Analitik' };

const formTim = (M, i) => M.hasil.filter(r => r.i === i || r.j === i).slice(-5).map(r => { const k = r.i === i, a = k ? r.s1 : r.s2, b = k ? r.s2 : r.s1; return `<i class="fd ${a > b ? 'm' : 'k'}"></i>`; }).join('');
function klasemen(M) {
  const baris = tabel(M).map((x, n) => `<tr class="${x.i === 0 ? 'saya' : 'bisa'}" data-tim="${x.i}"><td>${n + 1}</td><td class="tn">${logoMini(M.tim[x.i].nama)+esc(M.tim[x.i].nama)}</td><td>${x.m}</td><td>${x.mn}</td><td>${x.k}</td><td>${x.sm - x.sk}</td><td><b>${x.poin}</b></td><td class="fm">${formTim(M, x.i)}</td></tr>`).join('');
  return `<section class="pengaturan"><table class="tabel"><thead><tr><th>#</th><th class="tn">Tim</th><th>M</th><th>Mn</th><th>K</th><th>Sel</th><th>Poin</th><th class="fm">Form</th></tr></thead><tbody>${baris}</tbody></table></section>`;
}
function jadwal(M) {
  const A = analitik(M), pekan = Math.max(0, M.hari - 1);
  const mine = M.jadwal.map((p, h) => {
    const f = p.find(x => x.includes(0)), lw = f[0] === 0 ? f[1] : f[0], r = A.L.find(x => x.h === h);
    return `<div class="jd3 ${h === M.hari ? 'kini' : ''}"><small>P${h + 1}</small><span>${f[0] === 0 ? 'vs' : '@'} ${logoMini(M.tim[lw].nama)+esc(M.tim[lw].nama)}</span>${r ? `<b class="hc ${r.menang ? 'm' : 'k'}">${r.sa}-${r.sb}</b>` : '<b class="belum">-</b>'}</div>`;
  }).join('');
  const sem = M.jadwal[pekan].map(([i, j]) => { const r = M.hasil.find(r => r.h === pekan && r.i === i); return `<div class="jd ${i === 0 || j === 0 ? 'saya' : ''}"><span>${logoMini(M.tim[i].nama)+esc(M.tim[i].nama)}</span><b>${r ? r.s1 + ' - ' + r.s2 : '-'}</b><span>${logoMini(M.tim[j].nama)+esc(M.tim[j].nama)}</span></div>`; }).join('');
  return `<section class="pengaturan"><h2>Laga saya</h2>${mine}</section><section class="pengaturan"><h2>Semua laga pekan ${pekan + 1}</h2>${sem}</section>`;
}
// Cincin win rate
const cincin = (p, warna) => `<svg class="cincin-wr" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" pathLength="100" class="alas"/><circle cx="50" cy="50" r="40" pathLength="100" class="isi" style="stroke:${warna};stroke-dasharray:${p} ${100 - p}" transform="rotate(-90 50 50)"/><text x="50" y="56" text-anchor="middle">${p}%</text></svg>`;
// Grafik batang poin per pekan (0-3), slot tetap sebanyak pekan musim.
function grafikPoin(A, total) {
  const W = 320, H = 110, lb = 16, w = W / total, tinggi = H - lb - 14;
  const bar = A.L.map(x => { const t = x.poin / 3 * tinggi, xx = x.h * w + 3, warna = x.poin >= 3 ? 'var(--baik)' : x.poin ? 'var(--bola)' : 'var(--kritis)';
    return `<rect x="${xx}" y="${14 + tinggi - Math.max(t, 2)}" width="${w - 6}" height="${Math.max(t, 2)}" rx="3" fill="${warna}"/><text x="${xx + (w - 6) / 2}" y="${10 + tinggi - Math.max(t, 2)}" text-anchor="middle" class="gv">${x.poin}</text>`; }).join('');
  const sb = Array.from({ length: total }, (_, h) => `<text x="${h * w + w / 2}" y="${H - 3}" text-anchor="middle" class="gs">${h + 1}</text>`).join('');
  return `<svg class="grafik" viewBox="0 0 ${W} ${H}" role="img" aria-label="Poin per pekan"><line x1="0" x2="${W}" y1="${14 + tinggi}" y2="${14 + tinggi}" class="gg"/>${bar}${sb}</svg>`;
}
// Grafik garis peringkat per pekan (1 di atas).
function grafikRank(A, total, jumlahTim) {
  const W = 320, H = 120, px = 22, py = 14, w = (W - px - 8) / Math.max(total - 1, 1), h = H - py * 2 - 12;
  const X = i => px + A.L[i].h * w, Y = r => py + (r - 1) / (jumlahTim - 1) * h;
  const garis = A.rank.map((r, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(r).toFixed(1)}`).join(' ');
  const titik = A.rank.map((r, i) => `<circle cx="${X(i).toFixed(1)}" cy="${Y(r).toFixed(1)}" r="3.5" fill="${A.L[i].menang ? 'var(--baik)' : 'var(--kritis)'}"/>`).join('');
  const kisi = [1, Math.ceil(jumlahTim / 2), jumlahTim].map(r => `<line x1="${px}" x2="${W - 8}" y1="${Y(r)}" y2="${Y(r)}" class="gg"/><text x="${px - 6}" y="${Y(r) + 3}" text-anchor="end" class="gs">${r}</text>`).join('');
  const sb = A.L.map((x, i) => `<text x="${X(i).toFixed(1)}" y="${H - 2}" text-anchor="middle" class="gs">${x.h + 1}</text>`).join('');
  return `<svg class="grafik" viewBox="0 0 ${W} ${H}" role="img" aria-label="Peringkat per pekan">${kisi}<path d="${garis}" class="gl"/>${titik}${sb}</svg>`;
}
function riwayatMusim(S) {
  const R = S.riwayat.slice(-10); if (!R.length) return `<section class="pengaturan"><h2>Lintas musim</h2><small class="redup">Grafik muncul setelah musim pertama selesai.</small></section>`;
  const W = 320, H = 120, w = W / 10, h = 80, bar = R.map((r, n) => { const t = (9 - r.rank) / 8 * h, x = n * w + 5; return `<rect x="${x}" y="${16 + h - t}" width="${w - 10}" height="${t}" rx="3" fill="${r.naik ? 'var(--baik)' : r.turun ? 'var(--kritis)' : 'var(--bola)'}"/><text x="${x + (w - 10) / 2}" y="${12 + h - t}" text-anchor="middle" class="gv">${r.rank}</text><text x="${x + (w - 10) / 2}" y="${H - 4}" text-anchor="middle" class="gs">M${r.ke}</text>`; }).join('');
  return `<section class="pengaturan"><h2>Peringkat tiap musim</h2><svg class="grafik" viewBox="0 0 ${W} ${H}" role="img" aria-label="Peringkat tiap musim">${bar}</svg><div class="rw-daftar">${S.riwayat.slice().reverse().map(r => `<div><b>Musim ${r.ke}</b><span>${LIGA[r.liga]}</span><em>#${r.rank} · ${r.poin ?? '-'} poin</em><i class="${r.naik ? 'm' : r.turun ? 'k' : ''}">${r.naik ? 'Promosi' : r.turun ? 'Degradasi' : 'Bertahan'}</i></div>`).join('')}</div></section>`;
}
function analitikTab(M, S) {
  const A = analitik(M), K = S.manajer;
  if (!A.n) return `<section class="pengaturan"><small>Belum ada laga musim ini. Mainkan laga pertama untuk melihat grafik.</small></section>${riwayatMusim(S)}`;
  const st = A.streak, karier = K.main ? Math.round(K.menang / K.main * 100) : 0;
  return `<section class="pengaturan"><h2>Win rate musim ini</h2><div class="wr-baris">${cincin(A.winRate, 'var(--baik)')}<div class="wr-ket"><div><b class="m">${A.mn}</b> menang</div><div><b class="k">${A.kalah}</b> kalah</div><div class="redup">${st ? `${st.n} ${st.menang ? 'menang' : 'kalah'} beruntun` : ''}</div></div></div></section>
<section class="pengaturan"><h2>Poin per pekan</h2>${grafikPoin(A, M.jadwal.length)}</section>
<section class="pengaturan"><h2>Peringkat per pekan</h2>${grafikRank(A, M.jadwal.length, M.tim.length)}</section>
<section class="pengaturan"><h2>Statistik</h2><div class="km-statistik"><div><b>${A.setRate}%</b><span>Set menang</span></div><div><b>${A.sm}-${A.sk}</b><span>Set</span></div><div><b>${A.rataPoin}</b><span>Poin/laga</span></div><div><b>${karier}%</b><span>Karier</span></div></div></section>${riwayatMusim(S)}`;
}
export function renderLiga(root, S, aksi) {
  const M = S.musim, selesai = M.hari >= M.jadwal.length;
  const isi = sub === 'jadwal' ? jadwal(M) : sub === 'analitik' ? analitikTab(M, S) : sub === 'persahabatan' ? '<div id="pf"></div>' : klasemen(M);
  const klas = tabel(M), posisi = klas.findIndex(x => x.i === 0) + 1, main = M.hasil.length, total = M.jadwal.reduce((a, p) => a + p.length, 0);
  root.innerHTML = `<header class="page-head"><div><span class="eyebrow">LEAGUE OPERATIONS</span><h1>Kompetisi</h1><p>Pantau klasemen, kalender pertandingan, laga persahabatan, dan analitik perjalanan klub.</p></div><span class="head-meta">${LIGA[M.liga || 0]} · Musim ${M.ke}</span></header>
<div class="page-kpis"><div class="page-kpi"><small>Peringkat klub</small><b>#${posisi}</b><em>${klas.find(x => x.i === 0)?.poin || 0} poin</em></div><div class="page-kpi"><small>Pertandingan selesai</small><b>${main}</b><em>Dari ${total} pertandingan liga</em></div><div class="page-kpi"><small>Pemuncak klasemen</small><b>${esc(M.tim[klas[0]?.i || 0]?.nama || '-')}</b><em>${klas[0]?.poin || 0} poin</em></div><div class="page-kpi"><small>Jadwal tersisa</small><b>${Math.max(0, M.jadwal.length - M.hari)}</b><em>Pekan musim berjalan</em></div></div>
<div class="tab-sub tab-scroll">${Object.entries(SUB).map(([k, n]) => `<button class="${sub === k ? 'on' : ''}" data-sub="${k}">${n}</button>`).join('')}</div>${isi}${selesai && sub !== 'persahabatan' ? `<button class="tombol-besar" id="baru">${ikon('trofi', 30)} Selesaikan musim</button>` : ''}`;
  if (sub === 'persahabatan') renderPersahabatan(root.querySelector('#pf'), S, aksi);
  root.querySelector('.tab-sub').onclick = e => { const b = e.target.closest('[data-sub]'); if (b) { sub = b.dataset.sub; renderLiga(root, S, aksi); } };
  root.querySelectorAll('tr[data-tim]').forEach(r => { if (r.dataset.tim !== '0') r.onclick = () => bukaTimLawan(S.musim, +r.dataset.tim, sekarang()); });
  const b = root.querySelector('#baru');
  if (b) b.onclick = () => { const r = akhiriMusim(S, sekarang()); aksi.simpan(); aksi.perbaruiKoin(); alert(`Peringkat ${r.rank}. Hadiah ${r.koin} koin dan ${r.token} token. ${r.ket}. Musim baru dimulai!`); renderLiga(root, S, aksi); };
}
