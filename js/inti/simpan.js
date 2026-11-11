import { K } from './konfigurasi.js';
export function muat() {
  try { const t = localStorage.getItem(K.kunciSimpan); if (!t) return null; const d = JSON.parse(t); return d && d.versi === 1 ? d : null; }
  catch (e) { return null; }
}
export function simpan(s) { try { localStorage.setItem(K.kunciSimpan, JSON.stringify(s)); return true; } catch (e) { return false; } }
export function hapus() { try { localStorage.removeItem(K.kunciSimpan); } catch (e) {} }
