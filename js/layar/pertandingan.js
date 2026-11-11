import { kartuMini, figur, ikon } from './gambar.js';
import { pasangTukar, lepasPilihan } from './skuad.js';
import { sekarang, durasiPendek } from '../inti/waktu.js';
import { buatAcak } from '../inti/acak.js';
import { K } from '../inti/konfigurasi.js';
import { buatPertandingan, mainkanSet, timSaya, kekuatanTim } from '../sistem/pertandingan.js';
import { buatLawan } from '../sistem/liga.js';
import { bersihkanSusunan } from '../sistem/taktik.js';
import { fixtureSaya, kickoff, catatLaga, levelLawan } from '../sistem/musim.js';

let P = baru(), token = 0;
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

function tampilLapangan(root, S, aksi) {
  const m = P.m, now = sekarang(), A = timSaya(m), B = m.lawan, edit = P.fase === 'siap';
  const titik = n => Array.from({ length: K.set.menang }, (_, i) => `<i class="${i < n ? 'isi' : ''}"></i>`).join('');
  const baris = (a, tim, inter) => `<div class="baris">${a.map(p => kartuMini(p, { tim, now, zona: 'lap', interaktif: inter })).join('')}</div>`;
  const bangku = S.skuad.filter(p => !S.susunan.includes(p.id));
  root.innerHTML = `${edit && m.setKe === 1 ? `<button class="kembali" id="kembali" aria-label="Pilih lawan lain">${ikon('kembali', 22)}</button>` : ''}
<div class="papan"><div class="sisi"><div class="titik-set">${titik(m.setSaya)}</div><b id="skA">${P.skor.a}</b></div><div class="tengah">${ikon('bola', 30)}</div><div class="sisi lawan"><div class="titik-set">${titik(m.setLawan)}</div><b id="skB">${P.skor.b}</b></div></div>
<div class="lapangan"><div class="arena" id="arena">
<div class="separuh">${baris(B.slice(3), 'B', false)}${baris(B.slice(0, 3), 'B', false)}</div><div class="jaring"></div>
<div class="separuh">${baris(A.slice(0, 3), 'A', edit)}${baris(A.slice(3), 'A', edit)}</div>
<div class="bayangan" id="bay" style="left:50%;top:50%"></div><div class="bola" id="bola" style="left:50%;top:50%">${ikon('bola', 22)}</div><div class="pop" id="pop"></div></div></div>
<div class="komentar" id="kom">${P.kom || ''}</div>
${edit ? `<div class="bangku">${bangku.map(p => kartuMini(p, { tim: 'A', now, zona: 'bangku' })).join('')}</div><button class="tombol-besar" id="main" aria-label="Main set">${ikon('main', 30)}</button>`
       : `<button class="tombol-besar sekunder" id="lompat" aria-label="Lewati animasi">${ikon('lompat', 28)}</button>`}`;
  const k = root.querySelector('#kembali'); if (k) k.onclick = () => { P = baru(); renderPertandingan(root, S, aksi); };
  const mn = root.querySelector('#main'); if (mn) mn.onclick = () => mainkan(root, S, aksi);
  const lm = root.querySelector('#lompat'); if (lm) lm.onclick = () => { P.cepat = true; };
  if (edit) pasangTukar(root, S, { saatUbah: () => { aksi.simpan(); renderPertandingan(root, S, aksi); } });
}

function gambarRally(root, r, a, b) {
  const skA = root.querySelector('#skA'), skB = root.querySelector('#skB'), bola = root.querySelector('#bola'), pop = root.querySelector('#pop');
  if (!skA || !bola) return;
  skA.textContent = a; skB.textContent = b;
  const A = timSaya(P.m), B = P.m.lawan, pil = t => t[Math.floor(Math.random() * t.length)].nama.split(' ')[0], sk = r.a ? A : B, ls = r.a ? B : A;
  P.kom = { ace: `Ace dari ${pil(sk)}!`, blok: `${pil(sk)} blok kokoh!`, smash: `Smash keras ${pil(sk)}!`, salah: `${pil(ls)} membuat kesalahan` }[r.jenis];
  const kom = root.querySelector('#kom'); if (kom) kom.textContent = P.kom;
  const el = r.a ? skA : skB; el.classList.remove('naik'); void el.offsetWidth; el.classList.add('naik');
  const x = 10 + Math.random() * 80, y = r.a ? 6 + Math.random() * 36 : 58 + Math.random() * 36;   // bola jatuh di sisi yang kebobolan
  bola.style.left = x + '%'; bola.style.top = y + '%';
  const bay = root.querySelector('#bay'); if (bay) { bay.style.left = x + '%'; bay.style.top = y + '%'; }
  bola.classList.remove('terbang'); void bola.offsetWidth; bola.classList.add('terbang');
  pop.style.left = x + '%'; pop.style.top = y + '%';
  pop.className = 'pop ' + r.jenis; pop.innerHTML = ikon(r.jenis === 'salah' ? 'silang' : r.jenis === 'ace' ? 'servis' : r.jenis === 'blok' ? 'blok' : 'smash', 20);
  void pop.offsetWidth; pop.classList.add('muncul');
}

async function mainkan(root, S, aksi) {
  const saya = ++token; P.fase = 'main'; P.cepat = !!S.pengaturan?.animasiCepat;
  tampilLapangan(root, S, aksi);
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
