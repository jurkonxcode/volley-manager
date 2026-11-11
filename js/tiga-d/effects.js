export function createSpikeEffect(THREE, position = new THREE.Vector3()) {
  const group = new THREE.Group();
  group.position.copy(position);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.045, 8, 36),
    new THREE.MeshBasicMaterial({ color: 0xffc85a, transparent: true, opacity: 0.95 })
  );
  ring.rotation.x = Math.PI / 2;
  group.add(ring);
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 10),
    new THREE.MeshBasicMaterial({ color: 0xffe3a1, transparent: true, opacity: 0.8 })
  );
  group.add(glow);
  group.userData.age = 0;
  group.userData.update = (delta) => {
    group.userData.age += delta;
    const t = Math.min(group.userData.age / 0.55, 1);
    group.scale.setScalar(0.5 + t * 1.8);
    ring.material.opacity = 1 - t;
    glow.material.opacity = 0.8 * (1 - t);
    return t < 1;
  };
  return group;
}
