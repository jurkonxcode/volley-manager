// Cloud save Supabase (opsional, local-first). Tanpa konfigurasi atau saat offline, game tetap jalan dari localStorage.
// Satu baris per pemain di tabel public.game_saves (RLS: hanya milik sendiri). Kebijakan konflik: data terbaru (S.diperbarui) menang.
import { SUPABASE } from './supabase-config.js';
import { simpan } from './simpan.js';
const CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
const K_URL = 'vm-sb-url', K_ANON = 'vm-sb-key';
const baca = k => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
export const konfig = () => ({ url: baca(K_URL) || SUPABASE.url, anonKey: baca(K_ANON) || SUPABASE.anonKey });
export const terkonfigurasi = () => { const c = konfig(); return !!(c.url && c.anonKey); };
let _c = null, status = { teks: 'Cloud: belum diatur', ok: false }; const dengar = new Set();
const setStatus = (teks, ok = false) => { status = { teks, ok }; dengar.forEach(f => f(status)); };
export const onStatus = f => { dengar.add(f); f(status); };
export function simpanKonfig(url, anonKey) { try { localStorage.setItem(K_URL, url.trim().replace(/\/+$/, '')); localStorage.setItem(K_ANON, anonKey.trim()); } catch (e) {} _c = null; }
export function hapusKonfig() { try { localStorage.removeItem(K_URL); localStorage.removeItem(K_ANON); } catch (e) {} _c = null; setStatus('Cloud: belum diatur'); }
async function klien() {
  if (_c) return _c;
  const k = konfig(); if (!k.url || !k.anonKey) return null;
  const { createClient } = await import(CDN);
  _c = createClient(k.url, k.anonKey, { auth: { persistSession: true, autoRefreshToken: true } });
  return _c;
}
const galat = (e, d) => new Error(e?.message || d);
export async function sesi() {
  const c = await klien(); if (!c) return null;
  const { data, error } = await c.auth.getSession(); if (error) throw galat(error, 'Sesi gagal dibaca');
  setStatus(data.session ? 'Cloud: ' + (data.session.user.email || 'masuk') : 'Cloud: belum masuk', !!data.session);
  return data.session;
}
export async function masuk(email, sandi) {
  const c = await klien(); const { data, error } = await c.auth.signInWithPassword({ email, password: sandi });
  if (error) throw galat(error, 'Gagal masuk'); setStatus('Cloud: ' + email, true); return data.session;
}
export async function daftar(email, sandi) {
  const c = await klien(); const { data, error } = await c.auth.signUp({ email, password: sandi });
  if (error) throw galat(error, 'Gagal mendaftar');
  if (data.session) setStatus('Cloud: ' + email, true);
  return data.session;   // null = perlu konfirmasi email dulu
}
export async function keluar() { const c = await klien(); if (c) await c.auth.signOut(); setStatus('Cloud: belum masuk'); }
export async function unggah(S) {
  const c = await klien(), s = await sesi(); if (!c || !s) throw new Error('Belum masuk');
  const { error } = await c.from('game_saves').upsert({ user_id: s.user.id, data: S, versi: S.versi || 2, klub: S.manajer?.tim || null, musim: S.musim?.ke || null });
  if (error) throw galat(error, 'Gagal mengunggah'); setStatus('Cloud: tersimpan', true);
}
export async function unduh() {
  const c = await klien(), s = await sesi(); if (!c || !s) throw new Error('Belum masuk');
  const { data, error } = await c.from('game_saves').select('data,updated_at').eq('user_id', s.user.id).maybeSingle();
  if (error) throw galat(error, 'Gagal mengunduh'); return data;
}
let timer = null;
export function jadwalkanUnggah(S) {   // dipanggil tiap simpan lokal; digabung (debounce 5 dtk)
  if (!terkonfigurasi()) return; clearTimeout(timer);
  timer = setTimeout(async () => { try { if (await sesi()) await unggah(S); } catch (e) { setStatus('Cloud: offline', false); } }, 5000);
}
// Dipanggil sekali saat game dimulai. Mengembalikan 'cloud' bila data lokal diganti (halaman perlu dimuat ulang).
export async function sinkronAwal(S) {
  try {
    if (!terkonfigurasi() || !(await sesi())) return 'lokal';
    const r = await unduh();
    if (!r) { await unggah(S); return 'lokal'; }
    const c = r.data, tc = c?.diperbarui || Date.parse(r.updated_at) || 0, tl = S.diperbarui || 0;
    if (tc > tl + 1000 && confirm('Data di cloud lebih baru. Pakai data cloud di perangkat ini?')) { simpan(c); return 'cloud'; }
    if (tl > tc) await unggah(S);
    return 'lokal';
  } catch (e) { setStatus('Cloud: offline', false); return 'lokal'; }
}
