// Pembantu gambar: ikon, avatar, cincin stamina, radar. Hanya menghasilkan HTML/SVG.
import { K, URUTAN_STAT, WARNA_STAT } from '../inti/konfigurasi.js';
import { staminaSekarang, zonaStamina } from '../sistem/stamina.js';
import { ratingPemain } from '../sistem/pemain.js';

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
  kembali: '<path d="M15 5l-7 7 7 7"/>'
};
export function ikon(nama, u = 20) {
  return `<svg class="ikon" width="${u}" height="${u}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IKON[nama] || ''}</svg>`;
}

const KULIT = ['#F1C9A5', '#E0A878', '#C68642', '#8D5524'];
const RAMBUT = ['#1B1B1B', '#3B2417', '#6B4423', '#B5651D'];
function isiAvatar(p, tim) {
  const baju = tim === 'A' ? '#102A4A' : '#F6F2E8', angka = tim === 'A' ? '#F6F2E8' : '#102A4A';
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
export function kartuMini(p, { tim = 'A', now, zona = 'lap', interaktif = true } = {}) {
  const tag = interaktif ? 'button' : 'div';
  const data = interaktif ? ` data-id="${p.id}" data-zona="${zona}"` : '';
  return `<${tag} class="kartu"${data} style="--w:${K.warnaPosisi[p.posisi]}">${figur(p, tim, now)}<i class="lencana">${p.posisi}</i><span class="nilai">${ratingPemain(p)}</span></${tag}>`;
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
