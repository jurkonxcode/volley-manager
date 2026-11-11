import { kartuMini, figur, ikon } from './gambar.js';
import { setPose } from './sprite.js';
import { pasangTukar, lepasPilihan } from './skuad.js';
import { sekarang, durasiPendek } from '../inti/waktu.js';
import { buatAcak } from '../inti/acak.js';
import { K } from '../inti/konfigurasi.js';
import { buatPertandingan, mainkanSet, timSaya, kekuatanTim } from '../sistem/pertandingan.js';
import { buatLawan } from '../sistem/liga.js';
import { bersihkanSusunan, FORMASI, GAYA, autoSusun } from '../sistem/taktik.js';
import { fixtureSaya, kickoff, catatLaga, levelLawan } from '../sistem/musim.js';
import * as D3 from './arena3d.js';

let P = baru(), token = 0, gagal3d = false;
function baru() { return { fase: 'pilih', m: null, level: 0, lawan: null, skor: { a: 0, b: 0 }, hasil: null, cepat: false }; }
const tunggu = ms => new Promise(r => setTimeout(r, ms));

export function renderPertandingan(root, S, aksi) {
  token++;
  if (P.fase === 'pilih') return tampilPilih(root, S, aksi);
  if (P.fase === 'selesai') return tampilSelesai(root, S, aksi);
  tampilLapangan(root, S, aksi);
}

function tampilPilih(root, S, aksi) {
  const M = S.musim, now = sekarang(), f = fixtureSaya(M);
  if (!f) { root.innerHTML = `<button class="tombol-besar" id="ke">${ikon('trofi', 30)}</button>`; root.querySelector('#ke').onclick = () => aksi.pindah('liga'); return; }
  const buka = kickoff(M, f.hari), lw = M.tim[f.lawan], tim = buatLawan(lw.tingkat, buatAcak(M.ke * 1000 + f.lawan * 20 + f.hari), now);
  const saya = Math.round(kekuatanTim(timSaya({ skuad: S.skuad, susunan: S.susunan }), now, S.taktik)), level = levelLawan(lw.tingkat);
  root.innerHTML = `<div class="kuat-saya">${ikon('smash', 30)}<span>${saya}</span></div><div class="lawan-kartu"><b class="nama-lawan">${lw.nama}</b><span class="deret">${tim.map(p => figur(p, 'B', now)).join('')}</span><span class="kuat">${ikon('smash', 20)}<span>${Math.round(kekuatanTim(tim, now))}</span></span></div>` +
    (now >= buka ? `<button class="tombol-besar" id="mulai" aria-label="Mulai">${ikon('main', 30)}</button>` : `<div class="kuat-saya">${ikon('jam', 26)}<span>${durasiPendek(buka - now)}</span></div>`);
  const mb = root.querySelector('#mulai');
  if (mb) mb.onclick = () => { bersihkanSusunan(S, sekarang()); P.level = level; P.m = buatPertandingan(S.skuad, S.susunan, tim, level, S.taktik); P.fase = 'siap'; P.skor = { a: 0, b: 0 }; renderPertandingan(root, S, aksi); };
}

// Pergantian di jeda antar-set: pemain di susunan yang tidak main di set terakhir. Dibatasi K.ganti.maks.
const terpakai = (m, susunan) => m.kickoff ? susunan.filter(id => !m.kickoff.includes(id)).length : 0;
const taktikBaris = (S, m, A, B, now) => `<div class="taktik" id="taktik">${Object.keys(FORMASI).map(k => `<button class="chip-t ${S.taktik.formasi === k ? 'on' : ''}" data-formasi="${k}">${k}</button>`).join('')}<span class="pemisah"></span>${Object.entries(GAYA).map(([k, g]) => `<button class="chip-t ${S.taktik.gaya === k ? 'on' : ''}" data-gaya="${k}">${g.nama}</button>`).join('')}<button class="chip-t" data-auto aria-label="Susun otomatis">${ikon('ulang', 16)}</button></div>
<div class="banding"><span class="kuat ${m.kickoff && terpakai(m, S.susunan) >= K.ganti.maks ? 'habis' : ''}">${m.kickoff ? `${ikon('ulang', 14)} ${terpakai(m, S.susunan)}/${K.ganti.maks}` : ''}</span><span>${ikon('smash', 16)} <b>${Math.round(kekuatanTim(A, now, S.taktik))}</b> <i>vs</i> <b>${Math.round(kekuatanTim(B, now))}</b></span></div>`;

function tampilLapangan(root, S, aksi) {
  P.m.susunan = S.susunan; P.m.taktik = S.taktik;   // susunan/taktik bisa diganti (mis. susun otomatis membuat array baru): selalu pakai yang terkini
  const m = P.m, now = sekarang(), A = timSaya(m), B = m.lawan, edit = P.fase === 'siap', d3 = P.fase === 'main' && !!S.pengaturan?.tiga3d && !gagal3d;
  const titik = n => Array.from({ length: K.set.menang }, (_, i) => `<i class="${i < n ? 'isi' : ''}"></i>`).join('');
  const baris = (a, tim, inter) => `<div class="baris">${a.map(p => kartuMini(p, { tim, now, zona: 'lap', interaktif: inter, badan: true })).join('')}</div>`;
  const bangku = S.skuad.filter(p => !S.susunan.includes(p.id));
  root.innerHTML = `${edit && m.setKe === 1 ? `<button class="kembali" id="kembali" aria-label="Pilih lawan lain">${ikon('kembali', 22)}</button>` : ''}
<div class="papan"><div class="sisi"><div class="titik-set">${titik(m.setSaya)}</div><b id="skA">${P.skor.a}</b></div><div class="tengah">${ikon('bola', 30)}</div><div class="sisi lawan"><div class="titik-set">${titik(m.setLawan)}</div><b id="skB">${P.skor.b}</b></div></div>
<div class="lapangan"><button class="tiga-btn ${S.pengaturan?.tiga3d && !gagal3d ? 'on' : ''}" id="tiga" aria-label="Mode 3D">${ikon('kubus', 20)}<span>3D</span></button>${d3 ? '<div class="arena3d" id="arena3d"></div>' : `<div class="arena" id="arena">
<div class="separuh">${baris(B.slice(3), 'B', false)}${baris(B.slice(0, 3), 'B', false)}</div><div class="jaring"></div>
<div class="separuh">${baris(A.slice(0, 3), 'A', edit)}${baris(A.slice(3), 'A', edit)}</div>
<div class="bayangan" id="bay" style="left:50%;top:50%"></div><div class="bola" id="bola" style="left:50%;top:50%">${ikon('bola', 22)}</div><div class="pop" id="pop"></div></div>`}</div>
<div class="komentar" id="kom">${P.kom || ''}</div>
${edit ? `${taktikBaris(S, m, A, B, now)}<div class="bangku">${bangku.map(p => kartuMini(p, { tim: 'A', now, zona: 'bangku' })).join('')}</div><button class="tombol-besar" id="main" aria-label="Main set">${ikon('main', 30)}</button>`
       : `<button class="tombol-besar sekunder" id="lompat" aria-label="Lewati animasi">${ikon('lompat', 28)}</button>`}`;
  const k = root.querySelector('#kembali'); if (k) k.onclick = () => { P = baru(); renderPertandingan(root, S, aksi); };
  const mn = root.querySelector('#main'); if (mn) mn.onclick = () => mainkan(root, S, aksi);
  const tg = root.querySelector('#tiga'); if (tg) tg.onclick = () => { S.pengaturan.tiga3d = !S.pengaturan.tiga3d; gagal3d = false; aksi.simpan(); tampilLapangan(root, S, aksi); if (P.fase === 'main' && root.querySelector('#arena3d')) mulai3D(root, S, aksi); };
  const lm = root.querySelector('#lompat'); if (lm) lm.onclick = () => { P.cepat = true; };
  if (edit) {
    const tk = root.querySelector('#taktik');
    tk.onclick = e => {
      const b = e.target.closest('[data-formasi],[data-gaya],[data-auto]'); if (!b) return;
      if (b.dataset.auto) {
        const baru = autoSusun(S, sekarang());
        if (m.kickoff && terpakai(m, baru) > K.ganti.maks) { P.kom = 'Batas pergantian tercapai'; return renderPertandingan(root, S, aksi); }
        S.susunan = baru;
      }
      if (b.dataset.formasi) S.taktik.formasi = b.dataset.formasi;
      if (b.dataset.gaya) S.taktik.gaya = b.dataset.gaya;
      aksi.simpan(); renderPertandingan(root, S, aksi);
    };
    pasangTukar(root, S, {
      izin: m.kickoff ? baru => terpakai(m, baru) <= K.ganti.maks : null,
      ditolak: () => { P.kom = 'Batas pergantian tercapai'; renderPertandingan(root, S, aksi); },
      saatUbah: () => { aksi.simpan(); renderPertandingan(root, S, aksi); }
    });
  }
}

// Siapkan tampilan 3D (muat Three.js lalu pasang pemain). Gagal => tampilan 2D otomatis.
let siap3d = false;
async function mulai3D(root, S, aksi) {
  const wadah = root.querySelector('#arena3d'); siap3d = false;
  if (!wadah) return;
  try {
    await D3.muatThree();
    if (!wadah.isConnected) return;
    D3.pasang(wadah, timSaya(P.m), P.m.lawan); siap3d = true;
  } catch (e) {
    console.warn('Mode 3D tidak tersedia, kembali ke 2D:', e);
    gagal3d = true; siap3d = false;
    if (root.dataset.layar === 'tanding' && P.fase === 'main') tampilLapangan(root, S, aksi);
    const kom = root.querySelector('#kom'); if (kom && !kom.textContent) kom.textContent = '3D tidak tersedia, memakai 2D';
  }
}
function gambarRally(root, r, a, b) {
  const skA = root.querySelector('#skA'), skB = root.querySelector('#skB'), bola = root.querySelector('#bola'), pop = root.querySelector('#pop');
  if (!skA) return;
  skA.textContent = a; skB.textContent = b;
  const A = timSaya(P.m), B = P.m.lawan, nm = (ti, i) => (ti === 'A' ? A : B)[i]?.nama.split(' ')[0] ?? '';
  const pelaku = nm(r.ti, r.pi), lawan = nm(r.ti === 'A' ? 'B' : 'A', r.qi);
  P.kom = { ace: `Ace dari ${pelaku}!`, blok: `${pelaku} blok kokoh!`, smash: `Smash keras ${pelaku}!`, salah: `${pelaku} membuat kesalahan` }[r.jenis];
  const kom = root.querySelector('#kom'); if (kom) kom.textContent = P.kom;
  const el = r.a ? skA : skB; el.classList.remove('skor-naik'); void el.offsetWidth; el.classList.add('skor-naik');
  if (!bola) { if (siap3d) D3.reli(r); return; }   // mode 3D: animasi digambar arena3d.js
  beriPose(root, r);
  const x = 10 + Math.random() * 80, y = r.a ? 6 + Math.random() * 36 : 58 + Math.random() * 36;   // bola jatuh di sisi yang kebobolan
  bola.style.left = x + '%'; bola.style.top = y + '%';
  const bay = root.querySelector('#bay'); if (bay) { bay.style.left = x + '%'; bay.style.top = y + '%'; }
  bola.classList.remove('terbang'); void bola.offsetWidth; bola.classList.add('terbang');
  pop.style.left = x + '%'; pop.style.top = y + '%';
  pop.className = 'pop ' + r.jenis; pop.innerHTML = ikon(r.jenis === 'salah' ? 'silang' : r.jenis === 'ace' ? 'servis' : r.jenis === 'blok' ? 'blok' : 'smash', 20);
  void pop.offsetWidth; pop.classList.add('muncul');
}

// Pemain yang benar-benar terlibat reli bergerak (r.ti/r.pi = pelaku, r.qi = lawan yang terlibat).
// Urutan elemen .badan di arena: lawan belakang (0-2), lawan depan (3-5), saya depan (6-8), saya belakang (9-11).
const dom = (ti, i) => ti === 'A' ? 6 + i : (i < 3 ? 3 + i : i - 3);
function beriPose(root, r) {
  const k = [...root.querySelectorAll('#arena .badan')]; if (k.length < 12) return;
  const PM = { 'a-smash': 'smash', 'a-blok': 'blok', 'a-servis': 'servis', 'a-dig': 'receive', 'a-umpan': 'umpan' };
  const pose = (i, c) => { const e = k[i]; if (!e) return; e.classList.remove(...Object.keys(PM)); void e.getBoundingClientRect(); e.classList.add(c); setPose(e, PM[c] === 'receive' && i >= 6 && Math.random() < .3 ? 'dive' : PM[c]); };
  const lw = r.ti === 'A' ? 'B' : 'A', pil = a => a[Math.floor(Math.random() * a.length)];
  if (r.jenis === 'ace') { pose(dom(r.ti, r.pi), 'a-servis'); pose(dom(lw, r.qi), 'a-dig'); }
  else if (r.jenis === 'smash') { pose(dom(r.ti, 3 + Math.floor(Math.random() * 3)), 'a-umpan'); pose(dom(r.ti, r.pi), 'a-smash'); pose(dom(lw, r.qi), 'a-dig'); }
  else if (r.jenis === 'blok') { pose(dom(r.ti, r.pi), 'a-blok'); pose(dom(lw, r.qi), 'a-smash'); }
  else if (r.pi < 3 && r.qi != null) { pose(dom(r.ti, r.pi), 'a-smash'); pose(dom(lw, r.qi), 'a-dig'); }   // serangan keluar/gagal
  else pose(dom(r.ti, r.pi), 'a-servis');   // servis gagal
  const tim = s => s ? [6, 7, 8, 9, 10, 11] : [0, 1, 2, 3, 4, 5];   // 6-11 tim saya, 0-5 lawan
  const menang = r.a;   // yang mencetak poin kadang selebrasi, yang kehilangan poin kadang kecewa
  if (Math.random() < .5) setPose(k[pil(tim(menang))], 'selebrasi');
  if (Math.random() < .35) setPose(k[pil(tim(!menang))], 'kecewa');
}
async function mainkan(root, S, aksi) {
  const saya = ++token; P.fase = 'main'; P.m.kickoff = [...S.susunan];   // susunan yang main set ini: patokan hitungan pergantian di jeda berikutnya
  P.cepat = !!S.pengaturan?.animasiCepat;
  tampilLapangan(root, S, aksi);
  if (root.querySelector('#arena3d')) { await mulai3D(root, S, aksi); if (saya !== token) return; }
  const now = sekarang(), hasil = mainkanSet(P.m, buatAcak(now), now);
  const akhir = () => {
    P.skor = { a: hasil.a, b: hasil.b };
    if (P.m.selesai) { const r = catatLaga(S, P.m.setSaya, P.m.setLawan); P.hasil = { koin: r.koin, exp: r.exp, naik: r.naik, cedera: r.cedera }; P.fase = 'selesai'; }
    else P.fase = 'siap';
    aksi.simpan(); aksi.perbaruiKoin();
    if (root.dataset.layar === 'tanding') renderPertandingan(root, S, aksi);
  };
  let a = 0, b = 0;
  for (const r of hasil.rally) {
    if (saya !== token) return akhir();
    if (P.cepat) break;
    r.a ? a++ : b++; gambarRally(root, r, a, b); await tunggu(150);
  }
  akhir();
}

function tampilSelesai(root, S, aksi) {
  const m = P.m, menang = m.pemenang === 'saya';
  root.innerHTML = `<div class="hasil ${menang ? 'menang' : 'kalah'}">${ikon(menang ? 'trofi' : 'silang', 80)}
<div class="skor-akhir"><b>${m.setSaya}</b><span>-</span><b>${m.setLawan}</b></div>
<div class="rincian">${m.riwayat.map(r => `<span class="${r.a > r.b ? 'm' : 'k'}">${r.a}-${r.b}</span>`).join('')}</div>
<div class="hadiah">${ikon('koin', 32)}<b>+${P.hasil.koin}</b></div><div class="hadiah exp">${ikon('bintang', 26)}<b>+${P.hasil.exp} EXP</b>${P.hasil.naik ? `<span class="naik">Level ${P.hasil.naik}!</span>` : ''}</div></div>
${P.hasil.cedera?.length ? `<div class="komentar">Cedera: ${P.hasil.cedera.join(', ')}</div>` : ''}<button class="tombol-besar" id="lagi" aria-label="Main lagi">${ikon('ulang', 30)}</button>`;
  root.querySelector('#lagi').onclick = () => { P = baru(); renderPertandingan(root, S, aksi); };
}
export { lepasPilihan };
