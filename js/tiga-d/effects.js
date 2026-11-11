// Lightweight cinematic impact effects. Each effect self-updates and returns false when done.
export function createSpikeEffect(THREE, position = new THREE.Vector3()) {
  const group=new THREE.Group();group.name='SpikeImpactFX';group.position.copy(position);
  const ringMat=new THREE.MeshBasicMaterial({color:0xffd36a,transparent:true,opacity:.92,side:THREE.DoubleSide});
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.42,.035,8,40),ringMat);ring.rotation.x=Math.PI/2;group.add(ring);
  const core=new THREE.Mesh(new THREE.SphereGeometry(.13,12,10),new THREE.MeshBasicMaterial({color:0xfff2bd,transparent:true,opacity:.9}));group.add(core);
  const sparks=[];
  const sparkMat=new THREE.MeshBasicMaterial({color:0xffd36a,transparent:true,opacity:.95});
  for(let i=0;i<9;i++){
    const s=new THREE.Mesh(new THREE.BoxGeometry(.035,.035,.22),sparkMat.clone());
    const a=i/9*Math.PI*2;s.position.set(Math.cos(a)*.18,.04,Math.sin(a)*.18);s.rotation.y=a;group.add(s);sparks.push({mesh:s,angle:a});
  }
  group.userData.age=0;
  group.userData.update=delta=>{
    group.userData.age+=delta;const t=Math.min(group.userData.age/.62,1),ease=1-Math.pow(1-t,3);
    ring.scale.setScalar(.45+ease*2.3);ring.material.opacity=.92*(1-t);
    core.scale.setScalar(1+ease*1.5);core.material.opacity=.9*(1-t);
    for(const p of sparks){const r=.2+ease*(.65+(p.angle%0.3));p.mesh.position.x=Math.cos(p.angle)*r;p.mesh.position.z=Math.sin(p.angle)*r;p.mesh.scale.y=1-t;p.mesh.material.opacity=1-t;}
    return t<1;
  };
  return group;
}

export function createDustEffect(THREE, position = new THREE.Vector3()) {
  const group=new THREE.Group();group.position.copy(position);group.name='LandingDustFX';
  const particles=[];
  for(let i=0;i<8;i++){
    const m=new THREE.Mesh(new THREE.SphereGeometry(.055,6,5),new THREE.MeshBasicMaterial({color:0xe9d6b4,transparent:true,opacity:.5}));
    const a=i/8*Math.PI*2;m.position.set(Math.cos(a)*.12,.03,Math.sin(a)*.12);group.add(m);particles.push({m,a});
  }
  group.userData.age=0;group.userData.update=dt=>{group.userData.age+=dt;const t=Math.min(group.userData.age/.45,1);for(const p of particles){const r=.12+t*.65;p.m.position.set(Math.cos(p.a)*r,.03+t*.22,Math.sin(p.a)*r);p.m.material.opacity=.5*(1-t);p.m.scale.setScalar(1+t*1.8);}return t<1;};
  return group;
}
