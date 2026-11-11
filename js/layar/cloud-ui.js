// Kartu "Akun & Cloud Save" di Pengaturan (Supabase). Lihat js/inti/cloud.js.
import * as C from '../inti/cloud.js';
import { esc, ikon } from './gambar.js';
import { simpan } from '../inti/simpan.js';
export async function renderCloud(el, S, aksi, info = '') {
  if (!el) return;
  const pesan = t => t ? `<div class="komentar">${esc(t)}</div>` : '';
  if (!C.terkonfigurasi()) {
    el.innerHTML = `<h2>Akun & Cloud Save</h2><small class="redup">Hubungkan proyek Supabase kamu (Project Settings > API) agar progres tersimpan online.</small>${pesan(info)}
<label class="isian"><span>Project URL</span><input id="sb-url" placeholder="https://xxxx.supabase.co" autocomplete="off"></label>
<label class="isian"><span>Anon public key</span><input id="sb-key" placeholder="eyJ..." autocomplete="off"></label>
<button class="tombol-besar sekunder" id="sb-simpan">${ikon('cek', 22)} Simpan koneksi</button>`;
    el.querySelector('#sb-simpan').onclick = () => { const u = el.querySelector('#sb-url').value, k = el.querySelector('#sb-key').value; if (!/^https:\/\/.+/.test(u.trim()) || k.trim().length < 20) return renderCloud(el, S, aksi, 'URL atau key belum benar.'); C.simpanKonfig(u, k); renderCloud(el, S, aksi); };
    return;
  }
  el.innerHTML = '<h2>Akun & Cloud Save</h2><small class="redup">Menghubungkan...</small>';
  let s = null; try { s = await C.sesi(); } catch (e) { info = 'Tidak bisa terhubung: ' + e.message; }
  const jalan = (fn, ok) => async () => { try { await fn(); renderCloud(el, S, aksi, ok); } catch (e) { renderCloud(el, S, aksi, e.message); } };
  if (!s) {
    el.innerHTML = `<h2>Akun & Cloud Save</h2>${pesan(info)}
<label class="isian"><span>Email</span><input id="sb-em" type="email" autocomplete="email"></label>
<label class="isian"><span>Kata sandi (min. 6)</span><input id="sb-pw" type="password" autocomplete="current-password"></label>
<button class="tombol-besar" id="sb-masuk">Masuk</button><button class="tombol-besar sekunder" id="sb-daftar">Daftar akun baru</button><button class="chip-t" id="sb-lepas">Ganti proyek Supabase</button>`;
    const v = () => [el.querySelector('#sb-em').value.trim(), el.querySelector('#sb-pw').value];
    el.querySelector('#sb-masuk').onclick = jalan(async () => { const [e, p] = v(); await C.masuk(e, p); S.diperbarui ||= Date.now(); if (await C.sinkronAwal(S) === 'cloud') location.reload(); }, 'Berhasil masuk.');
    el.querySelector('#sb-daftar').onclick = async () => { try { const [e, p] = v(); const r = await C.daftar(e, p); if (r) { await C.unggah(S); renderCloud(el, S, aksi, 'Akun dibuat dan progres diunggah.'); } else renderCloud(el, S, aksi, 'Cek email untuk konfirmasi, lalu masuk.'); } catch (x) { renderCloud(el, S, aksi, x.message); } };
    el.querySelector('#sb-lepas').onclick = () => { C.hapusKonfig(); renderCloud(el, S, aksi); };
    return;
  }
  el.innerHTML = `<h2>Akun & Cloud Save</h2>${pesan(info)}<div class="db-evo"><div>${ikon('orang', 20)}<span>Masuk sebagai<small>${esc(s.user.email || '')}</small></span><b class="m">Online</b></div></div><small class="redup">Progres otomatis diunggah beberapa detik setelah berubah. Data terbaru yang menang.</small>
<button class="tombol-besar" id="sb-naik">${ikon('unduh', 22)} Simpan ke cloud sekarang</button><button class="tombol-besar sekunder" id="sb-turun">Ambil dari cloud</button><button class="chip-t" id="sb-keluar">Keluar</button>`;
  el.querySelector('#sb-naik').onclick = jalan(async () => { S.diperbarui = Date.now(); aksi.simpan(); await C.unggah(S); }, 'Tersimpan ke cloud.');
  el.querySelector('#sb-turun').onclick = async () => { try { const r = await C.unduh(); if (!r) return renderCloud(el, S, aksi, 'Belum ada data di cloud.'); if (confirm('Timpa data di perangkat ini dengan data cloud?')) { simpan(r.data); location.reload(); } } catch (e) { renderCloud(el, S, aksi, e.message); } };
  el.querySelector('#sb-keluar').onclick = jalan(() => C.keluar(), 'Sudah keluar.');
}
