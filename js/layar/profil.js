// Profil manajer: identitas, EXP, catatan pertandingan, dan pengaturan.
import { ikon, esc } from './gambar.js';
import { levelDari } from '../sistem/manajer.js';

export function renderProfil(root, S, aksi) {
  const m = S.manajer, L = levelDari(m.exp), huruf = (m.nama.trim()[0] || 'M').toUpperCase();
  const pengaturan = S.pengaturan || (S.pengaturan = { animasiCepat: false });
  root.innerHTML = `<section class="kartu-manajer">
<div class="km-kepala"><div class="km-avatar">${esc(huruf)}</div><div class="km-id"><div class="km-nama">${esc(m.nama)}</div><div class="km-tim">${ikon('skuad', 16)}<span>${esc(m.tim)}</span></div></div><div class="km-level"><small>LV</small><b>${L.level}</b></div></div>
<div class="km-exp"><div class="baris-exp"><span>EXP ke level ${L.level + 1}</span><b>${L.sisa} / ${L.butuh}</b></div><div class="batang exp-batang"><i style="width:${L.persen.toFixed(1)}%"></i></div></div>
<div class="km-statistik"><div><b>${m.main}</b><span>Main</span></div><div><b class="m">${m.menang}</b><span>Menang</span></div><div><b class="k">${m.kalah}</b><span>Kalah</span></div><div><b>${m.exp}</b><span>Total EXP</span></div></div>
</section>
<section class="pengaturan">
<h2>Pengaturan</h2>
<label class="isian"><span>Nama manajer</span><input id="nm" maxlength="24" value="${esc(m.nama)}" autocomplete="off"></label>
<label class="isian"><span>Nama tim</span><input id="nt" maxlength="24" value="${esc(m.tim)}" autocomplete="off"></label>
<label class="saklar"><span>Lewati animasi pertandingan</span><input type="checkbox" id="anim" ${pengaturan.animasiCepat ? 'checked' : ''}></label>
<button class="tombol-besar sekunder" id="ulang">${ikon('hapus', 24)} Mulai dari awal</button>
</section>`;
  root.querySelector('#nm').onchange = e => { m.nama = e.target.value.trim() || 'Manajer'; e.target.value = m.nama; aksi.simpan(); renderProfil(root, S, aksi); };
  root.querySelector('#nt').onchange = e => { m.tim = e.target.value.trim() || 'Tim Tanpa Nama'; e.target.value = m.tim; aksi.simpan(); };
  root.querySelector('#anim').onchange = e => { pengaturan.animasiCepat = e.target.checked; aksi.simpan(); };
  root.querySelector('#ulang').onclick = () => aksi.reset();
}
