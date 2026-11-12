import { K } from './konfigurasi.js';
let gagal = false;
export function muat() {
  let t = null;
  try { t = localStorage.getItem(K.kunciSimpan); if (!t) return null; const d = JSON.parse(t); if (d && d.versi === 2) return d; } catch (e) {}
  // Simpanan ada tetapi rusak / versi asing: salin dulu supaya tidak tertimpa game baru tanpa jejak.
  if (t) { try { localStorage.setItem(K.kunciSimpan + '-cadangan', t); } catch (e) {} }
  return null;
}
export function simpan(s) { try { localStorage.setItem(K.kunciSimpan, JSON.stringify(s)); gagal = false; return true; } catch (e) { gagal = true; return false; } }
export const simpanGagal = () => gagal;
export function hapus() { try { localStorage.removeItem(K.kunciSimpan); } catch (e) {} }
