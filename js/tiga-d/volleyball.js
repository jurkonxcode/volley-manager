// Detailed volleyball with curved panel seams and a subtle glossy finish.
export function createVolleyball(THREE, options = {}) {
  const radius=options.radius??.22;
  const ball=new THREE.Group();ball.name='VolleyManagerProBall';
  const shell=new THREE.Mesh(new THREE.SphereGeometry(radius,32,24),new THREE.MeshStandardMaterial({color:0xf4f1df,roughness:.34,metalness:.015}));
  shell.castShadow=true;shell.receiveShadow=true;ball.add(shell);
  const blue=new THREE.MeshStandardMaterial({color:0x1765b4,roughness:.4});
  const gold=new THREE.MeshStandardMaterial({color:0xf2c33c,roughness:.38});
  // Curved seam arcs on the spherical surface.
  for(let i=0;i<3;i++){
    const arc=new THREE.Mesh(new THREE.TorusGeometry(radius*.79,.012,6,48,Math.PI*1.42),i===1?gold:blue);
    arc.rotation.set(Math.PI/2+i*.72,.25+i*.85,.2+i*.55);ball.add(arc);
  }
  const center=new THREE.Mesh(new THREE.SphereGeometry(radius*.16,12,10),gold);center.position.set(0,radius*.96,0);ball.add(center);
  ball.userData.radius=radius;
  return ball;
}
