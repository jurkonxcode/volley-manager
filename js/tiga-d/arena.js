export function createArena(THREE, options = {}) {
  const length = options.courtLength ?? 18;
  const width = options.courtWidth ?? 9;
  const group = new THREE.Group();
  group.name = "VolleyManagerArena";

  const mat = (color, roughness = 0.82) => new THREE.MeshStandardMaterial({ color, roughness });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(34, 24), mat(0x12365a));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.08;
  floor.receiveShadow = true;
  group.add(floor);

  const court = new THREE.Mesh(
    new THREE.BoxGeometry(length, 0.12, width),
    mat(options.woodColor ?? 0xc77b3d)
  );
  court.position.y = 0;
  court.receiveShadow = true;
  court.castShadow = true;
  group.add(court);

  const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
  function line(x1, z1, x2, z2, thickness = 0.055) {
    const dx = x2 - x1, dz = z2 - z1;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(Math.hypot(dx, dz), 0.018, thickness),
      lineMat
    );
    mesh.position.set((x1+x2)/2, 0.071, (z1+z2)/2);
    mesh.rotation.y = -Math.atan2(dz, dx);
    group.add(mesh);
  }
  const L = length / 2, W = width / 2;
  line(-L, -W, L, -W); line(-L, W, L, W);
  line(-L, -W, -L, W); line(L, -W, L, W);
  line(0, -W, 0, W, 0.07);
  line(-3, -W, -3, W, 0.045);
  line(3, -W, 3, W, 0.045);

  // Net and posts
  const postMat = mat(0x25364a, 0.42);
  for (const x of [-0.18, 0.18]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 2.65, 12), postMat);
    post.position.set(x, 1.38, 0);
    group.add(post);
  }
  const net = new THREE.Mesh(
    new THREE.BoxGeometry(0.035, 1.0, width + 0.35),
    new THREE.MeshStandardMaterial({ color: 0xdce5ed, transparent: true, opacity: 0.58, wireframe: true })
  );
  net.position.set(0, 2.15, 0);
  group.add(net);
  const tape = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, width + 0.35), mat(0xffffff));
  tape.position.set(0, 2.68, 0);
  group.add(tape);

  if (options.showStands !== false) {
    const standMat = mat(0x172b49);
    for (let row = 0; row < 4; row++) {
      for (const side of [-1, 1]) {
        const bench = new THREE.Mesh(new THREE.BoxGeometry(length + 7, 0.32, 0.7), standMat);
        bench.position.set(0, 0.25 + row * 0.42, side * (W + 2.1 + row * 0.58));
        group.add(bench);
      }
    }
    const seatMat = mat(0x245a91);
    for (let row = 0; row < 4; row++) {
      for (const side of [-1, 1]) {
        const seats = new THREE.Mesh(new THREE.BoxGeometry(length + 6.6, 0.12, 0.48), seatMat);
        seats.position.set(0, 0.44 + row * 0.42, side * (W + 2.1 + row * 0.58));
        group.add(seats);
      }
    }
  }

  if (options.showLights !== false) {
    const poleMat = mat(0x26374c, 0.4);
    for (const x of [-13, 13]) for (const z of [-8, 8]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 7, 10), poleMat);
      pole.position.set(x, 3.5, z);
      group.add(pole);
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 0.5),
        new THREE.MeshBasicMaterial({ color: 0xeaf5ff }));
      lamp.position.set(x, 7.05, z);
      group.add(lamp);
    }
  }

  group.userData.dimensions = { length, width };
  return group;
}
