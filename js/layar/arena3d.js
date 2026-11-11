// Tampilan 3D opsional untuk layar laga (Three.js). Three dimuat dari CDN saat pertama dipakai.
// Gagal dimuat / WebGL tidak ada => pemanggil kembali ke tampilan 2D. Logika game tidak berubah:
// modul ini hanya menggambar ulang hasil reli (lihat gambarRally di pertandingan.js).
import { createArena } from '../tiga-d/arena.js';
import { createPlayer } from '../tiga-d/player.js';
import { createVolleyball } from '../tiga-d/volleyball.js';
import { createSpikeEffect } from '../tiga-d/effects.js';

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const KULIT = [0xF1C9A5, 0xE0A878, 0xC68642, 0x8D5524];
const WARNA = { A: 0x2F6BFF, B: 0xB51F35 };
// Slot 0-2 baris depan (dekat jaring), 3-5 belakang; kiri ke kanan seperti tampilan 2D.
const Z = [-3, 0, 3], X_DEPAN = 2.4, X_BELAKANG = 6.6;

let T = null, R = null, sc = null, cam = null, bola = null, wadah = null, ro = null, raf = 0, jam = 0;
let pemain = { A: [], B: [] }, tween = [], efek = [], bolaT = null;

export async function muatThree(batas = 9000) {
  if (T) return T;
  T = await Promise.race([import(THREE_URL), new Promise((_, no) => setTimeout(() => no(new Error('Three.js lambat dimuat')), batas))]);
  return T;
}

function bangunRenderer() {
  if (R) return;
  R = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));   // HP: jangan lebih dari 1.5
  R.shadowMap.enabled = true; R.shadowMap.type = T.PCFShadowMap;
  sc = new T.Scene(); sc.background = new T.Color(0x081426); sc.fog = new T.Fog(0x081426, 38, 80);
  cam = new T.PerspectiveCamera(42, 1, .1, 120);
  sc.add(new T.HemisphereLight(0xc8e4ff, 0x172238, 2.1));
  const kunci = new T.DirectionalLight(0xffffff, 2.2); kunci.position.set(-8, 18, 10); kunci.castShadow = true;
  kunci.shadow.mapSize.set(1024, 1024);
  Object.assign(kunci.shadow.camera, { left: -14, right: 14, top: 12, bottom: -12 }); kunci.shadow.camera.updateProjectionMatrix();
  sc.add(kunci);
  sc.add(createArena(T, { woodColor: 0xE0914A }));
  bola = createVolleyball(T, { radius: .22 }); bola.scale.setScalar(1.7); bola.castShadow = true; sc.add(bola);
}

function bersihkanPemain() {
  for (const t of ['A', 'B']) { pemain[t].forEach(g => sc.remove(g)); pemain[t] = []; }
  efek.forEach(e => sc.remove(e)); efek = []; tween = [];
}
function isiPemain(tim, daftar) {
  daftar.slice(0, 6).forEach((p, i) => {
    const depan = i < 3, g = createPlayer(T, { number: p.nomor, role: p.posisi, jerseyColor: WARNA[tim], skinColor: KULIT[(p.kulit ?? 0) % 4], facing: tim === 'A' ? 'left' : 'right' });
    // facing 'left' di starter memutar +90 derajat (hadap +X); 'right' hadap -X. Tim A di sisi -X menghadap jaring (+X).
    const x = (depan ? X_DEPAN : X_BELAKANG) * (tim === 'A' ? -1 : 1);
    g.position.set(x, .06, Z[i % 3]); g.userData.dasar = g.position.clone();
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    sc.add(g); pemain[tim].push(g);
  });
}
function ukuran() {
  if (!wadah || !R) return;
  const w = wadah.clientWidth || 340, h = wadah.clientHeight || 300, asp = w / h;
  R.setSize(w, h, false); cam.aspect = asp;
  const jarak = asp < 1.25 ? 25 + (1.25 - asp) * 14 : 24;   // layar sempit: mundur supaya lapangan muat
  cam.position.set(-jarak * .82, jarak * .52, 0); cam.lookAt(2, .6, 0); cam.updateProjectionMatrix();
}

// Pasang canvas ke wadah dan isi pemain. Dipanggil tiap set dimulai (renderer dipakai ulang).
export function pasang(el, A, B) {
  bangunRenderer(); wadah = el;
  bersihkanPemain(); isiPemain('A', A); isiPemain('B', B);
  bola.position.set(-X_BELAKANG, 1.4, 0);
  el.appendChild(R.domElement); R.domElement.style.cssText = 'width:100%;height:100%;display:block';
  ukuran(); ro?.disconnect(); ro = new ResizeObserver(ukuran); ro.observe(el);
  jam = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(putar);
}
export function lepas() { cancelAnimationFrame(raf); raf = 0; ro?.disconnect(); R?.domElement.remove(); wadah = null; }

const ease = t => t * t * (3 - 2 * t);
function putar(now) {
  if (!wadah || !wadah.isConnected) return lepas();   // layar sudah berganti: hentikan loop (hemat baterai)
  raf = requestAnimationFrame(putar);
  const dt = Math.min((now - jam) / 1000, .05); jam = now;
  for (let i = tween.length - 1; i >= 0; i--) { const w = tween[i]; w.t += dt; const k = Math.min(w.t / w.d, 1); w.f(k); if (k >= 1) tween.splice(i, 1); }
  for (let i = efek.length - 1; i >= 0; i--) if (!efek[i].userData.update(dt)) { sc.remove(efek[i]); efek.splice(i, 1); }
  bola.rotation.x += dt * 8; bola.rotation.z += dt * 5;
  R.render(sc, cam);
}
const anim = (d, f) => tween.push({ t: 0, d, f });
function lompat(g, tinggi = 1.1, d = .5) { anim(d, k => { g.position.y = g.userData.dasar.y + Math.sin(k * Math.PI) * tinggi; }); }
function jongkok(g, d = .45) { anim(d, k => { g.scale.y = 1 - Math.sin(k * Math.PI) * .16; g.position.y = g.userData.dasar.y; }); }
function terbang(dari, ke, tinggi, d, selesai) {
  const a = dari.clone(), b = ke.clone();
  anim(d, k => { const e = ease(k); bola.position.set(a.x + (b.x - a.x) * e, a.y + (b.y - a.y) * e + Math.sin(k * Math.PI) * tinggi, a.z + (b.z - a.z) * e); if (k >= 1 && selesai) selesai(); });
}
const pil = a => a[Math.floor(Math.random() * a.length)];

// r = { a: true bila tim saya mencetak poin, jenis: 'ace' | 'blok' | 'smash' | 'salah' } (dari mainkanSet).
export function reli(r) {
  if (!R || !wadah) return;
  const sk = r.a ? 'A' : 'B', ls = r.a ? 'B' : 'A', arah = r.a ? 1 : -1;   // arah +1: bola menuju sisi B (+X)
  const depan = t => pemain[t].slice(0, 3), belakang = t => pemain[t].slice(3);
  const mendarat = new T.Vector3(arah * (2 + Math.random() * 6.5), .25, (Math.random() - .5) * 7.4);
  let mulai;
  if (r.jenis === 'ace') { const s = pil(belakang(sk)); lompat(s, .5, .5); mulai = s.position.clone().setY(2.2); }
  else { const s = pil(depan(sk)); lompat(s, 1.15, .55); mulai = s.position.clone().setY(3.1); }
  if (r.jenis === 'blok') { depan(ls).slice(0, 2).forEach(g => lompat(g, 1.0, .5)); mendarat.set(-arah * (1.2 + Math.random() * 1.2), .25, (Math.random() - .5) * 6); }
  else jongkok(pil(belakang(ls)));
  if (r.jenis === 'smash' || r.jenis === 'blok') { const fx = createSpikeEffect(T, new T.Vector3(0, 2.7, mulai.z * .6)); sc.add(fx); efek.push(fx); }
  terbang(mulai, mendarat, r.jenis === 'ace' ? 3.2 : .8, r.jenis === 'ace' ? .38 : .26);
}
