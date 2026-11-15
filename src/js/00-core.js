/* ============================================================
   PIZZA PLACE MASSACRE
   One page, no build step for players: three.js r128 renders a low-res PS1 frame, then a post pass
   dithers and quantizes it. Static geometry is vertex-lit once at load (Gouraud, like the PS1),
   so the whole restaurant draws in a couple dozen calls and runs on a phone.
   Source lives in src/; tools/assemble.py stitches it into game/pizza-place-massacre.html.
   ============================================================ */
'use strict';
const $=id=>document.getElementById(id);
const TAU=Math.PI*2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
const smooth=t=>t*t*(3-2*t);
const angDiff=(a,b)=>{let d=(b-a)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return d;};
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const R=mulberry(20261114);
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let touchMode=matchMedia('(pointer: coarse)').matches;
const LS={get(k,d){try{const v=localStorage.getItem('ppm.'+k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set(k,v){try{localStorage.setItem('ppm.'+k,JSON.stringify(v));}catch(e){}},del(k){try{localStorage.removeItem('ppm.'+k);}catch(e){}}};
let sens=LS.get('sens',1);
let voiceVol=LS.get('vol',1);

/* ---------- controls copy ---------- */
const CTL_DESK=[['W A S D','Move'],['Mouse','Look (click the game to lock it)'],['Shift','Run'],['C','Duck behind things'],['E','Use, take, read, hide'],['1 2 3 4','Pick a dialogue answer'],['Esc','Pause, objective and a hint']];
const CTL_TOUCH=[['Left side','Drag to move. Push far to run'],['Right side','Drag to look'],['USE','Use, take, read, hide'],['DUCK','Duck behind things'],['II','Pause, objective and a hint']];
function ctlHTML(){const L=touchMode?CTL_TOUCH:CTL_DESK;return '<dl class="ctl">'+L.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')+'</dl>';}
$('ctlPanel').innerHTML=ctlHTML();
$('ctlBtn').addEventListener('click',()=>{const p=$('ctlPanel');p.innerHTML=ctlHTML();p.hidden=!p.hidden;$('ctlBtn').setAttribute('aria-expanded',String(!p.hidden));});

if(!window.THREE){$('loadErr').hidden=false;$('startBtn').disabled=true;throw new Error('three.js missing');}

let renderer;
try{renderer=new THREE.WebGLRenderer({canvas:$('view'),antialias:false,powerPreference:'high-performance'});}
catch(e){$('loadErr').textContent='This browser could not start WebGL, so the game cannot run here. Try another browser or device.';$('loadErr').hidden=false;$('startBtn').disabled=true;throw e;}
renderer.setPixelRatio(1);

/* ============================================================
   RENDERING: low-res target, vertex snap, a gentler dither than The Abandoned (cleaner, Telltale-ish)
   ============================================================ */
const snapU={value:new THREE.Vector2(100,75)};
function psxPatch(sh){
  sh.uniforms.uSnap=snapU;
  sh.vertexShader='uniform vec2 uSnap;\n'+sh.vertexShader.replace('#include <project_vertex>',
  '#include <project_vertex>\n if(gl_Position.w>0.0){ vec2 nd=gl_Position.xy/gl_Position.w; nd=floor(nd*uSnap+0.5)/uSnap; gl_Position.xy=nd*gl_Position.w; }');
}
const psx=m=>{m.onBeforeCompile=psxPatch;return m;};
const basic=o=>psx(new THREE.MeshBasicMaterial(o));

let LOW_H=400,lowW=860;
/* resolution scale, lowered automatically on a phone that can't keep up (see perfStep in 99-main.js) */
const PERF={acc:0,n:0,t:0,scale:clamp(+LS.get('resScale',1)||1,0.55,1)};
const rt=new THREE.WebGLRenderTarget(360,270,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,format:THREE.RGBAFormat,depthBuffer:true});
const postU={tDiffuse:{value:rt.texture},uRes:{value:new THREE.Vector2(360,270)},uTime:{value:0},uFlash:{value:0},uDanger:{value:0},uWake:{value:0},uRed:{value:0}};
const postMat=new THREE.ShaderMaterial({uniforms:postU,depthTest:false,depthWrite:false,
vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }',
fragmentShader:`
uniform sampler2D tDiffuse; uniform vec2 uRes; uniform float uTime; uniform float uFlash; uniform float uDanger; uniform float uWake; uniform float uRed;
varying vec2 vUv;
float b2(vec2 a){ a=floor(a); return fract(dot(a,vec2(0.5,a.y*0.75))); }
float b4(vec2 a){ return b2(0.5*a)*0.25+b2(a); }
void main(){
  vec2 uv=vUv;
  uv.x+=sin(uv.y*9.0+uTime*1.3)*0.012*uWake; uv.y+=sin(uv.x*7.0-uTime*0.9)*0.009*uWake;
  float ca=0.0003+uDanger*0.004+uWake*0.006;
  vec3 c;
  c.r=texture2D(tDiffuse,uv+vec2(ca,0.0)).r;
  c.g=texture2D(tDiffuse,uv).g;
  c.b=texture2D(tDiffuse,uv-vec2(ca,0.0)).b;
  if(uWake>0.001){ vec3 c2=texture2D(tDiffuse,uv+vec2(0.012,0.004)*uWake).rgb; c=mix(c,(c+c2)*0.5,uWake); }
  vec2 px=floor(uv*uRes);
  float n=fract(sin(dot(px+floor(uTime*20.0)*vec2(3.1,7.7),vec2(12.9898,78.233)))*43758.5453);
  c+=(n-0.5)*0.014;
  vec2 d=vUv-0.5; float vig=1.0-dot(d,d)*(0.75+uWake*1.6); c*=clamp(vig,0.0,1.0);
  c=mix(c,vec3(0.45,0.03,0.0),uDanger*0.42*smoothstep(0.16,0.62,length(d)));
  c=mix(c,vec3(dot(c,vec3(0.3,0.59,0.11)))*vec3(1.3,0.35,0.3),uRed);
  c+=vec3(uFlash*0.95,uFlash*0.85,uFlash*0.7);
  c+=(b4(px)-0.5)/72.0;
  c=floor(clamp(c,0.0,1.0)*47.0+0.5)/47.0;
  gl_FragColor=vec4(c,1.0);
}`});
const postScene=new THREE.Scene();
const postCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),postMat));

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x070504);
scene.fog=new THREE.Fog(0x0b0806,9,34);
const camera=new THREE.PerspectiveCamera(70,1,0.05,70);
camera.rotation.order='YXZ';
scene.add(camera);
const held=new THREE.Group();camera.add(held);

function resize(){
  const w=Math.max(1,innerWidth),h=Math.max(1,innerHeight);
  // crisper than The Abandoned: close to one game pixel per screen point on a phone, capped for speed
  LOW_H=Math.round(clamp(h,320,440)*PERF.scale);
  lowW=Math.max(240,Math.round(LOW_H*w/h));
  renderer.setSize(lowW,LOW_H,false);
  rt.setSize(lowW,LOW_H);
  postU.uRes.value.set(lowW,LOW_H);
  snapU.value.set(lowW/2,LOW_H/2);
  camera.aspect=w/h;camera.fov=w<h?84:68;camera.updateProjectionMatrix();
}
addEventListener('resize',resize);

/* ============================================================
   TEXTURES: painted on small canvases, nearest-filtered
   ============================================================ */
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function texFrom(c,rep=true){const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;}return t;}
function tex(w,h,draw,rep=true){const c=canvas(w,h);const g=c.getContext('2d');draw(g,w,h);const t=texFrom(c,rep);t.userData={canvas:c};return t;}
function speck(g,w,h,n,cols,s=1,rr=R){for(let i=0;i<n;i++){g.fillStyle=cols[(rr()*cols.length)|0];g.fillRect((rr()*w)|0,(rr()*h)|0,s,s);}}
function blot(g,x,y,r,col){const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
function wear(g,w,h,n,seed){const rr=mulberry(seed);g.save();g.globalCompositeOperation='destination-out';for(let i=0;i<n;i++){g.globalAlpha=0.25+rr()*0.75;const z=1+rr()*2;g.fillRect(rr()*w,rr()*h,z,z);}g.restore();}
const FONT_BRAND='"Bungee", "Arial Black", Impact, sans-serif';
const FONT_TYPE='"Special Elite", "Courier New", monospace';
const FONT_HAND='"Reenie Beanie", "Segoe Print", cursive';
const FONT_PIX='"VT323", monospace';
function fitText(g,txt,max,px,font){let z=px;g.font=z+'px '+font;while(g.measureText(txt).width>max&&z>6){z--;g.font=z+'px '+font;}return z;}
/* repaint text textures once the web fonts arrive */
const fontJobs=[];
function onFonts(fn){fontJobs.push(fn);}
try{if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{fontJobs.forEach(f=>{try{f();}catch(e){}});});}catch(e){}

/* light helpers shared by everything that is drawn without scene lights */
const _c=new THREE.Color();
function shadeHex(hex,k){_c.setHex(hex);return _c.multiplyScalar(k).getHex();}
