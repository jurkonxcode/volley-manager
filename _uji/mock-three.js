// Three.js tiruan minimal: hanya untuk menguji bentuk & pose di mini-renderer 2D (bukan pengganti Three.js).
const mul=(a,b)=>{const o=new Array(16).fill(0);for(let r=0;r<4;r++)for(let c=0;c<4;c++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;};
const rot=(ax,a)=>{const c=Math.cos(a),s=Math.sin(a);const m=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
 if(ax==='X'){m[5]=c;m[6]=s;m[9]=-s;m[10]=c}if(ax==='Y'){m[0]=c;m[2]=-s;m[8]=s;m[10]=c}if(ax==='Z'){m[0]=c;m[1]=s;m[4]=-s;m[5]=c}return m;};
class V{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}setScalar(s){this.x=this.y=this.z=s;return this}clone(){return new V(this.x,this.y,this.z)}setY(y){this.y=y;return this}copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this}add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this}sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this}multiplyScalar(s){this.x*=s;this.y*=s;this.z*=s;return this}subVectors(a,b){this.x=a.x-b.x;this.y=a.y-b.y;this.z=a.z-b.z;return this}length(){return Math.hypot(this.x,this.y,this.z)}toArray(){return [this.x,this.y,this.z]}}
class Euler{constructor(){this.x=0;this.y=0;this.z=0;this.order='XYZ'}set(x,y,z){this.x=x;this.y=y;this.z=z}}
class O3{constructor(){this.position=new V();this.rotation=new Euler();this.scale=new V(1,1,1);this.children=[];this.userData={};this.parent=null;this.castShadow=false;this.receiveShadow=false}
 add(c){c.parent=this;this.children.push(c)}
 local(){const e=this.rotation;let R=rot(e.order[0],e[e.order[0].toLowerCase()]);R=mul(R,rot(e.order[1],e[e.order[1].toLowerCase()]));R=mul(R,rot(e.order[2],e[e.order[2].toLowerCase()]));
  const S=[this.scale.x,0,0,0,0,this.scale.y,0,0,0,0,this.scale.z,0,0,0,0,1];const T=[1,0,0,0,0,1,0,0,0,0,1,0,this.position.x,this.position.y,this.position.z,1];return mul(T,mul(R,S));}
 world(){const l=this.local();return this.parent?mul(this.parent.world(),l):l}
 traverse(f){f(this);this.children.forEach(c=>c.traverse(f))}}
class Group extends O3{}
class Mesh extends O3{constructor(g,m){super();this.geometry=g;this.material=m;this.isMesh=true}}
class Geo{constructor(t,p){this.type=t;this.p=p;this.userData={}}
 get boundingBox(){return this._bb||null}
 computeBoundingBox(){const p=this.p;let s;if(this.type==='capsule')s=[p[0]*2,p[1]+p[0]*2,p[0]*2];else if(this.type==='sphere')s=[p[0]*2,p[0]*2,p[0]*2];else if(this.type==='cyl')s=[Math.max(p[0],p[1])*2,p[2],Math.max(p[0],p[1])*2];else if(this.type==='box')s=p;else if(this.type==='cone')s=[p[0]*2,p[1],p[0]*2];else s=[p[0],p[1],.01];
  this._bb={getSize:()=>new V(...s)};}}
const T={Group,Mesh,Vector3:V,SRGBColorSpace:'srgb',BackSide:1,
 CapsuleGeometry:class extends Geo{constructor(r,l){super('capsule',[r,l])}},SphereGeometry:class extends Geo{constructor(r){super('sphere',[r])}},
 CylinderGeometry:class extends Geo{constructor(a,b,h){super('cyl',[a,b,h])}},BoxGeometry:class extends Geo{constructor(a,b,c){super('box',[a,b,c])}},
 ConeGeometry:class extends Geo{constructor(r,h){super('cone',[r,h])}},PlaneGeometry:class extends Geo{constructor(w,h){super('plane',[w,h])}},
 MeshStandardMaterial:class{constructor(o){this.o=o;this.kind='std'}},MeshBasicMaterial:class{constructor(o){this.o=o;this.kind='basic'}},CanvasTexture:class{}};
export default T;
export const gambarPemain=(ctx,g,ox,oy,S,pandang)=>{ // pandang: 'samping' (layar x = z) atau 'depan' (layar x = x)
 const items=[];g.traverse(o=>{if(!o.isMesh||o.material.o?.side===1)return;const w=o.world();items.push({o,w})});
 const P=(w,x,y,z)=>{const X=w[0]*x+w[4]*y+w[8]*z+w[12],Y=w[1]*x+w[5]*y+w[9]*z+w[13],Z=w[2]*x+w[6]*y+w[10]*z+w[14];return [ox+(pandang==='samping'?Z:X)*S, oy-Y*S, X, Z]};
 const hex=c=>'#'+(c??0x888888).toString(16).padStart(6,'0');
 items.sort((a,b)=>(pandang==='samping'?a.w[12]-b.w[12]:b.w[14]-a.w[14])); // gambar yang jauh dulu
 for(const {o,w} of items){const gm=o.geometry,p=gm.p,col=hex(o.material.o?.color);const sc=(Math.hypot(w[0],w[1],w[2])+Math.hypot(w[8],w[9],w[10]))/2;
  ctx.fillStyle=col;ctx.strokeStyle=col;ctx.lineCap='round';
  if(gm.type==='capsule'){const h=p[1]/2,a=P(w,0,-h,0),b=P(w,0,h,0);ctx.lineWidth=p[0]*2*sc*S;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
   ctx.lineWidth=p[0]*2*sc*S+3;ctx.globalCompositeOperation='destination-over';ctx.strokeStyle='#0b0f1a';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();ctx.globalCompositeOperation='source-over';}
  else if(gm.type==='cyl'){const h=p[2]/2,a=P(w,0,-h,0),b=P(w,0,h,0);ctx.lineCap='butt';ctx.lineWidth=(p[0]+p[1])*sc*S;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}
  else if(gm.type==='sphere'){const c=P(w,0,0,0);ctx.beginPath();ctx.ellipse(c[0],c[1],p[0]*Math.hypot(w[0],w[1],w[2])*S*(pandang==='samping'?Math.hypot(w[8],w[9],w[10])/Math.hypot(w[0],w[1],w[2]):1),p[0]*Math.hypot(w[4],w[5],w[6])*S,0,0,7);ctx.fill();}
  else if(gm.type==='box'){const c=P(w,0,0,0);ctx.fillRect(c[0]-(pandang==='samping'?p[2]:p[0])*sc*S/2,c[1]-p[1]*sc*S/2,(pandang==='samping'?p[2]:p[0])*sc*S,p[1]*sc*S);}
  else if(gm.type==='cone'){const c=P(w,0,0,0);ctx.beginPath();ctx.arc(c[0],c[1],p[0]*sc*S,0,7);ctx.fill();}
  else if(gm.type==='plane'){/* nomor: lewati */}
 }};
