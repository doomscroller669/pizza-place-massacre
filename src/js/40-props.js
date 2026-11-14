/* ============================================================
   PROPS: Pepper Toni's, room by room. Static props go through the builder; anything that moves is a
   mesh lit by tintAt(). PT holds named spots the story and the player use.
   ============================================================ */
const PT={};const HIDES=[];const DYN=[];
const STEEL={d:'steel'};
signTex('pizzaTop',64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#c98a3c';g.beginPath();g.arc(32,32,31,0,TAU);g.fill();g.fillStyle='#b8341f';g.beginPath();g.arc(32,32,26,0,TAU);g.fill();
  g.fillStyle='#f2c75a';g.beginPath();g.arc(32,32,24,0,TAU);g.fill();speck(g,64,64,90,['#e8a838','#fff0b0'],2,mulberry(3));g.fillStyle='#a3241a';[[22,22],[40,20],[30,34],[44,40],[20,42],[34,48]].forEach(([x,y])=>{g.beginPath();g.arc(x,y,4,0,TAU);g.fill();});
  g.strokeStyle='rgba(90,40,10,.6)';g.lineWidth=1;for(let i=0;i<4;i++){const a=i/4*Math.PI;g.beginPath();g.moveTo(32+Math.cos(a)*30,32+Math.sin(a)*30);g.lineTo(32-Math.cos(a)*30,32-Math.sin(a)*30);g.stroke();}});
signTex('pizzaOld',64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#8a5a28';g.beginPath();g.arc(32,32,31,0,TAU);g.fill();g.fillStyle='#c79a3a';g.beginPath();g.arc(32,32,25,0,TAU);g.fill();speck(g,64,64,60,['#7a4a18','#e0b860'],2,mulberry(9));
  g.fillStyle='#2a1a10';g.beginPath();g.moveTo(32,32);g.arc(32,32,32,0.2,1.9);g.fill();});
signTex('standee',64,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#fff';g.beginPath();g.ellipse(32,64,30,62,0,0,TAU);g.fill();
  g.fillStyle='#e8b23a';g.fillRect(16,46,32,48);g.fillStyle='#c8321f';g.fillRect(20,52,24,36);g.fillStyle='#e8b23a';g.fillRect(8,50,10,30);g.fillRect(46,50,10,30);g.fillStyle='#fff';g.beginPath();g.arc(12,82,6,0,TAU);g.arc(52,82,6,0,TAU);g.fill();
  g.fillStyle='#2a3a6a';g.fillRect(20,94,10,22);g.fillRect(34,94,10,22);g.fillStyle='#c8321f';g.fillRect(16,114,16,8);g.fillRect(32,114,16,8);brandMark(g,32,30,0.9);
  g.fillStyle='#16110d';g.font='9px '+FONT_BRAND;g.textAlign='center';g.fillText('HI! IM TONI!',32,126);g.textAlign='left';});
signTex('lot',128,64,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#04060d');gr.addColorStop(0.55,'#0a0e1a');gr.addColorStop(1,'#1e1b14');g.fillStyle=gr;g.fillRect(0,0,w,h);
  blot(g,100,18,26,'rgba(255,170,60,.4)');g.fillStyle='#ffbf5a';g.fillRect(96,12,8,3);g.fillStyle='#111';g.fillRect(99,15,2,40);
  g.fillStyle='#1b1d22';g.fillRect(18,40,56,14);g.fillRect(28,32,34,10);g.fillStyle='#0e0f12';g.beginPath();g.arc(30,54,5,0,TAU);g.arc(62,54,5,0,TAU);g.fill();
  g.fillStyle='#c8321f';g.fillRect(36,25,20,7);g.fillStyle='#f0b93a';g.font='6px '+FONT_PIX;g.fillText("TONI'S",38,31);g.fillStyle='rgba(255,230,160,.5)';g.fillRect(70,43,4,3);
  g.fillStyle='rgba(230,220,180,.25)';for(let x=0;x<w;x+=16)g.fillRect(x,60,9,1);});
signTex('airhockey',64,128,(g,w,h)=>{g.fillStyle='#e9eef0';g.fillRect(0,0,w,h);g.fillStyle='#c8321f';g.fillRect(0,63,w,2);g.strokeStyle='#2a5fc4';g.lineWidth=2;g.beginPath();g.arc(32,64,12,0,TAU);g.stroke();g.beginPath();g.arc(32,0,14,0,Math.PI);g.stroke();g.beginPath();g.arc(32,128,14,Math.PI,TAU);g.stroke();
  g.fillStyle='rgba(0,0,0,.18)';for(let y=4;y<h;y+=6)for(let x=4;x<w;x+=6)g.fillRect(x,y,1,1);g.fillStyle='#111';g.fillRect(22,0,20,3);g.fillRect(22,125,20,3);});

function lampsAndAmbient(){
  Object.assign(AMB,{store:[.09,.08,.07],freezer:[.17,.21,.27],kitchen:[.15,.15,.14],office:[.11,.08,.06],employee:[.12,.11,.1],hall:[.09,.08,.07],dining:[.1,.075,.06],
    party:[.14,.09,.11],arcade:[.08,.05,.12],fun:[.05,.05,.1],closet:[.07,.06,.05],vest:[.09,.08,.08],mens:[.12,.13,.13],womens:[.12,.13,.13],out:[.04,.04,.07]});
  const F=[0.95,0.97,0.88],W=[1.0,0.82,0.56];
  lamp(4,2.95,5,[0.9,0.72,0.45],7.5,'store',{panel:[0.25,0.25],ptint:[1.3,1.1,0.8]});
  lamp(11,2.55,3,[0.55,0.7,0.85],6,'freezer',{panel:[1.2,0.3],ptint:[1,1.15,1.3]});
  [[17,3],[23,3],[17,7.5],[23,7.5],[11,8]].forEach(([x,z])=>lamp(x,2.95,z,F,7.5,'kitchen',{panel:[1.2,0.3]}));
  lamp(18,1.8,10,[1.1,0.35,0.12],4.2,['kitchen','dining'],{});
  lamp(32,2.75,4,W,7,'office',{panel:[0.6,0.6]});lamp(31.3,1.15,2.6,[0.7,0.55,0.3],2.4,'office');
  lamp(41,2.75,4,F,7.5,'employee',{panel:[1.2,0.3]});
  lamp(32,2.75,9,[0.6,0.6,0.55],5,'hall',{panel:[0.6,0.25]});lamp(41,2.75,9,[0.6,0.6,0.55],5,'hall',{panel:[0.6,0.25]});
  [[14,16],[23,16],[18.5,20],[27.5,20],[14,24],[23,24]].forEach(([x,z])=>lamp(x,2.75,z,W,6.4,'dining',{down:0.7}));
  lamp(33,3.3,17.8,[0.5,0.38,0.25],5,'dining',{});
  lamp(40,2.75,15.5,[1.15,0.95,0.7],7.6,'party',{down:0.5});lamp(35.5,2.8,11,[0.55,0.12,0.45],5,'party');lamp(45,2.8,20,[0.12,0.4,0.55],5,'party');
  lamp(38,3.3,24.5,[0.62,0.14,0.55],9,'arcade');lamp(43,3.3,30.5,[0.14,0.45,0.62],9,'arcade');lamp(44.2,1.4,25,[0.2,0.3,0.6],3.5,'arcade');lamp(41.4,1.8,22.4,[0.6,0.5,0.3],2.6,'arcade');
  lamp(5,5.9,16,[0.2,0.22,0.45],13,'fun');lamp(5,2.6,30,[0.42,0.26,0.55],7.5,'fun');
  lamp(14,2.75,31,[0.6,0.5,0.32],6,'closet',{panel:[0.25,0.25],ptint:[1.3,1.1,0.8]});
  lamp(21,2.95,31,[0.75,0.7,0.6],6,'vest',{panel:[0.6,0.6]});lamp(21,1.8,35.5,[0.7,0.45,0.15],4.8,'vest');
  lamp(26.5,2.75,31,F,6,'mens',{panel:[1.2,0.3]});lamp(31.5,2.75,31,F,6,'womens',{panel:[1.2,0.3]});
}

/* furniture helpers */
function chair(x,z,yaw,opts={}){const s=Math.sin(yaw),c=Math.cos(yaw);const P=(dx,dz)=>[x+dx*c+dz*s,z-dx*s+dz*c];
  const seat=opts.seat||'vinyl';const [a,b]=P(0,0);box(seat,a-0.23,a+0.23,0.44,0.5,b-0.23,b+0.23,{collide:false});
  const [bx,bz]=P(0,-0.21);const bw=Math.abs(c)>0.5;box(seat,bw?bx-0.23:bx-0.04,bw?bx+0.23:bx+0.04,0.5,0.95,bw?bz-0.04:bz-0.23,bw?bz+0.04:bz+0.23,{collide:false});
  [[-0.19,-0.19],[0.19,-0.19],[-0.19,0.19],[0.19,0.19]].forEach(([dx,dz])=>{const [lx,lz]=P(dx,dz);box('metal',lx-0.02,lx+0.02,0,0.44,lz-0.02,lz+0.02,{collide:false});});}
function table4(x,z){box({d:'formica',t:'formica'},x-0.5,x+0.5,0.7,0.75,z-0.5,z+0.5,{collide:false});cyl('metal',x,z,0,0.7,0.06,6,{top:false});box('metal',x-0.3,x+0.3,0,0.03,z-0.3,z+0.3,{collide:false});
  solid(x-0.55,x+0.55,z-0.55,z+0.55,0.75,'table');chair(x,z-0.72,0);chair(x,z+0.72,Math.PI);chair(x-0.72,z,Math.PI/2);chair(x+0.72,z,-Math.PI/2);
  if(R()<0.5)sign('pizzaOld',x+(R()-0.5)*0.4,0.755,z+(R()-0.5)*0.4,0.36,0.36,'up');}
function booth(z){const x0=32.5,x1=33.9;box('formica',x0,x1,0.7,0.75,z-0.4,z+0.4,{collide:false});box('metal',x0+0.5,x0+0.62,0,0.7,z-0.06,z+0.06,{collide:false});solid(x0,x1,z-0.42,z+0.42,0.75,'table');
  for(const s of [-1,1]){const zs=z+s*0.7;box('vinyl',x0-0.05,x1,0,0.46,zs-0.25,zs+0.25,{collide:false});box('vinyl',x0-0.05,x1,0.46,1.2,zs+s*0.22-0.06,zs+s*0.22+0.06,{collide:false});solid(x0-0.05,x1,zs-0.28,zs+0.28,1.2,'booth');}}
function shelfUnit(x0,x1,z0,z1,h,levels,stuff,face){box('metal',x0,x0+0.04,0,h,z0,z0+0.04,{collide:false});box('metal',x1-0.04,x1,0,h,z0,z0+0.04,{collide:false});box('metal',x0,x0+0.04,0,h,z1-0.04,z1,{collide:false});box('metal',x1-0.04,x1,0,h,z1-0.04,z1,{collide:false});
  for(let i=0;i<levels;i++){const y=0.15+i*(h-0.2)/(levels-1);box('metal',x0,x1,y,y+0.03,z0,z1,{collide:false,faces:'nsewtb'});
    if(i<levels-1){const st=stuff[(i+(x0*3|0))%stuff.length],hh=Math.min(0.42,(h-0.2)/(levels-1)-0.06);const faces=Array.isArray(face)?face:[face];
      for(const f of faces){const midx=(x0+x1)/2,midz=(z0+z1)/2,wx=x1-x0,wz=z1-z0;
        if(f==='s')sign(st,midx,y+0.03,z1-0.06,wx-0.08,hh,'s');if(f==='n')sign(st,midx,y+0.03,z0+0.06,wx-0.08,hh,'n');
        if(f==='e')sign(st,x1-0.06,y+0.03,midz,wz-0.08,hh,'e');if(f==='w')sign(st,x0+0.06,y+0.03,midz,wz-0.08,hh,'w');}}}
  solid(x0,x1,z0,z1,h,'shelf');}
function lockers(x0,n,z0,z1,face,opts={}){const w=0.5;for(let i=0;i<n;i++){const a=x0+i*w;box({d:'metal',s:'locker',n:'locker'},a+0.01,a+w-0.01,0.1,1.95,z0,z1,{collide:false,fitFace:{s:true,n:true}});}
  box('metal',x0,x0+n*w,0,0.1,z0,z1,{collide:false});solid(x0,x0+n*w,z0,z1,1.95,'locker');}
function cabinet(x,z,screen,face='w'){box({d:'black',w:'black'},x-0.4,x+0.4,0,1.85,z-0.42,z+0.42);const sx=face==='w'?x-0.41:x+0.41;
  sign(screen,sx,1.05,z,0.62,0.48,face);box('red',face==='w'?x-0.55:x+0.15,face==='w'?x-0.15:x+0.55,0.86,0.94,z-0.4,z+0.4,{collide:false});
  box('!'+(R()<0.5?'yellow':'blue'),face==='w'?x-0.42:x+0.36,face==='w'?x-0.36:x+0.42,1.62,1.8,z-0.4,z+0.4,{collide:false,tint:[1,1,1]});}
function speakerBox(x,y,z){box('black',x-0.18,x+0.18,y-0.24,y,z-0.14,z+0.14,{collide:false,faces:'nsewtb'});}

function buildProps(){
  lampsAndAmbient();
  /* ---------------- STOREROOM ---------------- */
  shelfUnit(0.3,7.7,0.2,0.75,2.1,5,['sign:shelfStuff','sign:cans'].map(s=>s.slice(5)),'s');
  shelfUnit(0.2,0.75,1.2,6.9,2.1,5,['cans','shelfStuff'],'e');
  shelfUnit(2.6,3.2,3,8,1.9,4,['cans','shelfStuff'],['e','w']);
  shelfUnit(5,5.6,3,8,1.9,4,['shelfStuff','cans'],['e','w']);
  sign('pepBox',0.79,1.06,5.4,0.4,0.36,'e');PT.pepperoni=[0.95,1.15,5.4];
  box('cardboard',6.2,7.8,0,0.5,8.6,9.8);box('white',6.3,7.7,0.5,0.75,8.7,9.7,{collide:false,tint:[0.95,0.92,0.85]});
  cyl('steel',7.3,1.6,0,1.6,0.32,8,{collide:true});
  box('cardboard',0.4,1.2,0,0.6,7.6,8.4);box('cardboard',0.5,1.1,0.6,1.0,7.7,8.3,{collide:false});
  /* ---------------- FREEZER ---------------- */
  shelfUnit(8.3,13.7,0.2,0.75,2.0,4,['shelfStuff','cans'],'s');
  shelfUnit(13.25,13.8,1,5.6,2.0,4,['shelfStuff','cans'],'w');
  // the staff, under tarps. Feet show; the rest doesn't.
  [[8.55,9.6,2.0,3.6],[8.55,9.6,4.0,5.5],[11.6,12.7,2.6,4.2]].forEach(([x0,x1,z0,z1],i)=>{box('tarp',x0,x1,0,0.34+i*0.04,z0,z1,{collide:true});box('tarp',x0+0.1,x1-0.1,0.34,0.5,z0+0.25,z0+0.8,{collide:false});
    const fz=i===2?z1+0.02:z1;box('black',x0+0.2,x0+0.4,0,0.14,fz,fz+0.24,{collide:false});box('black',x1-0.4,x1-0.2,0,0.14,fz,fz+0.24,{collide:false});
    quad('blood',[x0-0.3,0.012,z1+0.7],[x1-x0+0.6,0,0],[0,0,-1.2],{fit:true,nu:1,nv:1});});
  PT.freezerStart=[10.6,4.7];
  /* ---------------- KITCHEN ---------------- */
  box(STEEL,14.15,15.15,0,1.9,0.15,1.35);sign('fridge',15.16,0.1,0.75,1.1,1.75,'e');PT.dough=[15.3,1.2,0.75];
  cyl('steel',15.9,2.4,0,1.1,0.32,8,{collide:true});box('metal',15.7,16.1,1.1,1.35,2.2,2.6,{collide:false});
  box(STEEL,15.6,18.6,0,0.92,0.15,0.85);box('white',15.8,16.4,0.92,1.25,0.25,0.65,{collide:false,tint:[0.9,0.85,0.7]});box('white',16.6,17.2,0.92,1.25,0.25,0.65,{collide:false,tint:[0.9,0.85,0.7]});
  // conveyor oven: in at the west end, out at the east end
  box(STEEL,19.4,24.6,0.75,1.55,0.3,1.9);sign('ovenFront',22,0.85,1.91,4.6,0.66,'s');box(STEEL,19.4,24.6,1.6,2.4,0.3,1.9,{collide:false});sign('ovenFront',22,1.68,1.91,4.6,0.66,'s');
  [19.5,24.4].forEach(x=>[0.4,1.8].forEach(z=>box('metal',x-0.05,x+0.05,0,0.75,z-0.05,z+0.05,{collide:false})));
  box('black',18.1,25.9,0.92,0.95,0.5,1.7,{collide:false,faces:'nsewtb'});box('steel',18.1,19.4,0.6,0.92,0.48,1.72,{collide:false});box('steel',24.6,25.9,0.6,0.92,0.48,1.72,{collide:false});solid(18.1,25.9,0.3,1.9,1.55,'oven');
  PT.ovenIn=[18.6,1.0,1.1];PT.ovenOut=[25.45,1.0,1.1];
  box(STEEL,26.9,27.85,0,2.0,0.2,1.6);sign('fridge',26.89,0.15,0.9,1.3,1.75,'w');PT.fridge=[26.7,1.2,0.9];
  box(STEEL,27.1,27.85,0,0.92,2.0,4.8);cyl('red',27.45,3.0,0.92,1.2,0.2,8,{topKey:'red',tint:[0.75,0.15,0.1]});PT.sauce=[27.4,1.1,3.0];
  box('white',27.2,27.8,0.92,0.95,3.8,4.6,{collide:false,tint:[0.85,0.85,0.8]});
  box(STEEL,16.5,21.5,0,0.92,5.0,6.3);box('metal',16.6,21.4,0.12,0.16,5.1,6.2,{collide:false,faces:'t'});PT.prep=[19,0.95,5.65];
  box('white',16.8,17.3,0.92,0.98,5.2,5.6,{collide:false,tint:[0.85,0.2,0.15]});PT.recipe=[17.05,1.0,5.4];
  cyl('white',21.05,5.45,0.92,1.08,0.05,6,{tint:[0.9,0.85,0.6]});PT.seeds=[21.05,1.0,5.45];
  [20.1,20.5].forEach((x,i)=>cyl('white',x,5.95,0.92,1.04,0.07,6,{tint:i?[0.95,0.92,0.82]:[0.4,0.5,0.25]}));
  box(STEEL,14.4,21.6,0,0.92,9.0,9.9);box(STEEL,21.6,23.9,0,0.92,9.0,9.9);box('wood',21.8,23.6,0.92,0.96,9.15,9.8,{collide:false});PT.cut=[22.7,1.0,9.45];
  box('steel',15,21,0.92,0.95,9.9,10.1,{collide:false});
  box('metal',15,21,1.95,2.0,9.78,9.86,{collide:false});
  for(let i=0;i<7;i++){const x=15.4+i*0.82;if(Math.abs(x-18.7)<0.3)continue;sign('ticket',x,1.72,9.76,0.16,0.24,'n');}
  PT.ticket=[18.7,1.85,9.7];
  [16,18,20].forEach(x=>{box('!red',x-0.25,x+0.25,1.78,1.84,9.85,10.15,{collide:false,tint:[1.2,0.45,0.2],faces:'nsewtb'});});
  cyl('white',20.6,9.45,0.92,0.97,0.07,8,{tint:[0.8,0.7,0.4]});cyl('white',20.6,9.45,0.97,1.02,0.03,6,{tint:[0.7,0.6,0.3]});PT.bell=[20.6,1.0,9.45];PT.pass=[17.6,1.0,9.45];
  box(STEEL,10.4,13.4,0,0.9,9.2,9.9);[10.9,11.9,12.9].forEach(x=>box('black',x-0.4,x+0.4,0.86,0.905,9.3,9.8,{collide:false,faces:'t'}));
  shelfUnit(12.2,13.9,6.15,6.6,2.0,4,['cans','shelfStuff'],'s');
  cyl('black',15.0,8.4,0,0.75,0.28,8,{collide:true,topKey:'black'});
  speakerBox(14.6,2.98,5.5);speakerBox(27.4,2.98,8);sign('wash',14.12,1.4,7.5,0.6,0.4,'e');
  /* ---------------- OFFICE ---------------- */
  box({d:'wood',t:'wood'},31,33.6,0.72,0.77,2.4,3.4,{collide:false});box('wood',31.05,31.45,0,0.72,2.45,3.35,{collide:false});box('wood',33.15,33.55,0,0.72,2.45,3.35,{collide:false});solid(31,33.6,2.4,3.4,0.77,'desk');
  chair(32.3,3.95,Math.PI,{seat:'black'});
  box('black',28.35,29.25,0,0.8,0.55,1.45);box('black',28.4,29.2,0.8,1.4,0.6,1.4,{collide:false});sign('tvToni',29.21,0.86,1.0,0.66,0.48,'e');box('black',28.45,29.15,0.62,0.74,0.62,1.38,{collide:false});PT.tv=[29.5,1.1,1.0];
  box('steel',34.8,35.8,0,1.4,0.2,0.8);box('steel',33.7,34.7,0,1.4,0.2,0.8);
  sign('board',31.5,1.25,0.11,1.6,1.2,'s');PT.board=[31.5,1.6,0.3];
  box('wood',34.2,35.6,0,0.75,3.0,3.9);box('black',34.4,35.3,0.75,0.95,3.15,3.75,{collide:false});cyl('white',34.85,3.45,0.95,1.0,0.12,8,{tint:[0.9,0.88,0.8]});PT.polygraph=[34.85,1.0,3.45];
  [[32.85,2.75],[33.0,2.62],[32.72,2.6]].forEach(([x,z],i)=>box('white',x-0.04,x+0.04,0.77,0.8+i*0.02,z-0.03,z+0.03,{collide:false,tint:[0.95,0.92,0.85]}));PT.mug=[32.88,0.9,2.66];
  box('metal',35,35.85,0,0.9,6.6,7.6);box('white',31.25,31.4,0.77,1.1,2.55,2.7,{collide:false,tint:[0.4,0.35,0.2]});
  /* ---------------- EMPLOYEE ROOM ---------------- */
  lockers(36.4,18,0.15,0.65,'s');
  sign('ticket',41.13,1.3,0.66,0.2,0.08,'s');box('metal',41.05,41.2,1.0,1.12,0.66,0.7,{collide:false});PT.toniLocker=[41.13,1.2,0.8];
  HIDES.push({id:'lockerE1',kind:'locker',x:36.65,z:0.74,yaw:Math.PI,ex:36.65,ez:1.25,eye:1.55},{id:'lockerE2',kind:'locker',x:45.15,z:0.74,yaw:Math.PI,ex:45.15,ez:1.25,eye:1.55});
  box('wood',37.5,44.5,0.4,0.46,1.7,2.1);[38,41,44].forEach(x=>box('metal',x-0.04,x+0.04,0,0.4,1.75,2.05,{collide:false}));PT.sketch1=[39.4,0.5,1.9];
  box('formica',42,44,0.72,0.76,4.5,6);cyl('metal',43,5.25,0,0.72,0.06,6,{top:false});solid(42,44,4.5,6,0.76);chair(42.5,6.6,Math.PI,{seat:'blue'});chair(43.5,3.9,0,{seat:'blue'});
  box(STEEL,36.3,39,0,0.92,7.15,7.85);box('black',36.5,37.1,0.92,1.25,7.25,7.75,{collide:false});box('black',37.6,37.9,0.92,1.2,7.3,7.6,{collide:false});
  box('steel',44.9,45.8,0,1.7,6.6,7.8);
  sign('employee',45.89,1.2,6.4,0.9,0.45,'w');sign('smile',36.11,1.0,3.0,0.6,0.8,'e');box('black',36.1,36.3,1.2,1.6,4.8,5.2,{collide:false});
  /* ---------------- HALL ---------------- */
  box('red',45.65,45.85,0.5,1.0,8.8,9.1,{collide:false});sign('exit',29.8,2.4,9.9,0.5,0.18,'n');
  /* ---------------- DINING ---------------- */
  box({d:'red',t:'steel'},11,22.6,0,0.9,10.1,11.1);for(let i=0;i<5;i++){const x=11.8+i*2.15;sign(i%2?'pizzaOld':'pizzaTop',x,0.905,10.6,0.7,0.7,'up');}
  quad('glass',[11,1.3,11.15],[11.6,0,0],[0,0.25,-0.35],{nu:4,nv:1});
  sign('menu',18,2.0,10.11,3.1,1.16,'s');sign('logo',12.9,2.25,10.11,3.4,0.85,'s');sign('logo',26.6,2.25,10.11,3.4,0.85,'s');
  box({d:'red',t:'steel'},23,27,0,0.9,13.2,14.2);quad('glass',[23,1.25,13.1],[4,0,0],[0,0.2,0.4],{nu:2,nv:1});box('green',23.3,26.7,0.9,0.98,13.35,14.05,{collide:false,tint:[0.6,0.9,0.5]});
  box({d:'black',t:'steel'},31,33.8,0,1.0,10.15,10.85);box('black',31.4,33.4,1.0,1.75,10.15,10.55,{collide:false});[31.8,32.4,33.0].forEach(x=>box('!red',x-0.12,x+0.12,1.35,1.6,10.55,10.57,{collide:false,tint:[1,0.4,0.3]}));
  [[14,16],[18.5,16],[23,16.6],[27.5,16.6],[14,20],[18.5,20],[23,20.4],[27.5,20.6],[18.5,24],[23,24],[27.5,24.2]].forEach(([x,z])=>table4(x,z));
  [15.3,17.8,20.3].forEach(z=>booth(z));
  box({d:'red',t:'formica'},11,14.2,0,1.05,23.6,24.6);box('black',12,12.6,1.05,1.35,23.8,24.3,{collide:false});cyl('glass',13.6,24.1,1.05,1.3,0.1,8,{tint:[1,1,1]});
  quad('sign:standee',[23.0,0.02,26.9],[0.75,0,-0.45],[0,1.75,0],{fit:true,nu:1,nv:1});solid(22.9,23.8,26.4,26.95,1.8,'standee');
  sign('party',33.89,2.35,12.7,1.5,0.28,'w');sign('restroom',28.1,2.45,27.89,1.3,0.33,'n');sign('exit',21,2.68,27.89,0.6,0.2,'n');
  quad('sign:fun',[10.7,2.35,21.75],[0,0,-4],[0,1,0],{fit:true,nu:1,nv:1});box('black',10.68,10.72,3.35,3.4,19.6,19.9,{collide:false});
  quad('sign:arcade',[33.5,2.5,23.5],[0,0,2.5],[0,0.47,0],{fit:true,nu:1,nv:1});
  speakerBox(10.5,3.38,10.5);speakerBox(33.5,3.38,27.5);
  /* ---------------- PARTY ROOM ---------------- */
  box({d:'white',t:'white'},37,43,0,0.76,14.6,16.4,{tint:[0.95,0.93,0.9]});
  chair(36.25,15.5,Math.PI/2);chair(38.8,13.85,0);chair(41.8,13.85,0);chair(38.8,17.15,Math.PI);chair(41.8,17.15,Math.PI);chair(43.75,15.5,-Math.PI/2);
  sign('banner',40,1.95,10.11,3.6,0.9,'s');sign('tvToni',45.89,1.6,11.9,0.9,0.65,'w');speakerBox(34.4,2.98,10.4);
  box('white',44.6,45.8,0,0.8,19.6,20.8);box('white',44.8,45.6,0.8,0.95,19.8,20.6,{collide:false,tint:[0.95,0.6,0.75]});
  PT.seats={uncle:[36.25,15.5,Math.PI/2],grandpa:[38.8,13.85,0],dad:[41.8,13.85,0],ruben:[38.8,17.15,Math.PI],alex:[41.8,17.15,Math.PI],lucia:[43.75,15.5,-Math.PI/2]};
  /* ---------------- ARCADE ---------------- */
  [22.05,23.15,24.25,25.35,26.45,27.55].forEach((z,i)=>cabinet(45.3,z,i%2?'screen2':'screen1'));cabinet(45.3,30.1,'nightcaller');PT.nightcaller=[44.6,1.1,30.1];
  box('red',40.6,42.2,0,0.9,21.3,22.9);quad('glass',[40.6,0.9,22.9],[1.6,0,0],[0,1.1,0],{nu:1,nv:1});quad('glass',[40.6,0.9,21.3],[0,0,1.6],[0,1.1,0],{nu:1,nv:1});quad('glass',[42.2,0.9,22.9],[0,0,-1.6],[0,1.1,0],{nu:1,nv:1});
  sign('plush',41.4,0.91,22.1,1.5,1.5,'up');box('red',40.6,42.2,2.0,2.25,21.3,22.9,{collide:false,faces:'nsewtb'});box('metal',41.35,41.45,1.7,2.0,22.05,22.15,{collide:false});solid(40.6,42.2,21.3,22.9,2.2,'claw');PT.claw=[41.4,1.2,23.1];
  box({d:'blue',t:'blue'},37.4,39.4,0,0.78,25.5,29.5);sign('airhockey',38.4,0.785,27.5,1.9,3.9,'up');PT.airhockey=[38.4,0.9,27.5];
  [[34.4,35.4],[35.6,36.6]].forEach(([x0,x1])=>{box('wood',x0,x1,0,0.6,30,33.6);quad('black',[x0+0.1,0.62,33.5],[x1-x0-0.2,0,0],[0,0.8,-1.2],{nu:1,nv:1});});
  box({d:'black',t:'glass'},39,45.6,0,1.0,32.9,33.6);shelfUnit(39.2,45.4,33.65,33.9,2.4,4,['plush','shelfStuff'],'n');
  sign('poster1',37,1.2,21.11,0.6,0.9,'s');sign('poster1',43.5,1.2,21.11,0.6,0.9,'s');
  /* ---------------- FUN ZONE ---------------- */
  const posts=[[1.2,11.5],[4.2,11.5],[7.2,11.5],[1.2,15.5],[4.2,15.5],[7.2,15.5],[1.2,19.5],[4.2,19.5],[7.2,19.5]];
  posts.forEach(([x,z])=>{cyl('yellow',x,z,0,4.6,0.09,6,{top:false});solid(x-0.12,x+0.12,z-0.12,z+0.12,4.6,'post');});
  box({d:'red',t:'red',b:'red'},1.2,7.2,2.2,2.32,11.5,19.5,{collide:false,faces:'nsewtb'});box({d:'blue',t:'blue',b:'blue'},1.2,7.2,3.7,3.82,11.5,15.5,{collide:false,faces:'nsewtb'});
  for(const z of [11.5,19.5])quad('grate',[1.2,2.32,z],[6,0,0],[0,0.8,0]);for(const x of [1.2,7.2])quad('grate',[x,2.32,11.5],[0,0,8],[0,0.8,0]);
  for(const z of [12.5,14.5])cyl('blue',4.2,z,3.82,3.84,0.05,4,{top:false});
  [[2.2,2.32,'red',19.5],[4.7,3.82,'green',15.5],[7.0,2.32,'blue',19.5]].forEach(([x,y0,col,zs])=>{const zb=27.3,len=zb-zs,dy=0.62-y0;
    quad(col,[x-0.35,y0,zs],[0.7,0,0],[0,dy,len],{nu:1,nv:6,tint:[1.1,1.1,1.1]});quad(col,[x-0.37,y0,zs],[0,0.25,0],[0,dy,len],{nu:1,nv:6});quad(col,[x+0.37,y0,zs],[0,0.25,0],[0,dy,len],{nu:1,nv:6});
    solid(x-0.4,x+0.4,zb-1.8,zb,1.3,'slide');});
  // the ball pit: low padded walls, a gap to climb in on the north side
  box('blue',1,3.6,0,0.6,26.9,27.15);box('blue',5.2,8.6,0,0.6,26.9,27.15);box('blue',1,8.6,0,0.6,33.0,33.25,{collide:true});box('blue',0.85,1.1,0,0.6,26.9,33.25);box('blue',8.5,8.75,0,0.6,26.9,33.25);
  quad('ballpit',[1.1,0.46,33.0],[7.4,0,0],[0,0,-5.85],{step:0.7});PT.pit={x0:1.15,x1:8.5,z0:27.2,z1:33.0};
  quad('sign:fun',[2.5,4.2,10.11],[5,0,0],[0,1.25,0],{fit:true,nu:1,nv:1});sign('slider',0.11,1.0,24.6,0.8,0.8,'e');
  /* ---------------- CLOSET ---------------- */
  lockers(10.4,6,33.3,33.85,'n');HIDES.push({id:'lockerC1',kind:'locker',x:10.65,z:33.2,yaw:0,ex:10.65,ez:32.6,eye:1.55},{id:'lockerC2',kind:'locker',x:12.65,z:33.2,yaw:0,ex:12.65,ez:32.6,eye:1.55});
  shelfUnit(17.3,17.85,28.6,33.6,2.2,4,['shelfStuff','cans'],'w');PT.spareHead=[17.45,1.55,31.0];
  box('cardboard',14,15.2,0,0.5,32.6,33.6);box('cardboard',14.2,15,0.5,0.9,32.8,33.4,{collide:false});cyl('yellow',11.2,29.4,0,0.4,0.25,8,{collide:true});
  /* ---------------- VESTIBULE ---------------- */
  quad('sign:frontDoor',[20,0,33.92],[2,0,0],[0,2.3,0],{fit:true,nu:1,nv:1});quad('grate',[20,0,34.1],[2,0,0],[0,2.3,0]);quad('!sign:lot',[19.2,-0.1,34.7],[3.6,0,0],[0,2.6,0],{fit:true,nu:1,nv:1});
  solid(19.9,22.1,33.85,34.2,4,'door');PT.frontDoor=[21,1.2,33.6];
  sign('keypad',22.9,1.15,33.89,0.46,0.46,'n');PT.keypad=[22.9,1.38,33.7];
  cyl('red',18.6,29,0,0.9,0.12,6,{collide:true});cyl('glass',18.6,29,0.9,1.3,0.22,8,{tint:[1,1,1]});
  box('blue',23.3,23.8,0,1.0,29.0,29.6);
  /* ---------------- RESTROOMS ---------------- */
  for(const [xs,ids] of [[[25.0,26.6,28.2],['stallM1','stallM2']],[[30.0,31.6,33.2],['stallW1','stallW2']]]){
    xs.forEach(x=>{box('stall',x-0.03,x+0.03,0.15,1.9,32.2,33.88,{collide:true});});
    for(let i=0;i<2;i++){const x0=xs[i],x1=xs[i+1],cx=(x0+x1)/2;box('white',cx-0.2,cx+0.2,0,0.42,33.2,33.85,{tint:[0.95,0.95,0.92]});box('stall',x0+0.05,x0+0.12,0.15,1.9,31.5,32.2,{collide:false});
      HIDES.push({id:ids[i],kind:'stall',x:cx,z:33.0,yaw:0,ex:cx,ez:31.6,eye:1.25});}
    box(STEEL,xs[0]-0.8,xs[0]-0.3,0,0.85,28.4,30.4);}
  quad('glass',[24.11,1.1,28.6],[0,0,1.6],[0,0.8,0],{nu:1,nv:1,n:[1,0,0]});
  /* ---------------- dynamic doors ---------------- */
  DOORS.party=mkDoor('partyDoor','sign:partyDoor',34,12,1.4,'z',1,{locked:true});
  DOORS.freezer=mkDoor('freezerDoor','sign:steelDoor',10.3,6,1.4,'x',1,{locked:true,heavy:true});
  DOORS.swingA=mkDoor('swing','sign:swing',24,10,0.8,'x',1,{swing:true});DOORS.swingB=mkDoor('swing','sign:swing',25.6,10,-0.8,'x',1,{swing:true});
  DOORS.closet=mkDoor('closetDoor','sign:door',15,28,1.4,'x',-1,{open:1});DOORS.mens=mkDoor('mensDoor','sign:door',25,28,1.2,'x',1,{open:1});DOORS.womens=mkDoor('womensDoor','sign:door',30,28,1.2,'x',1,{open:1});
  DOORS.office=mkDoor('officeKitchen','sign:door',28,5,1.4,'z',1,{open:1});DOORS.store=mkDoor('storeDoor','sign:door',8,7.4,1.4,'z',-1,{open:1});
  DOORS.employee=mkDoor('employeeHall','sign:door',39,8,1.4,'x',-1,{open:1});DOORS.officeHall=mkDoor('officeHall','sign:door',33,8,1.4,'x',-1,{open:1});
}
/* a door leaf hinged at (hx,hz). along: the axis the closed leaf runs along. dir: which way it swings open (+1/-1 on the other axis) */
const DOORS={};
function mkDoor(id,key,hx,hz,w,along,dir,opts={}){const g=new THREE.Group();g.position.set(hx,0,hz);const name=key.replace('sign:','');
  const mat=basic({map:SIGN[name]||TX[name].t});const geo=new THREE.BoxGeometry(Math.abs(w),2.18,0.06);geo.translate(w/2,1.09,0);if(along==='z')geo.rotateY(-Math.PI/2);
  const m=new THREE.Mesh(geo,mat);g.add(m);scene.add(g);
  const len=Math.abs(w);const sol=along==='x'?solid(Math.min(hx,hx+w),Math.max(hx,hx+w),hz-0.06,hz+0.06,2.2,'door'):solid(hx-0.06,hx+0.06,hz,hz+len,2.2,'door');
  const d={id,g,mat,sol,ang:0,target:opts.open?1:0,dir,along,w,locked:!!opts.locked,swing:!!opts.swing,heavy:!!opts.heavy,hx,hz};
  d.ang=d.target;DYN.push(d);return d;}
function updateDoors(dt){for(const k in DOORS){const d=DOORS[k];
    if(d.swing){let push=0;for(const a of doorPushers()){const dz=a.z-d.hz,dx=a.x-(d.hx+d.w/2);if(Math.abs(dx)<1.1&&Math.abs(dz)<1.3)push=dz<0?1:-1;}d.target=push;}
    d.ang=damp(d.ang,d.target,d.heavy?3:d.swing?9:5,dt);const a=d.ang*Math.PI/2*0.94*d.dir*Math.sign(d.w);d.g.rotation.y=d.along==='x'?-a:a;
    d.sol.on=!d.swing&&Math.abs(d.ang)<0.35;
    d.mat.color.copy(tintAt(d.hx,1.2,d.hz+0.3,1.1));}}
