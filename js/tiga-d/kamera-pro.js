// Kamera dan komposisi layar laga 3D (v24). Tanpa aset baru.
// Semua angka yang boleh disetel ada di KAM dan percantikArena().
export const KAM = {
  fov: 36,                 // lebih sempit = lapangan terlihat lebih "tele", perspektif lebih datar
  elev: 0.70,              // sudut pandang ke bawah (radian). Naikkan => lebih dari atas, lapangan lebih besar di layar HP
  azim: 0.20,              // geser ke samping (radian). 0 = tepat di belakang garis belakang tim A
  sasaran: [1.0, 0.8, 0],  // titik yang dipandang kamera
  isi: 0.94,               // seberapa penuh lapangan mengisi layar (1 = tepat di tepi)
};
// Cari jarak kamera terdekat sehingga seluruh lapangan (+margin) muat di layar, apa pun rasio aspek wadahnya.
export function paskanKamera(T, cam, asp) {
  const { fov, elev, azim, sasaran, isi } = KAM, tgt = new T.Vector3(...sasaran), v = new T.Vector3();
  const arah = new T.Vector3(-Math.cos(azim) * Math.cos(elev), Math.sin(elev), Math.sin(azim) * Math.cos(elev));
  const titik = [];
  for (const x of [-9.8, 9.8]) for (const z of [-5.3, 5.3]) titik.push(new T.Vector3(x, 0, z));   // sudut lapangan + margin
  for (const z of [-5.2, 5.2]) titik.push(new T.Vector3(0, 3.0, z));                              // puncak tiang net
  cam.fov = fov; cam.aspect = asp;
  let d = 70;
  for (let k = 12; k <= 70; k += 0.5) {
    cam.position.copy(tgt).addScaledVector(arah, k); cam.lookAt(tgt); cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
    if (titik.every(p => { v.copy(p).project(cam); return Math.abs(v.x) <= isi && Math.abs(v.y) <= isi; })) { d = k; break; }
  }
  cam.position.copy(tgt).addScaledVector(arah, d); cam.lookAt(tgt); cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
  return d;
}
// Kurangi keramaian stadion supaya mata tertuju ke lapangan: papan skor gantung dikecilkan, rangka atap disembunyikan,
// tribun digelapkan, kabut dirapatkan, dan sorot lampu jatuh di tengah lapangan.
export function percantikArena(T, sc, arena) {
  const latar = new T.Color(0x0a1322); sc.background = latar; sc.fog = new T.Fog(latar, 30, 64);
  const kubus = arena.children.find(o => o.isGroup && Math.abs(o.position.y - 8.2) < 0.05);   // papan skor gantung (skor sudah ada di papan HTML)
  if (kubus) { kubus.position.y = 10.4; kubus.scale.setScalar(0.5); }
  arena.children.forEach(o => { if (o.isMesh && !o.isInstancedMesh && (Math.abs(o.position.y - 11.5) < 0.05 || Math.abs(o.position.y - 12.2) < 0.05)) o.visible = false; });   // rangka atap
  arena.traverse(o => {
    if (!o.isMesh || !o.material || Array.isArray(o.material)) return;
    if (o.isInstancedMesh) o.material.color.multiplyScalar(0.6);                                  // kursi dan penonton
    else if (o.material.isMeshBasicMaterial && o.geometry?.type === 'PlaneGeometry' && o.geometry.parameters.height === 6) o.material.color.multiplyScalar(0.55);   // dinding penonton jauh
  });
  sc.children.forEach(o => { if (o.isHemisphereLight) o.intensity *= 0.78; });
  const sorot = new T.SpotLight(0xfff1d9, 2.4, 0, 0.55, 0.65, 0); sorot.position.set(0, 17, 0); sorot.target.position.set(0, 0, 0);
  sc.add(sorot, sorot.target);
}
// Bayangan bulat di lantai di bawah bola: memperjelas posisi dan ketinggian bola.
export function pasangBayangan(T, sc, bola) {
  const m = new T.Mesh(new T.CircleGeometry(0.36, 24), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.09; m.renderOrder = 2; sc.add(m);
  const arena = sc.userData.arena; if (!arena) return;
  const asli = arena.userData.update;
  arena.userData.update = dt => {
    asli?.(dt);
    const h = Math.max(0, bola.position.y - 0.09);
    m.position.x = bola.position.x; m.position.z = bola.position.z;
    m.scale.setScalar(1 / (1 + h * 0.22)); m.material.opacity = 0.55 / (1 + h * 0.3);
  };
}
