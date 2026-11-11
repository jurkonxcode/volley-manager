// Pembantu gambar: ikon, avatar, cincin stamina, radar. Hanya menghasilkan HTML/SVG.
import { rarity } from './rarity.js';
import { K, URUTAN_STAT, WARNA_STAT } from '../inti/konfigurasi.js';
import { staminaSekarang, zonaStamina } from '../sistem/stamina.js';
import { ratingPemain } from '../sistem/pemain.js';
import { spriteSrc } from './sprite.js';
import { warnaTeks } from '../sistem/identitas.js';

const IKON = {
  bola: '<circle cx="12" cy="12" r="9"/><path d="M3.5 9.5c5 1 11 1 17 0M3.5 14.5c5-1 11-1 17 0M12 3c-3 4-3 14 0 18"/>',
  servis: '<circle cx="15" cy="9" r="5"/><path d="M3 21l6-6M3 16l3-3"/>',
  smash: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  blok: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 12h16M12 5v7M8 12v7M16 12v7"/>',
  receive: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>',
  umpan: '<path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/>',
  koin: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a2 2 0 010 4h-3a2 2 0 000 4h4"/>',
  skuad: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-4 3-6 6-6s6 2 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14c3 0 5 2 5 5"/>',
  jaring: '<path d="M3 6v14M21 6v14M3 8h18M3 13h18M8 8v10M13 8v10M18 8v10"/>',
  main: '<path d="M8 5v14l11-7z" fill="currentColor"/>',
  lompat: '<path d="M5 5v14l9-7zM16 5v14h3V5z" fill="currentColor"/>',
  jam: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  ulang: '<path d="M4 12a8 8 0 108-8M4 4v5h5"/>',
  api: '<path d="M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z" fill="currentColor" stroke="none"/>',
  trofi: '<path d="M8 4h8v5a4 4 0 01-8 0zM6 5H4v2a3 3 0 003 3M18 5h2v2a3 3 0 01-3 3M12 13v4M8 20h8"/>',
  silang: '<path d="M6 6l12 12M18 6L6 18"/>',
  bintang: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.500 20.200l1-6.200L3 9.600l6.200-.900z"/>',
  jantung: '<path d="M12 20s-7-4.500-7-10a4 4 0 017-2.500A4 4 0 0119 10c0 5.500-7 10-7 10z"/>',
  hapus: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  kembali: '<path d="M15 5l-7 7 7 7"/>',
  gerigi: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.100 2.100M16.300 16.300l2.100 2.100M18.400 5.600l-2.100 2.100M7.700 16.300l-2.100 2.100"/>',
  rumah: '<path d="M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6"/>',
  kubus: '<path d="M12 3l8 4.500v9L12 21l-8-4.500v-9zM12 12l8-4.500M12 12v9M12 12L4 7.500"/>',
  orang: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  stadion: '<ellipse cx="12" cy="12" rx="9.500" ry="6.500"/><ellipse cx="12" cy="12" rx="5" ry="3"/><path d="M12 9v6"/>',
  permata: '<path d="M6 4h12l3.500 5L12 21 2.500 9z"/><path d="M2.500 9h19M9 4l-2 5 5 12 5-12-2-5"/>',
  palu: '<path d="M14 4l6 6-3 3-6-6zM12 9L4 17l3 3 8-8"/>',
  buku: '<path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3zM5 17a3 3 0 013-3h11"/>',
  kalender: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  jabat: '<path d="M3 12l4-4 4 3 4-3 6 5-5 5-3-2-2 2-3-1-5-3z"/>',
  // v18: ikon tambahan (gaya garis 24px, sama dengan set di atas)
  tambah: '<path d="M12 5v14M5 12h14"/>',
  cek: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  bantuan: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 015 .3c0 1.700-2.500 2-2.500 3.700M12 17h.01"/>',
  lonceng: '<path d="M6 17v-6a6 6 0 0112 0v6l2 2H4zM10 21h4"/>',
  kunci: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  panah: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  toko: '<path d="M5 8h14l-1 12H6zM9 8a3 3 0 016 0"/>',
  parkir: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M10 16V8h3a2.500 2.500 0 010 5h-3"/>',
  medis: '<path d="M9 4h6v5h5v6h-5v5H9v-5H4V9h5z"/>',
  akademi: '<path d="M2 9l10-5 10 5-10 5zM6 11.500V16c0 1.500 3 3 6 3s6-1.500 6-3v-4.500M22 9v6"/>',
  tiket: '<path d="M4 7h16v3a2 2 0 000 4v3H4v-3a2 2 0 000-4z"/><path d="M14 7v2M14 11v2M14 15v2"/>',
  sponsor: '<path d="M4 10v4h3l8 4V6L7 10zM18 9a4 4 0 010 6"/>',
  grafik: '<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.500"/>',
  bendera: '<path d="M5 21V4M5 5h12l-2 4 2 4H5"/>',
  mata: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  unduh: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  lokasi: '<path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.500"/>',
  peluit: '<circle cx="9" cy="14" r="5"/><path d="M13 11l8-3v4l-6 1.500M9 9V6"/>'
};
export function ikon(nama, u = 20) {
  return `<svg class="ikon" width="${u}" height="${u}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IKON[nama] || ''}</svg>`;
}

const KULIT = ['#F1C9A5', '#E0A878', '#C68642', '#8D5524'];
const RAMBUT = ['#1B1B1B', '#3B2417', '#6B4423', '#B5651D'];
function isiAvatar(p, tim) {
  const baju = tim === 'A' ? WARNA_SAYA : '#F6F2E8', angka = tim === 'A' ? warnaTeks(WARNA_SAYA) : '#102A4A';
  const kulit = KULIT[p.kulit % 4], rambut = RAMBUT[p.rambut % 4];
  const gaya = [
    `<path d="M15 21a9 9 0 0 1 18 0c-4-3-14-3-18 0z" fill="${rambut}"/>`,
    `<path d="M14.500 22a9.500 9.500 0 0 1 19 0v-2c0-6-4-10-9.500-10s-9.500 4-9.500 10z" fill="${rambut}"/>`,
    `<path d="M15 21a9 9 0 0 1 18 0c-4-3-14-3-18 0z" fill="${rambut}"/><circle cx="34" cy="15" r="3.500" fill="${rambut}"/>`
  ][p.gaya % 3];
  return `<circle cx="24" cy="24" r="24" fill="#1C406A"/><g clip-path="url(#kAv)"><path d="M6 48c0-10 7-15 18-15s18 5 18 15z" fill="${baju}"/><rect x="21" y="28" width="6" height="7" fill="${kulit}"/><circle cx="24" cy="22" r="9" fill="${kulit}"/>${gaya}<text x="24" y="46" text-anchor="middle" font-size="10" font-weight="700" fill="${angka}" font-family="sans-serif">${p.nomor}</text></g>`;
}
export function figur(p, tim, now) {
  const s = staminaSekarang(p, now), C = 2 * Math.PI * 26;
  return `<svg class="figur zona-${zonaStamina(s)}" viewBox="0 0 56 56" role="img" aria-label="${Math.round(s)}%">
<circle class="cincin-latar" cx="28" cy="28" r="26"/>
<circle class="cincin-isi" cx="28" cy="28" r="26" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - s / 100)).toFixed(1)}" transform="rotate(-90 28 28)"/>
<svg x="8" y="8" width="40" height="40" viewBox="0 0 48 48">${isiAvatar(p, tim)}</svg></svg>`;
}
export function kartuMini(p, { tim = 'A', now, zona = 'lap', interaktif = true, badan = false } = {}) {
  const tag = interaktif ? 'button' : 'div';
  const data = interaktif ? ` data-id="${p.id}" data-zona="${zona}"` : '';
  const rr = rarity(p);
  return `<${tag} class="kartu r-${rr.kode}"${data} style="--w:${K.warnaPosisi[p.posisi]}">${badan ? badanGambar(p, tim, now) : figur(p, tim, now)}${badan ? '' : `<i class="rar">${rr.kode}</i>`}<i class="lencana">${p.posisi}</i>${badan ? '' : `<span class="nilai">${ratingPemain(p)}</span>`}${p.cedera > now ? '<i class="med">+</i>' : ''}</${tag}>`;
}
export function radar(p) {
  const R = 34, ang = i => (-90 + 72 * i) * Math.PI / 180;
  const pt = (i, r) => [50 + r * Math.cos(ang(i)), 50 + r * Math.sin(ang(i))];
  const f = n => n.toFixed(1);
  const poli = k => URUTAN_STAT.map((_, i) => pt(i, R * k).map(f).join(',')).join(' ');
  const area = URUTAN_STAT.map((st, i) => pt(i, R * Math.max(.08, p[st] / 100)).map(f).join(',')).join(' ');
  const sumbu = URUTAN_STAT.map((_, i) => { const [x, y] = pt(i, R); return `<line x1="50" y1="50" x2="${f(x)}" y2="${f(y)}"/>`; }).join('');
  const ik = URUTAN_STAT.map((st, i) => { const [x, y] = pt(i, R + 9); return `<g transform="translate(${f(x - 6)} ${f(y - 6)}) scale(.5)" style="color:${WARNA_STAT[st]}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${IKON[st]}</g>`; }).join('');
  return `<svg class="radar" viewBox="0 0 100 100" aria-hidden="true"><polygon class="grid" points="${poli(.33)}"/><polygon class="grid" points="${poli(.66)}"/><polygon class="grid" points="${poli(1)}"/>${sumbu}<polygon class="area" points="${area}"/>${ik}</svg>`;
}
export function chipStat(p) {
  return `<ul class="chip-stat">${URUTAN_STAT.map(st => `<li style="--w:${WARNA_STAT[st]}">${ikon(st, 16)}<b>${p[st]}</b></li>`).join('')}</ul>`;
}

export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Figur seluruh badan untuk layar laga (lengan dianimasikan lewat CSS: .a-smash, .a-blok, .a-servis, .a-dig).
export function badanSvg(p, tim, now) {
  const kulit = KULIT[p.kulit % 4], rambut = RAMBUT[p.rambut % 4], a = tim === 'A';
  const baju = a ? '#2F6BFF' : '#F4F1E8', celana = a ? '#14214D' : '#C0392B', garis = a ? '#FFC83D' : '#C0392B', tulis = a ? '#fff' : '#14214D', s = staminaSekarang(p, now);
  const lengan = k => { const x = k === 'k' ? 5 : 29; return `<g class="lengan ${k}"><rect x="${x}" y="25" width="6" height="19" rx="3" fill="${kulit}"/><rect x="${x}" y="24" width="6" height="8" rx="3" fill="${baju}"/></g>`; };
  return `<svg class="badan" viewBox="0 0 40 76" aria-hidden="true">${lengan('k')}${lengan('n')}
<rect x="14" y="52" width="5" height="19" rx="2.500" fill="${kulit}"/><rect x="21" y="52" width="5" height="19" rx="2.500" fill="${kulit}"/>
<rect x="13" y="68" width="7" height="5" rx="2" fill="#fff"/><rect x="20" y="68" width="7" height="5" rx="2" fill="#fff"/>
<path d="M11 44h18l1.500 12H21l-1-3-1 3H9.500z" fill="${celana}"/>
<path d="M10 25c0-3.500 4.500-5.500 10-5.500S30 21.500 30 25l-1 21H11z" fill="${baju}"/><rect x="10.500" y="40" width="19" height="2.500" fill="${garis}"/>
<rect x="17" y="17" width="6" height="5" fill="${kulit}"/><circle cx="20" cy="12" r="7.500" fill="${kulit}"/>
<path d="M12.500 11a7.500 7.500 0 0 1 15 0c-4-3-11-3-15 0z" fill="${rambut}"/>
<text x="20" y="35" text-anchor="middle" font-size="9" font-weight="800" fill="${tulis}" font-family="sans-serif">${ratingPemain(p)}</text></svg><i class="stm zona-${zonaStamina(s)}"><b style="width:${s.toFixed(0)}%"></b></i>`;
}

// Pemain di laga: gambar pose (assets/pose/) + bar stamina. Pose diganti lewat sprite.js (setPose).
export function badanGambar(p, tim, now) {
  const s = staminaSekarang(p, now);
  return `<span class="badan"><img class="sprite" data-tim="${tim}" data-pose="siap" src="${spriteSrc('siap', tim)}" alt="" draggable="false"></span><i class="stm zona-${zonaStamina(s)}"><b style="width:${s.toFixed(0)}%"></b></i>`;
}
// Identitas tim kita (diisi main.js lewat setIdentitasGambar): lambang dan warna jersey tampil di seluruh game.
export let LOGO = 'assets/logo/logo-garuda-muda.png';
let NAMA_SAYA = '', WARNA_SAYA = '#102A4A', KODE_LOGO = 'garuda-muda';
export function setIdentitasGambar(nama, id) { NAMA_SAYA = nama; WARNA_SAYA = id.warnaA; KODE_LOGO = id.logo; LOGO = `assets/logo/logo-${id.logo}.png`; }
export const logoTim = () => `<img class="logo-img" src="${LOGO}" alt="" draggable="false">`;

// Logo tiap tim lawan (nama tim -> berkas); tim sendiri atau nama lain memakai LOGO.
const LOGO_TIM = { 'Elang Sakti': 'elang', 'Badai Timur': 'petir', 'Macan Putih': 'singa', 'Naga Laut': 'naga', 'Rajawali': 'api', 'Banteng Muda': 'banteng', 'Cakra Biru': 'ombak' };
const LOGO_LIST = ['elang', 'petir', 'singa', 'naga', 'api', 'banteng', 'ombak'];
const hashNama = n => [...n].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
function kodeLogo(nama) {
  if (nama === NAMA_SAYA) return KODE_LOGO;
  let k = LOGO_TIM[nama] || LOGO_LIST[hashNama(nama) % 7];
  if (k === KODE_LOGO) k = LOGO_LIST[(LOGO_LIST.indexOf(k) + 1) % 7];   // lawan tidak memakai lambang yang sama dengan kita
  return k;
}
export const logoMini = nama => `<img class="logo-mini" src="assets/logo/logo-${kodeLogo(nama)}.png" alt="" draggable="false">`;
export const logoKode = k => `<img class="logo-mini" src="assets/logo/logo-${k}.png" alt="" draggable="false">`;
// Potret pemain: 12 wajah, dipilih tetap dari id pemain.
export const potret = p => `<img class="potret" src="assets/potret/p${String(([...String(p.id)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % 12) + 1).padStart(2, '0')}.png" alt="" draggable="false">`;
