/* ============================================================
   OPENING CREDITS
   Right after the cold open. A pizza is made in the dark kitchen, shot by shot, under the credits: the dough is dropped
   and rolled out, the sauce is ladled on, the cheese falls, it goes into the oven and comes out, and it gets a pepperoni
   face. The title lands on the smiling pizza, the cutter goes through it eight ways, and it bleeds. Then the Ramirez house.
   Everything runs on one clock (CR.t) so the shots, the words and the score stay together. Tap (or Space) skips.
   ============================================================ */
// [shows at, for, small line above, the name, small line below]
const CREDITS=[
  [2.2,5.4,'','Danger Biscuit Games','presents'],
  [11.0,5.6,'a game developed with','CLAUDE',''],
  [20.4,4.6,'original assets by','Danger Biscuit Games',''],
  [26.0,5.8,'music and sound by','Danger Biscuit Games',''],
  [35.4,4.4,'story by','J.H. Salmeron',''],
];
const CR={on:false,built:false,t:0,end:54.5,skip:false,ending:false,fired:{},credit:-1,parts:[],cheese:[],peps:[],drips:[],sauceU:0,dirty:true,cutK:[0,0,0,0],sep:0,bleed:0,bake:0,pepsPainted:false};
const PZR=0.2,PZH=0.018,TTR=0.3,CUT0=Math.PI/8,OVX=3,CUTL=PZR+0.04;
const crSeg=(t,a,b)=>clamp((t-a)/(b-a),0,1);
const easeOut=k=>1-(1-k)*(1-k);
/* the pizza canvas: one disc of radius PZR fills it edge to edge (128 px) */
const pzPx=(x,z)=>[128+x/PZR*128,128+z/PZR*128];

function crBuild(){if(CR.built)return;CR.built=true;
  const S=new THREE.Scene();S.background=new THREE.Color(0x020101);S.fog=new THREE.Fog(0x020101,1.3,5.5);CR.scene=S;
  CR.cam=new THREE.PerspectiveCamera(40,1.6,0.01,20);
  // the steel prep counter under one hard light, dusted with flour
  const ct=tex(512,512,(g,w,h)=>{g.fillStyle='#6c737a';g.fillRect(0,0,w,h);const r=mulberry(31);
    for(let i=0;i<900;i++){g.fillStyle=r()<0.5?`rgba(255,255,255,${0.012+r()*0.03})`:`rgba(0,0,0,${0.015+r()*0.035})`;g.fillRect(r()*w*0.5,(r()*h)|0,w*(0.3+r()*0.7),1);}
    for(let i=0;i<90;i++){g.strokeStyle=`rgba(255,255,255,${0.04+r()*0.08})`;g.lineWidth=1;g.beginPath();const x=r()*w,y=r()*h;g.moveTo(x,y);g.lineTo(x+(r()-0.5)*60,y+(r()-0.5)*10);g.stroke();}
    for(let i=0;i<1600;i++){const a=r()*TAU,d=Math.pow(r(),0.9)*(r()<0.85?70:150);g.fillStyle=`rgba(244,240,230,${0.08+r()*0.3})`;g.fillRect(256+Math.cos(a)*d,256+Math.sin(a)*d*0.9,1+(r()*2|0),1+(r()*2|0));}
    const gr=g.createRadialGradient(256,256,20,256,256,256);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(0.18,'rgba(0,0,0,0.12)');gr.addColorStop(0.4,'rgba(0,0,0,0.72)');gr.addColorStop(0.7,'rgba(0,0,0,0.95)');gr.addColorStop(1,'rgba(0,0,0,1)');g.fillStyle=gr;g.fillRect(0,0,w,h);},false);
  const counter=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.6),basic({map:ct}));counter.rotation.x=-Math.PI/2;S.add(counter);
  // the light's beam, and dust hanging in it
  const beam=new THREE.Mesh(new THREE.ConeGeometry(0.75,2.6,20,1,true),new THREE.MeshBasicMaterial({color:0x2a2216,transparent:true,opacity:0.32,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));beam.position.y=1.3;S.add(beam);CR.beam=beam;
  {const n=70,pos=new Float32Array(n*3);for(let i=0;i<n;i++){const a=R()*TAU,d=R()*0.45;pos[i*3]=Math.cos(a)*d;pos[i*3+1]=0.05+R()*0.9;pos[i*3+2]=Math.sin(a)*d;}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));CR.dust=new THREE.Points(g,new THREE.PointsMaterial({color:0xfff0d0,size:0.005,transparent:true,opacity:0.55,depthWrite:false}));S.add(CR.dust);}
  // the dough ball
  const doughT=tex(64,64,(g,w,h)=>{g.fillStyle='#ecdcb6';g.fillRect(0,0,w,h);speck(g,w,h,160,['rgba(255,255,255,.5)','rgba(180,150,100,.25)'],1,mulberry(5));},false);
  CR.ball=new THREE.Mesh(new THREE.SphereGeometry(0.085,12,9),basic({map:doughT}));CR.ball.visible=false;S.add(CR.ball);
  // the pizza: eight wedges sharing one painted top, each carrying its eighth of the title above it
  CR.pzCv=canvas(256,256);CR.pzTex=texFrom(CR.pzCv,false);CR.pzMat=basic({map:CR.pzTex});
  CR.ttCv=canvas(512,512);CR.ttTex=texFrom(CR.ttCv,false);CR.ttMat=basic({map:CR.ttTex,transparent:true,depthWrite:false,opacity:0});
  CR.pz=new THREE.Group();S.add(CR.pz);CR.wedges=[];CR.titleMeshes=[];
  for(let i=0;i<8;i++){const a0=CUT0+i*Math.PI/4,a1=a0+Math.PI/4;
    const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(Math.cos(a0)*PZR,Math.sin(a0)*PZR);sh.absarc(0,0,PZR,a0,a1,false);sh.lineTo(0,0);
    const geo=new THREE.ExtrudeGeometry(sh,{depth:PZH,bevelEnabled:false,curveSegments:6});const pos=geo.attributes.position,uv=geo.attributes.uv;
    for(let k=0;k<pos.count;k++)uv.setXY(k,pos.getX(k)/(2*PZR)+0.5,pos.getY(k)/(2*PZR)+0.5);geo.rotateX(-Math.PI/2);
    const w=new THREE.Group();w.add(new THREE.Mesh(geo,CR.pzMat));
    const tg=new THREE.CircleGeometry(TTR,8,a0,Math.PI/4);tg.rotateX(-Math.PI/2);const tm=new THREE.Mesh(tg,CR.ttMat);tm.position.y=PZH+0.0025;tm.renderOrder=2;w.add(tm);CR.titleMeshes.push(tm);
    const mid=(a0+a1)/2;w.userData.dir=new THREE.Vector3(Math.cos(mid),0,-Math.sin(mid));CR.pz.add(w);CR.wedges.push(w);}
  // blood on the counter, under the pizza: it runs out of the cuts
  CR.poolCv=canvas(256,256);CR.poolTex=texFrom(CR.poolCv,false);
  CR.pool=new THREE.Mesh(new THREE.PlaneGeometry(0.64,0.64),basic({map:CR.poolTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));CR.pool.rotation.x=-Math.PI/2;CR.pool.position.y=0.0012;S.add(CR.pool);
  // the rolling pin (the same hardwood pin from the cold open)
  {const g=new THREE.Group();const wood=basic({map:TX.wood.t,color:0xd8b48a});const b=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.36,12),wood);b.rotation.x=Math.PI/2;g.add(b);
    [-1,1].forEach(k=>{const h=new THREE.Mesh(new THREE.CylinderGeometry(0.014,0.014,0.11,8),basic({color:0x8a6038}));h.rotation.x=Math.PI/2;h.position.z=k*0.23;g.add(h);});g.visible=false;S.add(g);CR.pin=g;}
  // the ladle
  {const g=new THREE.Group();const steel=basic({color:0xb8bec6});const bowl=new THREE.Mesh(new THREE.SphereGeometry(0.036,10,6,0,TAU,Math.PI/2,Math.PI/2),steel);bowl.material.side=THREE.DoubleSide;g.add(bowl);
    const sauce=new THREE.Mesh(new THREE.CircleGeometry(0.032,10).rotateX(-Math.PI/2),basic({color:0x9e2412}));sauce.position.y=-0.008;g.add(sauce);
    const h=new THREE.Mesh(new THREE.BoxGeometry(0.008,0.32,0.006),steel);h.position.set(0.05,0.15,0);h.rotation.z=-0.42;g.add(h);g.visible=false;S.add(g);CR.ladle=g;}
  // the pizza cutter: a steel wheel on a red handle
  {const g=new THREE.Group();const hub=new THREE.Group();g.add(hub);const wheel=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.004,20),basic({color:0xd2d7de}));wheel.rotation.z=Math.PI/2;hub.add(wheel);
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.014,0.014,0.012,8),basic({color:0x505860}));cap.rotation.z=Math.PI/2;hub.add(cap);
    const fork=new THREE.Mesh(new THREE.BoxGeometry(0.014,0.012,0.07),basic({color:0x9aa1a8}));fork.position.set(0,0.02,-0.04);fork.rotation.x=-0.5;g.add(fork);
    const hd=new THREE.Mesh(new THREE.BoxGeometry(0.026,0.022,0.15),basic({color:0xb8261a}));hd.position.set(0,0.07,-0.13);hd.rotation.x=-0.55;g.add(hd);g.visible=false;S.add(g);CR.cutter=g;CR.hub=hub;}
  // the oven: a stainless deck oven, its mouth glowing; the logo plate over the door
  {const O=new THREE.Group();O.position.x=OVX;S.add(O);CR.oven=O;
    const st=tex(64,64,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#2e3236');gr.addColorStop(1,'#6b6258');g.fillStyle=gr;g.fillRect(0,0,w,h);const r=mulberry(8);for(let i=0;i<120;i++){g.fillStyle=`rgba(255,255,255,${r()*0.06})`;g.fillRect(0,(r()*h)|0,w,1);}
      g.fillStyle='rgba(0,0,0,.4)';for(let i=0;i<6;i++)g.fillRect(4+i*11,4,2,2);},false);
    const body=basic({map:st});const box=(w,h,d,x,y,z,m)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m||body);b.position.set(x,y,z);O.add(b);return b;};
    box(1.4,0.5,0.9,0,0.51,-0.25);box(1.4,0.36,0.9,0,-0.18,-0.25);box(0.27,0.26,0.9,-0.565,0.13,-0.25);box(0.27,0.26,0.9,0.565,0.13,-0.25);box(0.86,0.26,0.1,0,0.13,-0.65);
    const lip=box(0.92,0.03,0.06,0,0.275,0.22,basic({color:0x1a1a1c}));
    // the cavity, lit from inside by the fire
    const cav=tex(64,32,(g,w,h)=>{g.fillStyle='#2a0e06';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=4)for(let x=(y/4)%2*4;x<w;x+=8){g.fillStyle=`rgba(${120+((x*7+y*3)%60)},${40+((x+y)%20)},12,.55)`;g.fillRect(x,y,7,3);}
      const gr=g.createLinearGradient(0,h,0,0);gr.addColorStop(0,'rgba(255,150,40,.55)');gr.addColorStop(1,'rgba(255,80,10,.05)');g.fillStyle=gr;g.fillRect(0,0,w,h);},false);
    // the cavity: four inside walls (no front, so the mouth stays open), set in a few millimetres from the oven body so they never fight it
    {const cm=basic({map:cav,side:THREE.DoubleSide});const wall=(w,h,x,y,z,ry,rx)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h,6,3),cm);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);O.add(m);};
      wall(0.85,0.25,0,0.13,-0.594);wall(0.79,0.25,-0.424,0.13,-0.2,Math.PI/2);wall(0.79,0.25,0.424,0.13,-0.2,-Math.PI/2);wall(0.85,0.79,0,0.254,-0.2,0,Math.PI/2);}
    const deck=new THREE.Mesh(new THREE.PlaneGeometry(0.85,0.79).rotateX(-Math.PI/2),basic({map:tex(32,32,(g,w,h)=>{g.fillStyle='#5a3a26';g.fillRect(0,0,w,h);speck(g,w,h,120,['rgba(20,8,4,.5)','rgba(255,170,90,.18)'],1,mulberry(2));},false)}));deck.position.set(0,0.004,-0.2);O.add(deck);
    // the fire along the back wall
    CR.flames=[];for(let i=0;i<7;i++){const f=new THREE.Mesh(new THREE.PlaneGeometry(0.18,0.2),new THREE.MeshBasicMaterial({map:GLOW_TEX,color:i%2?0xff7a1a:0xffb040,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
      f.position.set(-0.36+i*0.12,0.08,-0.57);O.add(f);CR.flames.push(f);}
    const spill=new THREE.Mesh(new THREE.PlaneGeometry(1.2,0.9).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:GLOW_TEX,color:0xff6a10,transparent:true,opacity:0.5,blending:THREE.AdditiveBlending,depthWrite:false}));spill.position.set(0,0.003,0.66);O.add(spill);CR.spill=spill;
    const shelf=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.2).rotateX(-Math.PI/2),basic({map:ct}));shelf.position.set(0,-0.001,0.81);O.add(shelf);
    // the logo plate
    const plate=tex(128,48,(g,w,h)=>{g.fillStyle='#1c1a18';g.fillRect(0,0,w,h);g.strokeStyle='#8a8f96';g.lineWidth=2;g.strokeRect(2,2,w-4,h-4);brandMark(g,24,25,0.82);
      g.fillStyle='#e8d9b4';g.font='15px '+FONT_BRAND;g.textBaseline='middle';g.fillText('PEPPER',46,17);g.fillText('TONI’S',46,33);},false);
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(0.34,0.13),basic({map:plate}));pl.position.set(0,0.52,0.202);O.add(pl);CR.plateTex=plate;
    // the peel
    const pg=new THREE.Group();const wood=basic({map:TX.wood.t,color:0xe0c090});const pb=new THREE.Mesh(new THREE.BoxGeometry(0.46,0.008,0.44),wood);pb.position.y=0.004;pg.add(pb);
    const ph=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.012,0.7),wood);ph.position.set(0,0.006,0.56);pg.add(ph);pg.visible=false;S.add(pg);CR.peel=pg;}
  // pepperoni, with a little curl of fat on top
  CR.pepTex=tex(32,32,(g,w,h)=>{g.fillStyle='#8e1a12';g.fillRect(0,0,w,h);speck(g,w,h,40,['rgba(240,190,170,.55)','rgba(60,5,5,.5)'],2,mulberry(9));const gr=g.createRadialGradient(16,16,8,16,16,16);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(40,0,0,.5)');g.fillStyle=gr;g.fillRect(0,0,w,h);},false);
  CR.pepMat=basic({map:CR.pepTex});CR.pepSide=basic({color:0x6a120c});}

/* ---------- painting the pizza ---------- */
function crPaintDough(){const c=canvas(256,256),g=c.getContext('2d'),r=mulberry(44);
  g.fillStyle='#e9d4a8';g.fillRect(0,0,256,256);
  for(let i=0;i<500;i++){g.fillStyle=r()<0.6?'rgba(255,252,240,.45)':'rgba(190,150,95,.22)';g.fillRect(r()*256,r()*256,1+(r()*2|0),1);}
  for(let i=0;i<26;i++){const x=20+r()*216,y=20+r()*216;if(Math.hypot(x-128,y-128)>110)continue;blot(g,x,y,3+r()*5,'rgba(255,248,230,.5)');g.fillStyle='rgba(160,120,70,.3)';g.fillRect(x+1,y+2,2,1);}
  // the rim, rolled thicker
  g.strokeStyle='rgba(205,170,115,.6)';g.lineWidth=14;g.beginPath();g.arc(128,128,118,0,TAU);g.stroke();g.strokeStyle='rgba(255,246,222,.5)';g.lineWidth=3;g.beginPath();g.arc(128,128,113,0,TAU);g.stroke();
  CR.L={dough:c,sauce:canvas(256,256),cheese:canvas(256,256),melt:null,doughB:null,top:canvas(256,256),cut:canvas(256,256)};}
function crBakeLayers(){const L=CR.L,r=mulberry(61);
  // a golden crust with char, and the cheese run together into one blistered sheet
  const d=canvas(256,256),g=d.getContext('2d');g.drawImage(L.dough,0,0);g.globalCompositeOperation='multiply';g.fillStyle='#d79a52';g.fillRect(0,0,256,256);g.globalCompositeOperation='source-over';
  const gr=g.createRadialGradient(128,128,96,128,128,128);gr.addColorStop(0,'rgba(120,60,20,0)');gr.addColorStop(0.6,'rgba(120,60,20,.35)');gr.addColorStop(1,'rgba(70,30,10,.7)');g.fillStyle=gr;g.fillRect(0,0,256,256);
  for(let i=0;i<70;i++){const a=r()*TAU,w=104+r()*20;g.fillStyle=`rgba(${40+r()*30|0},18,6,${0.3+r()*0.5})`;g.beginPath();g.arc(128+Math.cos(a)*w,128+Math.sin(a)*w,1+r()*3,0,TAU);g.fill();}
  L.doughB=d;
  const m=canvas(256,256),h=m.getContext('2d');for(const s of CR.cheese){h.fillStyle=s[3]?'#f6d886':'#f0c868';h.beginPath();h.arc(s[0],s[1],5+r()*3,0,TAU);h.fill();}
  h.globalCompositeOperation='source-atop';for(let i=0;i<90;i++){const x=24+r()*208,y=24+r()*208;blot(h,x,y,2+r()*6,`rgba(${150+r()*40|0},${80+r()*30|0},20,.75)`);}
  for(let i=0;i<60;i++){h.fillStyle='rgba(255,250,220,.55)';h.fillRect(24+r()*208,24+r()*208,2,1);}h.globalCompositeOperation='source-over';L.melt=m;}
function crComposite(){const L=CR.L;if(!L)return;const g=CR.pzCv.getContext('2d'),b=CR.bake;g.globalAlpha=1;g.globalCompositeOperation='source-over';
  g.drawImage(L.dough,0,0);if(b>0&&L.doughB){g.globalAlpha=b;g.drawImage(L.doughB,0,0);g.globalAlpha=1;}
  g.drawImage(L.sauce,0,0);if(b>0){g.save();g.globalCompositeOperation='multiply';g.fillStyle=`rgb(255,${255-70*b|0},${255-110*b|0})`;g.fillRect(0,0,256,256);g.restore();}
  const melt=L.melt?smooth(clamp(b*1.4-0.15,0,1)):0;if(melt<1){g.globalAlpha=1-melt;g.drawImage(L.cheese,0,0);}if(melt>0){g.globalAlpha=melt;g.drawImage(L.melt,0,0);}g.globalAlpha=1;
  g.drawImage(L.top,0,0);g.drawImage(L.cut,0,0);CR.pzTex.needsUpdate=true;CR.dirty=false;}
function crSaucePaint(u0,u1){const g=CR.L.sauce.getContext('2d');g.lineCap='round';g.lineJoin='round';const n=Math.max(1,Math.ceil((u1-u0)*220));
  for(let i=0;i<n;i++){const a=crSpiral(u0+(u1-u0)*i/n),b=crSpiral(u0+(u1-u0)*(i+1)/n);
    g.strokeStyle='rgba(120,22,8,.55)';g.lineWidth=27;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();
    g.strokeStyle='#b42c16';g.lineWidth=22;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();
    if(R()<0.4){g.fillStyle=R()<0.5?'rgba(220,80,40,.5)':'rgba(110,18,6,.45)';g.fillRect(b[0]+(R()-0.5)*18,b[1]+(R()-0.5)*18,2,2);}}CR.dirty=true;}
/* the ladle's spiral, center out: canvas pixels */
function crSpiral(u){const rr=4+u*96,a=u*TAU*4.2;return [128+Math.cos(a)*rr,128+Math.sin(a)*rr];}
function crPepPaint(){const g=CR.L.top.getContext('2d');for(const p of CR.peps){const [x,y]=pzPx(p.x,p.z),rad=p.r/PZR*128;
    g.fillStyle='#5a0c08';g.beginPath();g.arc(x+1,y+1.5,rad+1,0,TAU);g.fill();g.fillStyle='#8e1a12';g.beginPath();g.arc(x,y,rad,0,TAU);g.fill();
    const rr=mulberry(p.seed);for(let i=0;i<7;i++){const a=rr()*TAU,d=rr()*rad*0.75;g.fillStyle=rr()<0.5?'rgba(240,190,170,.6)':'rgba(50,4,4,.55)';g.fillRect(x+Math.cos(a)*d,y+Math.sin(a)*d,2,2);}
    g.fillStyle='rgba(255,200,150,.35)';g.fillRect(x-rad*0.4,y-rad*0.5,rad*0.5,1.5);}CR.dirty=true;}

/* ---------- the title: two arcs, cream with a dark outline, over the face ---------- */
function crArcText(g,txt,r,center,font,px,dir,fill,stroke,lw){g.font=px+'px '+font;const sp=px*0.08;const ws=[...txt].map(ch=>g.measureText(ch).width);const W=ws.reduce((a,b)=>a+b,0)+sp*(txt.length-1);
  let a=center-dir*W/(2*r);g.textAlign='center';g.textBaseline='middle';const pass=(fn)=>{let aa=a;[...txt].forEach((ch,i)=>{const w=ws[i];aa+=dir*w/(2*r);g.save();g.translate(256+Math.cos(aa)*r,256+Math.sin(aa)*r);g.rotate(dir>0?aa+Math.PI/2:aa-Math.PI/2);fn(ch);g.restore();aa+=dir*(w/2+sp)/r;});};
  g.lineJoin='round';g.strokeStyle=stroke;g.lineWidth=lw;pass(ch=>g.strokeText(ch,0,0));g.fillStyle='rgba(120,10,6,.9)';pass(ch=>g.fillText(ch,1.5,3));g.fillStyle=fill;pass(ch=>g.fillText(ch,0,0));}
function crTitleBase(){const c=canvas(512,512),g=c.getContext('2d');
  crArcText(g,'PIZZA PLACE',122,-Math.PI/2,FONT_BRAND,34,1,'#fff0cc','#1c0b04',8);
  crArcText(g,'MASSACRE',168,Math.PI/2,FONT_BRAND,56,-1,'#fff0cc','#1c0b04',10);
  CR.ttBase=c;const d=g.getImageData(0,0,512,512).data;
  // where each cut crosses a letter, blood will run
  CR.drips=[];for(let k=0;k<4;k++){const th=CUT0+k*Math.PI/4,dx=Math.cos(th),dy=-Math.sin(th);let run=0;
    for(let s=-250;s<=250;s+=2){const x=256+dx*s,y=256+dy*s,i=((y|0)*512+(x|0))*4;if(d[i+3]>150&&d[i]>200){run++;if(run%4===1)CR.drips.push({k,s,x:x+(R()-0.5)*2,y,len:10+R()*44,v:16+R()*30,w:2.4+R()*2.6,delay:R()*0.9,cur:0});}else run=0;}}}
function crTitleDraw(){const g=CR.ttCv.getContext('2d');g.clearRect(0,0,512,512);g.drawImage(CR.ttBase,0,0);
  // the cuts through the letters, as far as the wheel has gone
  for(let k=0;k<4;k++){const c=CR.cutK[k];if(c<=0)continue;const th=CUT0+k*Math.PI/4,dx=Math.cos(th),dy=-Math.sin(th),s0=-CUTL/TTR*256,s1=lerp(-CUTL,CUTL,c)/TTR*256;
    g.save();g.globalCompositeOperation='source-atop';g.strokeStyle=`rgba(150,12,8,${0.55+CR.bleed*0.4})`;g.lineWidth=4+CR.bleed*7;g.beginPath();g.moveTo(256+dx*s0,256+dy*s0);g.lineTo(256+dx*s1,256+dy*s1);g.stroke();g.restore();
    g.save();g.globalCompositeOperation='destination-out';g.lineWidth=2;g.beginPath();g.moveTo(256+dx*s0,256+dy*s0);g.lineTo(256+dx*s1,256+dy*s1);g.stroke();g.restore();}
  // and it runs down the letters
  for(const p of CR.drips){if(p.cur<=0)continue;const L=p.cur;g.fillStyle='rgba(118,6,4,.95)';g.fillRect(p.x-p.w/2,p.y,p.w,L);g.beginPath();g.ellipse(p.x,p.y+L,p.w*0.72,p.w*0.9,0,0,TAU);g.fill();
    g.fillStyle='rgba(205,40,30,.55)';g.fillRect(p.x-p.w/2+0.6,p.y,1,L*0.85);}
  CR.ttTex.needsUpdate=true;}
function crCutPaint(){const g=CR.L.cut.getContext('2d');g.clearRect(0,0,256,256);g.lineCap='round';
  for(let k=0;k<4;k++){const c=CR.cutK[k];if(c<=0)continue;const th=CUT0+k*Math.PI/4,dx=Math.cos(th),dy=-Math.sin(th),s0=-CUTL/PZR*128,s1=lerp(-CUTL,CUTL,c)/PZR*128;
    g.strokeStyle=`rgba(96,6,4,${0.75+CR.bleed*0.25})`;g.lineWidth=2.5+CR.bleed*7;g.beginPath();g.moveTo(128+dx*s0,128+dy*s0);g.lineTo(128+dx*s1,128+dy*s1);g.stroke();
    if(CR.bleed>0){g.strokeStyle=`rgba(170,16,10,${CR.bleed*0.6})`;g.lineWidth=1.5;g.beginPath();g.moveTo(128+dx*s0+1,128+dy*s0);g.lineTo(128+dx*s1+1,128+dy*s1);g.stroke();}}CR.dirty=true;}
function crPoolPaint(){const g=CR.poolCv.getContext('2d');g.clearRect(0,0,256,256);const b=CR.bleed;if(b<=0)return;const px=256/0.64,r=mulberry(70);
  g.fillStyle='rgba(104,4,3,.95)';g.strokeStyle='rgba(104,4,3,.95)';g.lineCap='round';
  for(let k=0;k<4;k++){const th=CUT0+k*Math.PI/4,dx=Math.cos(th),dy=-Math.sin(th);g.lineWidth=4+b*10;g.beginPath();g.moveTo(128-dx*PZR*px,128-dy*PZR*px);g.lineTo(128+dx*PZR*px,128+dy*PZR*px);g.stroke();
    [-1,1].forEach(sg=>{const e=(PZR+0.004)*px,x=128+dx*e*sg,y=128+dy*e*sg,rr=3+b*(9+r()*6);g.beginPath();g.ellipse(x+dx*sg*rr*0.5,y+dy*sg*rr*0.5,rr,rr*0.75,th,0,TAU);g.fill();
      for(let j=0;j<3;j++){const a=r()*TAU;g.beginPath();g.arc(x+dx*sg*rr+Math.cos(a)*rr*0.6,y+dy*sg*rr+Math.sin(a)*rr*0.6,1+b*r()*3,0,TAU);g.fill();}});}
  CR.poolTex.needsUpdate=true;}

/* ---------- little particles: flour, steam, cheese ---------- */
function crPuff(x,y,z,col,n,spread,up,life,size){for(let i=0;i<n;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.MeshBasicMaterial({map:GLOW_TEX,color:col,transparent:true,depthWrite:false,opacity:0}));
  m.position.set(x+(R()-0.5)*spread,y,z+(R()-0.5)*spread);CR.scene.add(m);CR.parts.push({m,t:0,life:life*(0.7+R()*0.6),vx:(R()-0.5)*spread*1.5,vy:up*(0.6+R()*0.8),vz:(R()-0.5)*spread*1.5,kind:'puff'});}}
function crShred(){const a=R()*TAU,d=Math.sqrt(R())*PZR*0.8,x=Math.cos(a)*d,z=Math.sin(a)*d;const m=new THREE.Mesh(new THREE.BoxGeometry(0.014,0.003,0.004),basic({color:R()<0.5?0xfff4d2:0xf2e2a8}));
  m.position.set(x+(R()-0.5)*0.05,0.32+R()*0.22,z+(R()-0.5)*0.05);m.rotation.set(R()*3,R()*3,R()*3);CR.scene.add(m);CR.parts.push({m,t:0,life:9,vx:(x-m.position.x)*2.4,vy:-0.4,vz:(z-m.position.z)*2.4,kind:'shred',tx:x,tz:z,spin:(R()-0.5)*14});}
function crStepParts(dt){for(let i=CR.parts.length-1;i>=0;i--){const p=CR.parts[i],m=p.m;p.t+=dt;
  if(p.kind==='shred'){p.vy-=4.2*dt;m.position.x+=p.vx*dt;m.position.y+=p.vy*dt;m.position.z+=p.vz*dt;m.rotation.x+=p.spin*dt;m.rotation.z+=p.spin*0.6*dt;
    if(m.position.y<=PZH+0.004){const [cx,cy]=pzPx(m.position.x,m.position.z);CR.cheese.push([cx,cy,R()*Math.PI,R()<0.5?1:0]);const g=CR.L.cheese.getContext('2d');const s=CR.cheese[CR.cheese.length-1];
      g.fillStyle=s[3]?'#fff6d8':'#f4e2a6';g.save();g.translate(cx,cy);g.rotate(s[2]);g.fillRect(-5,-1.4,10,2.8);g.fillStyle='rgba(200,170,90,.5)';g.fillRect(-5,0.6,10,0.8);g.restore();CR.dirty=true;p.t=p.life;}}
  else{const dr=Math.exp(-dt*1.8);p.vx*=dr;p.vz*=dr;m.position.x+=p.vx*dt;m.position.y+=p.vy*dt;m.position.z+=p.vz*dt;const k=p.t/p.life;m.scale.setScalar(1+k*2.2);m.material.opacity=Math.min(0.6,p.t*3)*(1-k);m.lookAt(CR.cam.position);}
  if(p.t>=p.life){CR.scene.remove(m);m.geometry.dispose();m.material.dispose();CR.parts.splice(i,1);}}}

/* ---------- sounds for the kitchen ---------- */
const CRS={
  slap(){if(!AC)return;const t=now();sTone(busFx,t,0.18,'sine',120,45,0.5);sNoise(busFx,t,0.12,'lowpass',900,0.8,0.45,0.002);sNoise(busFx,t+0.02,0.25,'bandpass',2200,1,0.08,0.01);},
  roll(d=0.8){if(!AC)return;sNoise(busFx,now(),d,'lowpass',260,0.8,0.22,0.15);},
  sauce(){if(!AC)return;const t=now();for(let i=0;i<5;i++){sTone(busFx,t+i*0.13,0.09,'sine',420+R()*200,140,0.07,0.01);sNoise(busFx,t+i*0.13,0.1,'bandpass',700+R()*400,3,0.06,0.01);}},
  sprinkle(d){if(!AC)return;const t=now();for(let i=0;i<d*30;i++)sNoise(busFx,t+R()*d,0.015,'highpass',5000+R()*3000,1,0.03+R()*0.04,0.001);},
  ovenRoar(d){if(!AC)return;const t=now();sNoise(busFx,t,d,'bandpass',380,0.7,0.25,0.6);sNoise(busFx,t,d,'lowpass',160,0.7,0.3,0.4);},
  clank(){if(!AC)return;const t=now();sTone(busFx,t,0.3,'triangle',640,520,0.08);sTone(busFx,t,0.4,'sine',1320,0,0.05);sNoise(busFx,t,0.06,'bandpass',3000,4,0.1,0.002);},
  plop(){if(!AC)return;const t=now();sTone(busFx,t,0.08,'sine',260+R()*60,110,0.22,0.003);sNoise(busFx,t,0.05,'lowpass',1400,1,0.12,0.002);},
  slice(){if(!AC)return;const t=now();sNoise(busFx,t,0.42,'bandpass',2600,1.2,0.2,0.02,1200);for(let i=0;i<9;i++)sNoise(busFx,t+i*0.045,0.02,'highpass',4000,1,0.12,0.001);sNoise(busFx,t+0.35,0.25,'lowpass',500,1,0.18,0.01);},
  splat(){if(!AC)return;const t=now();sNoise(busFx,t,0.5,'lowpass',700,1,0.4,0.01);sTone(busFx,t,0.4,'sine',180,50,0.3);for(let i=0;i<6;i++)sNoise(busFx,t+0.2+R()*1.4,0.04,'bandpass',900+R()*500,4,0.08,0.003);},
};

/* ---------- the shots: [from, until, camera from, camera to] as [x,y,z, lookX,lookY,lookZ] ---------- */
function crTopD(){const c=CR.cam,half=Math.tan(c.fov*Math.PI/360),fit=0.245;return Math.max(fit/half,fit/(half*Math.min(1,c.aspect)));}
const CR_SHOTS=[
  [0,4.3,[0.42,0.07,0.38,0,0.035,0],[0.3,0.085,0.3,0,0.035,0]],
  [4.3,7,[-0.08,0.56,0.4,0,0,0],[0.04,0.5,0.32,0,0,0]],
  [7,10,[-0.56,0.1,0.14,0,0.02,0],[-0.46,0.12,0.22,0,0.02,0]],
  [10,15,'spin'],
  [15,20,[0.34,0.065,-0.12,-0.04,0.02,0.04],[0.3,0.075,0.1,-0.04,0.02,0]],
  [20,25,[0,0.34,0.52,0,0.02,0],[0.1,0.27,0.43,0,0.02,0]],
  [25,28,[OVX+0.36,0.25,1.65,OVX,0.2,0],[OVX+0.2,0.19,1.3,OVX,0.13,0]],
  [28,31.5,[OVX+0.31,0.078,0.03,OVX-0.05,0.02,-0.22],[OVX+0.24,0.062,-0.02,OVX-0.03,0.02,-0.22]],
  [31.5,35,[OVX-0.56,0.33,1.2,OVX,0.05,0.35],[OVX-0.4,0.28,1.02,OVX,0.05,0.5]],
  [35,40,[0,0.52,0.44,0,0,0.02],[0,0.47,0.37,0,0,0.02]],
  [40,49,'top'],
  [49,99,'push'],
];
const _cu=new THREE.Vector3(0,1,0),_cd=new THREE.Vector3(0,0,-1);
function crCamera(t){const c=CR.cam;c.aspect=camera.aspect;c.fov=camera.aspect<1?60:40;c.updateProjectionMatrix();
  const s=CR_SHOTS.find(s=>t<s[1])||CR_SHOTS[CR_SHOTS.length-1],k=smooth(crSeg(t,s[0],s[1]));
  if(s[2]==='spin'){const a=0.6+k*1.1,d=0.66;c.up.set(Math.sin(a),0,-Math.cos(a));c.position.set(0,d,0);c.lookAt(0,0,0);return;}
  if(s[2]==='top'){const D=crTopD();c.up.copy(_cd);c.position.set(0,D*(1-0.07*k),0);c.lookAt(0,0,0);return;}
  if(s[2]==='push'){const D=crTopD()*0.93,kk=smooth(crSeg(t,49.2,54.5));c.up.copy(_cd);c.position.set(0,lerp(D,D*0.56,kk),lerp(0,0.13,kk));c.lookAt(0,0,lerp(0,0.13,kk));return;}
  const a=s[2],b=s[3];c.up.copy(_cu);c.position.set(lerp(a[0],b[0],k),lerp(a[1],b[1],k),lerp(a[2],b[2],k));c.lookAt(lerp(a[3],b[3],k),lerp(a[4],b[4],k),lerp(a[5],b[5],k));}

/* fire a one-off once the clock passes it */
function crAt(t,key,fn){if(CR.t>=t&&!CR.fired[key]){CR.fired[key]=true;fn();}}
function crReset(){CR.t=0;CR.skip=false;CR.ending=false;CR.fired={};CR.credit=-1;CR.sauceU=0;CR.cutK=[0,0,0,0];CR.sep=0;CR.bleed=0;CR.bake=0;CR.pepsPainted=false;CR.cheese=[];
  for(const p of CR.parts){CR.scene.remove(p.m);p.m.geometry.dispose();p.m.material.dispose();}CR.parts.length=0;for(const p of CR.peps)if(p.m)CR.scene.remove(p.m);CR.peps=[];
  crPaintDough();crComposite();CR.ttMat.opacity=0;CR.pool.material.opacity=1;crPoolPaint();CR.pz.position.set(0,0,0);CR.pz.scale.set(1,1,1);CR.pz.visible=false;CR.wedges.forEach(w=>w.position.set(0,0,0));
  CR.ball.visible=false;CR.pin.visible=false;CR.ladle.visible=false;CR.cutter.visible=false;CR.peel.visible=false;CR.pzMat.color.setRGB(1,1,1);
  // the face: two eyes, a wide smile
  const face=[[-0.068,-0.062,0.028],[0.068,-0.062,0.028]];for(let i=0;i<7;i++){const a=lerp(0.17,0.83,i/6)*Math.PI;face.push([Math.cos(a)*0.114,Math.sin(a)*0.112-0.008,0.022]);}
  CR.peps=face.map(([x,z,r],i)=>({x,z,r,seed:90+i,at:35.7+i*(i<2?0.55:0.42)+(i>=2?0.5:0),m:null}));
  $('crText').classList.remove('on');}

function stepCredits(dt){if(!CR.on)return;CR.t+=dt;const t=CR.t;
  // the words
  let ci=-1;CREDITS.forEach((c,i)=>{if(t>=c[0]&&t<c[0]+c[1])ci=i;});if(CR.skip)ci=-1;
  if(ci!==CR.credit){CR.credit=ci;const el=$('crText');if(ci<0)el.classList.remove('on');else{const c=CREDITS[ci];$('crK').textContent=c[2];$('crN').textContent=c[3];$('crB').textContent=c[4];el.classList.add('on');}}
  const S=CR.scene;CR.oven.visible=t>=24.9&&t<35.1;CR.dust.rotation.y+=dt*0.04;CR.dust.position.y=Math.sin(t*0.3)*0.02;
  // 1. the dough: dropped, then rolled out with the pin
  crAt(0.0,'start',()=>{CR.ball.visible=true;CR.ball.position.set(0,0.7,0);});
  if(t<4.3){const k=crSeg(t,1.0,1.45),landed=t>=1.45;let sq=1;
    if(landed)sq=lerp(0.55,0.62,crSeg(t,1.45,2.2))-Math.sin(crSeg(t,1.45,1.9)*Math.PI)*0.05;
    const pk=crSeg(t,3.0,4.2);if(pk>0.55)sq=lerp(0.62,0.38,crSeg(pk,0.55,1));
    const wide=landed?1/Math.sqrt(sq):0.92;CR.ball.scale.set(wide,sq,wide);CR.ball.position.y=lerp(0.7,0,k*k)+0.085*sq;
    if(pk>0){CR.pin.visible=true;const x=lerp(-0.42,0.08,pk),rx=x/(0.085*wide),h=0.17*sq*Math.sqrt(Math.max(0,1-rx*rx));CR.pin.position.set(x,0.03+h,0);CR.pin.rotation.z=-x/0.03;}}
  crAt(1.45,'slap',()=>{CRS.slap();crPuff(0,0.02,0,0xf4f0e6,9,0.22,0.12,1.6,0.12);});
  crAt(3.0,'roll1',()=>CRS.roll(1.2));
  crAt(4.3,'flat',()=>{CR.ball.visible=false;CR.pz.visible=true;});
  if(t>=4.3&&t<10){const k=easeOut(crSeg(t,4.3,9.3)),s=lerp(0.52,1,k);CR.pz.scale.set(s,lerp(2.3,1,k),s);
    const ph=(t-4.3)*1.25,x=Math.sin(ph*Math.PI)*PZR*s*0.9;CR.pin.visible=t<9.4;CR.pin.position.set(x,PZH*CR.pz.scale.y+0.03,0);CR.pin.rotation.z=-x/0.03;
    if(t<9.4&&((t-4.3)*1.25%1)<dt*1.25+0.001)CRS.roll(0.75);}
  crAt(9.6,'flatDone',()=>{CR.pz.scale.set(1,1,1);CR.pin.visible=false;});
  // 2. the sauce, ladled on in a spiral
  if(t>=10.3&&t<17.4){CR.ladle.visible=true;const u=crSeg(t,10.6,17.0);if(u>CR.sauceU){crSaucePaint(CR.sauceU,u);CR.sauceU=u;}const [px,py]=crSpiral(u);
    CR.ladle.position.set((px-128)/128*PZR,PZH+0.036+Math.sin(t*9)*0.002,(py-128)/128*PZR);CR.ladle.rotation.y=-u*TAU*4.2;}
  else CR.ladle.visible=false;
  crAt(10.6,'sauce1',()=>CRS.sauce());crAt(12.4,'sauce2',()=>CRS.sauce());crAt(14.2,'sauce3',()=>CRS.sauce());crAt(16.0,'sauce4',()=>CRS.sauce());
  // 3. the cheese
  if(t>=20.2&&t<24.4){CR.cheeseAcc=(CR.cheeseAcc||0)+dt*44;while(CR.cheeseAcc>=1){CR.cheeseAcc--;crShred();}}
  crAt(20.3,'sprinkle',()=>CRS.sprinkle(4.2));
  // 4. the oven: in on the peel, the fire, and out again
  crAt(25,'toOven',()=>{for(const p of CR.parts)if(p.kind==='shred')p.t=p.life;crBakeLayers();CR.peel.visible=true;CRS.ovenRoar(10);});
  if(t>=25&&t<35){const zIn=t<31.5?lerp(0.72,-0.2,smooth(crSeg(t,25.6,27.4))):lerp(-0.2,0.74,smooth(crSeg(t,32.2,33.8)));CR.pz.position.set(OVX,0.008,zIn);
    const pz=t<31.5?(t<27.4?zIn:lerp(-0.2,0.85,smooth(crSeg(t,27.4,28)))):(t<32.2?lerp(0.85,-0.2,smooth(crSeg(t,31.5,32.2))):zIn);CR.peel.position.set(OVX,0,pz);
    const inside=clamp((0.25-zIn)/0.35,0,1),fl=0.85+Math.sin(t*23)*0.06+Math.sin(t*37)*0.05;CR.pzMat.color.setRGB(1,lerp(1,0.74*fl,inside),lerp(1,0.5*fl,inside));
    CR.bake=smooth(crSeg(t,28.2,31.4));CR.dirty=true;
    CR.flames.forEach((f,i)=>{const q=0.75+Math.sin(t*(9+i*1.7)+i)*0.18+Math.sin(t*(23+i*3.1))*0.1;f.scale.set(1,q*1.3,1);f.material.opacity=0.55+q*0.35;});CR.spill.material.opacity=0.35+Math.sin(t*17)*0.05;}
  crAt(25.6,'in',()=>CRS.clank());crAt(31.6,'out',()=>CRS.clank());
  crAt(33.4,'steam',()=>crPuff(OVX,0.03,0.74,0xffffff,14,0.25,0.18,2.4,0.14));
  crAt(35,'backToCounter',()=>{CR.peel.visible=false;CR.pz.position.set(0,0,0);CR.pzMat.color.setRGB(1,1,1);CR.bake=1;CR.dirty=true;crPuff(0,0.03,0,0xffffff,8,0.2,0.16,2.6,0.14);});
  // 5. the face, one pepperoni at a time
  for(const p of CR.peps){if(t<p.at||CR.pepsPainted)continue;if(!p.m){p.m=new THREE.Mesh(new THREE.CylinderGeometry(p.r,p.r,0.005,14),[CR.pepSide,CR.pepMat,CR.pepSide]);S.add(p.m);p.m.rotation.y=R()*TAU;}
    const k=crSeg(t,p.at,p.at+0.32);p.m.position.set(p.x,lerp(0.42,PZH+0.0026,k*k)+(k>=1?Math.sin(crSeg(t,p.at+0.32,p.at+0.5)*Math.PI)*0.006:0),p.z);p.m.rotation.x=(1-k)*1.2;
    if(k>=1&&!p.landed){p.landed=true;CRS.plop();}}
  // 6. the title, the cutter, the blood
  crAt(40,'paintPeps',()=>{CR.pepsPainted=true;crPepPaint();for(const p of CR.peps)if(p.m){S.remove(p.m);p.m=null;}crTitleBase();crTitleDraw();});
  if(t>=40.3){const k=crSeg(t,40.3,41.0);CR.ttMat.opacity=k;CR.titleMeshes.forEach(m=>{const s=lerp(1.25,1,easeOut(k));m.scale.set(s,1,s);});}
  crAt(40.3,'stamp',()=>{postU.uFlash.value=Math.max(postU.uFlash.value,0.35);if(AC){const t0=now();sNoise(busFx,t0,0.6,'lowpass',400,1,0.4,0.005);}});
  if(t>=44.6&&t<48.4){const ct=t-44.6,k=Math.min(3,Math.floor(ct/0.95)),q=ct-k*0.95,th=CUT0+k*Math.PI/4,dir=[Math.cos(th),-Math.sin(th)],L=CUTL;
    const roll=crSeg(q,0.14,0.62),lift=q<0.14?1-q/0.14:q>0.62?crSeg(q,0.62,0.76):0;let x,z;
    if(q<=0.76){x=dir[0]*lerp(-L,L,roll);z=dir[1]*lerp(-L,L,roll);}else{const n=Math.min(3,k+1),th2=CUT0+n*Math.PI/4,m=crSeg(q,0.76,0.95);x=lerp(dir[0]*L,-Math.cos(th2)*L,m);z=lerp(dir[1]*L,Math.sin(th2)*L,m);}
    CR.cutter.visible=true;CR.cutter.position.set(x,0.046+PZH-0.004+lift*0.06,z);CR.cutter.rotation.y=Math.atan2(dir[0],dir[1]);CR.hub.rotation.x=roll*L*2/0.05;
    if(roll>0){CR.cutK[k]=roll;for(let j=0;j<k;j++)CR.cutK[j]=1;crCutPaint();crTitleDraw();}
    crAt(44.6+k*0.95+0.14,'slice'+k,()=>{CRS.slice();if(AC){const g=AC.createGain();g.gain.value=1;g.connect(busMus);scoreVoices(g).tom(now(),70,0.55);setTimeout(()=>{try{g.disconnect();}catch(e){}},2000);}});}
  crAt(48.4,'cutsDone',()=>{CR.cutter.visible=false;CR.cutK=[1,1,1,1];crCutPaint();crTitleDraw();});
  crAt(48.6,'split',()=>{scoreHit(1);CRS.splat();postU.uFlash.value=0.55;postU.uRed.value=0.35;});
  if(t>=48.6){const k=easeOut(crSeg(t,48.6,49.2));CR.wedges.forEach(w=>w.position.copy(w.userData.dir).multiplyScalar(k*0.016));
    CR.bleed=crSeg(t,48.6,53.5);postU.uRed.value=Math.max(0,0.35*(1-crSeg(t,48.6,50)));
    for(const p of CR.drips){const tt=t-48.7-p.delay;p.cur=tt>0?Math.min(p.len,tt*p.v*(1-Math.min(0.7,tt*0.12))):0;}
    if(((t*20)|0)!==CR.lastBleed){CR.lastBleed=(t*20)|0;crCutPaint();crTitleDraw();crPoolPaint();}}
  crAt(49.2,'score',()=>scoreBase(null));
  crStepParts(dt);if(CR.dirty)crComposite();crCamera(t);}

function crSkip(){if(CR.on&&CR.t>0.8)CR.skip=true;}
$('credits').addEventListener('pointerdown',e=>{e.preventDefault();crSkip();});
function crEnd(){if(!CR.on)return;CR.on=false;$('credits').hidden=true;$('crText').classList.remove('on');postU.uRed.value=0;}
async function sceneCredits(){const run=G.run;crBuild();crReset();CR.on=true;setMode('cine');$('hud').hidden=true;$('obj').hidden=true;bubble('off');$('credits').hidden=false;
  for(const k in amb)setAmb(k,0,0.4);scoreBase('theme',true);
  await fadeTo(0,1.6);if(!alive(run)){crEnd();return;}
  await waitUntil(()=>CR.t>=CR.end||CR.skip);if(!alive(run)){crEnd();return;}
  if(CR.skip)scoreBase(null);await fadeTo(1,CR.skip?0.5:1.8);crEnd();if(!alive(run))return;await gwait(0.5);if(!alive(run))return;sceneHouse();}
