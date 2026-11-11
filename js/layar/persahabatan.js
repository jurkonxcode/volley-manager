// Kompetisi > Persahabatan: cari lawan, pilih waktu dan kandang/tandang, lihat jadwal dan hasil.
import { ikon, esc, logoMini } from './gambar.js';
import { sekarang, durasiPendek } from '../inti/waktu.js';
import { K } from '../inti/konfigurasi.js';
import { NEGARA } from '../data/negara.js';
import { kekuatanTim, timSaya } from '../sistem/pertandingan.js';
import { pemasukanLaga } from '../sistem/stadion.js';
import { segarkanTawaran, jadwalkan, batalkan, lengkapiPersahabatan } from '../sistem/persahabatan.js';
import { hadiahPertandingan } from '../sistem/ekonomi.js';

let pesan = '';
const kekSaya = S => Math.round(kekuatanTim(timSaya({ skuad: S.skuad, susunan: S.susunan }), sekarang(), S.taktik));
const SLOT = { 0: 'Sekarang', 10: '10 menit', 30: '30 menit', 60: '1 jam', 180: '3 jam' };
function tingkatKesulitan(sel) { return sel >= 4 ? ['Sulit', 'k'] : sel <= -4 ? ['Mudah', 'm'] : ['Seimbang', 'n']; }
export function bukaJadwalkan(S, cand, aksi, selesai) {
  const now = sekarang(), ks = kekSaya(S), sel = cand.tingkat - ks, [kes] = tingkatKesulitan(sel);
  let slot = K.persahabatan.slot[1], kandang = true;
  const el = document.createElement('div'); el.className = 'modal'; el.setAttribute('role', 'dialog');
  const gambar = () => {
    const inc = pemasukanLaga(S, 'persahabatan', true), hd = Math.round(hadiahPertandingan(true, cand.level) * K.persahabatan.hadiah);
    el.innerHTML = `<article class="kartu-lengkap sheet"><button class="tutup" data-tutup aria-label="Tutup">✕</button>
<header class="pf-kepala">${logoMini(cand.nama)}<div><div class="kl-nama">${esc(cand.nama)}</div><small>${NEGARA[cand.neg]?.bendera || ''} ${NEGARA[cand.neg]?.nama || ''} · Kekuatan ${cand.tingkat} (kita ${ks}) · ${kes}</small></div></header>
<h3 class="wz-sub">Kapan bertanding?</h3><div class="taktik">${K.persahabatan.slot.map(m => `<button class="chip-t ${slot === m ? 'on' : ''}" data-slot="${m}">${SLOT[m]}</button>`).join('')}</div>
<h3 class="wz-sub">Tempat</h3><div class="taktik"><button class="chip-t ${kandang ? 'on' : ''}" data-kd="1">Kandang</button><button class="chip-t ${!kandang ? 'on' : ''}" data-kd="0">Tandang</button></div>
<div class="kontrak"><div><small>Hadiah bila menang</small><b>${hd} koin${kandang ? ` + tiket ~${inc.tiket}` : ''}</b></div><small>Persahabatan tidak masuk klasemen, tapi menambah EXP, fans, dan semangat tim.${kandang ? '' : ' Laga tandang tidak menghasilkan tiket.'}</small></div>
<button class="tombol-besar" id="ok">Jadwalkan laga</button></article>`;
    el.querySelector('#ok').onclick = () => { const e = jadwalkan(S, cand, slot, kandang, sekarang()); pesan = e || `Laga vs ${cand.nama} dijadwalkan.`; aksi.simpan(); el.remove(); selesai(); };
    el.querySelectorAll('[data-slot]').forEach(b => b.onclick = () => { slot = +b.dataset.slot; gambar(); });
    el.querySelectorAll('[data-kd]').forEach(b => b.onclick = () => { kandang = b.dataset.kd === '1'; gambar(); });
  };
  el.onclick = e => { if (e.target === el || e.target.closest('[data-tutup]')) el.remove(); };
  gambar(); document.body.appendChild(el);
}
export function renderPersahabatan(root, S, aksi) {
  const now = sekarang(); lengkapiPersahabatan(S); segarkanTawaran(S, now, kekSaya(S));
  const P = S.persahabatan, ks = kekSaya(S);
  const jadwal = P.daftar.map(f => { const s = f.kickoff - now; return `<div class="pf-baris">${logoMini(f.lawan.nama)}<div class="pf-i"><b>${esc(f.lawan.nama)}</b><small>${f.kandang ? 'Kandang' : 'Tandang'} · ${NEGARA[f.lawan.neg]?.bendera || ''} kekuatan ${f.lawan.tingkat}</small></div><div class="pf-a">${s > 0 ? `<em>${durasiPendek(s)}</em>` : '<em class="siap">Siap main</em>'}<button class="chip-t" data-batal="${f.id}" aria-label="Batalkan">${ikon('silang', 14)}</button></div></div>`; }).join('');
  const tawaran = P.tawaran.daftar.map(c => { const [t, kls] = tingkatKesulitan(c.tingkat - ks); return `<button class="pf-baris bisa" data-cand="${c.id}">${logoMini(c.nama)}<div class="pf-i"><b>${esc(c.nama)}</b><small>${NEGARA[c.neg]?.bendera || ''} ${NEGARA[c.neg]?.nama || ''} · kekuatan ${c.tingkat}</small></div><div class="pf-a"><i class="kes ${kls}">${t}</i></div></button>`; }).join('') || '<small class="redup">Belum ada lawan. Coba segarkan.</small>';
  const hasil = P.selesai.slice(0, 5).map(r => `<div class="pf-baris">${logoMini(r.nama)}<div class="pf-i"><b>${esc(r.nama)}</b><small>${r.kandang ? 'Kandang' : 'Tandang'} · +${r.koin} koin</small></div><b class="hc ${r.sa > r.sb ? 'm' : 'k'}">${r.sa}-${r.sb}</b></div>`).join('');
  root.innerHTML = `${pesan ? `<div class="komentar">${pesan}</div>` : ''}<section class="pengaturan"><h2>Jadwal persahabatan · ${P.daftar.length}/${K.persahabatan.maksJadwal}</h2>${jadwal || '<small class="redup">Belum ada laga terjadwal. Pilih lawan di bawah.</small>'}${P.daftar.length ? `<button class="tombol-besar" data-ke="tanding">${ikon('main', 22)} Ke layar Laga</button>` : ''}</section>
<section class="pengaturan"><h2>Cari lawan · segar ${durasiPendek(P.tawaran.ts + K.persahabatan.menitSegar * 60000 - now)}</h2>${tawaran}<div class="fas-aksi"><small class="redup">Kekuatan tim kita: ${ks}</small><button class="chip-t" data-segar>${ikon('permata', 14)} 1 · Lawan baru</button></div></section>
${hasil ? `<section class="pengaturan"><h2>Hasil terakhir</h2>${hasil}</section>` : ''}`;
  pesan = '';
  const ulang = () => renderPersahabatan(root, S, aksi);
  root.onclick = e => {
    const b = e.target.closest('[data-cand],[data-batal],[data-segar],[data-ke]'); if (!b) return;
    if (b.dataset.ke) return aksi.pindah('tanding');
    if (b.dataset.batal) { batalkan(S, b.dataset.batal); aksi.simpan(); return ulang(); }
    if (b.dataset.segar) { if ((S.token || 0) < 1) { pesan = 'Token kurang'; return ulang(); } S.token--; segarkanTawaran(S, sekarang(), kekSaya(S), true); aksi.simpan(); aksi.perbaruiKoin(); return ulang(); }
    const c = P.tawaran.daftar.find(x => x.id === b.dataset.cand); if (c) bukaJadwalkan(S, c, aksi, ulang);
  };
}
