// Pemain 3D "gaya" (stylized) berkerangka, seluruhnya dibuat dari kode (tanpa file model).
// Konvensi sama dengan player.js: pusat grup di telapak kaki, depan = +Z, facing 'left'/'right' memutar Y.
// Rangka: hips > spine > (bahu > siku) x2, leher > kepala; hips > paha > lutut > kaki x2.
// Animasi = pose per sendi (kanal di KANAL) yang dicampur halus; arena memanggil g.userData.main(nama, durasi).
// Konvensi sudut: lengan/tungkai menggantung ke -Y. rotation.x NEGATIF = ayun ke depan (+Z); lutut/siku: x positif = tekuk belakang.

const KANAL = ['rootY', 'sp', 'twist', 'hd', 'aRx', 'aRz', 'aRy', 'aLx', 'aLz', 'aLy', 'eR', 'eL', 'lRx', 'lRz', 'lLx', 'lLz', 'kR', 'kL'];
const IDX = Object.fromEntries(KANAL.map((k, i) => [k, i]));
const PINGGUL = .98;                                          // tinggi pinggul saat berdiri tegak
// Jongkok sambil telapak tetap menapak: paha maju th, lutut menekuk 2*th (paha dan betis sama panjang .45).
const sq = th => ({ rootY: -.9 * (1 - Math.cos(th)), lRx: -th, lLx: -th, kR: 2 * th, kL: 2 * th });
// Posisi siaga: lutut sedikit tekuk, lengan rileks di depan paha.
const IDLE = { ...sq(.22), sp: .1, hd: -.08, aRx: -.5, aLx: -.5, aRz: .25, aLz: .25, eR: -.8, eL: -.8, lRz: .1, lLz: .1 };

const vec = (p = {}) => { const v = new Float32Array(KANAL.length); for (const k in IDLE) v[IDX[k]] = IDLE[k]; for (const k in p) v[IDX[k]] = p[k]; return v; };
const lengan = (x, z, e, y = 0) => ({ aRx: x, aLx: x, aRz: z, aLz: z, eR: e, eL: e, aRy: y, aLy: y });

// Klip: durasi asli (dtk) + kunci [waktu 0..1, pose sebagian]. Kanal yang tak disebut kembali ke IDLE.
const KLIP = {
  // Terima/dig: turun rendah, kedua lengan lurus menyatu (platform).
  terima: { d: .7, k: [[0, {}], [.3, { ...sq(.72), sp: .5, hd: .25, ...lengan(-.95, -.1, -.05) }], [.7, { ...sq(.72), sp: .5, hd: .25, ...lengan(-.8, -.1, -.05) }], [1, {}]] },
  // Lompat umum: tekuk, meluncur lurus, lutut ditarik di udara, mendarat.
  lompat: { d: .55, k: [[0, { ...sq(.55), sp: .3, ...lengan(.45, .1, -.2) }], [.25, { ...sq(.05), ...lengan(-2.7, .25, -.2) }], [.55, { ...sq(.05), kR: .9, kL: .9, lRx: -.45, lLx: -.45, ...lengan(-2.5, .3, -.2) }], [1, { ...sq(.5), sp: .2, ...lengan(-.4, .2, -.7) }]] },
  // Servis loncat: lempar bola, ayun lengan kanan di atas kepala (puncak pukulan ~30%).
  servis: { d: .6, k: [[0, { ...sq(.5), sp: .15, aLx: -2.5, aLz: .15, eL: -.1, aRx: -.2, aRz: .5, eR: -1.2 }], [.28, { ...sq(.05), sp: -.18, hd: -.3, aLx: -2.6, aLz: .15, eL: -.1, aRx: -2.9, aRz: .2, eR: -.1 }], [.5, { ...sq(.08), sp: .35, hd: .1, aLx: -.8, aLz: .3, eL: -.7, aRx: -.6, aRz: .25, eR: -.4 }], [1, { ...sq(.4), sp: .2 }]] },
  // Umpan (set): dua tangan di atas dahi, dorong ke atas lewat ekstensi lutut.
  umpan: { d: .6, k: [[0, { ...sq(.4), sp: .1, ...lengan(-2.2, .45, -1.5) }], [.35, { ...sq(.45), sp: .08, hd: -.25, ...lengan(-2.3, .42, -1.7) }], [.6, { ...sq(.05), sp: -.05, hd: -.3, ...lengan(-2.8, .3, -.2) }], [1, { ...sq(.3) }]] },
  // Smash: ayun lengan ke belakang, busur punggung, pukul ke depan-bawah di ~70%.
  smash: { d: .85, k: [[0, { ...sq(.6), sp: .25, ...lengan(.5, .1, -.2) }], [.28, { ...sq(.05), sp: -.3, hd: -.3, aLx: -2.6, aLz: .2, eL: -.15, aRx: -1.9, aRz: 1.3, aRy: 1.2, eR: -1.5 }], [.5, { ...sq(.05), sp: -.38, hd: -.3, aLx: -2.0, aLz: .2, eL: -.3, aRx: -2.0, aRz: 1.4, aRy: 1.3, eR: -1.7 }], [.7, { ...sq(.08), sp: .55, hd: .15, aLx: -.7, aLz: .3, eL: -.9, aRx: -2.85, aRz: .15, aRy: 0, eR: -.1 }], [.85, { ...sq(.2), sp: .35, aLx: -.4, aLz: .3, eL: -.8, aRx: -.9, aRz: .2, aRy: 0, eR: -.5 }], [1, { ...sq(.5), sp: .2, aRx: -.4 }]] },
  // Blok: lengan lurus ke atas melewati jaring, telapak ke depan.
  blok: { d: .6, k: [[0, { ...sq(.6), sp: .2, ...lengan(.3, .1, -.1) }], [.18, { ...sq(.1), ...lengan(-2.4, .2, -.1) }], [.5, { ...sq(.04), hd: -.05, sp: .08, ...lengan(-2.95, .16, 0) }], [.8, { ...sq(.1), ...lengan(-2.85, .16, 0) }], [1, { ...sq(.55), sp: .25, ...lengan(-.6, .2, -.5) }]] },
  // Selebrasi: lompat kecil dengan kedua tangan membentuk V.
  rayakan: { d: 1.1, k: [[0, {}], [.2, { ...sq(.45), ...lengan(-.3, .3, -.3) }], [.45, { ...sq(.03), sp: -.12, hd: -.25, ...lengan(-2.6, 1.1, -.1) }], [.8, { ...sq(.15), sp: -.05, hd: -.2, ...lengan(-2.5, 1.2, -.1) }], [1, {}]] },
  // Kecewa: bahu merosot, kepala tertunduk, tangan ke pinggang.
  kecewa: { d: 1.2, k: [[0, {}], [.3, { ...sq(.1), sp: .5, hd: .5, ...lengan(-.1, .1, -.3) }], [.8, { ...sq(.1), sp: .5, hd: .5, ...lengan(-.1, .1, -.3) }], [1, {}]] }
};
for (const n in KLIP) KLIP[n].v = KLIP[n].k.map(([t, p]) => [t, vec(p)]);

const ease = t => t * t * (3 - 2 * t);
function contoh(klip, u, out) {                     // u 0..1 -> pose (interpolasi halus antar kunci)
  const ks = klip.v; let i = 0; while (i < ks.length - 2 && u > ks[i + 1][0]) i++;
  const [t0, a] = ks[i], [t1, b] = ks[i + 1], k = ease(Math.max(0, Math.min(1, (u - t0) / (t1 - t0 || 1))));
  for (let c = 0; c < out.length; c++) out[c] = a[c] + (b[c] - a[c]) * k;
}

// Geometri dibagi antar pemain (userData.shared => tidak di-dispose oleh arena3d.buang).
const GEO = new Map();
const geo = (kunci, buat) => { let g = GEO.get(kunci); if (!g) { g = buat(); g.userData.shared = true; GEO.set(kunci, g); } return g; };
let GARIS = null;                                   // material garis tepi bersama (inverted hull)

export const RAMBUT_WARNA = [0x1B1B1B, 0x3B2417, 0x6B4423, 0xB5651D];

export function createPlayerGaya(THREE, options = {}) {
  const root = new THREE.Group(); root.name = `Player_${options.number ?? 7}`;
  const warnaJersey = options.role === 'L' ? 0xF2C230 : (options.jerseyColor ?? 0xb51f35);   // libero memakai warna kontras
  const std = (c, r = .7) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0 });
  // Celana & sepatu mengikuti warna jersey (lebih gelap) seperti di sample; libero tetap gelap netral.
  const cJ = new THREE.Color(warnaJersey), libero = options.role === 'L';
  const warnaCelana = options.shortsColor ?? (libero ? 0x171d28 : cJ.clone().multiplyScalar(.78).getHex());
  const warnaSepatu = options.shoeColor ?? (libero ? 0x222a35 : cJ.clone().multiplyScalar(.7).getHex());
  const jersey = std(warnaJersey, .6), celana = std(warnaCelana, .75), kulit = std(options.skinColor ?? 0xe6b18d, .8),
    sepatu = std(warnaSepatu, .55), sol = std(0xf4f6f9, .6), kaos = std(0xf4f6f9, .75), putih = std(0xf7f9fc, .6),
    rambut = std(options.hairColor ?? 0x3b2417, .85), pelindung = std(0x2b3345, .8), mata = new THREE.MeshBasicMaterial({ color: 0x111622 }),
    mataPutih = new THREE.MeshBasicMaterial({ color: 0xffffff }), alis = new THREE.MeshBasicMaterial({ color: 0x2a1a12 }),
    mulutM = new THREE.MeshBasicMaterial({ color: 0x7a1f2b, side: THREE.DoubleSide }), karet = std(options.pita ?? 0x26c6b8, .6);
  GARIS ??= new THREE.MeshBasicMaterial({ color: 0x0b0f1a, side: THREE.BackSide });
  const garisTipis = options.garis !== false;

  const sendi = (induk, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); induk.add(g); return g; };
  // part(): mesh + (opsional) garis tepi. `lingkar` = pelebaran garis tepi dalam meter.
  const part = (g, m, induk, [x, y, z] = [0, 0, 0], { s = [1, 1, 1], bayang = true, garis = false, lebar = .022 } = {}) => {
    const me = new THREE.Mesh(g, m); me.position.set(x, y, z); me.scale.set(...s); me.castShadow = bayang; me.receiveShadow = true; induk.add(me);
    if (garis && garisTipis) { const o = new THREE.Mesh(g, GARIS); const bb = g.boundingBox || (g.computeBoundingBox(), g.boundingBox), sz = bb.getSize(new THREE.Vector3()); o.scale.set(1 + lebar * 2 / Math.max(sz.x * s[0], .01), 1 + lebar * 2 / Math.max(sz.y * s[1], .01), 1 + lebar * 2 / Math.max(sz.z * s[2], .01)); o.castShadow = false; o.receiveShadow = false; me.add(o); }
    return me;
  };
  const kapsul = (r, p) => geo(`k${r}_${p}`, () => new THREE.CapsuleGeometry(r, p, 4, 10));
  const bola = r => geo(`s${r}`, () => new THREE.SphereGeometry(r, 14, 10));
  const silinder = (a, b, h) => geo(`c${a}_${b}_${h}`, () => new THREE.CylinderGeometry(a, b, h, 12));

  // ---- Pinggul + celana ----
  const hips = sendi(root, 0, PINGGUL, 0);
  part(silinder(.2, .185, .3), celana, hips, [0, .02, 0], { s: [1.15, 1, .8], garis: true });
  // ---- Tungkai ----
  const kaki = [];
  for (const sisi of [1, -1]) {
    const paha = sendi(hips, sisi * .135, -.02, 0);
    part(kapsul(.1, .26), kulit, paha, [0, -.22, 0], { garis: true });
    part(silinder(.108, .1, .14), celana, paha, [0, -.06, 0], { bayang: false });
    const lutut = sendi(paha, 0, -.45, 0);
    part(kapsul(.075, .28), kulit, lutut, [0, -.22, 0], { garis: true });
    part(bola(.1), pelindung, lutut, [0, 0, .035], { s: [.95, .85, .6], bayang: false });
    part(silinder(.08, .085, .22), kaos, lutut, [0, -.31, 0], { bayang: false });
    const telapak = sendi(lutut, 0, -.45, 0);
    part(geo('sepatu', () => new THREE.BoxGeometry(.2, .12, .34)), sepatu, telapak, [0, -.03, .07], { garis: true, lebar: .015 });
    part(geo('sol', () => new THREE.BoxGeometry(.205, .03, .345)), sol, telapak, [0, -.085, .07], { bayang: false });
    part(geo('sepatuAksen', () => new THREE.BoxGeometry(.206, .035, .15)), putih, telapak, [0, -.02, .09], { bayang: false });   // aksen putih di sisi sepatu
    kaki.push({ paha, lutut, telapak });
  }
  // ---- Badan atas ----
  const spine = sendi(hips, 0, .12, 0);
  const dada = part(kapsul(.2, .3), jersey, spine, [0, .3, 0], { s: [1.14, 1, .78], garis: true, lebar: .025 });
  part(silinder(.22, .2, .12), jersey, spine, [0, .02, 0], { s: [1.1, 1, .8], bayang: false });
  part(silinder(.226, .224, .035), putih, spine, [0, -.035, 0], { s: [1.1, 1, .8], bayang: false });     // list putih ujung jersey
  const kerah = part(geo('kerah', () => new THREE.TorusGeometry(.095, .018, 6, 16)), putih, spine, [0, .625, .01], { s: [1.15, 1, 1], bayang: false });
  kerah.rotation.x = Math.PI / 2;                                                                         // kerah putih
  // Nomor punggung dari kanvas (tajam di semua ukuran); tim A terlihat dari belakang.
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const cx = cv.getContext('2d');
  cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.font = '900 92px Arial'; cx.lineWidth = 8; cx.strokeStyle = 'rgba(12,16,26,.7)';
  const no = String(options.number ?? 7); cx.strokeText(no, 64, 68); cx.fillStyle = '#fffdf5'; cx.fillText(no, 64, 68);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const matNo = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
  const bidang = geo('no', () => new THREE.PlaneGeometry(.26, .26));
  const noDepan = part(bidang, matNo, spine, [0, .33, .176], { bayang: false }), noBelakang = part(bidang, matNo, spine, [0, .33, -.176], { bayang: false });
  noBelakang.rotation.y = Math.PI;
  // Lengan
  const lengan = [];
  for (const sisi of [1, -1]) {
    const bahu = sendi(spine, sisi * .31, .5, 0); bahu.rotation.order = 'ZXY';
    part(bola(.12), jersey, bahu, [0, 0, 0], { s: [1, .9, .95] });
    part(kapsul(.072, .2), kulit, bahu, [0, -.2, 0], { garis: true });
    part(silinder(.1, .112, .15), jersey, bahu, [0, -.1, 0], { bayang: false });
    part(silinder(.114, .115, .025), putih, bahu, [0, -.165, 0], { bayang: false });                      // list putih ujung lengan
    const siku = sendi(bahu, 0, -.34, 0);
    part(kapsul(.058, .22), kulit, siku, [0, -.17, 0], { garis: true });
    const tangan = part(bola(.075), kulit, siku, [0, -.37, .01], { s: [.85, 1.1, .75], bayang: false });
    lengan.push({ bahu, siku });
  }
  // Kepala: leher + kepala besar sedikit dilebihkan (proporsi game olahraga) + rambut + mata.
  const leher = sendi(spine, 0, .58, 0);
  part(silinder(.07, .085, .14), kulit, leher, [0, .04, 0], { bayang: false });
  const kepala = part(bola(.21), kulit, leher, [0, .22, 0], { s: [.92, 1.02, .94], garis: true, lebar: .02 });
  for (const sisi of [-1, 1]) {
    part(bola(.03), mataPutih, kepala, [sisi * .075, .02, .19], { s: [.9, 1.15, .45], bayang: false });
    part(bola(.018), mata, kepala, [sisi * .075, .02, .2], { s: [.8, 1.1, .4], bayang: false });
    const ab = part(geo('alis', () => new THREE.CapsuleGeometry(.008, .05, 3, 6)), alis, kepala, [sisi * .075, .075, .172], { bayang: false });
    ab.rotation.z = Math.PI / 2 + sisi * .15;                                                              // alis sedikit naik di ujung luar
    part(bola(.034), kulit, kepala, [sisi * .185, 0, 0], { s: [.5, 1, .7], bayang: false });
  }
  const mulut = part(geo('mulut', () => new THREE.CircleGeometry(.05, 14, Math.PI, Math.PI)), mulutM, kepala, [0, -.045, .182], { bayang: false });
  mulut.rotation.x = .25;                                                                                  // senyum lebar terbuka
  const gaya = (options.hair ?? 0) % 3;
  part(bola(.215), rambut, kepala, [0, .045, -.02], { s: [.98, .82, 1], bayang: false });
  let kuncir = null;
  if (gaya === 0) {                                                                                         // gaya sample: poni + kuncir kuda berikat toska
    part(geo('poni', () => new THREE.SphereGeometry(.222, 14, 8, Math.PI / 2 - 1.0, 2.0, .55, .75)), rambut, kepala, [0, .02, 0], { s: [.95, 1, .97], bayang: false });
    kuncir = sendi(kepala, 0, .13, -.2);
    part(kapsul(.055, .22), rambut, kuncir, [0, -.16, -.01], { bayang: false });
    part(silinder(.052, .052, .045), karet, kuncir, [0, -.015, 0], { bayang: false });
  }
  if (gaya === 1) for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, c = part(geo('cone', () => new THREE.ConeGeometry(.055, .15, 6)), rambut, kepala, [Math.cos(a) * .12, .2, Math.sin(a) * .1], { bayang: false }); c.rotation.z = -Math.cos(a) * .5; c.rotation.x = Math.sin(a) * .4; }
  if (gaya === 2) part(bola(.07), rambut, kepala, [0, .15, -.2], { bayang: false });                 // cepol belakang
  if (gaya !== 0 && options.pita != null) part(geo('pita', () => new THREE.CylinderGeometry(.205, .205, .035, 14, 1, true)), std(options.pita, .8), kepala, [0, .09, 0], { s: [.98, 1, 1.02], bayang: false });   // ikat kepala (opsional)

  // ---- Animasi ----
  const pose = vec(), dasar = vec(), dari = vec(), tmp = vec();
  let mode = 'diam', klip = null, t = 0, skala = 1, campur = 1, ekor = 0, waktu = Math.random() * 10;
  const terapkan = v => {
    const g = k => v[IDX[k]];
    hips.position.y = PINGGUL + g('rootY'); spine.rotation.set(g('sp'), g('twist'), 0); leher.rotation.x = g('hd');
    lengan[0].bahu.rotation.set(g('aRx'), g('aRy'), g('aRz')); lengan[1].bahu.rotation.set(g('aLx'), -g('aLy'), -g('aLz'));
    lengan[0].siku.rotation.x = g('eR'); lengan[1].siku.rotation.x = g('eL');
    kaki[0].paha.rotation.set(g('lRx'), 0, g('lRz')); kaki[1].paha.rotation.set(g('lLx'), 0, -g('lLz'));
    kaki[0].lutut.rotation.x = g('kR'); kaki[1].lutut.rotation.x = g('kL');
    kaki[0].telapak.rotation.x = -(g('lRx') + g('kR')); kaki[1].telapak.rotation.x = -(g('lLx') + g('kL'));   // telapak selalu rata
  };
  const napas = () => {                                  // sapuan siaga: tarik napas + goyang bobot
    dasar.set(vec()); const s = Math.sin(waktu * 2.1);
    dasar[IDX.rootY] += s * .012; dasar[IDX.sp] += s * .02; dasar[IDX.aRx] += s * .04; dasar[IDX.aLx] += s * .04; dasar[IDX.hd] += Math.sin(waktu * .7) * .04;
  };
  // Mulai klip; durasi (dtk) menyesuaikan lompatan di arena. Pose sekarang dicampur halus ke awal klip.
  function main(nama, durasi) {
    const k = KLIP[nama]; if (!k) return;
    klip = k; skala = durasi > 0 ? k.d / durasi : 1; t = 0; mode = 'klip'; dari.set(pose); campur = 0;
  }
  function update(dt) {
    waktu += dt; napas();
    if (mode === 'klip') {
      t += dt * skala / klip.d; contoh(klip, Math.min(t, 1), tmp);
      campur = Math.min(1, campur + dt / .1); const b = ease(campur);
      for (let c = 0; c < pose.length; c++) pose[c] = dari[c] + (tmp[c] - dari[c]) * b;
      if (t >= 1) { mode = 'ekor'; ekor = 0; dari.set(pose); }
    } else if (mode === 'ekor') {
      ekor += dt / .3; const b = ease(Math.min(1, ekor));
      for (let c = 0; c < pose.length; c++) pose[c] = dari[c] + (dasar[c] - dari[c]) * b;
      if (ekor >= 1) mode = 'diam';
    } else pose.set(dasar);
    terapkan(pose);
    if (kuncir) kuncir.rotation.x = .45 + Math.sin(waktu * 2.6) * .07 + (mode === 'klip' ? .3 * Math.sin(Math.min(t, 1) * Math.PI) : 0);   // kuncir bergoyang & terayun saat aksi
  }
  pose.set(vec()); terapkan(pose);

  root.userData = { number: no, role: options.role ?? 'OH', rig: true, parts: { torso: dada, head: kepala }, main, mixer: { update }, klip: Object.keys(KLIP), pose, terapkan };
  root.scale.setScalar(options.scale ?? 1.04);
  if (options.facing === 'left') root.rotation.y = Math.PI / 2;
  if (options.facing === 'right') root.rotation.y = -Math.PI / 2;
  return root;
}
