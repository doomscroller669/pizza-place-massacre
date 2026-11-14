/* ============================================================
   CHARACTERS: low-poly, inked outlines, painted faces that change expression. PS1 bodies, Telltale faces.
   Everything is MeshBasic with baked shading, tinted each frame by the light where the character stands.
   ============================================================ */
const LIGHT_DIR=norm([0.35,0.85,0.45]);
function shadeGeo(geo,top=1,bottom=0.55){geo=geo.index?geo.toNonIndexed():geo;geo.computeVertexNormals();const p=geo.attributes.position,n=geo.attributes.normal,c=new Float32Array(p.count*3);
  geo.computeBoundingBox();const bb=geo.boundingBox,h=Math.max(1e-3,bb.max.y-bb.min.y);
  for(let i=0;i<p.count;i++){const d=n.getX(i)*LIGHT_DIR[0]+n.getY(i)*LIGHT_DIR[1]+n.getZ(i)*LIGHT_DIR[2];const k=(0.5+0.5*Math.max(0,d))*lerp(bottom,top,(p.getY(i)-bb.min.y)/h)*1.25;c[i*3]=c[i*3+1]=c[i*3+2]=k;}
  geo.setAttribute('color',new THREE.BufferAttribute(c,3));return geo;}
const INK=new THREE.MeshBasicMaterial({color:0x0a0605,side:THREE.BackSide});
function inkHull(geo,w){const g=geo.clone();const p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)+n.getX(i)*w,p.getY(i)+n.getY(i)*w,p.getZ(i)+n.getZ(i)*w);g.deleteAttribute('color');return g;}
/* a part: geometry + flat color or texture, with an ink outline */
function part(ch,geo,col,opts={}){geo=shadeGeo(geo,opts.top,opts.bottom);const mat=psx(new THREE.MeshBasicMaterial({color:0xffffff,vertexColors:true,map:opts.map||null}));mat.userData.base=new THREE.Color(col);
  const m=new THREE.Mesh(geo,mat);ch.mats.push(mat);if(opts.ink!==0){const o=new THREE.Mesh(inkHull(geo,opts.ink||0.012),INK);m.add(o);}return m;}
const GEO={box:(w,h,d)=>new THREE.BoxGeometry(w,h,d),cyl:(rt,rb,h,s=7)=>new THREE.CylinderGeometry(rt,rb,h,s),sph:(r,w=10,h=8)=>new THREE.SphereGeometry(r,w,h)};
function limbGeo(len,r0,r1,s=7){const g=GEO.cyl(r1,r0,len,s);g.translate(0,-len/2,0);return g;}

/* ---------- faces ---------- */
const FACE_W=128,FACE_H=64;
function drawFace(g,s,e,blink,talk){const W=FACE_W,H=FACE_H;g.fillStyle=s.skin;g.fillRect(0,0,W,H);
  // hair wraps the back and top; the face sits at u=0.25 (x=32)
  if(s.hair){g.fillStyle=s.hair;g.fillRect(0,0,W,s.hairTop||16);g.fillRect(56,0,W-80,H*(s.hairBack||0.62));if(s.bald){g.fillStyle=s.skin;g.fillRect(14,0,40,13);}}
  if(s.toni){g.fillStyle='#e8b23a';g.fillRect(0,0,W,H);speck(g,W,H,160,['#f7cf5c','#c98f22','#fbe08a'],2,mulberry(5));for(let i=0;i<10;i++)blot(g,mulberry(i)()*W,20+mulberry(i+9)()*40,6,'rgba(160,100,20,.35)');}
  const cx=32,ey=30,dx=7;
  if(s.toni){// pepperoni eyes: never blink. The grin is painted on.
    [-1,1].forEach(k=>{g.fillStyle='#8a1a12';g.beginPath();g.arc(cx+k*9,ey-2,7,0,TAU);g.fill();g.fillStyle='#5e0d08';[[2,1],[-2,-2],[1,-3],[-3,2]].forEach(([a,b])=>{g.beginPath();g.arc(cx+k*9+a,ey-2+b,1.3,0,TAU);g.fill();});g.fillStyle='#120403';g.fillRect(cx+k*9-1,ey-3,2,2);});
    g.fillStyle='#2a0806';g.beginPath();g.moveTo(cx-15,ey+7);g.quadraticCurveTo(cx,ey+22,cx+15,ey+7);g.quadraticCurveTo(cx,ey+12,cx-15,ey+7);g.fill();g.strokeStyle='#e8b23a';g.lineWidth=1;for(let i=-3;i<=3;i++){g.beginPath();g.moveTo(cx+i*3.6,ey+8+Math.abs(i)*-0.3);g.lineTo(cx+i*3.6,ey+13-Math.abs(i));g.stroke();}
    return;}
  // eyes
  const wide=e==='fear'||e==='shock',closed=blink||e==='out'||e==='dead',sq=e==='angry'||e==='smirk'||e==='pain';
  [-1,1].forEach(k=>{const x=cx+k*dx;
    if(closed){g.fillStyle='#2a1a12';g.fillRect(x-3,ey,7,1);if(e==='dead'){g.fillRect(x-3,ey-2,1,1);}return;}
    const h=wide?6:sq?3:4;g.fillStyle='#f4efe6';g.fillRect(x-3,ey-h/2,7,h);g.fillStyle=s.eye||'#3a2414';g.fillRect(x-1,ey-h/2+(wide?1:0),3,Math.min(h,4));g.fillStyle='#0c0806';g.fillRect(x,ey-h/2+(wide?2:1),1,2);
    g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x-3,ey-h/2-1,7,1);});
  if(s.glasses){g.strokeStyle=s.glasses;g.lineWidth=1;[-1,1].forEach(k=>g.strokeRect(cx+k*dx-4.5,ey-4,9,8));g.beginPath();g.moveTo(cx-1,ey-1);g.lineTo(cx+1,ey-1);g.stroke();}
  // brows
  g.fillStyle=s.brow||s.hair||'#2a1a12';[-1,1].forEach(k=>{const x=cx+k*dx;const tilt=e==='angry'?k*-1.5:(e==='fear'||e==='sad'||e==='pain')?k*1.5:0;const y=ey-(wide?7:6);
    g.save();g.translate(x,y);g.rotate(tilt*0.25);g.fillRect(-4,-1,8,s.bushy?3:2);g.restore();});
  // nose and cheeks
  g.fillStyle='rgba(60,30,15,.28)';g.fillRect(cx-1,ey+3,3,5);g.fillRect(cx-2,ey+7,5,1);
  if(s.stache){g.fillStyle=s.stache;g.fillRect(cx-6,ey+9,13,2);}
  if(s.stubble){g.fillStyle='rgba(30,20,15,.22)';g.fillRect(cx-9,ey+8,19,10);}
  if(s.beard){g.fillStyle=s.beard;g.fillRect(cx-10,ey+9,21,11);g.fillStyle=s.skin;g.fillRect(cx-5,ey+12,11,4);}
  // mouth
  const my=ey+13;g.fillStyle='#4a1810';
  if(talk||e==='shock'||e==='scream'){const o=e==='scream'?6:e==='shock'?4:3;g.fillRect(cx-3,my-1,7,o);g.fillStyle='#e8e0d0';g.fillRect(cx-2,my-1,5,1);}
  else if(e==='smirk'){g.fillRect(cx-3,my,7,1);g.fillRect(cx+3,my-1,2,1);}
  else if(e==='sad'||e==='fear'||e==='pain'){g.fillRect(cx-3,my,7,1);g.fillRect(cx-4,my+1,1,1);g.fillRect(cx+4,my+1,1,1);}
  else if(e==='angry'){g.fillRect(cx-4,my,9,2);}
  else if(e==='smile'){g.fillRect(cx-4,my,9,1);g.fillRect(cx-5,my-1,1,1);g.fillRect(cx+5,my-1,1,1);}
  else if(e==='choke'){g.fillStyle='#5a1a10';g.fillRect(cx-3,my-1,7,4);g.fillStyle='rgba(150,40,60,.35)';g.fillRect(cx-12,ey-2,25,22);}
  else if(e==='dead'){g.fillRect(cx-3,my,6,2);}
  else g.fillRect(cx-3,my,7,1);
  if(s.blush){g.fillStyle='rgba(200,80,70,.18)';g.fillRect(cx-12,ey+5,5,3);g.fillRect(cx+8,ey+5,5,3);}
  if(s.marks)s.marks(g,cx,ey);
}

/* ---------- the cast ---------- */
const CAST={
  dad:    {name:'Dad',h:1.78,build:1.08,skin:'#b07a52',hair:'#16100c',stache:'#1a120c',shirt:'#e8e4da',jacket:'#1b1c22',pants:'#18181c',shoe:'#0c0c0c',tie:'#2a1630',eye:'#2a1a0e'},
  grandpa:{name:'Grandpa',h:1.7,build:1.0,skin:'#c3906f',hair:'#dcd8d0',bald:1,bushy:1,brow:'#e8e4dc',glasses:'#9a8a5a',shirt:'#d8d2c0',jacket:'#3a3a3e',pants:'#2c2c30',shoe:'#1a120c',tie:'#5a1a1a',hunch:0.22,eye:'#4a5a6a'},
  uncle:  {name:'Uncle',h:1.8,build:1.12,skin:'#b88560',hair:'#0e0a08',stubble:1,shirt:'#0e0e10',jacket:'#2a2a30',pants:'#1c1c22',shoe:'#3a2214',chain:1,watch:1,eye:'#1e140c'},
  alex:   {name:'Alex',h:1.56,build:0.86,skin:'#b07a52',hair:'#16100c',shirt:'#ecebe6',jacket:null,pants:'#1a1a20',shoe:'#0e0e0e',tie:'#141418',bracelet:1,eye:'#2a1a0e'},
  ruben:  {name:'Ruben',h:1.47,build:0.84,skin:'#9c6a48',hair:'#1a120c',glasses:'#111',shirt:'#222224',print:1,jacket:'#24242a',pants:'#2a2a32',shoe:'#e8e6e0',eye:'#2a1a0e'},
  lucia:  {name:'Lucia',h:1.63,build:0.88,skin:'#b47c55',hair:'#120c09',pony:1,shirt:'#121214',dress:1,pants:'#111114',shoe:'#0c0c0c',eye:'#2a1a0e',blush:1},
  manny:  {name:'Manny',h:1.83,build:1.12,skin:'#a87550',hair:'#16100c',beard:'#1f150e',shirt:'#b8261a',apron:'#1a1a1a',pants:'#22242a',shoe:'#0e0e0e',cap:1,eye:'#2a1a0e'},
  toni:   {name:'Toni',h:1.9,build:1.25,toni:1,skin:'#e8b23a',shirt:'#e8b23a',pants:'#e8b23a',shoe:'#c8221a',eye:'#000'},
};
const CHARS={};
function buildChar(id){const s=CAST[id];const ch={id,s,mats:[],j:{},pose:'stand',expr:'neutral',t:R()*10,blinkT:2+R()*3,talkT:0,x:0,z:0,yaw:0,y:0,root:new THREE.Group(),walkPh:0,speed:0,look:null,lookW:0,extra:{}};
  const H=s.h,b=s.build,S=H/1.78;
  const fc=canvas(FACE_W,FACE_H);ch.faceCv=fc;ch.faceTex=texFrom(fc,false);ch.faceTex.magFilter=THREE.NearestFilter;
  const J=n=>{const g=new THREE.Group();ch.j[n]=g;return g;};
  const hips=J('hips');hips.position.y=0.94*S;ch.root.add(hips);
  const spine=J('spine');hips.add(spine);
  const chestCol=s.jacket||s.shirt;
  const torso=part(ch,GEO.cyl(0.19*b*S,0.17*b*S,0.5*S,8),chestCol,{});torso.scale.z=0.62;torso.position.y=0.27*S;spine.add(torso);
  if(s.jacket&&s.shirt){const v=part(ch,GEO.box(0.12*S,0.34*S,0.02),s.shirt,{ink:0});v.position.set(0,0.36*S,0.12*b*S);spine.add(v);}
  if(s.tie){const t=part(ch,GEO.box(0.045*S,0.26*S,0.02),s.tie,{ink:0});t.position.set(0,0.34*S,0.13*b*S);spine.add(t);}
  if(s.print){const p=part(ch,GEO.box(0.14*S,0.12*S,0.02),'#c8261a',{ink:0});p.position.set(0,0.3*S,0.125*b*S);spine.add(p);}
  if(s.chain){const c=part(ch,GEO.box(0.1*S,0.015,0.02),'#e8c060',{ink:0});c.position.set(0,0.47*S,0.12*b*S);spine.add(c);}
  if(s.apron||s.toni){const ap=part(ch,GEO.box(0.3*b*S,0.5*S,0.02),s.toni?'#c8321f':s.apron,{ink:0,map:s.toni?SIGN.apron:null});ap.position.set(0,0.12*S,0.135*b*S);spine.add(ap);ch.extra.apron=ap;}
  const pelvis=part(ch,GEO.cyl(0.17*b*S,0.16*b*S,0.18*S,8),s.dress?s.shirt:s.pants,{});pelvis.scale.z=0.7;pelvis.position.y=-0.02*S;hips.add(pelvis);
  if(s.dress){const sk=part(ch,GEO.cyl(0.18*b*S,0.27*b*S,0.42*S,8),s.shirt,{});sk.position.y=-0.2*S;hips.add(sk);}
  const neck=J('neck');neck.position.y=0.52*S;spine.add(neck);
  const nk=part(ch,GEO.cyl(0.05*S,0.06*S,0.1*S,6),s.skin,{ink:0});nk.position.y=0.04*S;neck.add(nk);
  const head=J('head');head.position.y=0.1*S;neck.add(head);
  const hr=(s.toni?0.165:0.125)*S;const hg=GEO.sph(hr,12,10);if(s.toni){const p=hg.attributes.position;const rr2=mulberry(41);for(let i=0;i<p.count;i++){const k=1+(rr2()-0.5)*0.12;p.setXYZ(i,p.getX(i)*k,p.getY(i)*k*1.05,p.getZ(i)*k*(p.getZ(i)>0?0.92:1));}}
  const hm=part(ch,hg,'#ffffff',{map:ch.faceTex,top:1.05,bottom:0.85});hm.position.y=hr*0.95;hm.scale.set(1,1.08,1);head.add(hm);ch.headMesh=hm;
  if(s.hair&&!s.bald&&!s.toni){const cap=part(ch,new THREE.SphereGeometry(hr*1.07,12,8,0,TAU,0,Math.PI*0.42),s.hair,{});cap.position.y=hr*1.0;cap.rotation.x=-0.25;head.add(cap);}
  if(s.bald){[-1,1].forEach(k=>{const tuft=part(ch,GEO.sph(hr*0.45,6,5),s.hair,{});tuft.scale.set(0.5,0.8,1.1);tuft.position.set(k*hr*0.9,hr*0.9,-hr*0.2);head.add(tuft);});}
  if(s.pony){const pt=part(ch,GEO.cyl(0.04*S,0.02*S,0.28*S,6),s.hair,{});pt.position.set(0,hr*1.25,-hr*1.05);pt.rotation.x=0.5;head.add(pt);ch.extra.pony=pt;}
  if(s.cap){const c=part(ch,GEO.cyl(hr*1.04,hr*1.08,hr*0.55,10),'#b8261a',{});c.position.y=hr*1.55;head.add(c);const br=part(ch,GEO.box(hr*1.6,0.015,hr*1.1),'#b8261a',{});br.position.set(0,hr*1.3,hr*0.95);head.add(br);}
  if(s.toni){// chef's hat, cheese drips, the stretched-stocking sheen
    const band=part(ch,GEO.cyl(hr*0.95,hr*1.0,hr*0.5,10),'#efeae0',{});band.position.y=hr*2.0;head.add(band);
    const puff=part(ch,GEO.sph(hr*1.15,10,8),'#f4f0e8',{});puff.scale.set(1,0.75,1);puff.position.y=hr*2.6;head.add(puff);
    for(let i=0;i<7;i++){const a=-1.2+i*0.4;const d=part(ch,GEO.cyl(0.018,0.008,0.07+((i*37)%5)*0.025,5),'#e8b23a',{ink:0.006});d.position.set(Math.sin(a)*hr*0.92,hr*0.1-((i*37)%5)*0.012,Math.cos(a)*hr*0.85);head.add(d);}
  }
  // arms
  for(const side of ['L','R']){const k=side==='L'?1:-1;const sh=J('sh'+side);sh.position.set(k*0.22*b*S,0.46*S,0);spine.add(sh);
    const ua=part(ch,limbGeo(0.29*S,0.055*b*S,0.047*b*S),s.jacket||s.shirt,{});sh.add(ua);
    const el=J('el'+side);el.position.y=-0.29*S;sh.add(el);
    const fa=part(ch,limbGeo(0.26*S,0.045*b*S,0.038*b*S),s.jacket||s.shirt,{});el.add(fa);
    if(id==='manny'||id==='alex'||id==='lucia'){fa.material.userData.base=new THREE.Color(s.skin);}
    const hd=J('hand'+side);hd.position.y=-0.27*S;el.add(hd);
    const hand=part(ch,GEO.box(0.07*S,0.1*S,0.035*S),s.toni?'#f4f0e8':s.skin,{});hand.position.y=-0.04*S;hd.add(hand);
    if(s.toni){const cuff=part(ch,GEO.cyl(0.055*S,0.05*S,0.05*S,7),'#f4f0e8',{});cuff.position.y=0.005;hd.add(cuff);hand.scale.set(1.3,1.15,1.4);}
    if(s.bracelet&&side==='L'){const br=part(ch,GEO.cyl(0.044*S,0.044*S,0.025,8),'#d42a1a',{ink:0.004});br.position.y=-0.23*S;el.add(br);ch.extra.bracelet=br;}
    if(s.watch&&side==='L'){const w=part(ch,GEO.cyl(0.044*S,0.044*S,0.03,8),'#e8c060',{ink:0.004});w.position.y=-0.23*S;el.add(w);}
  }
  // legs
  for(const side of ['L','R']){const k=side==='L'?1:-1;const hp=J('hip'+side);hp.position.set(k*0.095*b*S,-0.06*S,0);hips.add(hp);
    const th=part(ch,limbGeo(0.42*S,0.075*b*S,0.06*b*S),s.dress?s.pants:s.pants,{});hp.add(th);
    const kn=J('knee'+side);kn.position.y=-0.42*S;hp.add(kn);const sh=part(ch,limbGeo(0.42*S,0.057*b*S,0.045*b*S),s.pants,{});kn.add(sh);
    const ft=J('foot'+side);ft.position.y=-0.43*S;kn.add(ft);
    const shoe=part(ch,GEO.box(0.1*b*S,0.08*S,(s.toni?0.3:0.24)*S),s.shoe,{});shoe.position.set(0,-0.0,0.05*S);ft.add(shoe);
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
function paintFace(ch){const g=ch.faceCv.getContext('2d');drawFace(g,ch.s,ch.expr,ch.blinkNow,ch.talkOpen);ch.faceTex.needsUpdate=true;}
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
