import { kartuMini, figur, radar, chipStat, ikon } from './gambar.js';
import { sekarang, durasiPendek } from '../inti/waktu.js';
import { ratingPemain } from '../sistem/pemain.js';
import { staminaSekarang, zonaStamina, menitPulihPenuh } from '../sistem/stamina.js';
import { K } from '../inti/konfigurasi.js';

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
<div class="baris-info">${ikon('bintang', 20)}<div class="batang potensi"><i style="width:${r}%"></i><u style="left:${p.potensi}%"></u></div><b>${p.potensi}</b></div>`;
}

export function renderSkuad(root, S, aksi) {
  const now = sekarang(), cari = id => S.skuad.find(p => p.id === id);
  if (!fokusId || !cari(fokusId)) fokusId = S.susunan[0];
  const lap = S.susunan.map(cari), bangku = S.skuad.filter(p => !S.susunan.includes(p.id));
  const baris = a => `<div class="baris">${a.map(p => kartuMini(p, { tim: 'A', now, zona: 'lap' })).join('')}</div>`;
  root.innerHTML = `<div class="lapangan"><div class="jaring"></div><div class="arena"><div class="separuh">${baris(lap.slice(0, 3))}${baris(lap.slice(3))}</div></div></div>
<div class="bangku">${bangku.map(p => kartuMini(p, { tim: 'A', now, zona: 'bangku' })).join('')}</div>
<section class="detail" id="detail">${detailHtml(cari(fokusId), now)}</section>`;
  pasangTukar(root, S, {
    saatFokus: id => { fokusId = id; root.querySelector('#detail').innerHTML = detailHtml(cari(id), sekarang()); },
    saatUbah: () => { aksi.simpan(); renderSkuad(root, S, aksi); }
  });
}
