/* ============================================================
   CHARACTERS: low-poly, inked outlines, painted faces that change expression. PS1 bodies, Telltale faces.
   Everything is MeshBasic with baked shading, tinted each frame by the light where the character stands.
   ============================================================ */
const LIGHT_DIR=norm([0.35,0.85,0.45]);
/* baked shading: warm key light, cool shadow side with a soft wrap, a darker underside, and a faint bounce from the floor.
   Smooth normals on the round parts so it shades like Gouraud on a PS1, not facets. */
const SH_LIT=[1.12,1.03,0.9],SH_DARK=[0.36,0.38,0.52],SH_FILL=norm([-0.6,0.25,0.75]);
function shadeGeo(geo,top=1,bottom=0.55,smooth=true){if(smooth&&geo.index){geo.computeVertexNormals();}geo=geo.index?geo.toNonIndexed():geo;if(!smooth||!geo.attributes.normal)geo.computeVertexNormals();
  const p=geo.attributes.position,n=geo.attributes.normal,c=new Float32Array(p.count*3);
  geo.computeBoundingBox();const bb=geo.boundingBox,h=Math.max(1e-3,bb.max.y-bb.min.y);
  for(let i=0;i<p.count;i++){const nx=n.getX(i),ny=n.getY(i),nz=n.getZ(i);const d=nx*LIGHT_DIR[0]+ny*LIGHT_DIR[1]+nz*LIGHT_DIR[2];
    const lam=smooth01(clamp((d+0.3)/1.3,0,1));const fill=Math.max(0,nx*SH_FILL[0]+ny*SH_FILL[1]+nz*SH_FILL[2])*0.12;const under=Math.max(0,-ny);
    const g=lerp(bottom,top,(p.getY(i)-bb.min.y)/h)*(1-under*0.22)*1.16;
    for(let k=0;k<3;k++)c[i*3+k]=(SH_DARK[k]+(SH_LIT[k]-SH_DARK[k])*lam+fill)*g+(k===0?under*0.05:0);}
  geo.setAttribute('color',new THREE.BufferAttribute(c,3));return geo;}
function smooth01(t){return t*t*(3-2*t);}
const INK=new THREE.MeshBasicMaterial({color:0x0a0605,side:THREE.BackSide});
function inkHull(geo,w){const g=geo.clone();const p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)+n.getX(i)*w,p.getY(i)+n.getY(i)*w,p.getZ(i)+n.getZ(i)*w);g.deleteAttribute('color');return g;}
/* a part: geometry + flat color or texture, with an ink outline */
/* In the Puppet Combo style (PUPPET) bodies are low-poly and faceted, with no ink outline; heads stay smooth. */
function part(ch,geo,col,opts={}){geo=shadeGeo(geo,opts.top,opts.bottom,opts.smooth!==undefined?opts.smooth:opts.flat||PUPPET?false:!(geo.type==='BoxGeometry'));const mat=psx(new THREE.MeshBasicMaterial({color:0xffffff,vertexColors:true,map:opts.map||null}));mat.userData.base=new THREE.Color(col);
  const m=new THREE.Mesh(geo,mat);ch.mats.push(mat);if(opts.ink!==0&&!PUPPET){const o=new THREE.Mesh(inkHull(geo,opts.ink||0.012),INK);m.add(o);}return m;}
const LOWP=n=>PUPPET?Math.max(5,Math.round(n*0.67)):n;
const GEO={box:(w,h,d)=>new THREE.BoxGeometry(w,h,d),cyl:(rt,rb,h,s=9)=>new THREE.CylinderGeometry(rt,rb,h,LOWP(s)),sph:(r,w=12,h=9)=>new THREE.SphereGeometry(r,LOWP(w),Math.max(4,LOWP(h)))};
function limbGeo(len,r0,r1,s=9){const g=GEO.cyl(r1,r0,len,s);g.translate(0,-len/2,0);return g;}

/* ---------- surface detail: weave for clothes, strands for hair, the cheese-foam of Toni's suit ---------- */
const CLOTH={};
function clothTex(kind){if(CLOTH[kind])return CLOTH[kind];const r=mulberry(kind.length*97+7);const t=tex(32,32,(g)=>{g.fillStyle='#fff';g.fillRect(0,0,32,32);
  if(kind==='suit'){for(let y=0;y<32;y++)for(let x=0;x<32;x++){if((x+y)%4===0){g.fillStyle='rgba(0,0,0,.07)';g.fillRect(x,y,1,1);}}speck(g,32,32,90,['rgba(0,0,0,.08)','rgba(255,255,255,.1)'],1,r);}
  else if(kind==='denim'){for(let y=0;y<32;y++)for(let x=0;x<32;x++){if((x*2+y)%5===0){g.fillStyle='rgba(0,0,0,.1)';g.fillRect(x,y,1,1);}}speck(g,32,32,140,['rgba(255,255,255,.12)','rgba(0,0,0,.1)'],1,r);}
  else if(kind==='knit'){for(let x=0;x<32;x+=2){g.fillStyle='rgba(0,0,0,.08)';g.fillRect(x,0,1,32);}speck(g,32,32,60,['rgba(0,0,0,.08)'],1,r);}
  else if(kind==='hair'){for(let i=0;i<70;i++){const x=r()*32,l=4+r()*10;g.fillStyle=i%3?'rgba(0,0,0,.22)':'rgba(255,255,255,.16)';g.fillRect(x,r()*32,1,l);}}
  else if(kind==='skin'){speck(g,32,32,50,['rgba(120,50,30,.06)','rgba(255,255,255,.05)'],1,r);}
  else if(kind==='foam'){speck(g,32,32,120,['rgba(170,90,10,.18)','rgba(255,250,210,.25)'],1,r);for(let i=0;i<7;i++)blot(g,r()*32,r()*32,2+r()*3,'rgba(150,70,0,.28)');}
  else if(kind==='leather'){speck(g,32,32,40,['rgba(255,255,255,.12)'],1,r);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(4,2,10,2);}
  },true);CLOTH[kind]=t;return t;}
/* a soft dark disc that keeps feet on the floor */
const SHADOW_TEX=tex(64,64,(g)=>{const gr=g.createRadialGradient(32,32,2,32,32,31);gr.addColorStop(0,'rgba(0,0,0,.62)');gr.addColorStop(0.55,'rgba(0,0,0,.4)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);},false);
SHADOW_TEX.magFilter=THREE.LinearFilter;SHADOW_TEX.minFilter=THREE.LinearFilter;
const SHADOW_MAT=new THREE.MeshBasicMaterial({map:SHADOW_TEX,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});

/* ---------- photo faces (Puppet Combo style) ----------
   A character with an entry in FACE_DATA (06-facedata.js, made by tools/faces.py) gets a blocky low-poly head with a
   photo of a generated, fictional face projected onto its front. Blinks and the moving jaw are painted onto the photo
   from its landmarks, so one photo per expression is enough. Everyone else keeps the painted face below. */
const PUPPET=true;
const PHOTO={};
function hasPhoto(id){return PUPPET&&typeof FACE_DATA!=='undefined'&&!!FACE_DATA[id];}
function loadPhoto(id){const P={img:{},mk:FACE_MARKS[id]};for(const k in FACE_DATA[id]){const im=new Image();im.onload=()=>{const ch=typeof CHARS!=='undefined'&&CHARS[id];if(ch&&ch.faceCv)paintFace(ch);};im.src=FACE_DATA[id][k];P.img[k]=im;}PHOTO[id]=P;return P;}
const PHOTO_EXPR={fear:'fear',scream:'fear',shock:'fear',pain:'fear',angry:'angry',sad:'sad',dead:'neutral',out:'neutral'};
function drawPhotoFace(g,id,e,blink,talk){const P=PHOTO[id],W=g.canvas.width,k=W/128,m=P.mk;g.setTransform(1,0,0,1,0,0);
  const im=P.img[PHOTO_EXPR[e]]||P.img.neutral;if(!im||!im.complete||!im.naturalWidth){g.fillStyle=CAST[id].skin;g.fillRect(0,0,W,W);return;}
  g.imageSmoothingEnabled=true;g.drawImage(im,0,0,W,W);
  // the jaw: everything under the lips slides down and the gap is the open mouth
  const open=e==='scream'?7:e==='shock'?4:talk?2.6:0;
  if(open){const my=(m.mouthR[1]+m.mouthL[1])/2,x0=m.mouthR[0],x1=m.mouthL[0],cx=(x0+x1)/2,o=Math.round(open*k);
    const sx=Math.round((x0-12)*k),sw=Math.round((x1-x0+24)*k),sy=Math.round((my+0.5)*k),sh=W-sy-o;
    if(sh>0)g.drawImage(g.canvas,sx,sy,sw,sh,sx,sy+o,sw,sh);
    const gr=g.createLinearGradient(0,sy,0,sy+o);gr.addColorStop(0,'#2a0a08');gr.addColorStop(1,'#120303');g.fillStyle=gr;
    g.beginPath();g.ellipse(cx*k,sy+o/2,(x1-x0)/2*k*0.78,o/2+k*0.4,0,0,TAU);g.fill();
    if(open>3){g.fillStyle='rgba(225,215,195,.85)';g.fillRect((cx-6)*k,sy,12*k,Math.max(1,k));}}
  // eyelids: skin sampled from just above each eye, drawn over it, with a lash line
  if(blink||e==='dead'||e==='out'){[m.eyeR,m.eyeL].forEach(([x,y])=>{const d=g.getImageData(Math.round(x*k),Math.round((y-6)*k),1,1).data;
    g.fillStyle=`rgb(${d[0]},${d[1]},${d[2]})`;g.beginPath();g.ellipse(x*k,y*k,7.5*k,4*k,0,0,TAU);g.fill();
    g.fillStyle='rgba(25,12,10,.8)';g.fillRect((x-6)*k,(y+1.2)*k,12*k,Math.max(1,0.9*k));});}}
/* the blocky head: a box pulled most of the way to an egg, the jaw narrowed. The photo is projected straight onto the
   front at one scale both ways (crown to chin = the texture's height); the back third takes the hair band from the
   top of the photo. Each triangle picks one or the other, so nothing smears across the seam. */
function photoHeadGeo(hr){const H=hr*2.2,W=hr*1.5,D=hr*1.78;let g=new THREE.BoxGeometry(W,H,D,4,6,4);const p=g.attributes.position;
  for(let i=0;i<p.count;i++){let nx=p.getX(i)/(W/2),ny=p.getY(i)/(H/2),nz=p.getZ(i)/(D/2);const l=Math.hypot(nx,ny,nz)||1;
    nx=lerp(nx,nx/l*1.12,0.62);ny=lerp(ny,ny/l*1.08,0.55);nz=lerp(nz,nz/l*1.12,0.62);
    const jaw=clamp((-0.15-ny)/0.85,0,1);nx*=1-0.24*jaw;nz*=1-0.12*jaw;if(nz>0)nz*=1-0.06*clamp(1-Math.abs(ny),0,1);
    p.setXYZ(i,nx*W/2,ny*H/2,nz*D/2);}
  g.computeVertexNormals();g=g.toNonIndexed();const P=g.attributes.position,uv=new Float32Array(P.count*2);
  for(let t=0;t<P.count;t+=3){const cz=(P.getZ(t)+P.getZ(t+1)+P.getZ(t+2))/3,back=cz<-D*0.16;
    for(let j=t;j<t+3;j++){const x=P.getX(j),y=P.getY(j),vy=(y+H/2)/H;
      uv[j*2]=back?0.5+x/H*0.5:0.5+x/H;uv[j*2+1]=back?0.8+0.15*vy:vy;}}
  g.setAttribute('uv',new THREE.BufferAttribute(uv,2));return g;}

/* ---------- faces ---------- */
const FACE_W=256,FACE_H=128;
/* faces are drawn in a 128x64 layout and scaled up 2x, so the fine strokes (lids, highlights, lip lines) land on half pixels */
function drawFace(g,s,e,blink,talk){g.setTransform(2,0,0,2,0,0);g.imageSmoothingEnabled=false;drawFace1(g,s,e,blink,talk);g.setTransform(1,0,0,1,0,0);}
function shadeHex(hex,k){const c=new THREE.Color(hex);c.multiplyScalar(k);return '#'+c.getHexString();}
function drawFace1(g,s,e,blink,talk){const W=128,H=64;g.fillStyle=s.skin;g.fillRect(0,0,W,H);
  if(!s.toni){// the skin turns away from the light: lighter on the face, darker round the sides and under the jaw
    const gr=g.createLinearGradient(0,0,W,0);gr.addColorStop(0,'rgba(40,20,30,.28)');gr.addColorStop(0.25,'rgba(255,235,210,.10)');gr.addColorStop(0.5,'rgba(30,15,25,.30)');gr.addColorStop(0.75,'rgba(40,20,30,.38)');gr.addColorStop(1,'rgba(40,20,30,.28)');g.fillStyle=gr;g.fillRect(0,0,W,H);
    const jaw=g.createLinearGradient(0,40,0,64);jaw.addColorStop(0,'rgba(0,0,0,0)');jaw.addColorStop(1,'rgba(40,15,20,.35)');g.fillStyle=jaw;g.fillRect(0,40,W,24);
    // ears on the sides of the head
    [16,48].forEach(x=>{g.fillStyle=shadeHex(s.skin,0.86);g.beginPath();g.ellipse(x,32,3,5,0,0,TAU);g.fill();g.fillStyle=shadeHex(s.skin,0.66);g.fillRect(x-1,30,2,4);});}
  // hair wraps the back and top; the face sits at u=0.25 (x=32)
  if(s.hair){g.fillStyle=s.hair;g.fillRect(0,0,W,s.hairTop||16);g.fillRect(56,0,W-80,H*(s.hairBack||0.62));if(s.bald){g.fillStyle=s.skin;g.fillRect(14,0,40,13);}
    // a soft hairline and strands, sideburns in front of the ears
    const rh=mulberry(s.name.length*13);for(let i=0;i<120;i++){const x=rh()*W,y=rh()*(s.hairTop||16);g.fillStyle=i%3?'rgba(0,0,0,.25)':'rgba(255,255,255,.12)';g.fillRect(x,y,0.6,2+rh()*3);}
    if(!s.bald){g.fillStyle=s.hair;for(let x=16;x<49;x+=2){g.fillRect(x,(s.hairTop||16),1.2,1+((x*7)%3)*0.8);}g.fillRect(19,14,3,s.pony?10:8);g.fillRect(43,14,3,s.pony?10:8);}}
  if(s.toni){g.fillStyle='#e8b23a';g.fillRect(0,0,W,H);speck(g,W,H,160,['#f7cf5c','#c98f22','#fbe08a'],2,mulberry(5));for(let i=0;i<10;i++)blot(g,mulberry(i)()*W,20+mulberry(i+9)()*40,6,'rgba(160,100,20,.35)');}
  const cx=32,ey=30,dx=7;
  if(!s.toni){// sockets and cheekbones
    blot(g,cx-dx,ey,6,'rgba(60,25,30,.22)');blot(g,cx+dx,ey,6,'rgba(60,25,30,.22)');blot(g,cx-10,ey+7,5,'rgba(255,220,200,.12)');blot(g,cx+10,ey+7,5,'rgba(255,220,200,.08)');}
  if(s.toni){// pepperoni eyes: never blink. The grin is painted on.
    [-1,1].forEach(k=>{g.fillStyle='#8a1a12';g.beginPath();g.arc(cx+k*9,ey-2,7,0,TAU);g.fill();g.fillStyle='#5e0d08';[[2,1],[-2,-2],[1,-3],[-3,2]].forEach(([a,b])=>{g.beginPath();g.arc(cx+k*9+a,ey-2+b,1.3,0,TAU);g.fill();});g.fillStyle='#120403';g.fillRect(cx+k*9-1,ey-3,2,2);});
    const tg=g.createLinearGradient(0,0,W,0);tg.addColorStop(0,'rgba(120,50,0,.2)');tg.addColorStop(0.25,'rgba(255,255,220,.12)');tg.addColorStop(0.55,'rgba(120,50,0,.28)');tg.addColorStop(1,'rgba(120,50,0,.2)');g.fillStyle=tg;g.fillRect(0,0,W,H);
    blot(g,cx-15,ey+8,5,'rgba(220,60,30,.35)');blot(g,cx+15,ey+8,5,'rgba(220,60,30,.35)');
    g.fillStyle='#2a0806';g.beginPath();g.moveTo(cx-15,ey+7);g.quadraticCurveTo(cx,ey+22,cx+15,ey+7);g.quadraticCurveTo(cx,ey+12,cx-15,ey+7);g.fill();g.strokeStyle='#e8b23a';g.lineWidth=1;for(let i=-3;i<=3;i++){g.beginPath();g.moveTo(cx+i*3.6,ey+8+Math.abs(i)*-0.3);g.lineTo(cx+i*3.6,ey+13-Math.abs(i));g.stroke();}
    return;}
  // eyes
  const wide=e==='fear'||e==='shock',closed=blink||e==='out'||e==='dead',sq=e==='angry'||e==='smirk'||e==='pain';
  [-1,1].forEach(k=>{const x=cx+k*dx;
    if(closed){g.fillStyle='#2a1a12';g.fillRect(x-3,ey,7,1);if(e==='dead'){g.fillRect(x-3,ey-2,1,1);}return;}
    const h=wide?6:sq?3:4;g.fillStyle='#efe8dc';g.fillRect(x-3,ey-h/2,7,h);g.fillStyle='rgba(120,90,80,.35)';g.fillRect(x-3,ey+h/2-0.5,7,0.5);
    g.fillStyle=s.eye||'#3a2414';g.fillRect(x-1.5,ey-h/2+(wide?1:0),4,Math.min(h,4));g.fillStyle='#0c0806';g.fillRect(x-0.5,ey-h/2+(wide?1.5:0.5),2,Math.min(h,4)-1);
    g.fillStyle='rgba(255,255,255,.85)';g.fillRect(x+0.5,ey-h/2+(wide?1.5:0.5),1,1);
    g.fillStyle='#1a0d0a';g.fillRect(x-3.5,ey-h/2-0.5,8,1);g.fillStyle='rgba(60,25,25,.35)';g.fillRect(x-3,ey-h/2-2,7,1);});
  if(s.glasses){g.strokeStyle=s.glasses;g.lineWidth=1;[-1,1].forEach(k=>g.strokeRect(cx+k*dx-4.5,ey-4,9,8));g.beginPath();g.moveTo(cx-1,ey-1);g.lineTo(cx+1,ey-1);g.stroke();}
  // brows
  g.fillStyle=s.brow||s.hair||'#2a1a12';[-1,1].forEach(k=>{const x=cx+k*dx;const tilt=e==='angry'?k*-1.5:(e==='fear'||e==='sad'||e==='pain')?k*1.5:0;const y=ey-(wide?7:6);
    g.save();g.translate(x,y);g.rotate(tilt*0.25);g.fillRect(-4,-1,8,s.bushy?3:2);g.restore();});
  // nose and cheeks
  g.fillStyle='rgba(255,230,210,.22)';g.fillRect(cx,ey+1,1,5);g.fillStyle='rgba(60,25,15,.32)';g.fillRect(cx+1,ey+2,1.5,6);g.fillRect(cx-2.5,ey+7,6,1.2);
  g.fillStyle='rgba(40,12,10,.55)';g.fillRect(cx-2,ey+7.5,1.2,0.8);g.fillRect(cx+1.8,ey+7.5,1.2,0.8);
  if(s.stache){g.fillStyle=s.stache;g.fillRect(cx-6,ey+9,13,2);g.fillRect(cx-6,ey+10.5,2,1.5);g.fillRect(cx+5,ey+10.5,2,1.5);}
  if(s.stubble){const rs=mulberry(17);for(let i=0;i<160;i++){g.fillStyle=i%2?'rgba(25,15,12,.35)':'rgba(25,15,12,.2)';g.fillRect(cx-10+rs()*21,ey+8+rs()*12,0.7,0.7);}}
  if(s.beard){g.fillStyle=s.beard;g.fillRect(cx-10,ey+9,21,11);g.fillRect(cx-12,ey+2,3,12);g.fillRect(cx+10,ey+2,3,12);g.fillStyle=s.skin;g.fillRect(cx-5,ey+12,11,4);
    const rb=mulberry(23);for(let i=0;i<90;i++){g.fillStyle=i%2?'rgba(255,255,255,.08)':'rgba(0,0,0,.25)';g.fillRect(cx-11+rb()*23,ey+3+rb()*17,0.6,1.4);}}
  // mouth
  const my=ey+13;if(!s.beard){g.fillStyle='rgba(150,60,55,.35)';g.fillRect(cx-3.5,my-1,8,1);g.fillStyle='rgba(150,60,55,.25)';g.fillRect(cx-2.5,my+1,6,1.2);}g.fillStyle='#4a1810';
  if(talk||e==='shock'||e==='scream'){const o=e==='scream'?6:e==='shock'?4:3;g.fillRect(cx-3,my-1,7,o);g.fillStyle='#e8e0d0';g.fillRect(cx-2,my-1,5,1);}
  else if(e==='smirk'){g.fillRect(cx-3,my,7,1);g.fillRect(cx+3,my-1,2,1);}
  else if(e==='sad'||e==='fear'||e==='pain'){g.fillRect(cx-3,my,7,1);g.fillRect(cx-4,my+1,1,1);g.fillRect(cx+4,my+1,1,1);}
  else if(e==='angry'){g.fillRect(cx-4,my,9,2);}
  else if(e==='smile'){g.fillRect(cx-4,my,9,1);g.fillRect(cx-5,my-1,1,1);g.fillRect(cx+5,my-1,1,1);}
  else if(e==='choke'){g.fillStyle='#5a1a10';g.fillRect(cx-3,my-1,7,4);g.fillStyle='rgba(150,40,60,.35)';g.fillRect(cx-12,ey-2,25,22);}
  else if(e==='dead'){g.fillRect(cx-3,my,6,2);}
  else g.fillRect(cx-3,my,7,1);
  if(s.blush){blot(g,cx-10,ey+7,4,'rgba(210,80,80,.22)');blot(g,cx+10,ey+7,4,'rgba(210,80,80,.22)');}
  if(s.lashes&&!closed){g.fillStyle='#120806';[-1,1].forEach(k=>{const x=cx+k*dx;g.fillRect(x+k*3.5,ey-3.5,1,1);});}
  if(s.marks)s.marks(g,cx,ey);
}

/* ---------- the cast ---------- */
const CAST={
  dad:    {name:'Dad',h:1.78,build:1.08,skin:'#b07a52',hair:'#16100c',stache:'#1a120c',shirt:'#e8e4da',jacket:'#1b1c22',pants:'#18181c',shoe:'#0c0c0c',tie:'#2a1630',eye:'#2a1a0e'},
  grandpa:{name:'Grandpa',h:1.7,build:1.0,skin:'#c3906f',hair:'#dcd8d0',bald:1,bushy:1,brow:'#e8e4dc',glasses:'#9a8a5a',shirt:'#d8d2c0',jacket:'#3a3a3e',pants:'#2c2c30',shoe:'#1a120c',tie:'#5a1a1a',hunch:0.22,eye:'#4a5a6a'},
  uncle:  {name:'Uncle',h:1.8,build:1.12,skin:'#b88560',hair:'#0e0a08',stubble:1,shirt:'#0e0e10',jacket:'#2a2a30',pants:'#1c1c22',shoe:'#3a2214',chain:1,watch:1,eye:'#1e140c'},
  alex:   {name:'Alex',h:1.56,build:0.86,skin:'#b07a52',hair:'#16100c',shirt:'#ecebe6',jacket:null,pants:'#1a1a20',shoe:'#0e0e0e',tie:'#141418',bracelet:1,eye:'#2a1a0e'},
  ruben:  {name:'Ruben',h:1.47,build:0.84,skin:'#9c6a48',hair:'#1a120c',glasses:'#111',shirt:'#222224',print:1,jacket:'#24242a',pants:'#2a2a32',shoe:'#e8e6e0',eye:'#2a1a0e'},
  lucia:  {name:'Lucia',h:1.63,build:0.88,skin:'#b47c55',hair:'#120c09',pony:1,shirt:'#121214',dress:1,pants:'#111114',shoe:'#0c0c0c',eye:'#2a1a0e',blush:1,lashes:1},
  manny:  {name:'Manny',h:1.83,build:1.12,skin:'#a87550',hair:'#16100c',beard:'#1f150e',shirt:'#b8261a',apron:'#1a1a1a',pants:'#22242a',shoe:'#0e0e0e',cap:1,eye:'#2a1a0e'},
  toni:   {name:'Toni',h:1.9,build:1.25,toni:1,skin:'#e8b23a',shirt:'#e8b23a',pants:'#e8b23a',shoe:'#c8221a',eye:'#000'},
};
const CHARS={};
function buildChar(id){const s=CAST[id];const ch={id,s,mats:[],j:{},pose:'stand',expr:'neutral',t:R()*10,blinkT:2+R()*3,talkT:0,x:0,z:0,yaw:0,y:0,root:new THREE.Group(),walkPh:0,speed:0,look:null,lookW:0,extra:{}};
  const H=s.h,b=s.build,S=H/1.78;
  const photo=hasPhoto(id);if(photo)loadPhoto(id);
  const skin=photo&&FACE_MARKS[id].skin?FACE_MARKS[id].skin:s.skin;   // a photo face sets the neck and hands to its own skin tone
  const fc=photo?canvas(128,128):canvas(FACE_W,FACE_H);ch.faceCv=fc;ch.faceTex=texFrom(fc,false);ch.faceTex.magFilter=THREE.NearestFilter;
  const top=s.toni?clothTex('foam'):s.jacket?clothTex('suit'):clothTex('knit'),legs=s.toni?clothTex('foam'):id==='alex'||id==='ruben'?clothTex('denim'):clothTex('suit');
  // the blob shadow, under the hips so it follows him in every pose
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(0.78*b*(s.toni?1.25:1),0.7*b*(s.toni?1.25:1)).rotateX(-Math.PI/2),SHADOW_MAT);shadow.position.y=0.012;ch.root.add(shadow);ch.shadow=shadow;
  const J=n=>{const g=new THREE.Group();ch.j[n]=g;return g;};
  const hips=J('hips');hips.position.y=0.94*S;ch.root.add(hips);
  const spine=J('spine');hips.add(spine);
  const chestCol=s.jacket||s.shirt;
  const torso=part(ch,GEO.cyl(0.19*b*S,0.17*b*S,0.5*S,12),chestCol,{map:top});torso.scale.z=0.62;torso.position.y=0.27*S;spine.add(torso);
  // rounded shoulders, so the silhouette isn't a tin can
  [-1,1].forEach(k=>{const d=part(ch,GEO.sph(0.075*b*S,10,8),chestCol,{map:top,ink:0.008});d.scale.set(1.1,0.8,0.95);d.position.set(k*0.17*b*S,0.48*S,0);spine.add(d);});
  // collar and lapels on a jacket over a shirt; a crew neck otherwise
  if(s.jacket&&s.shirt&&!s.toni){[-1,1].forEach(k=>{const c=part(ch,GEO.box(0.05*S,0.06*S,0.012),s.shirt,{ink:0});c.position.set(k*0.035*S,0.5*S,0.115*b*S);c.rotation.z=k*0.55;spine.add(c);
      const l=part(ch,GEO.box(0.055*S,0.26*S,0.014),shadeHex(s.jacket,0.78),{ink:0.004});l.position.set(k*0.065*S,0.37*S,0.122*b*S);l.rotation.z=-k*0.28;spine.add(l);});
    [0.2,0.12].forEach(y=>{const bt=part(ch,GEO.box(0.016,0.016,0.01),'#0a0a0c',{ink:0});bt.position.set(0.02*S,y*S,0.122*b*S);spine.add(bt);});}
  else if(!s.toni){const cr=part(ch,GEO.cyl(0.07*S,0.085*S,0.035*S,10),shadeHex(s.shirt,0.8),{ink:0});cr.scale.z=0.75;cr.position.y=0.515*S;spine.add(cr);}
  if(s.jacket&&s.shirt){const v=part(ch,GEO.box(0.12*S,0.34*S,0.02),s.shirt,{ink:0});v.position.set(0,0.36*S,0.12*b*S);spine.add(v);}
  if(s.tie){const t=part(ch,GEO.box(0.045*S,0.26*S,0.02),s.tie,{ink:0});t.position.set(0,0.34*S,0.13*b*S);spine.add(t);}
  if(s.print){const p=part(ch,GEO.box(0.14*S,0.12*S,0.02),'#c8261a',{ink:0});p.position.set(0,0.3*S,0.125*b*S);spine.add(p);}
  if(s.chain){const c=part(ch,GEO.box(0.1*S,0.015,0.02),'#e8c060',{ink:0});c.position.set(0,0.47*S,0.12*b*S);spine.add(c);}
  if(s.apron||s.toni){const ap=part(ch,GEO.box(0.3*b*S,0.5*S,0.02),s.toni?'#c8321f':s.apron,{ink:0,map:s.toni?SIGN.apron:clothTex('denim')});ap.position.set(0,0.12*S,0.135*b*S);spine.add(ap);ch.extra.apron=ap;
    if(!s.toni){// neck strap, pocket and a name tag
      const st=part(ch,GEO.box(0.2*S,0.025*S,0.012),s.apron,{ink:0});st.position.set(0,0.43*S,0.128*b*S);spine.add(st);
      const pk=part(ch,GEO.box(0.16*b*S,0.08*S,0.012),shadeHex(s.apron,1.5),{ink:0});pk.position.set(0,0.0,0.147*b*S);spine.add(pk);
      const tag=part(ch,GEO.box(0.06*S,0.025*S,0.008),'#e8e2d0',{ink:0});tag.position.set(-0.1*S,0.4*S,0.12*b*S);spine.add(tag);}}
  if(s.toni){// the suit: a bow tie and two big pepperoni buttons above the apron
    [-1,1].forEach(k=>{const bw=part(ch,GEO.cyl(0.01,0.045*S,0.07*S,6),'#c8221a',{ink:0.006});bw.rotation.z=k*Math.PI/2;bw.position.set(k*0.035*S,0.49*S,0.12*b*S);spine.add(bw);});
    const knot=part(ch,GEO.sph(0.022*S,6,5),'#a01a12',{ink:0.005});knot.position.set(0,0.49*S,0.13*b*S);spine.add(knot);
    [0.42].forEach(y=>{const bt=part(ch,GEO.cyl(0.03*S,0.03*S,0.015,9),'#a3241a',{ink:0.005});bt.rotation.x=Math.PI/2;bt.position.set(0.08*S,y*S,0.13*b*S);spine.add(bt);});}
  const pelvis=part(ch,GEO.cyl(0.17*b*S,0.16*b*S,0.18*S,12),s.dress?s.shirt:s.pants,{map:s.dress?top:legs});pelvis.scale.z=0.7;pelvis.position.y=-0.02*S;hips.add(pelvis);
  if(s.dress){const sk=part(ch,GEO.cyl(0.18*b*S,0.27*b*S,0.42*S,12),s.shirt,{map:top});sk.position.y=-0.2*S;hips.add(sk);
    const sash=part(ch,GEO.cyl(0.175*b*S,0.175*b*S,0.03*S,12),'#2a2a30',{ink:0});sash.scale.z=0.72;sash.position.y=0.06*S;hips.add(sash);}
  else if(!s.toni){// a belt with a buckle
    const belt=part(ch,GEO.cyl(0.172*b*S,0.172*b*S,0.035*S,12),'#16100c',{ink:0,map:clothTex('leather')});belt.scale.z=0.72;belt.position.y=0.06*S;hips.add(belt);
    const bk=part(ch,GEO.box(0.04*S,0.03*S,0.01),'#c8b070',{ink:0});bk.position.set(0,0.06*S,0.125*b*S);hips.add(bk);}
  const neck=J('neck');neck.position.y=0.52*S;spine.add(neck);
  const nk=part(ch,photo?GEO.cyl(0.062*S,0.07*S,0.1*S,9):GEO.cyl(0.05*S,0.06*S,0.1*S,9),skin,{ink:0,top:0.75,bottom:0.5});nk.position.y=0.04*S;neck.add(nk);
  const head=J('head');head.position.y=(photo?0.075:0.1)*S;neck.add(head);
  const hr=(s.toni?0.165:photo?0.135:0.125)*S;const hg=GEO.sph(hr,16,12);if(s.toni){const p=hg.attributes.position;const rr2=mulberry(41);for(let i=0;i<p.count;i++){const k=1+(rr2()-0.5)*0.12;p.setXYZ(i,p.getX(i)*k,p.getY(i)*k*1.05,p.getZ(i)*k*(p.getZ(i)>0?0.92:1));}}
  const hm=photo?part(ch,photoHeadGeo(hr),'#ffffff',{map:ch.faceTex,top:1.02,bottom:0.9,ink:0,smooth:true}):part(ch,hg,'#ffffff',{map:ch.faceTex,top:1.05,bottom:0.85});
  hm.position.y=hr*0.95;if(!photo)hm.scale.set(1,1.08,1);head.add(hm);ch.headMesh=hm;
  if(!s.toni&&!photo){// ears and a nose, so the head has a profile
    [-1,1].forEach(k=>{const e=part(ch,GEO.sph(hr*0.26,8,6),s.skin,{ink:0.005});e.scale.set(0.45,1,0.75);e.position.set(k*hr*0.98,hr*0.88,-hr*0.05);head.add(e);});
    const no=part(ch,GEO.cyl(hr*0.05,hr*0.13,hr*0.36,5),s.skin,{ink:0.004,top:1.05,bottom:0.8});no.rotation.x=0.32;no.position.set(0,hr*0.84,hr*0.97);head.add(no);}
  if(s.hair&&!s.bald&&!s.toni&&!photo){const cap=part(ch,new THREE.SphereGeometry(hr*1.07,16,9,0,TAU,0,Math.PI*0.42),s.hair,{map:clothTex('hair')});cap.position.y=hr*1.0;cap.rotation.x=-0.25;head.add(cap);
    const back=part(ch,GEO.sph(hr*1.02,14,9),s.hair,{map:clothTex('hair'),ink:0});back.scale.set(1.0,0.85,0.8);back.position.set(0,hr*0.98,-hr*0.32);head.add(back);}
  if(s.bald&&!photo){[-1,1].forEach(k=>{const tuft=part(ch,GEO.sph(hr*0.45,6,5),s.hair,{});tuft.scale.set(0.5,0.8,1.1);tuft.position.set(k*hr*0.9,hr*0.9,-hr*0.2);head.add(tuft);});}
  if(s.pony){const pt=part(ch,GEO.cyl(0.045*S,0.018*S,0.3*S,8),s.hair,{map:clothTex('hair')});pt.position.set(0,hr*1.15,-hr*1.12);pt.rotation.x=0.42;head.add(pt);ch.extra.pony=pt;
    const tie=part(ch,GEO.cyl(0.04*S,0.04*S,0.025*S,8),'#7a1a2a',{ink:0});tie.position.set(0,hr*1.42,-hr*1.02);tie.rotation.x=0.42;head.add(tie);}
  if(s.glasses&&!s.toni&&!photo){// wire frames in front of the painted ones
    [-1,1].forEach(k=>{const f=part(ch,GEO.box(hr*0.42,hr*0.3,0.004),s.glasses,{ink:0});f.material.transparent=true;f.material.opacity=0.35;f.position.set(k*hr*0.36,hr*1.04,hr*0.97);head.add(f);});
    const br=part(ch,GEO.box(hr*0.2,0.006,0.006),s.glasses,{ink:0});br.position.set(0,hr*1.08,hr*1.0);head.add(br);}
  if(s.cap){const c=part(ch,GEO.cyl(hr*1.04,hr*1.08,hr*0.55,10),'#b8261a',{});c.position.y=hr*1.55;head.add(c);const br=part(ch,GEO.box(hr*1.6,0.015,hr*1.1),'#b8261a',{});br.position.set(0,hr*1.3,hr*0.95);head.add(br);}
  if(s.toni){// chef's hat, cheese drips, the stretched-stocking sheen
    const band=part(ch,GEO.cyl(hr*0.95,hr*1.0,hr*0.5,10),'#efeae0',{});band.position.y=hr*2.0;head.add(band);
    const puff=part(ch,GEO.sph(hr*1.15,10,8),'#f4f0e8',{});puff.scale.set(1,0.75,1);puff.position.y=hr*2.6;head.add(puff);
    for(let i=0;i<7;i++){const a=-1.2+i*0.4;const d=part(ch,GEO.cyl(0.018,0.008,0.07+((i*37)%5)*0.025,5),'#e8b23a',{ink:0.006});d.position.set(Math.sin(a)*hr*0.92,hr*0.1-((i*37)%5)*0.012,Math.cos(a)*hr*0.85);head.add(d);}
  }
  // arms
  for(const side of ['L','R']){const k=side==='L'?1:-1;const sh=J('sh'+side);sh.position.set(k*0.22*b*S,0.46*S,0);spine.add(sh);
    const ua=part(ch,limbGeo(0.29*S,0.055*b*S,0.047*b*S),s.jacket||s.shirt,{map:top});sh.add(ua);
    const el=J('el'+side);el.position.y=-0.29*S;sh.add(el);
    const fa=part(ch,limbGeo(0.26*S,0.045*b*S,0.038*b*S),s.jacket||s.shirt,{map:top});el.add(fa);
    if(s.jacket&&s.shirt&&!s.toni){const cuff=part(ch,GEO.cyl(0.04*b*S,0.04*b*S,0.025*S,9),s.shirt,{ink:0});cuff.position.y=-0.255*S;el.add(cuff);}
    if(id==='manny'||id==='alex'||id==='lucia'){fa.material.userData.base=new THREE.Color(skin);}
    const hd=J('hand'+side);hd.position.y=-0.27*S;el.add(hd);
    const hand=part(ch,GEO.box(0.07*S,0.1*S,0.035*S),s.toni?'#f4f0e8':skin,{});hand.position.y=-0.04*S;hd.add(hand);
    const th=part(ch,GEO.box(0.022*S,0.05*S,0.024*S),s.toni?'#f4f0e8':skin,{ink:0.006});th.position.set(k*0.042*S*(s.toni?1.3:1),-0.03*S,0.012*S);th.rotation.z=-k*0.45;hd.add(th);
    if(s.toni){const cuff=part(ch,GEO.cyl(0.055*S,0.05*S,0.05*S,7),'#f4f0e8',{});cuff.position.y=0.005;hd.add(cuff);hand.scale.set(1.3,1.15,1.4);}
    if(s.bracelet&&side==='L'){const br=part(ch,GEO.cyl(0.044*S,0.044*S,0.025,8),'#d42a1a',{ink:0.004});br.position.y=-0.23*S;el.add(br);ch.extra.bracelet=br;}
    if(s.watch&&side==='L'){const w=part(ch,GEO.cyl(0.044*S,0.044*S,0.03,8),'#e8c060',{ink:0.004});w.position.y=-0.23*S;el.add(w);}
  }
  // legs
  for(const side of ['L','R']){const k=side==='L'?1:-1;const hp=J('hip'+side);hp.position.set(k*0.095*b*S,-0.06*S,0);hips.add(hp);
    const th=part(ch,limbGeo(0.42*S,0.075*b*S,0.06*b*S),s.dress?s.pants:s.pants,{map:legs});hp.add(th);
    const kn=J('knee'+side);kn.position.y=-0.42*S;hp.add(kn);const sh=part(ch,limbGeo(0.42*S,0.057*b*S,0.045*b*S),s.pants,{map:legs});kn.add(sh);
    const ft=J('foot'+side);ft.position.y=-0.43*S;kn.add(ft);
    const shoe=part(ch,GEO.box(0.1*b*S,0.08*S,(s.toni?0.3:0.24)*S),s.shoe,{map:clothTex('leather')});shoe.position.set(0,-0.0,0.05*S);ft.add(shoe);
    if(!s.toni){const sole=part(ch,GEO.box(0.106*b*S,0.022*S,0.25*S),s.shoe==='#e8e6e0'?'#c8c4b8':'#2a2420',{ink:0});sole.position.set(0,-0.045*S,0.05*S);ft.add(sole);
      const toe=part(ch,GEO.cyl(0.05*b*S,0.05*b*S,0.08*S,8),s.shoe,{ink:0,map:clothTex('leather')});toe.scale.set(1,1,0.6);toe.position.set(0,0,0.17*S);ft.add(toe);}
    if(s.toni){const toe=part(ch,GEO.box(0.104*b*S,0.05*S,0.08*S),'#f4f0e8',{ink:0});toe.position.set(0,-0.012,0.17*S);ft.add(toe);const sole=part(ch,GEO.box(0.106*b*S,0.025*S,0.31*S),'#f4f0e8',{ink:0});sole.position.set(0,-0.045,0.05*S);ft.add(sole);}}
  if(s.toni){// the phone, always in his right hand, and the gun he holds in his left once he's hunting
    const ph=new THREE.Group();const body=part(ch,GEO.box(0.075,0.15,0.012),'#111',{ink:0.004});ph.add(body);const scr=new THREE.Mesh(new THREE.PlaneGeometry(0.064,0.13),new THREE.MeshBasicMaterial({color:0x9fd0ff}));scr.position.z=0.007;ph.add(scr);ch.extra.screen=scr;
    ph.position.set(0,-0.1,0.04);ph.rotation.x=-0.3;ch.j.handR.add(ph);ch.extra.phone=ph;
    const gun=new THREE.Group();const gb=part(ch,GEO.box(0.035,0.11,0.17),'#1a1a1a',{ink:0.004});gb.position.set(0,0,0.04);gun.add(gb);const gg=part(ch,GEO.box(0.03,0.11,0.04),'#2a2018',{ink:0.004});gg.position.set(0,-0.08,-0.02);gun.add(gg);
    gun.position.set(0,-0.12,0.02);gun.rotation.x=-1.3;gun.visible=false;ch.j.handL.add(gun);ch.extra.gun=gun;}
  scene.add(ch.root);CHARS[id]=ch;setExpr(ch,'neutral');return ch;}
signTex('apron',32,48,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#c8321f';g.fillRect(3,0,26,34);const rr3=mulberry(12);for(let i=0;i<9;i++){const x=3+rr3()*24,l=6+rr3()*12;g.fillRect(x,30,2+rr3()*2,l);g.beginPath();g.arc(x+1.5,30+l,2,0,TAU);g.fill();}
  g.fillStyle='#e8b23a';g.fillRect(0,0,3,48);g.fillRect(29,0,3,48);g.fillStyle='rgba(120,10,5,.5)';g.fillRect(6,10,20,2);g.fillStyle='#f4f0e8';g.font='7px '+FONT_BRAND;g.fillText('TONI',5,20);});
function setExpr(ch,e){ch.expr=e;paintFace(ch);}
function paintFace(ch){const g=ch.faceCv.getContext('2d');if(PHOTO[ch.id])drawPhotoFace(g,ch.id,ch.expr,ch.blinkNow,ch.talkOpen);else drawFace(g,ch.s,ch.expr,ch.blinkNow,ch.talkOpen);ch.faceTex.needsUpdate=true;}
function place(ch,x,z,yaw,y=0){ch.x=x;ch.z=z;ch.yaw=yaw;ch.y=y;ch.root.position.set(x,y,z);ch.root.rotation.y=yaw;}
function say(ch,dur){ch.talkT=Math.max(ch.talkT,dur);}

/* ---------- poses: joint targets (x rotations unless noted) ---------- */
const POSES={
  stand:{},
  sit:{hipL:-1.5,hipR:-1.5,kneeL:1.5,kneeR:1.5,shL:-0.35,shR:-0.35,elL:-0.9,elR:-0.9,hipsY:-0.47},
  sitOut:{hipL:-1.4,hipR:-1.5,kneeL:1.45,kneeR:1.55,spine:0.55,neck:0.5,head:0.35,shL:0.1,shR:0.15,elL:-0.2,elR:-0.1,hipsY:-0.5,headZ:0.35},
  sitScared:{hipL:-1.55,hipR:-1.5,kneeL:1.7,kneeR:1.6,spine:0.12,shL:-0.6,shR:-0.6,elL:-1.4,elR:-1.4,hipsY:-0.47,neck:0.1},
  sitBound:{hipL:-1.5,hipR:-1.5,kneeL:1.5,kneeR:1.5,shL:0.25,shR:0.25,elL:-0.15,elR:-0.15,hipsY:-0.47,armOut:0.12},
  eat:{hipL:-1.5,hipR:-1.5,kneeL:1.5,kneeR:1.5,spine:0.15,shR:-1.25,elR:-1.7,shL:-0.4,elL:-0.9,hipsY:-0.47,neck:0.1},
  choke:{hipL:-1.4,hipR:-1.6,kneeL:1.4,kneeR:1.6,spine:-0.25,neck:-0.35,shL:-1.6,shR:-1.6,elL:-2.0,elR:-2.0,hipsY:-0.47,armIn:0.6},
  slumpDead:{hipL:-1.5,hipR:-1.5,kneeL:1.5,kneeR:1.5,spine:0.85,neck:0.6,head:0.5,shL:-0.9,shR:-1.1,elL:-0.3,elR:-0.5,hipsY:-0.47,headZ:-0.4},
  type:{shR:-0.95,elR:-1.15,shL:-0.75,elL:-1.4,neck:0.35,armIn:0.35},
  typeHead:{shR:-0.95,elR:-1.15,shL:-0.75,elL:-1.4,neck:0.3,headZ:0.45,armIn:0.35},
  aim:{shL:-1.45,elL:-0.05,shR:-0.95,elR:-1.15,armIn:0.2},
  carry:{shL:-0.75,elL:-1.0,shR:-0.75,elR:-1.0,armIn:0.25},
  crouchHug:{hipL:-1.9,hipR:-1.9,kneeL:2.4,kneeR:2.4,spine:0.5,shL:-1.0,shR:-1.0,elL:-1.6,elR:-1.6,hipsY:-0.62,neck:0.3},
};
function animChar(ch,dt){ch.t+=dt;const P=POSES[ch.pose]||POSES.stand,j=ch.j,k=10;
  const tgt=(n,v)=>{if(j[n])j[n].rotation.x=damp(j[n].rotation.x,v||0,k,dt);};
  const walk=ch.speed>0.05,ph=ch.walkPh,sw=walk?Math.sin(ph)*clamp(ch.speed/1.4,0.4,1.1):0;
  tgt('hipL',(P.hipL||0)+sw*0.55);tgt('hipR',(P.hipR||0)-sw*0.55);tgt('kneeL',(P.kneeL||0)+(walk?Math.max(0,-Math.sin(ph))*0.8:0));tgt('kneeR',(P.kneeR||0)+(walk?Math.max(0,Math.sin(ph))*0.8:0));
  tgt('shL',(P.shL||0)-sw*0.4*(P.shL?0.2:1));tgt('shR',(P.shR||0)+sw*0.4*(P.shR?0.2:1));tgt('elL',P.elL||-0.15);tgt('elR',P.elR||-0.15);
  const br=Math.sin(ch.t*1.7)*0.02;tgt('spine',(P.spine||0)+(ch.s.hunch||0)+br);tgt('neck',(P.neck||0)-(ch.s.hunch||0)*0.6);tgt('head',P.head||0);
  if(j.head){j.head.rotation.z=damp(j.head.rotation.z,(P.headZ||0)+(ch.tilt||0),6,dt);}
  const ai=P.armIn||0,ao=P.armOut||0;if(j.shL){j.shL.rotation.z=damp(j.shL.rotation.z,-ai+ao+0.06,k,dt);j.shR.rotation.z=damp(j.shR.rotation.z,ai-ao-0.06,k,dt);}
  j.hips.position.y=damp(j.hips.position.y,0.94*ch.s.h/1.78+(P.hipsY||0)*ch.s.h/1.78+(walk?Math.abs(Math.cos(ph))*0.03:0),k,dt);
  // look at a point by turning the head
  if(ch.look&&j.head){const dx=ch.look[0]-ch.x,dz=ch.look[2]-ch.z;const want=Math.atan2(dx,dz);let d=angDiff(ch.yaw,want);d=clamp(d,-1.1,1.1);j.head.rotation.y=damp(j.head.rotation.y,d,5,dt);
    const dy=ch.look[1]-(ch.y+ch.s.h*0.9);const pit=-Math.atan2(dy,Math.hypot(dx,dz));j.neck.rotation.x+= (clamp(pit,-0.5,0.6)*0.6-0)*0.0;}
  else if(j.head)j.head.rotation.y=damp(j.head.rotation.y,0,4,dt);
  if(ch.shake){j.spine.rotation.z=Math.sin(ch.t*31)*0.04*ch.shake;}else j.spine.rotation.z=damp(j.spine.rotation.z,0,8,dt);
  // face: blink and flap the mouth while talking
  if(!ch.s.toni){ch.blinkT-=dt;let need=false;const bl=ch.blinkT<0.12&&ch.blinkT>0;if(bl!==!!ch.blinkNow){ch.blinkNow=bl;need=true;}if(ch.blinkT<0)ch.blinkT=2.5+R()*3.5;
    if(ch.talkT>0){ch.talkT-=dt;const o=Math.sin(ch.t*18)>0;if(o!==!!ch.talkOpen){ch.talkOpen=o;need=true;}}else if(ch.talkOpen){ch.talkOpen=false;need=true;}
    if(need)paintFace(ch);}
  ch.root.position.set(ch.x,ch.y,ch.z);ch.root.rotation.y=ch.yaw;
  const L=tintAt(ch.x,1.3,ch.z,1.15);for(const m of ch.mats){m.color.copy(m.userData.base).multiply(L);}
}
/* a person sitting at the party table */
function seat(ch,key){const s=PT.seats[key];place(ch,s[0]-Math.sin(s[2])*0.05,s[1]-Math.cos(s[2])*0.05,s[2],0);}
