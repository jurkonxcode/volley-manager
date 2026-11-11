// Identitas klub (nama, lambang, warna, stadion). Logika murni.
import { NEGARA } from '../data/negara.js';
export const LOGO_PILIHAN = ['volley-manager', 'elang', 'petir', 'singa', 'naga', 'api', 'banteng', 'ombak', 'bintang'];
export const PALET = [['Navy', '#1B2F6B'], ['Merah', '#C8283C'], ['Putih', '#F2F2F2'], ['Kuning', '#F2C230'], ['Hijau', '#1F9D55'], ['Oranye', '#F2711C'], ['Ungu', '#6B3FA0'], ['Hitam', '#1A1A22'], ['Biru muda', '#38A3E8'], ['Pink', '#E8559A']];
export const WARNA_ASLI = '#1B2F6B';   // jersey asli di gambar sprite (navy): tidak perlu dicat ulang
export const singkat = nama => {
  const k = String(nama).replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean);
  const s = k.length >= 3 ? k.slice(0, 3).map(x => x[0]).join('') : k.length === 2 ? k[0][0] + k[1].slice(0, 2) : (k[0] || 'KLB').slice(0, 3);
  return s.toUpperCase().padEnd(3, 'X').slice(0, 3);
};
export function identitasAwal(nama = 'Volley Club', neg = 'ID', kota) {
  const n = NEGARA[neg] || NEGARA.ID, k = kota || n.kota[0];
  return { singkatan: singkat(nama), kota: k, logo: 'volley-manager', warnaA: WARNA_ASLI, warnaB: '#F2F2F2', stadion: 'Stadion ' + k };
}
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
export const jarakWarna = (a, b) => { const x = rgb(a), y = rgb(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };
// Warna jersey lawan: merah, kecuali warna kandang kita mirip merah (lalu kuning).
export const warnaLawan = home => jarakWarna(home, '#C8283C') < 140 ? '#F2C230' : '#C8283C';
// Warna teks yang terbaca di atas warna dasar tertentu.
export const warnaTeks = h => { const [r, g, b] = rgb(h); return (r * .3 + g * .59 + b * .11) > 150 ? '#111827' : '#FFFFFF'; };
