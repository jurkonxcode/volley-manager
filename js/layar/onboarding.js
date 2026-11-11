// Onboarding (v18): 4 slide sambutan sebelum layar Buat Klub. Hanya tampil sekali (kunci localStorage vm-onboard).
// Ilustrasi SVG buatan sendiri: garis krem ala sketsa tangan + isian koral/lime di atas latar malam.
import { ikon } from './gambar.js';

const KUNCI = 'vm-onboard';
const sudahLihat = () => { try { return localStorage.getItem(KUNCI) === '1'; } catch (e) { return false; } };
const tandai = () => { try { localStorage.setItem(KUNCI, '1'); } catch (e) {} };

// Percikan kecil dipakai di semua ilustrasi.
const kilau = (x, y, s = 1, w = 'var(--bola)') => `<path class="kl" transform="translate(${x} ${y}) scale(${s})" d="M0-9C1.200-3 3-1.200 9 0 3 1.200 1.200 3 0 9-1.200 3-3 1.200-9 0-3-1.200-1.200-3 0-9z" fill="${w}"/>`;

// 1) Sambutan: stadion malam + lampu sorot, lambang di tengah (gambar lambang dipasang lewat HTML di atasnya).
const SAMBUTAN = `<svg viewBox="0 0 320 240" aria-hidden="true">
<defs><linearGradient id="obBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C6FF3D" stop-opacity=".34"/><stop offset="1" stop-color="#C6FF3D" stop-opacity="0"/></linearGradient></defs>
<path d="M58 40L18 200h86z" fill="url(#obBeam)"/><path d="M262 40l40 160h-86z" fill="url(#obBeam)"/>
<g stroke="#F0EEE6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
<path d="M58 40v70M262 40v70"/><rect x="46" y="28" width="24" height="14" rx="3" fill="#C6FF3D"/><rect x="250" y="28" width="24" height="14" rx="3" fill="#C6FF3D"/>
<path d="M22 206C22 168 70 150 160 150s138 18 138 56z" fill="#121932"/>
<path d="M60 196c0-20 38-32 100-32s100 12 100 32" opacity=".5"/>
<path d="M10 206h300"/></g>
<g fill="#F0EEE6" opacity=".32"><rect x="82" y="174" width="14" height="3" rx="1.500"/><rect x="108" y="170" width="14" height="3" rx="1.500"/><rect x="134" y="168" width="14" height="3" rx="1.500"/><rect x="172" y="168" width="14" height="3" rx="1.500"/><rect x="198" y="170" width="14" height="3" rx="1.500"/><rect x="224" y="174" width="14" height="3" rx="1.500"/></g>
<ellipse cx="160" cy="208" rx="86" ry="9" fill="#D97757"/>${kilau(36, 92, 1.100)}${kilau(290, 74, .8, '#D97757')}${kilau(272, 130, .6)}${kilau(48, 140, .7, '#D97757')}</svg>`;

// 2) Taktik: papan strategi dengan 6 pemain dan panah serangan.
const TAKTIK = `<svg viewBox="0 0 320 240" aria-hidden="true">
<g stroke="#F0EEE6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
<rect x="40" y="36" width="240" height="176" rx="16" fill="#121932"/>
<rect x="124" y="26" width="72" height="22" rx="8" fill="#D97757"/>
<rect x="58" y="60" width="204" height="138" rx="8" fill="#0F1424" stroke-width="2" opacity=".95"/>
<path d="M58 129h204" stroke-dasharray="3 8" stroke-width="2.500"/><path d="M58 106h204M58 152h204" stroke-width="1.600" opacity=".35"/></g>
<g stroke="#070A14" stroke-width="2.500" font-family="Barlow Condensed,sans-serif" font-weight="800" font-size="13" text-anchor="middle">
<circle cx="102" cy="92" r="13" fill="#C6FF3D"/><circle cx="160" cy="92" r="13" fill="#C6FF3D"/><circle cx="218" cy="92" r="13" fill="#C6FF3D"/>
<circle cx="102" cy="168" r="13" fill="#D97757"/><circle cx="160" cy="168" r="13" fill="#D97757"/><circle cx="218" cy="168" r="13" fill="#D97757"/></g>
<g fill="#070A14" font-family="Barlow Condensed,sans-serif" font-weight="800" font-size="13" text-anchor="middle"><text x="102" y="97">4</text><text x="160" y="97">3</text><text x="218" y="97">2</text><text x="102" y="173">5</text><text x="160" y="173">6</text><text x="218" y="173">1</text></g>
<g fill="none" stroke="#F0EEE6" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 9"><path d="M168 154C196 140 214 124 214 108"/><path d="M110 154C112 136 116 120 126 106"/></g>
<path d="M214 106l-7 9m7-9l8 8" stroke="#F0EEE6" stroke-width="3.500" stroke-linecap="round" fill="none"/>
<path d="M126 104l-1 11m1-11l10 5" stroke="#F0EEE6" stroke-width="3.500" stroke-linecap="round" fill="none"/>
${kilau(298, 52, .9)}${kilau(24, 188, .8, '#D97757')}</svg>`;

// 3) Laga: net, bola melambung, lencana 3D.
const LAGA = `<svg viewBox="0 0 320 240" aria-hidden="true">
<path d="M18 204h284" stroke="#F0EEE6" stroke-width="3" stroke-linecap="round"/>
<g stroke="#F0EEE6" stroke-linecap="round" fill="none"><path d="M66 204V96M254 204V96" stroke-width="5"/>
<path d="M66 100h188v50H66z" fill="#121932" stroke-width="3"/>
<path d="M66 116h188M66 132h188M98 100v50M130 100v50M162 100v50M194 100v50M226 100v50" stroke-width="1.600" opacity=".42"/>
<path d="M66 100h188" stroke-width="6" stroke="#fff"/></g>
<path d="M36 186C74 100 150 44 224 62" fill="none" stroke="#D97757" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 10"/>
<g transform="translate(236 62)"><circle r="20" fill="#C6FF3D" stroke="#F0EEE6" stroke-width="3"/><path d="M-17-8C-4-3 4-3 17-8M-17 8C-4 3 4 3 17 8M0-20C-9-6-9 6 0 20" fill="none" stroke="#070A14" stroke-width="2.500" stroke-linecap="round"/></g>
<g transform="translate(246 172)" stroke="#F0EEE6" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M0-22l24 13v26L0 30-24 17V-9z" fill="#121932"/><path d="M0-22l24 13L0 4-24-9z" fill="#D97757"/><path d="M0 4v26" fill="none"/></g>
<g fill="#F0EEE6" opacity=".45"><circle cx="40" cy="222" r="5"/><circle cx="64" cy="224" r="5"/><circle cx="88" cy="222" r="5"/><circle cx="232" cy="224" r="5"/><circle cx="256" cy="222" r="5"/><circle cx="280" cy="224" r="5"/></g>
${kilau(40, 60, .9)}${kilau(284, 112, .7, '#D97757')}</svg>`;

// 4) Trofi: tiga anak tangga liga, trofi di puncak, panah naik.
const TROFI = `<svg viewBox="0 0 320 240" aria-hidden="true">
<g stroke="#F0EEE6" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
<path d="M28 208h264" fill="none"/>
<rect x="44" y="168" width="64" height="40" rx="6" fill="#121932"/><rect x="118" y="136" width="64" height="72" rx="6" fill="#182036"/><rect x="192" y="104" width="64" height="104" rx="6" fill="#1E2A4A"/>
<g fill="none" stroke-width="2.600" opacity=".7"><path d="M60 188h32M134 172h32M208 156h32"/></g>
<path d="M208 52h32v22c0 12-7 20-16 20s-16-8-16-20z" fill="#C6FF3D"/><path d="M208 58h-14v8c0 8 6 14 14 14M240 58h14v8c0 8-6 14-14 14" fill="none"/><path d="M224 94v10M212 104h24" fill="none"/></g>
<path d="M70 150C96 130 118 104 140 80" fill="none" stroke="#D97757" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 10"/>
<path d="M142 78l-14 2m14-2l-2 14" stroke="#D97757" stroke-width="4.500" stroke-linecap="round" fill="none"/>
${kilau(178, 52, 1.100, '#D97757')}${kilau(268, 84, .9)}${kilau(34, 112, .8)}${kilau(280, 150, .6, '#D97757')}</svg>`;

const SLIDE = [
  { gambar: SAMBUTAN, logo: true, judul: 'Bangun klub impianmu', teks: 'Dari lapangan kelurahan sampai juara liga.' },
  { gambar: TAKTIK, judul: 'Atur skuad & taktik', teks: 'Pilih enam pemain, formasi, dan gaya mainmu.' },
  { gambar: LAGA, judul: 'Tonton laga langsung', teks: 'Reli demi reli di lapangan 2D atau stadion 3D.' },
  { gambar: TROFI, judul: 'Naik liga, raih trofi', teks: 'Kembangkan stadion, akademi, dan fans.' }
];

// onSelesai dipanggil setelah onboarding ditutup (atau langsung bila sudah pernah dilihat).
export function bukaOnboarding(onSelesai, { paksa = false } = {}) {
  if (!paksa && sudahLihat()) return onSelesai();
  const el = document.createElement('div'); el.className = 'ob'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Selamat datang di Volley Manager');
  el.innerHTML = `<button type="button" class="ob-lewati" id="ob-lewati">Lewati</button>
<div class="ob-jalur" id="ob-jalur">${SLIDE.map((s, i) => `<section class="ob-slide" aria-label="${i + 1} dari ${SLIDE.length}">
<div class="ob-gbr${s.logo ? ' ada-logo' : ''}">${s.gambar}${s.logo ? '<img class="ob-logo" src="assets/brand/logo-mark.svg" alt="" draggable="false">' : ''}</div>
<h2>${s.judul}</h2><p>${s.teks}</p></section>`).join('')}</div>
<div class="ob-bawah"><div class="ob-titik" id="ob-titik">${SLIDE.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>
<button type="button" class="tombol-besar" id="ob-lanjut">Lanjut ${ikon('panah', 20)}</button></div>`;
  document.body.appendChild(el);
  const jalur = el.querySelector('#ob-jalur'), titik = [...el.querySelectorAll('#ob-titik i')], lanjut = el.querySelector('#ob-lanjut');
  const idx = () => Math.max(0, Math.min(SLIDE.length - 1, Math.round(jalur.scrollLeft / jalur.clientWidth)));
  const perbarui = () => {
    const i = idx(); titik.forEach((t, k) => t.classList.toggle('on', k === i));
    lanjut.innerHTML = i === SLIDE.length - 1 ? 'Buat klubku' : `Lanjut ${ikon('panah', 20)}`;
    el.querySelector('#ob-lewati').style.visibility = i === SLIDE.length - 1 ? 'hidden' : 'visible';
  };
  const tutup = () => { tandai(); el.remove(); onSelesai(); };
  jalur.addEventListener('scroll', () => requestAnimationFrame(perbarui), { passive: true });
  lanjut.onclick = () => { const i = idx(); if (i >= SLIDE.length - 1) return tutup(); jalur.scrollTo({ left: (i + 1) * jalur.clientWidth, behavior: 'smooth' }); };
  el.querySelector('#ob-lewati').onclick = tutup;
  titik.forEach((t, k) => t.onclick = () => jalur.scrollTo({ left: k * jalur.clientWidth, behavior: 'smooth' }));
}
