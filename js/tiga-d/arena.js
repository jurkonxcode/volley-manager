// Premium procedural volleyball arena for Three.js 0.160.
// No external models or textures required; all detail is generated at runtime.
export function createArena(THREE, options = {}) {
  const length = options.courtLength ?? 18;
  const width = options.courtWidth ?? 9;
  const group = new THREE.Group();
  group.name = 'VolleyManagerArenaPremium';
  const mat = (color, roughness = .72, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const add = (geo, material, pos, parent = group) => {
    const m = new THREE.Mesh(geo, material);
    if (pos) m.position.set(pos[0], pos[1], pos[2]);
    m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  };
  const box = (w,h,d,material,pos,parent=group) => add(new THREE.BoxGeometry(w,h,d),material,pos,parent);

  // Main arena floor and dark perimeter apron.
  const floorMat = mat(0x101f35, .9);
  const floor = add(new THREE.PlaneGeometry(44, 34), floorMat, [0,-.22,0]);
  floor.rotation.x = -Math.PI/2; floor.castShadow = false;
  const apron = box(23,.18,14,mat(0x173b61,.78),[0,-.105,0]); apron.castShadow = false;

  // Procedural parquet texture, generated locally (no network dependency).
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#bd8047'; ctx.fillRect(0,0,1024,512);
  let seed = 1937; const rnd = () => { seed = (seed*1664525+1013904223)>>>0; return seed/4294967296; };
  const plankH = 32;
  for (let y=0;y<512;y+=plankH) {
    let x = (Math.floor(y/plankH)%2)*74;
    while (x<1024) {
      const w = 115 + Math.floor(rnd()*105), shade = Math.floor(105+rnd()*55);
      ctx.fillStyle = `rgb(${shade+48},${shade+5},${shade-30})`; ctx.fillRect(x,y,w-2,plankH-2);
      ctx.strokeStyle='rgba(65,34,17,.24)'; ctx.lineWidth=2; ctx.strokeRect(x+1,y+1,w-4,plankH-4);
      ctx.strokeStyle='rgba(255,220,160,.13)'; ctx.lineWidth=1;
      for(let k=0;k<3;k++){ const yy=y+5+rnd()*(plankH-10); ctx.beginPath();ctx.moveTo(x+8,yy);ctx.bezierCurveTo(x+w*.3,yy-3,x+w*.65,yy+3,x+w-8,yy);ctx.stroke(); }
      x += w;
    }
  }
  const woodTex = new THREE.CanvasTexture(canvas); woodTex.wrapS=woodTex.wrapT=THREE.RepeatWrapping; woodTex.repeat.set(1.35,1.1); woodTex.colorSpace=THREE.SRGBColorSpace;
  const court = box(length,.14,width,new THREE.MeshStandardMaterial({map:woodTex,roughness:.52,metalness:.02}),[0,0,0]);
  court.receiveShadow=true;

  // Painted court markings, with subtle raised white paint.
  const lineMat = mat(0xf7f4e9,.55);
  function line(x1,z1,x2,z2,t=.055,y=.078,material=lineMat){
    const dx=x2-x1,dz=z2-z1, m=box(Math.hypot(dx,dz),.014,t,material,[(x1+x2)/2,y,(z1+z2)/2]);
    m.rotation.y=-Math.atan2(dz,dx); m.castShadow=false; return m;
  }
  const L=length/2,W=width/2;
  line(-L,-W,L,-W); line(-L,W,L,W); line(-L,-W,-L,W); line(L,-W,L,W);
  line(-3,-W,-3,W,.045); line(3,-W,3,W,.045);
  // Center line is under the net; subtle service-zone corner marks.
  const accent=mat(0xf4c45e,.5,.1);
  for(const x of [-L+.35,L-.35]) for(const z of [-W+.35,W-.35]) box(.36,.016,.055,accent,[x,.081,z]).castShadow=false;

  // Net: fine horizontal and vertical cords, top/bottom tapes and antennae.
  const netGroup=new THREE.Group(); netGroup.name='VolleyballNet'; group.add(netGroup);
  const cord=mat(0xdce5ec,.82), tape=mat(0xf5f6f7,.55), postMat=mat(0x24374e,.38,.55), padMat=mat(0x24558a,.65);
  const netW=width+.18, netH=1.0, netX=0;
  for(let y=1.72;y<=2.72;y+=.13){ const c=box(.025,.018,netW,cord,[netX,y,0],netGroup); c.castShadow=false; }
  for(let z=-netW/2;z<=netW/2;z+=.16){ const c=box(.022,netH,.018,cord,[netX,2.22,z],netGroup); c.castShadow=false; }
  box(.12,.09,netW+.28,tape,[0,2.76,0],netGroup);
  box(.07,.055,netW+.28,tape,[0,1.68,0],netGroup);
  for(const z of [-netW/2-.12,netW/2+.12]){
    const post=add(new THREE.CylinderGeometry(.065,.08,2.9,14),postMat,[0,1.43,z],netGroup);
    const pad=add(new THREE.CylinderGeometry(.105,.11,1.35,12),padMat,[0,.72,z],netGroup);
    const cap=add(new THREE.SphereGeometry(.075,12,8),accent,[0,2.91,z],netGroup);
    post.castShadow=pad.castShadow=cap.castShadow=true;
    const antenna=add(new THREE.CylinderGeometry(.018,.018,1.8,8),mat(0xf4f1e8,.5),[0,3.12,z],netGroup);
    antenna.castShadow=false;
  }

  // Referee stand and chair at the sideline.
  const metal=mat(0x34465b,.4,.55), red=mat(0xc33b42,.48), seat=mat(0x18283d,.6);
  const stand=new THREE.Group(); stand.position.set(.5,0,-W-1.25); group.add(stand);
  for(const x of [-.32,.32]) for(const z of [-.25,.25]) box(.055,1.45,.055,metal,[x,.72,z],stand);
  box(.82,.08,.68,red,[0,1.48,0],stand); box(.62,.48,.5,seat,[0,1.78,-.03],stand);
  box(.7,.06,.06,metal,[0,2.04,.22],stand);

  // LED advertising boards around the court.
  const ledMat = new THREE.MeshStandardMaterial({color:0x0b2341,emissive:0x082d59,emissiveIntensity:.9,roughness:.45});
  const ledGold = new THREE.MeshStandardMaterial({color:0x132d4a,emissive:0xc18b27,emissiveIntensity:.65,roughness:.4});
  for(const z of [-W-1.0,W+1.0]){
    box(length+.6,.48,.16,ledMat,[0,.48,z]);
    box(length+.6,.045,.18,ledGold,[0,.75,z]);
  }
  for(const x of [-L-1.0,L+1.0]) box(.16,.48,width+.2,ledMat,[x,.48,0]);

  // Tiered stands on all four sides.
  const standBase=mat(0x14243a,.9), riser=mat(0x203b5d,.78), seatBlue=mat(0x24568a,.56), seatAlt=mat(0x183c68,.62);
  for(const side of [-1,1]){
    for(let row=0;row<5;row++){
      const z=side*(W+1.65+row*.68), y=.34+row*.34;
      box(length+8,.34,.66,riser,[0,y,z]);
      box(length+7.7,.13,.5,standBase,[0,y+.2,z]);
      // Seat instances keep draw calls low on mobile.
      const seatGeo=new THREE.BoxGeometry(.42,.22,.38), seats=new THREE.InstancedMesh(seatGeo,row%2?seatAlt:seatBlue,32);
      const dummy=new THREE.Object3D(); let n=0;
      for(let x=-10.5;x<=10.5;x+=.72){ dummy.position.set(x,y+.39,z); dummy.rotation.y=side===1?Math.PI:0; dummy.updateMatrix(); seats.setMatrixAt(n++,dummy.matrix); }
      seats.count=n; seats.instanceMatrix.needsUpdate=true; seats.castShadow=false; seats.receiveShadow=true; group.add(seats);
    }
  }
  for(const side of [-1,1]){
    for(let row=0;row<4;row++){
      const x=side*(L+1.8+row*.68), y=.34+row*.34;
      box(.66,.34,width+7,riser,[x,y,0]);
      const seats=new THREE.InstancedMesh(new THREE.BoxGeometry(.38,.22,.42),row%2?seatAlt:seatBlue,18);
      const d=new THREE.Object3D();let n=0;
      for(let z=-7;z<=7;z+=.85){d.position.set(x,y+.39,z);d.updateMatrix();seats.setMatrixAt(n++,d.matrix);}
      seats.count=n;seats.instanceMatrix.needsUpdate=true;group.add(seats);
    }
  }

  // Crowd: low-poly torso + head instances, varied colors, arranged in tiers.
  const crowdColors=[0xe4e9f2,0x243c62,0x9b3345,0xd49a43,0x4d789c,0x263044,0xeeeeea];
  let crowdSeed=8173;const rand=()=>{crowdSeed=(crowdSeed*1664525+1013904223)>>>0;return crowdSeed/4294967296;};
  const torsoGeo=new THREE.CapsuleGeometry(.095,.19,2,5), headGeo=new THREE.SphereGeometry(.075,7,6);
  for(const side of [-1,1]) for(let row=0;row<5;row++){
    const count=30, torsoMeshes=crowdColors.map(c=>new THREE.InstancedMesh(torsoGeo,mat(c,.88),count));
    const colorCounts=crowdColors.map(()=>0);
    const headMesh=new THREE.InstancedMesh(headGeo,mat(0xc99b78,.95),count* crowdColors.length);
    const d=new THREE.Object3D();let idx=0;
    for(let j=0;j<count;j++){
      const x=-10.2+j*.7+(rand()-.5)*.16, z=side*(W+1.65+row*.68)+(rand()-.5)*.12, y=.78+row*.34;
      const c=Math.floor(rand()*crowdColors.length), ci=colorCounts[c]++;d.position.set(x,y,z);d.rotation.z=(rand()-.5)*.14;d.updateMatrix();torsoMeshes[c].setMatrixAt(ci,d.matrix);
      d.position.set(x,y+.19,z);d.scale.setScalar(.78+rand()*.35);d.updateMatrix();headMesh.setMatrixAt(idx++,d.matrix);d.scale.setScalar(1);
    }
    torsoMeshes.forEach((m,i)=>{m.count=colorCounts[i];m.instanceMatrix.needsUpdate=true;m.castShadow=false;group.add(m);}); headMesh.count=idx;headMesh.instanceMatrix.needsUpdate=true;headMesh.castShadow=false;group.add(headMesh);
  }

  // Roof trusses and suspended arena lights.
  const roofMat=mat(0x263b53,.48,.55), beamMat=mat(0x40546a,.42,.6), lampMat=new THREE.MeshBasicMaterial({color:0xfff1cf});
  for(const x of [-12,-8,-4,0,4,8,12]){
    const beam=box(.16,.18,29,beamMat,[x,11.5,0]); beam.castShadow=false;
    for(const z of [-13,13]){ const brace=box(.12,3.0,.12,roofMat,[x,10,z]);brace.rotation.x=z>0?.35:-.35; }
  }
  for(const z of [-10,0,10]){
    const truss=box(27,.2,.2,roofMat,[0,12.2,z]);truss.castShadow=false;
    for(const x of [-9,-3,3,9]){
      const lamp=box(1.1,.16,.55,lampMat,[x,10.8,z]);lamp.castShadow=false;
    }
  }
  // Corner columns, upper fascia and stadium nameplate.
  const columnMat=mat(0x1c2d43,.65,.25);
  for(const x of [-13,13]) for(const z of [-10,10]) box(.55,8,.55,columnMat,[x,4,z]);
  box(28,.65,.5,mat(0x0b1c31,.55),[0,8.1,-13.5]);

  group.userData.dimensions={length,width};
  group.userData.quality='premium-procedural';
  return group;
}
