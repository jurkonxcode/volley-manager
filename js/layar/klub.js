// Beranda klub dan layar liga (klasemen + jadwal).
import { ikon, esc, logoTim, LOGO } from './gambar.js';
import { sekarang, durasiPendek } from '../inti/waktu.js';
import { levelDari } from '../sistem/manajer.js';
import { setSub } from './tim.js';
import { tabel, fixtureSaya, kickoff, LIGA } from '../sistem/musim.js';
import { CAPAI, gajiMingguan } from '../sistem/klub.js';
import { logoMini } from './gambar.js';
import { setSubLiga } from './kompetisi.js';
import { analitik } from '../sistem/analitik.js';
function dxEko(E) {
  const D = E.slice(-5);
  if (!D.length) return '<div class="dx-kosong">Belum ada data. Mainkan laga pertama.</div>';
  let c = 0; const bal = D.map(e => (c += e.masuk - e.keluar)), inc = D.map(e => e.masuk), exp = D.map(e => e.keluar);
  const all = [...inc, ...exp, ...bal], mx = Math.max(...all, 1), mn = Math.min(0, ...all), W = 330, H = 110, x0 = 38;
  const px = i => x0 + (D.length > 1 ? i * (W - x0) / (D.length - 1) : (W - x0) / 2), py = v => 8 + (mx - v) / (mx - mn || 1) * (H - 16);
  const ln = (v, col) => `<polyline fill="none" stroke="${col}" stroke-width="2.5" stroke-linejoin="round" points="${v.map((a, i) => px(i) + ',' + py(a)).join(' ')}"/>` + v.map((a, i) => `<circle cx="${px(i)}" cy="${py(a)}" r="3" fill="${col}"/>`).join('');
  const grid = [0, .5, 1].map(f => { const v = mn + (mx - mn) * f; return `<line x1="${x0}" x2="${W}" y1="${py(v)}" y2="${py(v)}" stroke="rgba(150,190,255,.14)"/><text x="${x0 - 6}" y="${py(v) + 4}" text-anchor="end" font-size="10" fill="#8FA8E0">${Math.round(v)}</text>`; }).join('');
  const lab = D.map((e, i) => `<text x="${px(i)}" y="${H + 14}" text-anchor="middle" font-size="10" fill="#8FA8E0">P${E.length - D.length + i + 1}</text>`).join('');
  return `<div class="dx-chart"><svg viewBox="0 0 ${W + 6} ${H + 20}" role="img" aria-label="Grafik keuangan 5 pekan terakhir">${grid}${lab}${ln(inc, '#3AA0FF')}${ln(exp, '#2ECC71')}${ln(bal, '#FFC21A')}</svg><ul class="dx-leg"><li><i style="background:#3AA0FF"></i>Pemasukan</li><li><i style="background:#2ECC71"></i>Gaji</li><li><i style="background:#FFC21A"></i>Saldo</li></ul></div>`;
}


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
  const PF = S.persahabatan?.daftar || [], pfHtml = PF.length ? `<section class="pengaturan"><h2>Persahabatan terjadwal</h2>${PF.slice(0, 3).map(x => `<div class="pf-baris">${lg(x.lawan.nama)}<div class="pf-i"><b>${esc(x.lawan.nama)}</b><small>${x.kandang ? 'Kandang' : 'Tandang'}</small></div><div class="pf-a">${x.kickoff > now ? `<em>${durasiPendek(x.kickoff - now)}</em>` : '<em class="siap">Siap main</em>'}</div></div>`).join('')}<button class="tombol-besar sekunder" data-ke="tanding">${ikon('main', 20)} Ke layar Laga</button></section>` : '';
  const habis = S.skuad.filter(p => p.kM <= M.ke).length, n = CAPAI.filter(([nm]) => K.capai[nm]).length;
  const win = M.hasil.filter(r => r.i === 0 || r.j === 0).filter(r => (r.i === 0 ? r.s1 : r.s2) > (r.i === 0 ? r.s2 : r.s1)).length;
  const played = M.hasil.filter(r => r.i === 0 || r.j === 0).length;
  const A = analitik(M), L5 = A.L.slice(-5), w5 = L5.filter(x => x.menang).length, k5 = L5.length - w5;
  const sm5 = L5.reduce((a, x) => a + x.sa, 0), sk5 = L5.reduce((a, x) => a + x.sb, 0), wr = L5.length ? Math.round(w5 / L5.length * 100) : 0;
  const bar = (n, tot, c) => `<div class="dx-bar"><i class="${c}" style="width:${tot ? Math.round(n / tot * 100) : 0}%"></i></div>`;
  let nm;
  if (f) { const buka = kickoff(M, f.hari), lw = M.tim[f.lawan].nama;
    nm = `<div class="dx-vs"><div>${lg(S.manajer.tim)}<b>${esc(S.manajer.tim)}</b></div><span>VS</span><div>${lg(lw)}<b>${esc(lw)}</b></div></div><div class="dx-info"><b>${LIGA[M.liga || 0]} · Pekan ${f.hari + 1}</b><span>${f.kandang ? 'Kandang' : 'Tandang'} · ${now >= buka ? 'Siap dimainkan' : 'Mulai ' + durasiPendek(buka - now)}</span><small>${ikon('lokasi', 14)} ${esc(S.identitas.stadion)}</small></div><button class="dx-btn-emas" data-ke="tanding">Ke Pertandingan →</button>`;
  } else nm = `<div class="dx-kosong">Musim ${M.ke} sudah selesai.</div><button class="dx-btn-emas" data-ke="liga">Lihat Kompetisi →</button>`;
  const top5 = t.slice(0, 5).map((x, n) => `<div class="dx-r ${x.i === 0 ? 'saya' : ''}"><i>${n + 1}</i>${lg(M.tim[x.i].nama)}<span>${esc(M.tim[x.i].nama)}</span><b>${x.m}</b><b>${x.mn}</b><b>${x.k}</b><b class="p">${x.poin}</b></div>`).join('');
  const dx = `<section class="dx-hero"><div class="dx-hero-t"><small>Selamat datang di</small><h1>Volley Manager!</h1><p>Pimpin klubmu menuju kejayaan di dunia bola voli</p><button class="dx-btn-biru" data-ke="tanding">${ikon('main', 22)} Lanjutkan Game</button></div></section>
<div class="dx-grid">
<section class="dx-kartu dx-klub"><div class="dx-kh">${ikon('grafik', 22)}<h3>Ringkasan Klub</h3><button class="dx-link" data-dk="club">Detail →</button></div><div class="dx-klub-b"><div class="dx-crest">${logoTim()}</div><div><h2>${esc(S.manajer.tim)}</h2><em>${LIGA[M.liga || 0]}</em><ul class="dx-rows"><li>${ikon('trofi', 18)}<span>Posisi Liga</span><b>#${pos}</b></li><li>${ikon('bintang', 18)}<span>Semangat Tim</span><b>${Math.round(K.semangat)} / 100</b></li><li>${ikon('skuad', 18)}<span>Basis Penggemar</span><b>${K.fans.toLocaleString('id-ID')}</b></li><li>${ikon('koin', 18)}<span>Saldo Klub</span><b>${S.koin.toLocaleString('id-ID')}</b></li></ul></div></div><div class="dx-pita">${ikon('trofi', 16)} ${pos === 1 && M.hasil.length ? 'Pemuncak Klasemen' : 'Musim ' + M.ke}</div></section>
<section class="dx-kartu dx-next"><div class="dx-kh">${ikon('kalender', 22)}<h3>Laga Berikutnya</h3><button class="dx-link" data-dk="jadwal">Jadwal →</button></div>${nm}</section>
<section class="dx-kartu"><div class="dx-kh">${ikon('trofi', 22)}<h3>Klasemen Liga</h3><button class="dx-link" data-dk="comp">Tabel →</button></div><div class="dx-tbl"><div class="dx-r h"><i></i><i></i><span></span><b>M</b><b>W</b><b>L</b><b class="p">Poin</b></div>${top5}</div></section>
<section class="dx-kartu"><div class="dx-kh">${ikon('koin', 22)}<h3>Keuangan Klub</h3><button class="dx-link" data-dk="fin">Kas →</button></div>${dxEko(K.ekonomi)}</section>
<section class="dx-kartu"><div class="dx-kh">${ikon('grafik', 22)}<h3>Performa Tim</h3><small class="dx-sm">5 laga terakhir</small></div><div class="dx-perf"><div class="dx-pb"><div><span>Menang</span>${bar(w5, 5, 'b-m')}<b>${w5}</b></div><div><span>Kalah</span>${bar(k5, 5, 'b-k')}<b>${k5}</b></div><div><span>Set</span>${bar(sm5, sm5 + sk5, 'b-s')}<b>${sm5}</b></div></div><div class="dx-donut" style="--p:${wr}"><div><b>${wr}%</b><small>Win Rate</small></div></div></div></section>
<section class="dx-kartu"><div class="dx-kh">${ikon('target', 22)}<h3>Aksi Cepat</h3></div><div class="dx-qa"><button data-dk="squad">${ikon('skuad', 30)}<span>Kelola Skuad</span></button><button data-dk="scout">${ikon('mata', 30)}<span>Cari Pemain</span></button><button data-dk="fac">${ikon('kubus', 30)}<span>Upgrade Fasilitas</span></button><button data-dk="jadwal">${ikon('kalender', 30)}<span>Lihat Jadwal</span></button></div></section>
</div>`;
  root.innerHTML = `${dx}<div class="dx-detail">${pfHtml}<section class="pengaturan"><h2>Pesan staf</h2><div class="db-pesan"><b>${esc(msg.judul)}</b><p>${esc(msg.isi)}</p><div class="db-nav"><button data-p="-1" aria-label="Sebelumnya">${ikon('kembali', 18)}</button><span>${Math.min(idxPesan, inbox.length - 1) + 1} / ${inbox.length}</span><button data-p="1" aria-label="Berikutnya" class="maju">${ikon('kembali', 18)}</button></div></div></section>
<section class="pengaturan"><h2>Ekonomi mingguan</h2><div class="db-ek3"><div><small>Gaji pemain</small><b class="k">${gajiMingguan(S)}</b></div><div><small>Sponsor</small><b class="m">${sp.bayar}</b></div><div><small>Pekan lalu</small><b class="${net >= 0 ? 'm' : 'k'}">${net >= 0 ? '+' : ''}${net}</b></div></div>${ekoBar(E)}</section>
<section class="pengaturan"><h2>Evolusi tim</h2><div class="db-evo"><div>${ikon('trofi', 20)}<span>Target sponsor: peringkat ${sp.target}<small>${esc(sp.nama)} · bonus ${sp.bonus}</small></span><b class="${ok ? 'm' : 'k'}">${ok ? 'Aman' : 'Belum'}</b></div><div>${ikon('skuad', 20)}<span>Fans</span><b>${K.fans.toLocaleString('id-ID')}</b></div><div>${ikon('jantung', 20)}<span>Semangat tim<small>Bonus statistik ${((S.taktik.semangat - 1) * 100).toFixed(1)}%. Naik lewat kemenangan dan persahabatan</small></span><b>${Math.round(K.semangat)}</b></div><div>${ikon('permata', 20)}<span>Token<small>Dari akhir musim dan pencapaian. Percepat pembangunan di tab Klub</small></span><b>${S.token || 0}</b></div><div>${ikon('bintang', 20)}<span>Musim selesai</span><b>${S.riwayat.length}</b></div><div>${ikon('jam', 20)}<span>Kontrak habis musim ini<small>Perpanjang lewat kartu pemain</small></span><b class="${habis ? 'k' : ''}">${habis}</b></div></div>
<details class="db-capai"><summary><span>Pencapaian</span><b>${n} / ${CAPAI.length}</b></summary><div>${CAPAI.map(([nm]) => `<i class="${K.capai[nm] ? 'on' : ''}">${nm}</i>`).join('')}</div></details></section></div>`;
  root.querySelectorAll('[data-ke]').forEach(b => b.onclick = () => aksi.pindah(b.dataset.ke));
  root.querySelectorAll('[data-dk]').forEach(b => b.onclick = () => aksi.buka(b.dataset.dk));
  root.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { idxPesan = Math.max(0, Math.min(inbox.length - 1, idxPesan + +b.dataset.p)); renderBeranda(root, S, aksi); });
}
