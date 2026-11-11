import { kartuMini, figur, radar, chipStat, ikon } from './gambar.js';
import { bukaKartu } from './kartu-pemain.js';
import { sekarang, durasiPendek } from '../inti/waktu.js';
import { ratingPemain } from '../sistem/pemain.js';
import { staminaSekarang, zonaStamina, menitPulihPenuh } from '../sistem/stamina.js';
import { K } from '../inti/konfigurasi.js';
import { FORMASI, GAYA, autoSusun } from '../sistem/taktik.js';
const taktikHtml = S => `<div class="taktik">${Object.keys(FORMASI).map(k => `<button class="chip-t ${S.taktik.formasi === k ? 'on' : ''}" data-formasi="${k}">${k}</button>`).join('')}<span class="pemisah"></span>${Object.entries(GAYA).map(([k, g]) => `<button class="chip-t ${S.taktik.gaya === k ? 'on' : ''}" data-gaya="${k}">${g.nama}</button>`).join('')}<button class="chip-t" data-auto aria-label="Susun otomatis">${ikon('ulang', 16)}</button></div>`;

let terpilih = null, fokusId = null;
export const lepasPilihan = () => { terpilih = null; };

// Ketuk satu pemain lalu ketuk pemain lain untuk menukar posisi (lapangan <-> bangku, atau sesama lapangan).
export function pasangTukar(root, S, cb = {}) {
  const tandai = () => root.querySelectorAll('[data-id]').forEach(e => e.classList.toggle('terpilih', e.dataset.id === terpilih));
  tandai();
  root.querySelectorAll('[data-id]').forEach(el => el.addEventListener('click', () => {
    const id = el.dataset.id;
    if (cb.saatFokus) cb.saatFokus(id);
    if (!terpilih) { terpilih = id; return tandai(); }
    if (terpilih === id) { terpilih = null; return tandai(); }
    const i1 = S.susunan.indexOf(terpilih), i2 = S.susunan.indexOf(id);
    if (cb.izin) {   // batas pergantian (jeda antar-set): periksa susunan hasil tukar sebelum dilakukan
      const baru = [...S.susunan];
      if (i1 >= 0 && i2 >= 0) [baru[i1], baru[i2]] = [baru[i2], baru[i1]]; else if (i1 >= 0) baru[i1] = id; else if (i2 >= 0) baru[i2] = terpilih;
      if (!cb.izin(baru)) { terpilih = null; tandai(); return cb.ditolak && cb.ditolak(); }
    }
    if (i1 >= 0 && i2 >= 0) [S.susunan[i1], S.susunan[i2]] = [S.susunan[i2], S.susunan[i1]];
    else if (i1 >= 0) S.susunan[i1] = id;
    else if (i2 >= 0) S.susunan[i2] = terpilih;
    else { terpilih = id; return tandai(); }   // dua-duanya di bangku: pindah pilihan saja
    terpilih = null;
    cb.saatUbah && cb.saatUbah();
  }));
}

function detailHtml(p, now) {
  const s = staminaSekarang(p, now), pulih = menitPulihPenuh(p, now) * 60000, r = ratingPemain(p);
  return `<div class="detail-kepala">${figur(p, 'A', now)}<div><div class="nama">${p.nama.split(' ')[0]}</div><div class="sub"><i class="lencana" style="--w:${K.warnaPosisi[p.posisi]}">${p.posisi}</i><span>${p.umur}</span></div></div><div class="rating-besar">${r}</div></div>
${radar(p)}${chipStat(p)}
<div class="baris-info">${ikon('jam', 20)}<div class="batang zona-${zonaStamina(s)}"><i style="width:${s.toFixed(0)}%"></i></div><b>${pulih > 0 ? durasiPendek(pulih) : '100'}</b></div>
<div class="baris-info">${ikon('jantung', 20)}<div class="batang tahan"><i style="width:${p.tahan}%"></i></div><b>${p.tahan}</b></div>
<div class="baris-info">${ikon('bintang', 20)}<div class="batang potensi"><i style="width:${r}%"></i><u style="left:${p.potensi}%"></u></div><b>${p.potensi}</b></div>
<button class="tombol-kecil" data-kartu="${p.id}">${ikon('orang', 18)} Profil lengkap</button>`;
}

export function renderSkuad(root, S, aksi, opsi = {}) {
  const now = sekarang(), cari = id => S.skuad.find(p => p.id === id);
  if (!fokusId || !cari(fokusId)) fokusId = S.susunan[0];
  const lap = S.susunan.map(cari), bangku = S.skuad.filter(p => !S.susunan.includes(p.id));
  const baris = a => `<div class="baris">${a.map(p => kartuMini(p, { tim: 'A', now, zona: 'lap' })).join('')}</div>`;
  root.innerHTML = `${opsi.taktik === false ? '' : taktikHtml(S)}<div class="lapangan"><div class="jaring"></div><div class="arena"><div class="separuh">${baris(lap.slice(0, 3))}${baris(lap.slice(3))}</div></div></div>
<div class="bangku">${bangku.map(p => kartuMini(p, { tim: 'A', now, zona: 'bangku' })).join('')}</div>
<section class="detail" id="detail">${detailHtml(cari(fokusId), now)}</section>`;
  // Tombol "Profil lengkap" di panel detail: didengar sekali di akar, jadi tidak menumpuk.
  root.onclick = e => {
    const f = e.target.closest('[data-formasi],[data-gaya],[data-auto]');
    if (f) { if (f.dataset.formasi) S.taktik.formasi = f.dataset.formasi; if (f.dataset.gaya) S.taktik.gaya = f.dataset.gaya; else S.susunan = autoSusun(S, sekarang()); aksi.simpan(); return renderSkuad(root, S, aksi, opsi); }
    const b = e.target.closest('[data-kartu]');
    if (!b) return;
    const p = cari(b.dataset.kartu);
    if (p) bukaKartu(p, sekarang(), S, aksi);
  };
  pasangTukar(root, S, {
    saatFokus: id => { fokusId = id; root.querySelector('#detail').innerHTML = detailHtml(cari(id), sekarang()); },
    saatUbah: () => { aksi.simpan(); renderSkuad(root, S, aksi, opsi); }
  });
}
