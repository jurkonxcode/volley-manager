// Tab Pasar: transfer + scouting dan latihan. (Fasilitas dipindah ke tab Klub.)
import { ikon, figur, esc } from './gambar.js';
import { sekarang, durasiPendek } from '../inti/waktu.js';
import { K } from '../inti/konfigurasi.js';
import { ratingPemain } from '../sistem/pemain.js';
import * as P from '../sistem/pasar.js';
let bagian = 'transfer', pesan = '';
const BAGIAN = { transfer: 'Transfer', latihan: 'Latihan' };
const NAMA_STAT = { servis: 'Servis', smash: 'Smash', blok: 'Blok', receive: 'Receive', umpan: 'Umpan', tahan: 'Daya tahan' };
const koin = n => `${ikon('koin', 14)} ${n}`;
const baris = (p, now, aksi) => `<div class="pk"><span class="pk-f">${figur(p, 'A', now)}</span><div class="pk-i"><b>${esc(p.nama)}</b><small>${p.posisi} · ${p.umur} th${p.scout === undefined ? '' : ' · Potensi ' + (p.scout ? p.potensi : '?')}${p.cedera > now ? ' · cedera ' + durasiPendek(p.cedera - now) : ''}</small></div><b class="pk-r">${ratingPemain(p)}</b><div class="pk-a">${aksi}</div></div>`;
function transfer(S, now) {
  const bangku = S.skuad.filter(p => !S.susunan.includes(p.id));
  return `<div class="pengaturan"><h2>Pasar · segar dalam ${durasiPendek(S.pasar.ts + K.pasar.menitSegar * 60000 - now)} <button class="chip-t seg" data-a="segar:x">${ikon('permata', 14)} 1 · Segarkan</button></h2>${S.pasar.daftar.map(p => baris(p, now, `${p.scout ? '' : `<button class="chip-t" data-a="scout:${p.id}">${ikon('bintang', 14)} ${K.pasar.biayaScout}</button>`}<button class="chip-t on" data-a="beli:${p.id}">${koin(P.hargaBeli(p))}</button>`)).join('') || '<small>Kosong</small>'}</div>
<div class="pengaturan"><h2>Jual dari bangku (${S.skuad.length}/${K.pasar.maksSkuad})</h2>${bangku.map(p => baris(p, now, `<button class="chip-t" data-a="jual:${p.id}">${koin(P.hargaJual(p))}</button>`)).join('')}</div>`;
}
function latihan(S, now) {
  const l = S.latihan;
  return `<div class="pengaturan"><h2>Latihan tim</h2>${l ? `<div class="laga-depan"><b>${NAMA_STAT[l.stat]}</b><div class="tombol-besar sekunder">${ikon('jam', 24)} ${durasiPendek(l.selesai - now)}</div><button class="chip-t on" data-a="cepatLatih:x" style="margin-top:10px">${ikon('permata', 14)} 1 · Percepat</button></div>` : `<div class="taktik">${P.STAT_LATIHAN.map(s => `<button class="chip-t on" data-a="latih:${s}">${NAMA_STAT[s]}</button>`).join('')}</div><small>Biaya ${K.latihan.biaya} koin. Tiap pemain berpeluang naik +1 pada statistik terpilih.</small>`}</div>`;
}
export function renderPasar(root, S, aksi) {
  const now = sekarang(); P.prosesWaktu(S, now); P.segarkanPasar(S, now);
  root.innerHTML = `<div class="taktik">${Object.entries(BAGIAN).map(([k, n]) => `<button class="chip-t ${bagian === k ? 'on' : ''}" data-b="${k}">${n}</button>`).join('')}</div>${pesan ? `<div class="komentar">${pesan}</div>` : ''}${{ transfer, latihan, fasilitas }[bagian](S, now)}`;
  pesan = '';
  root.onclick = e => {
    const b = e.target.closest('[data-b],[data-a]'); if (!b) return;
    if (b.dataset.b) bagian = b.dataset.b;
    else { const [a, v] = b.dataset.a.split(':'); pesan = { beli: () => P.beli(S, v), jual: () => P.jual(S, v), scout: () => P.scout(S, v), latih: () => P.mulaiLatihan(S, v, now), cepatLatih: () => P.percepatLatihan(S, now), segar: () => P.segarkanPaksa(S, now) }[a]() || ''; aksi.simpan(); aksi.perbaruiKoin(); }
    renderPasar(root, S, aksi);
  };
}
