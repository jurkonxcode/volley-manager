// Detailed stylized-realistic volleyball athlete built from optimized Three.js meshes.
// The group origin is at the feet; local +Z is the player's front.
export function createPlayer(THREE, options = {}) {
  const group=new THREE.Group();
  group.name=`Player_${options.number??7}`;
  const jerseyColor=options.jerseyColor??0xb51f35, shortsColor=options.shortsColor??0x171d28, skinColor=options.skinColor??0xe6b18d;
  const mat=(color,roughness=.72,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
  const jersey=mat(jerseyColor,.62), shorts=mat(shortsColor,.76), skin=mat(skinColor,.84), shoe=mat(0xe9edf2,.46), sole=mat(0x222a35,.72), sock=mat(0xe4e8ed,.7), hair=mat(options.hairColor??0x171923,.9), hairHi=mat(options.hairHighlight??0x333746,.86), trim=mat(0xf1d37b,.5,.12), knee=mat(0x161c28,.8), eye=mat(0x171b22,.45), white=mat(0xf8f5ef,.5);
  const mesh=(geo,material,pos,parent=group)=>{const m=new THREE.Mesh(geo,material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  const sphere=(r,pos,material,scale=[1,1,1],parent=group)=>{const m=mesh(new THREE.SphereGeometry(r,16,12),material,pos,parent);m.scale.set(...scale);return m;};
  const bone=(a,b,r,material,r2=r)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),dir=new THREE.Vector3().subVectors(B,A);const m=mesh(new THREE.CylinderGeometry(r2,r,dir.length(),10),material,[...(A.clone().add(B).multiplyScalar(.5).toArray())]);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());return m;};

  // Legs: athletic thighs, calves, socks, knee pads and volleyball shoes.
  for(const side of [-1,1]){
    const x=side*.145;
    bone([x,.91,0],[x,.53,.015],.105,skin,.085);
    bone([x,.53,.015],[x,.19,.035],.073,skin,.055);
    mesh(new THREE.CylinderGeometry(.082,.085,.17,12),sock,[x,.17,.035]);
    sphere(.105,[x,.51,.085],knee,[.9,.62,.48]);
    const sh=mesh(new THREE.BoxGeometry(.23,.13,.37),shoe,[x,.095,.13]); sh.rotation.x=-.04;
    mesh(new THREE.BoxGeometry(.235,.035,.38),sole,[x,.035,.13]);
    // Shoe laces.
    for(let i=0;i<3;i++) mesh(new THREE.BoxGeometry(.085,.012,.018),white,[x,.166,.02+i*.055]);
  }
  // Shorts with side panels and waist band.
  mesh(new THREE.CylinderGeometry(.245,.22,.32,12),shorts,[0,1.02,0]);
  mesh(new THREE.BoxGeometry(.45,.055,.31),trim,[0,1.18,0]);
  for(const x of [-.205,.205]) mesh(new THREE.BoxGeometry(.035,.25,.325),white,[x,1.015,.005]);

  // Torso silhouette: tapered athletic jersey with shoulders and sleeves.
  const torsoGeo=new THREE.CylinderGeometry(.235,.19,.66,14,1,false); const torso=mesh(torsoGeo,jersey,[0,1.52,0]); torso.scale.z=.72;
  sphere(.235,[0,1.82,0],jersey,[1.42,.48,.72]);
  mesh(new THREE.CylinderGeometry(.075,.09,.16,12),skin,[0,1.91,0]);
  // Collar and sleeve cuffs.
  const collar=mesh(new THREE.TorusGeometry(.085,.018,6,20),trim,[0,1.91,.006]); collar.rotation.x=Math.PI/2;
  for(const side of [-1,1]){
    const sx=side*.285;
    const sleeve=mesh(new THREE.CylinderGeometry(.105,.12,.22,12),jersey,[sx,1.72,0]); sleeve.rotation.z=side*.18;
    const cuff=mesh(new THREE.CylinderGeometry(.108,.11,.035,12),trim,[sx+side*.018,1.61,0]); cuff.rotation.z=side*.18;
  }
  // Arms in a relaxed ready pose, articulated-looking with elbows and hands.
  for(const side of [-1,1]){
    const shoulder=[side*.32,1.72,0], elbow=[side*.43,1.43,.07], wrist=[side*.42,1.17,.16];
    sphere(.115,shoulder,jersey,[1,.9,.85]);
    bone(shoulder,elbow,.075,skin,.06); sphere(.065,elbow,skin);
    bone(elbow,wrist,.055,skin,.043); sphere(.052,wrist,skin,[.9,1,.85]);
    const hand=sphere(.065,[wrist[0],wrist[1]-.045,wrist[2]+.025],skin,[.8,1.15,.65]);
    for(let f=0;f<3;f++) bone([wrist[0]+side*(f-1)*.025,1.13,.18],[wrist[0]+side*(f-1)*.03,1.075,.2],.012,skin,.009);
  }
  // Neck, head and facial planes.
  const head=sphere(.19,[0,2.12,.005],skin,[.82,1.12,.78]);
  sphere(.145,[0,2.02,.012],skin,[.9,.42,.82]); // jaw
  for(const side of [-1,1]){
    sphere(.035,[side*.155,2.12,0],skin,[.65,1,.5]);
    // eyes and brows face +Z
    sphere(.018,[side*.067,2.145,.151],eye,[1,.7,.55]);
    const brow=mesh(new THREE.BoxGeometry(.075,.018,.018),hair,[side*.067,2.185,.15]); brow.rotation.z=side*-.12;
  }
  // Nose and mouth are deliberately subtle at match-camera scale.
  sphere(.025,[0,2.105,.16],skin,[.7,1,.7]);
  mesh(new THREE.BoxGeometry(.055,.009,.012),mat(0x754c46,.9),[0,2.055,.151]);
  // Hair cap and layered spikes for a recognizable anime-sports silhouette.
  sphere(.195,[0,2.235,-.005],hair,[1.04,.72,.95]);
  for(let i=0;i<9;i++){
    const a=(i/9)*Math.PI*2, x=Math.cos(a)*.13,z=Math.sin(a)*.11;
    const spike=mesh(new THREE.ConeGeometry(.055,.17,6),i%3===0?hairHi:hair,[x,2.34,z]); spike.rotation.z=Math.cos(a)*-.5; spike.rotation.x=Math.sin(a)*.35;
  }
  // Sideburns.
  for(const side of [-1,1]) mesh(new THREE.BoxGeometry(.045,.16,.09),hair,[side*.17,2.17,.025]);

  // Jersey number printed on a small canvas texture (crisp at all screen sizes).
  const cv=document.createElement('canvas');cv.width=256;cv.height=256;const cx=cv.getContext('2d');
  cx.clearRect(0,0,256,256);cx.textAlign='center';cx.textBaseline='middle';cx.font='900 174px Arial';cx.lineWidth=12;cx.strokeStyle='rgba(18,24,34,.65)';cx.strokeText(String(options.number??7),128,132);cx.fillStyle='#fffdf5';cx.fillText(String(options.number??7),128,132);
  const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;
  const numMat=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false});
  const number=mesh(new THREE.PlaneGeometry(.24,.27),numMat,[0,1.55,.176]);
  number.name='JerseyNumber';
  // Back number: the match camera sees team A (the player's own team) from behind, so the chest number alone is never visible.
  const numberBack=mesh(new THREE.PlaneGeometry(.24,.27),numMat,[0,1.55,-.176]);
  numberBack.rotation.y=Math.PI; numberBack.name='JerseyNumberBack';
  number.castShadow=numberBack.castShadow=false;
  // Role marker is metadata for future tactical animations.
  group.userData.number=String(options.number??7); group.userData.role=options.role??'OH';
  group.userData.parts={torso,head};
  // Only larger parts cast shadows (fingers, laces, eyes, ears, hair spikes etc. are invisible in the shadow map but cost a draw call each).
  group.traverse(o=>{ if(!o.isMesh) return; o.geometry.computeBoundingSphere(); const s=Math.max(o.scale.x,o.scale.y,o.scale.z); if(o.geometry.boundingSphere.radius*s<.12) o.castShadow=false; });
  group.scale.setScalar(options.scale??1);
  if(options.facing==='left') group.rotation.y=Math.PI/2;
  if(options.facing==='right') group.rotation.y=-Math.PI/2;
  return group;
}
