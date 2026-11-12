// Stadion Pro (v16): arena voli prosedural untuk Three.js 0.160. Tanpa aset luar: lantai, tribun, penonton, papan skor LED, sponsor dibuat saat dijalankan.
// API: createArena(THREE, opsi) -> Group. group.userData: update(dt) (ombak penonton, LED), hype (0-1), setSkor(a, b, namaA, namaB, set).
export function createArena(THREE, o = {}) {
  const L = (o.courtLength ?? 18) / 2, W = (o.courtWidth ?? 9) / 2, g = new THREE.Group(); g.name = 'VolleyManagerArenaPro';
  const sponsor = o.sponsor ?? ['VOLLEY MANAGER', 'SPIKE SPORTS', 'COURT PRO', 'ACE ATHLETIC', 'NETPLAY', 'CHAMPION GEAR'];
  const SRGB = THREE.SRGBColorSpace;
  const mat = (c, r = .7, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const box = (w, h, d, m, p, par = g, sh = true) => { const x = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); x.position.set(...p); x.castShadow = x.receiveShadow = sh; par.add(x); return x; };
  const kanvas = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = SRGB; t.anisotropy = 4; return t; };
  let sd = 4242; const rnd = () => (sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296;

  // 1. Lantai: zona bebas biru + parket + garis resmi (serang 3 m, tengah), digambar ke satu tekstur.
  const FW = L * 2 + 6, FD = W * 2 + 6, P = 56;
  const lantai = kanvas(FW * P, FD * P, (c, w, h) => {
    c.fillStyle = '#1d4e8f'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(255,255,255,${rnd() * .035})`; c.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 20, 1); }
    const cw = L * 2 * P, ch = W * 2 * P, x0 = (w - cw) / 2, y0 = (h - ch) / 2, ph = 24;
    for (let y = 0; y < ch; y += ph) { let x = (y / ph % 2) * 60; while (x < cw) { const pw = 90 + rnd() * 90, s = 150 + rnd() * 40; c.fillStyle = `rgb(${s + 45},${s - 18},${s - 85})`; c.fillRect(x0 + x, y0 + y, Math.min(pw, cw - x) - 1.5, ph - 1.5); x += pw; } }
    const gr = c.createLinearGradient(0, y0, 0, y0 + ch); gr.addColorStop(0, 'rgba(255,255,255,.12)'); gr.addColorStop(.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.14)'); c.fillStyle = gr; c.fillRect(x0, y0, cw, ch);
    c.strokeStyle = '#fff'; c.lineWidth = 5; c.strokeRect(x0, y0, cw, ch);
    for (const dx of [-3, 0, 3]) { const x = w / 2 + dx * P; c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y0 + ch); c.stroke(); }
    c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 4; c.beginPath(); c.arc(w / 2, h / 2, 1.3 * P, 0, 6.283); c.stroke();
  });
  const gelap = mat(0x0c1a30, .9);
  box(FW, .14, FD, [gelap, gelap, new THREE.MeshStandardMaterial({ map: lantai, roughness: .38, metalness: .04 }), gelap, gelap, gelap], [0, 0, 0]).castShadow = false;
  const dasar = new THREE.Mesh(new THREE.PlaneGeometry(90, 70), mat(0x070d1a, .95)); dasar.rotation.x = -Math.PI / 2; dasar.position.y = -.2; g.add(dasar);

  // 2. Net, tiang berpelindung, antena.
  const net = new THREE.Group(); net.name = 'VolleyballNet'; g.add(net);
  const cord = mat(0xdce5ec, .82), tape = mat(0xf5f6f7, .55), tiang = mat(0x24374e, .38, .55), pad = mat(0x24558a, .65), emas = mat(0xf4c45e, .5, .1), nw = W * 2 + .18;
  for (let y = 1.72; y <= 2.72; y += .13) box(.025, .018, nw, cord, [0, y, 0], net, false);
  for (let z = -nw / 2; z <= nw / 2; z += .16) box(.022, 1, .018, cord, [0, 2.22, z], net, false);
  box(.12, .09, nw + .28, tape, [0, 2.76, 0], net); box(.07, .055, nw + .28, tape, [0, 1.68, 0], net);
  for (const z of [-nw / 2 - .12, nw / 2 + .12]) {
    for (const [geo, m, y] of [[new THREE.CylinderGeometry(.065, .08, 2.9, 14), tiang, 1.43], [new THREE.CylinderGeometry(.105, .11, 1.35, 12), pad, .72], [new THREE.SphereGeometry(.075, 12, 8), emas, 2.91], [new THREE.CylinderGeometry(.018, .018, 1.8, 8), mat(0xf4f1e8, .5), 3.12]]) { const x = new THREE.Mesh(geo, m); x.position.set(0, y, z); x.castShadow = true; net.add(x); }
  }

  // 3. Papan sponsor LED mengelilingi zona bebas (teks bergulir) dan papan skor gantung 4 sisi.
  const led = kanvas(2048, 64, (c, w, h) => {
    c.fillStyle = '#06102a'; c.fillRect(0, 0, w, h); c.font = '800 38px sans-serif'; c.textBaseline = 'middle';
    sponsor.forEach((s, i) => { c.fillStyle = i % 2 ? '#c6ff3d' : '#ffffff'; c.fillText(s, 40 + i * (w / sponsor.length), h / 2); c.fillStyle = '#ff7a1a'; c.fillRect(i * (w / sponsor.length) - 6, 14, 6, 36); });
  });
  led.wrapS = THREE.RepeatWrapping; led.repeat.set(3, 1);
  const ledM = new THREE.MeshBasicMaterial({ map: led, toneMapped: false });
  const bz = W + 2.5, bx = L + 2.5;
  for (const s of [-1, 1]) { box(FW, .55, .12, ledM, [0, .42, s * bz], g, false); box(.12, .55, FD - .2, ledM, [s * bx, .42, 0], g, false); }
  const papan = document.createElement('canvas'); papan.width = 1024; papan.height = 256; const pc = papan.getContext('2d'), ptex = new THREE.CanvasTexture(papan); ptex.colorSpace = SRGB;
  const setSkor = (a = 0, b = 0, na = 'TUAN RUMAH', nb = 'LAWAN', set = 'SET 1') => { pc.fillStyle = '#050a18'; pc.fillRect(0, 0, 1024, 256); pc.fillStyle = '#c6ff3d'; pc.fillRect(0, 0, 1024, 10); pc.textAlign = 'center'; pc.font = '800 40px sans-serif'; pc.fillStyle = '#fff'; pc.fillText(String(na).toUpperCase().slice(0, 16), 230, 70); pc.fillText(String(nb).toUpperCase().slice(0, 16), 794, 70); pc.font = '800 120px sans-serif'; pc.fillStyle = '#ffc83d'; pc.fillText(a, 230, 200); pc.fillText(b, 794, 200); pc.font = '800 44px sans-serif'; pc.fillStyle = '#c6ff3d'; pc.fillText(set, 512, 140); ptex.needsUpdate = true; };
  setSkor();
  const kubus = new THREE.Group(); kubus.position.set(0, 8.2, 0); g.add(kubus);
  const pm = new THREE.MeshBasicMaterial({ map: ptex, toneMapped: false });
  for (const [r, x, z] of [[0, 0, 3.05], [Math.PI, 0, -3.05], [Math.PI / 2, 3.05, 0], [-Math.PI / 2, -3.05, 0]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), pm); p.rotation.y = r; p.position.set(x, 0, z); kubus.add(p); }
  box(6.2, .5, 6.2, mat(0x10192c, .5, .6), [0, 1, 0], kubus, false); box(6.2, .3, 6.2, mat(0x10192c, .5, .6), [0, -1, 0], kubus, false);
  for (const [x, z] of [[-2.8, -2.8], [2.8, 2.8], [-2.8, 2.8], [2.8, -2.8]]) box(.04, 4, .04, mat(0x8a98ad, .4, .8), [x, 3.2, z], kubus, false);

  // 4. Perlengkapan lapangan: kursi wasit, hakim garis, meja skor, bangku pemain, troli bola.
  const logam = mat(0x34465b, .4, .55), merah = mat(0xc33b42, .48), kursi = mat(0x18283d, .6);
  const wasit = new THREE.Group(); wasit.position.set(1.1, 0, -W - 1.2); g.add(wasit);
  for (const x of [-.32, .32]) for (const z of [-.25, .25]) box(.055, 1.45, .055, logam, [x, .72, z], wasit);
  box(.82, .08, .68, merah, [0, 1.48, 0], wasit); box(.62, .48, .5, kursi, [0, 1.78, -.03], wasit); box(.7, .06, .06, logam, [0, 2.04, .22], wasit);
  for (const x of [-L - 1, L + 1]) for (const z of [-W - 1, W + 1]) box(.4, .4, .4, merah, [x, .2, z], g, false);
  box(3.2, .8, .7, mat(0x1b3a63, .6), [-4, .4, -W - 1.7]); for (let i = 0; i < 3; i++) box(.5, .02, .35, mat(0x9fb2c9, .3, .6), [-5 + i, .82, -W - 1.7], g, false);
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) box(.45, .5, .45, mat(s < 0 ? 0x2b5fb8 : 0xc33b42, .6), [s * (4 + i * .55), .25, W + 1.5]);
  box(.7, .6, .5, mat(0x24374e, .5, .3), [L + 1.2, .3, W + .5]);

  // 5. Tribun landai di empat sisi, kursi berwarna per blok, penonton instanced (badan + kepala) dengan variasi warna & kulit.
  const tangga = mat(0x16253d, .85), kBaris = [], KS = [new THREE.Color(0x2455a6), new THREE.Color(0xf2c230), new THREE.Color(0xe8ecf4), new THREE.Color(0xc33b42)];
  const sisi = [{ s: 1, pj: 30, R: 10, D0: W + 3.4, ax: 'z', w: [0, 1, 2] }, { s: -1, pj: 30, R: 10, D0: W + 3.4, ax: 'z', w: [0, 1, 2] }, { s: 1, pj: 20, R: 8, D0: L + 3.4, ax: 'x', w: [3, 2, 3] }, { s: -1, pj: 20, R: 8, D0: L + 3.4, ax: 'x', w: [3, 2, 3] }];
  for (const S of sisi) for (let r = 0; r < S.R; r++) {
    const d = S.D0 + r * .72, y = .3 + r * .36, tinggi = y + .18;
    S.ax === 'z' ? box(S.pj + 2, tinggi, .72, tangga, [0, tinggi / 2, S.s * d]) : box(.72, tinggi, S.pj + 2, tangga, [S.s * d, tinggi / 2, 0]);
    for (let t = -S.pj / 2, n = 0; t <= S.pj / 2; t += .62, n++) kBaris.push({ x: S.ax === 'z' ? t : S.s * d, y: y + .3, z: S.ax === 'z' ? S.s * d : t, w: S.w[Math.floor(n / 7) % 3] });
  }
  const kursiM = new THREE.InstancedMesh(new THREE.BoxGeometry(.46, .26, .42), mat(0xffffff, .6), kBaris.length);
  const badan = new THREE.InstancedMesh(new THREE.CapsuleGeometry(.11, .22, 2, 6), mat(0xffffff, .88), kBaris.length), kepala = new THREE.InstancedMesh(new THREE.SphereGeometry(.085, 7, 6), mat(0xffffff, .9), kBaris.length);
  const kulit = [0xf1c9a5, 0xd9a07a, 0xb97a52, 0x8a5636, 0x5e3a24].map(c => new THREE.Color(c)), baju = [0xe4e9f2, 0x243c62, 0x9b3345, 0xd49a43, 0x4d789c, 0x263044, 0xf2c230, 0x2455a6].map(c => new THREE.Color(c)), d = new THREE.Object3D(), col = new THREE.Color();
  const ada = []; kBaris.forEach((k, i) => {
    d.position.set(k.x, k.y, k.z); d.updateMatrix(); kursiM.setMatrixAt(i, d.matrix); kursiM.setColorAt(i, col.copy(KS[k.w]).multiplyScalar(.85 + rnd() * .3));
    const isi = rnd() < .94; k.isi = isi; if (!isi) { d.scale.setScalar(0); d.position.set(k.x, k.y, k.z); d.updateMatrix(); badan.setMatrixAt(i, d.matrix); kepala.setMatrixAt(i, d.matrix); d.scale.setScalar(1); badan.setColorAt(i, col.set(0)); kepala.setColorAt(i, col.set(0)); return; }
    k.ph = rnd() * 6.28; k.sk = .85 + rnd() * .3;
    badan.setColorAt(i, rnd() < .55 ? col.copy(KS[k.w]) : col.copy(baju[Math.floor(rnd() * baju.length)])); kepala.setColorAt(i, kulit[Math.floor(rnd() * kulit.length)]);
    d.position.set(k.x, k.y + .3, k.z); d.updateMatrix(); badan.setMatrixAt(i, d.matrix); d.position.set(k.x, k.y + .6, k.z); d.scale.setScalar(k.sk); d.updateMatrix(); kepala.setMatrixAt(i, d.matrix); d.scale.setScalar(1); ada.push(i);
  });
  for (const m of [kursiM, badan, kepala]) { m.castShadow = false; m.receiveShadow = m === kursiM; m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; g.add(m); }

  // 6. Dinding dengan penonton jauh (lapis atas), pagar, dan atap rangka berlampu.
  const jauh = kanvas(2048, 256, (c, w, h) => { c.fillStyle = '#0a1224'; c.fillRect(0, 0, w, h); const w8 = ['#e4e9f2', '#2455a6', '#f2c230', '#c33b42', '#7d8fb0']; for (let i = 0; i < 5200; i++) { c.fillStyle = w8[Math.floor(rnd() * 5)]; c.globalAlpha = .35 + rnd() * .5; c.beginPath(); c.arc(rnd() * w, 20 + rnd() * (h - 20), 2 + rnd() * 2.2, 0, 6.283); c.fill(); } });
  const jm = new THREE.MeshBasicMaterial({ map: jauh, color: 0xb8c4dc });
  const zD = W + 3.4 + 10 * .72 + .5, xD = L + 3.4 + 8 * .72 + .5;
  for (const s of [-1, 1]) { const a = new THREE.Mesh(new THREE.PlaneGeometry(2 * xD, 6), jm); a.position.set(0, 6.2, s * zD); a.rotation.y = s > 0 ? Math.PI : 0; g.add(a); const b = new THREE.Mesh(new THREE.PlaneGeometry(2 * zD, 6), jm); b.position.set(s * xD, 6.2, 0); b.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; g.add(b);
    box(2 * xD, 3.4, .4, mat(0x0d1730, .8), [0, 1.7 + 4.2, s * (zD + .2)], g, false).position.y = 3.2; box(.4, 3.4, 2 * zD, mat(0x0d1730, .8), [s * (xD + .2), 3.2, 0], g, false); }
  const rangka = mat(0x40546a, .42, .6), lampu = new THREE.MeshBasicMaterial({ color: 0xfff1cf, toneMapped: false }), kerucut = new THREE.MeshBasicMaterial({ color: 0xfff1cf, transparent: true, opacity: .045, depthWrite: false, blending: THREE.AdditiveBlending });
  for (const x of [-12, -8, -4, 0, 4, 8, 12]) box(.16, .18, 2 * zD, rangka, [x, 11.5, 0], g, false);
  for (const z of [-9, 0, 9]) { box(2 * xD, .2, .2, mat(0x263b53, .48, .55), [0, 12.2, z], g, false); for (const x of [-10, -5, 0, 5, 10]) { box(1.1, .16, .55, lampu, [x, 10.8, z], g, false); const k = new THREE.Mesh(new THREE.ConeGeometry(2.6, 10.7, 14, 1, true), kerucut); k.position.set(x, 5.4, z); k.renderOrder = 2; g.add(k); } }

  // 7. Animasi: ombak penonton (diperbarui tiap 3 frame), sorotan LED bergulir.
  let t = 0, fr = 0; g.userData.hype = .3;
  g.userData.setSkor = setSkor;
  g.userData.update = dt => {
    t += dt; led.offset.x = (t * .04) % 1; g.userData.hype += (.28 - g.userData.hype) * Math.min(1, dt * .6);
    if (++fr % 3) return; const h = g.userData.hype;
    for (const i of ada) { const k = kBaris[i], lift = Math.pow(Math.max(0, Math.sin(t * 3.2 - (k.x + k.z) * .32 + k.ph * .15)), 2) * (.05 + .22 * h);
      d.position.set(k.x, k.y + .3 + lift, k.z); d.rotation.z = Math.sin(t * 2 + k.ph) * .05 * (.5 + h); d.updateMatrix(); badan.setMatrixAt(i, d.matrix);
      d.position.set(k.x, k.y + .6 + lift, k.z); d.scale.setScalar(k.sk); d.updateMatrix(); kepala.setMatrixAt(i, d.matrix); d.scale.setScalar(1); d.rotation.z = 0; }
    badan.instanceMatrix.needsUpdate = kepala.instanceMatrix.needsUpdate = true;
  };
  g.userData.dimensions = { length: L * 2, width: W * 2 }; g.userData.quality = 'stadion-pro';
  return g;
}
