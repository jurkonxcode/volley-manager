export function createPlayer(THREE, options = {}) {
  const group = new THREE.Group();
  group.name = `Player_${options.number ?? 7}`;
  const jerseyColor = options.jerseyColor ?? 0xb51f35;
  const shortsColor = options.shortsColor ?? 0x171d28;
  const skinColor = options.skinColor ?? 0xe6b18d;
  const jerseyMat = new THREE.MeshStandardMaterial({ color: jerseyColor, roughness: 0.72 });
  const shortsMat = new THREE.MeshStandardMaterial({ color: shortsColor, roughness: 0.82 });
  const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.9 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0xe7edf4, roughness: 0.5 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x202432, roughness: 0.8 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 0.52, 4, 8), jerseyMat);
  torso.position.y = 1.28; torso.castShadow = true; group.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), skinMat);
  head.position.y = 1.92; head.castShadow = true; group.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.225, 12, 8, 0, Math.PI*2, 0, Math.PI*0.55), darkMat);
  hair.position.set(0, 2.02, -0.015); group.add(hair);

  const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.28, 0.32), shortsMat);
  shorts.position.y = 0.88; group.add(shorts);

  const limb = (radius, length, material, x, y, z, angle = 0) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(radius*0.82, radius, length, 8), material);
    m.position.set(x, y, z); m.rotation.z = angle; m.castShadow = true; group.add(m); return m;
  };
  limb(0.075, 0.48, skinMat, -0.37, 1.28, 0, 0.18);
  limb(0.075, 0.48, skinMat, 0.37, 1.28, 0, -0.18);
  limb(0.09, 0.53, skinMat, -0.14, 0.48, 0, 0.08);
  limb(0.09, 0.53, skinMat, 0.14, 0.48, 0, -0.08);
  for (const x of [-0.14, 0.14]) {
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.11, 0.32), shoeMat);
    shoe.position.set(x, 0.12, 0.055); group.add(shoe);
  }
  const number = new THREE.Group();
  number.name = "JerseyNumberAnchor";
  number.position.set(0, 1.32, 0.275);
  group.add(number);
  group.userData.number = String(options.number ?? 7);
  group.userData.role = options.role ?? "OH";
  group.scale.setScalar(options.scale ?? 1);
  if (options.facing === "left") group.rotation.y = Math.PI / 2;
  if (options.facing === "right") group.rotation.y = -Math.PI / 2;
  return group;
}
