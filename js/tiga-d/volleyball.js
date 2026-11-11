export function createVolleyball(THREE, options = {}) {
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(options.radius ?? 0.22, 24, 18),
    new THREE.MeshStandardMaterial({ color: 0xf4c847, roughness: 0.38, metalness: 0.02 })
  );
  ball.name = "VolleyManagerBall";
  const bluePanel = new THREE.Mesh(
    new THREE.TorusGeometry((options.radius ?? 0.22) * 0.72, 0.025, 6, 32),
    new THREE.MeshStandardMaterial({ color: 0x1c5ca4, roughness: 0.42 })
  );
  bluePanel.rotation.x = Math.PI / 2;
  ball.add(bluePanel);
  return ball;
}
