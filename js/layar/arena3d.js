// Tampilan 3D opsional untuk layar laga (Three.js). Three dimuat dari CDN saat pertama dipakai.
// Gagal dimuat / WebGL tidak ada => pemanggil kembali ke tampilan 2D. Logika game tidak berubah:
// modul ini hanya menggambar ulang hasil reli (lihat gambarRally di pertandingan.js).
import { createArena } from '../tiga-d/arena.js';
import { createPlayer } from '../tiga-d/player.js';
import { createPlayerGaya, RAMBUT_WARNA } from '../tiga-d/player-gaya.js';
import { muatAssetPack, ambilAset } from '../tiga-d/asset-pack.js';
import { muatModel, modelSiap, createPlayerGLB } from '../tiga-d/player-glb.js';
import { createVolleyball } from '../tiga-d/volleyball.js';
import { createSpikeEffect } from '../tiga-d/effects.js';
import { paskanKamera, percantikArena, pasangBayangan } from '../tiga-d/kamera-pro.js';

// true = pemain stylized berkerangka buatan kode (player-gaya.js); false = model FBX Kenney / pemain prosedural lama.
const GAYA = false;   // false = pemain dari model Kenney (assets/models/kenney/); true = pemain prosedural bergaya
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const KULIT = [0xF1C9A5, 0xE0A878, 0xC68642, 0x8D5524];
const WARNA = { A: 0xB51F35, B: 0x245A9A };
// Warna jersey 3D mengikuti warna klub (hex '#RRGGBB'); dipanggil dari main.js saat identitas dimuat/diganti.
export function setWarna3D(a, b) { WARNA.A = parseInt(a.slice(1), 16); WARNA.B = parseInt(b.slice(1), 16); }
// Slot 0-2 baris depan (dekat jaring), 3-5 belakang; kiri ke kanan seperti tampilan 2D.
const Z = [-3, 0, 3], X_DEPAN = 2.4, X_BELAKANG = 6.6;

let T = null, R = null, sc = null, cam = null, bola = null, wadah = null, ro = null, raf = 0, jam = 0;
let pemain = { A: [], B: [] }, tween = [], efek = [], bolaT = null;

export async function muatThree(batas = 9000) {
  if (T) return T;
  T = await Promise.race([import(THREE_URL), new Promise((_, no) => setTimeout(() => no(new Error('Three.js lambat dimuat')), batas))]);
  if (!GAYA) await muatModel(T).catch(e => console.warn('[GLB] model tidak dipakai, pakai pemain prosedural:', e.message));   // gagal => 2D/prosedural tetap jalan
  await muatAssetPack(T, ['volleyball', 'bench', 'bottle', 'netSystem']).catch(e => console.warn('[AssetPack] memakai aset prosedural:', e.message));   // bola/bangku/botol/net GLB; gagal => prosedural
  return T;
}

// Bila WebGL/pembuatan scene gagal di tengah jalan, semua dikembalikan ke kosong supaya percobaan berikutnya
// (atau fallback 2D) tidak memakai renderer setengah jadi.
function bangunRenderer() {
  if (R) return;
  try { rakitRenderer(); } catch (e) { try { R?.dispose(); } catch (_) {} R = sc = cam = bola = null; throw e; }
}
// Three.js tidak membebaskan memori GPU saat objek hanya dilepas dari scene: geometri, material, dan tekstur harus di-dispose.
function buang(o) {
  const tekstur = new Set();
  o.traverse(c => {
    if (!c.geometry?.userData.shared) c.geometry?.dispose();
    for (const m of [].concat(c.material || [])) {
      if (m.userData?.shared) continue;                       // material milik cache aset GLB / bersama
      for (const k of ['map', 'roughnessMap', 'metalnessMap', 'normalMap', 'aoMap', 'emissiveMap', 'alphaMap']) { const t = m[k]; if (t && !t.userData?.shared) tekstur.add(t); }
      m.dispose();
    }
  });
  tekstur.forEach(t => t.dispose());
}
function rakitRenderer() {
  R = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  // Konteks WebGL bisa hilang di HP (tab di latar, memori sempit): hentikan loop, lanjutkan bila dipulihkan.
  R.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); cancelAnimationFrame(raf); raf = 0; });
  R.domElement.addEventListener('webglcontextrestored', () => { if (wadah && !raf) { jam = performance.now(); raf = requestAnimationFrame(putar); } });
  R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35)); // batas aman untuk HP
  R.outputColorSpace = T.SRGBColorSpace;
  R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.12;
  R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
  sc = new T.Scene(); sc.background = new T.Color(0x101c2d); sc.fog = new T.Fog(0x101c2d, 48, 92);
  cam = new T.PerspectiveCamera(39, 1, .1, 150);
  sc.add(new T.HemisphereLight(0xd8eaff, 0x293348, 2.25));
  const kunci = new T.DirectionalLight(0xfff1d7, 2.65); kunci.position.set(-10, 21, 13); kunci.castShadow = true;
  kunci.shadow.mapSize.set(1024, 1024);
  Object.assign(kunci.shadow.camera, { left: -16, right: 16, top: 15, bottom: -15, near: 1, far: 55 }); kunci.shadow.camera.updateProjectionMatrix();
  kunci.shadow.bias = -0.00018; sc.add(kunci);
  const isi = new T.DirectionalLight(0x83baff, .85); isi.position.set(8, 12, -10); sc.add(isi);
  const rim = new T.DirectionalLight(0xffd28a, .55); rim.position.set(0, 10, 15); sc.add(rim);
  const arena = createArena(T, { sponsor: ['VOLLEY MANAGER', 'SPIKE SPORTS', 'COURT PRO', 'ACE ATHLETIC', 'NETPLAY', 'CHAMPION GEAR'] }); sc.add(arena); sc.userData.arena = arena; percantikArena(T, sc, arena);
  // Net + tiang + antena dari model "Volleyball Court" (mihail-pavel, CGTrader, Royalty Free) menggantikan net prosedural. GLB gagal dimuat => net prosedural tetap dipakai.
  const jaring = ambilAset('netSystem');
  if (jaring) {
    const lama = arena.getObjectByName('VolleyballNet'); if (lama) { arena.remove(lama); buang(lama); }
    jaring.name = 'AssetPack_NetSystem';
    jaring.traverse(o => { if (!o.isMesh) return; if (o.name === 'Net_Mesh') { o.castShadow = false; o.receiveShadow = false; } else if (o.name === 'Net_Cables') o.castShadow = false; });   // jaring tipis: tanpa bayangan agar tidak berkedip
    arena.add(jaring);
  }
  // Bangku tim + botol dari paket GLB (di luar lapangan, x=0 di antara blok kursi prosedural z=W+1.5, di depan papan LED z=7.0).
  const bangku = ambilAset('bench'); if (bangku) { bangku.name = 'AssetPack_TeamBench'; bangku.scale.setScalar(.82); bangku.position.set(0, .08, 6.0); sc.add(bangku); }
  for (const x of [-.62, .62]) { const b = ambilAset('bottle'); if (b) { b.scale.setScalar(.78); b.position.set(x, .08 + .70 * .82, 5.96); sc.add(b); } }   // dudukan bangku setinggi .70 x skala .82
  bola = ambilAset('volleyball') || createVolleyball(T, { radius: .22 }); bola.scale.multiplyScalar(2.1);   /* v25: JANGAN setScalar: menimpa skala model Mikasa (FBX) hingga bola sebesar layar */ bola.castShadow = true; sc.add(bola); pasangBayangan(T, sc, bola);
}

function bersihkanPemain() {
  for (const t of ['A', 'B']) { pemain[t].forEach(g => { sc.remove(g); buang(g); }); pemain[t] = []; }
  efek.forEach(e => { sc.remove(e); buang(e); }); efek = []; tween = []; bolaT = null;
}
function isiPemain(tim, daftar) {
  daftar.slice(0, 6).forEach((p, i) => {
    const depan = i < 3, opsi = { number: p.nomor, role: p.posisi, jerseyColor: WARNA[tim], skinColor: KULIT[(p.kulit ?? 0) % 4], facing: tim === 'A' ? 'left' : 'right' },
      g = GAYA ? createPlayerGaya(T, { ...opsi, hair: p.gaya ?? 0, hairColor: RAMBUT_WARNA[(p.rambut ?? 0) % 4] }) : modelSiap() ? createPlayerGLB(opsi) : createPlayer(T, opsi);
    // facing 'left' di starter memutar +90 derajat (hadap +X); 'right' hadap -X. Tim A di sisi -X menghadap jaring (+X).
    const x = (depan ? X_DEPAN : X_BELAKANG) * (tim === 'A' ? -1 : 1);
    g.position.set(x, .06, Z[i % 3]); g.userData.dasar = g.position.clone();
    sc.add(g); pemain[tim].push(g);   // castShadow sudah diatur di createPlayer (bagian kecil tidak membuat bayangan)
  });
}
function ukuran() {
  if (!wadah || !R) return;
  const w = wadah.clientWidth || 340, h = wadah.clientHeight || 300, asp = w / h;
  R.setSize(w, h, false); cam.aspect = asp;
  paskanKamera(T, cam, asp);
}

// Pasang canvas ke wadah dan isi pemain. Dipanggil tiap set dimulai (renderer dipakai ulang).
export function pasang(el, A, B) {
  bangunRenderer(); wadah = el;
  bersihkanPemain(); isiPemain('A', A); isiPemain('B', B);
  bola.position.set(-X_BELAKANG, 1.4, 0);
  el.appendChild(R.domElement); R.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:pan-y';
  ukuran(); ro?.disconnect(); ro = new ResizeObserver(ukuran); ro.observe(el);
  jam = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(putar);
}
// v25: papan skor gantung di arena mengikuti skor laga (sebelumnya selalu 0-0).
export function skor(a, b, na, nb, set) { try { sc?.userData.arena?.userData.setSkor?.(a, b, na, nb, set); } catch (e) {} }
export function lepas() { cancelAnimationFrame(raf); raf = 0; ro?.disconnect(); R?.domElement.remove(); wadah = null; }

const ease = t => t * t * (3 - 2 * t);
function putar(now) {
  if (!wadah || !wadah.isConnected) return lepas();   // layar sudah berganti: hentikan loop (hemat baterai)
  raf = requestAnimationFrame(putar);
  const dt = Math.min((now - jam) / 1000, .05); jam = now;
  for (let i = tween.length - 1; i >= 0; i--) { const w = tween[i]; if (w.tunda > 0) { w.tunda -= dt; continue; } if (w.mulai) { w.mulai(); w.mulai = null; } w.t += dt; const k = Math.min(w.t / w.d, 1); w.f(k); if (k >= 1) { const j = tween.indexOf(w); if (j >= 0) tween.splice(j, 1); } }
  for (let i = efek.length - 1; i >= 0; i--) if (!efek[i].userData.update(dt)) { sc.remove(efek[i]); buang(efek[i]); efek.splice(i, 1); }
  for (const t of ['A', 'B']) for (const g of pemain[t]) g.userData.mixer?.update(dt);
  bola.rotation.x += dt * 8; bola.rotation.z += dt * 5;
  sc.userData.arena?.userData.update?.(dt);
  R.render(sc, cam);
}
const anim = (d, f, tunda = 0, mulai = null) => { const w = { t: 0, d, f, tunda, mulai }; tween.push(w); return w; };
function lompat(g, tinggi = 1.1, d = .5, tunda = 0, aksi = 'lompat') {   // aksi = nama klip animasi pemain berkerangka
  anim(d, k => { g.position.y = g.userData.dasar.y + Math.sin(k * Math.PI) * tinggi; }, tunda, () => g.userData.main?.(aksi, d));
}
function jongkok(g, d = .45, tunda = 0) {   // tidak menyentuh position.y: bisa bentrok dengan lompat
  anim(d, k => { if (!g.userData.rig) g.scale.y = 1 - Math.sin(k * Math.PI) * .16; }, tunda, () => g.userData.main?.('terima', d));
}
// Setelah poin: dua pemain pencetak merayakan (lompat kecil), dua pemain lawan kecewa.
function reaksi(menang, kalah) {
  const acak = (a, n) => [...a].sort(() => Math.random() - .5).slice(0, n);
  acak(pemain[menang], 2).forEach(g => lompat(g, .35, .9, Math.random() * .2, 'rayakan'));
  acak(pemain[kalah], 2).forEach(g => anim(.01, () => {}, Math.random() * .25, () => g.userData.main?.('kecewa')));
}
function terbang(dari, ke, tinggi, d, selesai) {
  const a = dari.clone(), b = ke.clone();
  // Reli berikutnya datang tiap ~150 ms, lebih cepat dari durasi terbang: gerakan bola lama dibatalkan supaya tidak menimpa yang baru.
  if (bolaT) { const i = tween.indexOf(bolaT); if (i >= 0) tween.splice(i, 1); }
  bolaT = anim(d, k => { const e = ease(k); bola.position.set(a.x + (b.x - a.x) * e, a.y + (b.y - a.y) * e + Math.sin(k * Math.PI) * tinggi, a.z + (b.z - a.z) * e); if (k >= 1 && selesai) selesai(); });
}
const pil = a => a[Math.floor(Math.random() * a.length)];

// r = { a, jenis: 'ace' | 'blok' | 'smash' | 'salah', ti, pi, qi } (dari mainkanSet). k = skala waktu (1 = normal ~2.4 dtk per reli, .5 = 2x).
// Reli digambar bertahap: servis -> terima -> umpan -> serangan -> bola mendarat, supaya terbaca seperti pertandingan sungguhan.
let reliId = 0;
export function reli(r, k = 1) {
  if (sc?.userData.arena) sc.userData.arena.userData.hype = 1;
  if (!R || !wadah) return;
  const my = ++reliId, batal = () => my !== reliId;
  const sk = r.a ? 'A' : 'B', ls = r.a ? 'B' : 'A', arah = r.a ? 1 : -1;   // arah +1: bola menuju sisi B (+X)
  const depan = t => pemain[t].slice(0, 3), belakang = t => pemain[t].slice(3);
  const mendarat = new T.Vector3(arah * (2 + Math.random() * 6.5), .25, (Math.random() - .5) * 7.4);
  const ada = (t, i) => (i != null ? pemain[t][i] : null);
  const dr = r.ti === sk ? ada(sk, r.pi) : null;
  const pos = (g, y) => g.position.clone().setY(y);

  if (r.jenis === 'salah') {
    const servis = r.pi >= 3, s = ada(ls, r.pi) || pil(servis ? belakang(ls) : depan(ls));
    lompat(s, servis ? .5 : 1.15, .7 * k, 0, servis ? 'servis' : 'smash');
    mendarat.set(-arah * (1 + Math.random() * 8.5), .25, (Math.random() < .5 ? -1 : 1) * (4.9 + Math.random() * .4));   // keluar garis samping (papan LED di z=±5.5)
    jongkok(ada(sk, r.qi) || pil(belakang(sk)), .6 * k, .4 * k);
    return terbang(pos(s, servis ? 2.2 : 3.1), mendarat, servis ? 3.2 : .8, (servis ? 1.1 : .7) * k, () => { if (!batal()) reaksi(sk, ls); });
  }
  if (r.jenis === 'ace') {
    const s = dr || pil(belakang(sk)); lompat(s, .5, .7 * k, 0, 'servis');
    jongkok(pil(belakang(ls)), .6 * k, .5 * k);
    return terbang(pos(s, 2.2), mendarat, 3.2, 1.1 * k, () => { if (!batal()) reaksi(sk, ls); });
  }
  // Smash / blok: lawan (ls) melayani, sk menerima, mengumpan, lalu menyerang.
  const srv = pil(belakang(ls)), rcv = pil(belakang(sk)), setter = depan(sk)[1] || depan(sk)[0], atk = (dr && r.pi < 3 ? dr : null) || pil([depan(sk)[0], depan(sk)[2]].filter(Boolean));
  const bertahan = ada(ls, r.ti === sk ? r.qi : r.pi) || pil(belakang(ls));
  const t1 = .8 * k, t2 = .5 * k, t3 = .45 * k, t4 = .3 * k;
  lompat(srv, .45, .55 * k, 0, 'servis');
  jongkok(rcv, .6 * k, t1 * .55);
  const selesaiSpike = () => {
    if (batal()) return;
    if (r.jenis === 'blok') {
      depan(ls).slice(0, 2).forEach(g => lompat(g, 1.0, .5 * k, 0, 'blok'));
      mendarat.set(arah * (1.2 + Math.random() * 1.2), .25, (Math.random() - .5) * 6);   // bola dipantulkan jatuh di sisi penyerang
    }
    const fx = createSpikeEffect(T, new T.Vector3(0, 2.7, atk.position.z * .6)); sc.add(fx); efek.push(fx);
    if (r.jenis !== 'blok') jongkok(bertahan, .5 * k, 0);
    terbang(pos(atk, 3.1), mendarat, .8, t4, () => { if (!batal()) reaksi(sk, ls); });
  };
  terbang(pos(srv, 2.2), pos(rcv, .9), 3.2, t1, () => {                                 // servis
    if (batal()) return;
    lompat(atk, 1.15, (t3 + t4 + .1) * 1.4, t2 * .2, 'smash');
    if (setter !== atk) setter.userData.main?.('umpan', t2 + .2 * k);
    terbang(pos(rcv, .9), pos(setter, 2.4), 1.8, t2, () => {                            // terima
      if (batal()) return;
      terbang(pos(setter, 2.4), pos(atk, 2.9), 1.1, t3, selesaiSpike);                   // umpan lalu serangan
    });
  });
}
