import M from 'http://localhost:8124/_uji/mock-three.js';
const lepas=()=>{const f=function(){return px};f.x=f.y=f.z=0;const px=new Proxy(f,{get:(a,b)=>b in a?a[b]:(typeof b==='symbol'||b==='then'?undefined:(b==='length'?0:lepas())),set:(a,b,v)=>{a[b]=v;return true},apply:()=>px});return px};
const gen=base=>class extends base{constructor(...a){super(...a);return new Proxy(this,{get(t,k,r){if(k in t)return Reflect.get(t,k,r);if(typeof k==='symbol'||k==='then')return undefined;return t[k]=lepas()},set(t,k,v){t[k]=v;return true}})}};
const O=n=>gen(M.Group);
export const Group=gen(M.Group),Mesh=gen(M.Mesh),Object3D=gen(M.Group),Scene=gen(M.Group),PerspectiveCamera=gen(M.Group),HemisphereLight=gen(M.Group),DirectionalLight=gen(M.Group),InstancedMesh=class extends gen(M.Group){constructor(g,m,n){super();this.geometry=g;this.material=m;this.count=n;this.isMesh=false}},AnimationMixer=gen(M.Group);
export const Vector3=M.Vector3,Box3=gen(M.Group),Color=gen(M.Group),Fog=gen(M.Group),TextureLoader=class{load(){return new (gen(M.Group))()}};
export const BoxGeometry=gen(M.BoxGeometry),CapsuleGeometry=gen(M.CapsuleGeometry),ConeGeometry=gen(M.ConeGeometry),CylinderGeometry=gen(M.CylinderGeometry),PlaneGeometry=gen(M.PlaneGeometry),SphereGeometry=gen(M.SphereGeometry),TorusGeometry=gen(M.SphereGeometry);
export const MeshStandardMaterial=gen(M.MeshStandardMaterial),MeshBasicMaterial=gen(M.MeshBasicMaterial),CanvasTexture=gen(M.CanvasTexture);
export const ACESFilmicToneMapping=1,AdditiveBlending=2,BackSide=1,DoubleSide=2,LoopOnce=3,PCFSoftShadowMap=4,RepeatWrapping=5,SRGBColorSpace='srgb';
window.__frames=0;
export class WebGLRenderer{constructor(){this.domElement=document.createElement('canvas');this.shadowMap={};}setPixelRatio(){}setSize(){}dispose(){}render(s){window.__scene=s;window.__frames++}}
