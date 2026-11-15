/* ============================================================
   PROLOGUE
   1. Cold open, 10:04 PM: Manny, latched in the walk-in, watches Toni kill the closing crew through the door window.
   2. The Ramirez house, 10:41 PM: Lucia at her mother's wake; the late delivery; Grandpa's two-dollar tip and the
      one-star rating; the drugged pizza; her dead phone; Toni in the dark house; out the front door, into his arms.
   ============================================================ */
let BRAND_URL='';
const STAFF=['manager','bree','devon'];
/* who is drawn, by where they are tonight: 'kitchen' (the cold open), 'house', 'van', 'party' (the party room), 'none' */
function castVisible(id){const c=CHARS[id];const w=c.where||'party';if(w==='none')return false;const g=groupAt(camera.position.x,camera.position.z);const inHouse=g.startsWith('h_');
  if(w==='house'||w==='van')return inHouse;if(w==='kitchen')return !inHouse;return g==='party'||g==='dining'||g==='hall'||g==='arcade';}

/* ---------- little engines: tweens, walking extras, camera shake, decals ---------- */
const TWEENS=[],MOVERS=[];const SHAKE={a:0,t:0};
function tween(dur,fn){return new Promise(res=>TWEENS.push({t:0,dur,fn,res,run:G.run}));}
function npcMove(ch,x,z,speed=1.4,o={}){return new Promise(res=>MOVERS.push({ch,x,z,speed,res,run:G.run,face:o.face!==false,back:!!o.back,faceCh:o.faceCh||null}));}
function shake(a,dur){SHAKE.a=Math.max(SHAKE.a,a);SHAKE.t=Math.max(SHAKE.t,dur);}
const DECALS=[];
function decal(x,y,z,w,h,face,seed=1){const cv=canvas(64,64);const g=cv.getContext('2d');const r=mulberry(seed);g.fillStyle='rgba(95,6,4,.95)';g.beginPath();g.ellipse(32,32,18+r()*6,13+r()*5,r()*3,0,TAU);g.fill();
  for(let i=0;i<16;i++){const a=r()*TAU,d=16+r()*14;g.beginPath();g.arc(32+Math.cos(a)*d,32+Math.sin(a)*d*0.8,1+r()*3,0,TAU);g.fill();if(face!=='up'&&r()<0.5)g.fillRect(32+Math.cos(a)*d-0.6,32+Math.sin(a)*d,1.2,4+r()*10);}
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),basic({map:texFrom(cv,false),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
  if(face==='up')m.rotation.x=-Math.PI/2;if(face==='n')m.rotation.y=Math.PI;if(face==='e')m.rotation.y=Math.PI/2;if(face==='w')m.rotation.y=-Math.PI/2;
  m.position.set(x,y,z);scene.add(m);m.material.color.copy(tintAt(x,Math.max(y,0.5),z,1.1));DECALS.push(m);return m;}
function clearDecals(){for(const m of DECALS){scene.remove(m);m.geometry.dispose();}DECALS.length=0;}
/* white extinguisher powder: a stream out of the horn in Toni's hand, billowing where it hits */
const PUFF=[],SPRAY={on:false,acc:0,run:0};const _sa=new THREE.Vector3(),_sb=new THREE.Vector3();
function puff(x,y,z,vx,vy,vz,life,s0){const m=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.5),new THREE.MeshBasicMaterial({map:GLOW_TEX,transparent:true,depthWrite:false,color:0xe8eae8,opacity:0.0}));
  m.position.set(x,y,z);m.scale.setScalar(s0);scene.add(m);PUFF.push({m,t:0,life,vx,vy,vz,s0});}
function sprayOn(on){SPRAY.on=on;SPRAY.run=G.run;SPRAY.acc=0;}
function stepSpray(dt){if(!SPRAY.on)return;if(SPRAY.run!==G.run){SPRAY.on=false;return;}const T=CHARS.toni;if(!T.extra.nozzle.visible)return;
  T.root.updateMatrixWorld(true);T.extra.hoseB.getWorldPosition(_sa);T.extra.nozzleTip.getWorldPosition(_sb);const d=_sb.clone().sub(_sa).normalize();SPRAY.acc+=dt*48;
  while(SPRAY.acc>=1){SPRAY.acc-=1;const sp=3.4+R()*1.2;puff(_sb.x,_sb.y,_sb.z,d.x*sp+(R()-0.5)*0.5,d.y*sp+(R()-0.5)*0.4,d.z*sp+(R()-0.5)*0.5,1.6+R()*1.4,0.25);}}
function stepPuffs(dt){stepSpray(dt);for(let i=PUFF.length-1;i>=0;i--){const p=PUFF[i];p.t+=dt;const k=p.t/p.life,dr=Math.exp(-dt*2.6);p.vx*=dr;p.vy=p.vy*dr+dt*0.12;p.vz*=dr;
  // nothing goes through the walk-in door
  const pz=p.m.position.z+p.vz*dt;if(G.where==='pizzeria'&&p.m.position.z>=6.06&&pz<6.06&&Math.abs(p.m.position.x-11)<0.8){p.vz=Math.abs(p.vz)*0.15;p.vx+=(R()-0.5)*1.2;p.vy+=(R()-0.3)*0.6;}
  p.m.position.x+=p.vx*dt;p.m.position.y+=p.vy*dt;p.m.position.z+=p.vz*dt;p.m.scale.setScalar(p.s0+k*2.6);p.m.material.opacity=Math.min(0.85,p.t*4)*(1-k);
  p.m.lookAt(camera.position);if(k>=1){scene.remove(p.m);p.m.geometry.dispose();p.m.material.dispose();PUFF.splice(i,1);}}}
function stepPrologue(dt){
  for(let i=TWEENS.length-1;i>=0;i--){const w=TWEENS[i];if(w.run!==G.run){TWEENS.splice(i,1);continue;}w.t+=dt;const k=Math.min(1,w.t/w.dur);w.fn(k);if(k>=1){TWEENS.splice(i,1);w.res();}}
  for(let i=MOVERS.length-1;i>=0;i--){const m=MOVERS[i];const c=m.ch;if(m.run!==G.run){MOVERS.splice(i,1);c.speed=0;continue;}const dx=m.x-c.x,dz=m.z-c.z,d=Math.hypot(dx,dz);
    if(d<0.04){c.x=m.x;c.z=m.z;c.speed=0;MOVERS.splice(i,1);m.res();continue;}const st=Math.min(d,m.speed*dt);c.x+=dx/d*st;c.z+=dz/d*st;c.speed=m.speed;c.walkPh+=dt*m.speed*4.2;
    if(m.face){const f=m.faceCh,want=f?Math.atan2(f.x-c.x,f.z-c.z):Math.atan2(dx,dz)+(m.back?Math.PI:0);c.yaw+=angDiff(c.yaw,want)*Math.min(1,dt*9);}}
  if(SHAKE.t>0){SHAKE.t-=dt;const a=SHAKE.a*clamp(SHAKE.t*3,0,1);camera.position.x+=(R()-0.5)*a;camera.position.y+=(R()-0.5)*a;if(SHAKE.t<=0)SHAKE.a=0;}
  stepPuffs(dt);stepCandles(dt);lightMozz();stepRain(dt);stepThunder(dt);
  if(BOXHELD.visible)BOXHELD.children.forEach(m=>{(Array.isArray(m.material)?m.material:[m.material]).forEach(mm=>mm.color.copy(tintAt(camera.position.x,1.2,camera.position.z,1.1)));});
  if(TBOX.g.visible){const c=tintAt(171.5,1,3.5,1.1);TBOX.mats.forEach(m=>m.color.copy(c));}
  if(G.flags.escaping)stepEscape(dt);if(G.lpCharge)stepCharge(dt);}

/* rain outside the Ramirez house, and thunder now and then (a flash at the windows) */
const RAIN={n:520,seed:[],mesh:null},THUNDER={t:20};
{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(RAIN.n*6),3));
  RAIN.mesh=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x7d8ea6,transparent:true,opacity:0.32}));RAIN.mesh.frustumCulled=false;RAIN.mesh.visible=false;scene.add(RAIN.mesh);
  for(let i=0;i<RAIN.n;i++)RAIN.seed.push({x:R()*28-14,y:R()*7,z:R()*28-14,v:7+R()*3});}
function stepRain(dt){const on=G.where==='house'&&camera.position.x>176;RAIN.mesh.visible=on;if(!on)return;const a=RAIN.mesh.geometry.attributes.position.array;
  for(let i=0;i<RAIN.n;i++){const d=RAIN.seed[i];d.y-=d.v*dt;if(d.y<0){d.y+=7;d.x=R()*28-14;d.z=R()*28-14;}
    const x=camera.position.x+d.x,z=camera.position.z+d.z,under=x<182.7&&z>1.5&&z<5.7,y=x>180.2&&!under?d.y:-20;
    a[i*6]=x;a[i*6+1]=y;a[i*6+2]=z;a[i*6+3]=x+0.02;a[i*6+4]=y+0.34;a[i*6+5]=z;}
  RAIN.mesh.geometry.attributes.position.needsUpdate=true;}
function stepThunder(dt){if(G.where!=='house'||(G.mode!=='play'&&G.mode!=='cine'))return;THUNDER.t-=dt;if(THUNDER.t>0)return;THUNDER.t=30+R()*45;
  postU.uFlash.value=Math.max(postU.uFlash.value,LIGHTSET==='dark'?0.22:0.1);setTimeout(()=>{if(G.where==='house')SFX.thunder();},700+R()*1500);}
/* the pizza box: in Lucia's hands, and open on the dining table */
const BOXHELD=new THREE.Group();{const b=new THREE.Mesh(new THREE.BoxGeometry(0.42,0.05,0.42),[0,1,2,3,4,5].map(i=>basic({map:i===2?SIGN.pizzaBox:TX.cardboard.t})));BOXHELD.add(b);BOXHELD.position.set(0,-0.36,-0.5);BOXHELD.rotation.x=0.35;BOXHELD.visible=false;held.add(BOXHELD);}
const TBOX={g:new THREE.Group(),mats:[]};
{const base=new THREE.Mesh(new THREE.BoxGeometry(0.44,0.045,0.44),basic({map:TX.cardboard.t}));base.position.y=0.022;TBOX.g.add(base);TBOX.mats.push(base.material);
  const pie=new THREE.Mesh(new THREE.PlaneGeometry(0.38,0.38).rotateX(-Math.PI/2),basic({map:SIGN.pizzaTop,transparent:true,alphaTest:0.3}));pie.position.y=0.047;TBOX.g.add(pie);TBOX.mats.push(pie.material);TBOX.pie=pie;
  const hinge=new THREE.Group();hinge.position.set(0,0.045,-0.22);const lid=new THREE.Mesh(new THREE.BoxGeometry(0.44,0.01,0.44),[0,1,2,3,4,5].map(i=>basic({map:i===2?SIGN.pizzaBox:TX.cardboard.t})));lid.position.z=0.22;hinge.add(lid);lid.material.forEach(m=>TBOX.mats.push(m));
  TBOX.g.add(hinge);TBOX.lid=hinge;TBOX.g.position.set(171.5,0.77,3.5);TBOX.g.rotation.y=0.25;TBOX.g.visible=false;scene.add(TBOX.g);}
/* Grandpa's phone, face down by his plate. It keeps buzzing. */
const GPHONE=new THREE.Mesh(new THREE.BoxGeometry(0.075,0.012,0.15),basic({color:0x111114}));GPHONE.position.set(170.7,0.776,3.05);GPHONE.rotation.y=0.3;GPHONE.visible=false;scene.add(GPHONE);

/* ---------- Lucia's phone ---------- */
const LP={open:false,bat:14};
function lpBat(){const i=$('lpBat').firstElementChild;i.style.width=Math.max(1,LP.bat/100*19)+'px';i.style.background=LP.bat<15?'#e33':'#ddd';}
function lpOpen(html,clock){$('lpScr').innerHTML=html;if(clock)$('lpClock').textContent=clock;lpBat();$('lp').hidden=false;LP.open=true;}
function lpClose(){$('lp').hidden=true;LP.open=false;}
const lpHead=()=>`<div class="lp-app"><img src="${BRAND_URL}" alt="">Pepper Toni’s</div>`;
function lpTrack(late){lpOpen(`${lpHead()}<div class="lp-body"><p class="lp-h">${late?'Running a few minutes late':'Your order is on its way'}</p><p class="lp-sub">Ramirez · Order #4471</p>
  <ul class="lp-steps"><li class="done">Order placed · 9:58 PM</li><li class="done">Preparing</li><li class="now">Out for delivery</li><li>Delivered</li></ul>
  <div class="lp-row"><span>Large Pepperoni</span><span>$6.00</span></div><div class="lp-row"><span>Driver tip</span><span>$2.00</span></div>
  <div class="lp-driver"><div class="lp-av" aria-hidden="true">🍕</div><div><b>Your driver</b>Pepper Toni’s delivery</div></div></div>`);}
/* the rating: five stars, Grandpa's review, submit. Any star but one, and Grandpa makes her change it. */
function lpRate(){return new Promise(res=>{const run=G.run;let stars=0,typed=false,busy=false;
  lpOpen(`${lpHead()}<div class="lp-body"><p class="lp-h">How was your delivery?</p><p class="lp-sub">Large Pepperoni · Your driver</p>
    <div class="lp-stars" role="group" aria-label="Rating">${[1,2,3,4,5].map(n=>`<button type="button" data-n="${n}" aria-label="${n} star${n>1?'s':''}">★</button>`).join('')}</div>
    <button type="button" class="lp-box ph" id="lpReview" disabled>Write a review</button>
    <button type="button" class="lp-btn" id="lpSubmit" disabled>Submit</button></div>`,'10:54');
  const prev=G.mode;setMode('ui');const btns=[...$('lpScr').querySelectorAll('.lp-stars button')];
  const paint=()=>btns.forEach((b,i)=>b.classList.toggle('on',i<stars));
  btns.forEach(b=>b.addEventListener('click',async e=>{e.stopPropagation();if(busy||!alive(run))return;SFX.ui();stars=+b.dataset.n;paint();
    if(stars>1){busy=true;G.flags.triedStars=Math.max(G.flags.triedStars||0,stars);setExpr(CHARS.grandpa,'angry');await line('grandpa',stars===5?'Five? For cold pizza? One. Star.':'One. Star.',{expr:'angry'});if(!alive(run))return;stars=0;paint();busy=false;return;}
    const rv=$('lpReview');if(!typed){rv.disabled=false;rv.classList.remove('ph');rv.textContent='';busy=true;
      await line('grandpa','Now write: late and cold. Driver didn’t say a word.',{expr:'neutral'});if(!alive(run))return;busy=false;rv.textContent='Tap to type';rv.classList.add('ph');}}));
  $('lpReview').addEventListener('click',async e=>{e.stopPropagation();if(typed||busy||stars!==1||!alive(run))return;typed=true;busy=true;const rv=$('lpReview');rv.classList.remove('ph');rv.textContent='';
    const txt='Late and cold. Driver didn’t say a word.';for(let i=1;i<=txt.length;i++){rv.textContent=txt.slice(0,i);if(i%2)SFX.tap(busFx,now());await gwait(0.045);if(!alive(run))return;}busy=false;$('lpSubmit').disabled=false;});
  $('lpSubmit').addEventListener('click',e=>{e.stopPropagation();if(busy||!typed||!alive(run))return;SFX.ui();
    lpOpen(`${lpHead()}<div class="lp-body"><p class="lp-h">Thanks!</p><p class="lp-sub">Your rating was sent to your driver.</p><div class="lp-stars" aria-label="One star"><button class="on" tabindex="-1">★</button>${'<button tabindex="-1">★</button>'.repeat(4)}</div>
      <p class="lp-sub" style="text-align:center">“Late and cold. Driver didn’t say a word.”</p></div>`);setMode(prev==='ui'?'play':prev);res();});});}
function lpThread(){lpOpen(`<div class="lp-who"><div class="lp-av" aria-hidden="true">🍕</div>Your driver</div><div class="lp-thread"><span class="lp-time">10:57 PM</span><div class="lp-msg">sorry it was late</div></div>`,'10:57');}
function lpDead(){LP.bat=1;lpOpen(`<div class="lp-dark"><div class="lp-bigbat"><i></i></div><span>1%</span></div>`,'11:06');}
function lpBlack(){$('lpScr').innerHTML='<div class="lp-dark"></div>';$('lpClock').textContent='';$('lpBat').firstElementChild.style.width='0';}
function lpCharging(){LP.bat=0;lpOpen(`<div class="lp-dark"><div class="lp-bigbat chg"><i></i></div><span id="lpChgTxt">Charging · starting up…</span><div class="lp-bar2"><b id="lpChgBar"></b></div></div>`,'');}
function lpNoCharge(){$('lpScr').innerHTML=`<div class="lp-dark"><div class="lp-bigbat"><i></i></div><span style="color:#e55">Not charging</span><span>0%</span></div>`;}
let chargeT=0;function stepCharge(dt){chargeT+=dt;const b=$('lpChgBar');if(b)b.style.width=Math.min(100,chargeT/26*100)+'%';}
function appText(text){SFX.ping();SFX.buzz();bubble('text',text,'app');setTimeout(()=>{if($('phone').querySelector('.from')&&$('phone').textContent.includes(text))bubble('off');},4200);}

/* ============================================================
   COLD OPEN: Manny in the walk-in, 10:04 PM
   ============================================================ */
function staffSetup(){const M=CHARS.manager,B=CHARS.bree,D=CHARS.devon;
  for(const id of STAFF){const c=CHARS[id];c.where='kitchen';c.root.rotation.set(0,0,0);c.y=0;c.look=null;c.shake=0;setExpr(c,'neutral');}
  place(D,11.9,8.75,0);D.pose='wash';M.where='none';place(M,14.8,8.6,-Math.PI/2);M.pose='phoneEar';B.where='none';place(B,14.8,7.3,-Math.PI/2);B.pose='stand';}
async function sceneCold(){const run=G.run;G.who='manny';G.where='pizzeria';checkpoint('cold');$('title').hidden=true;
  setTarps(false);glassReset();staffSetup();for(const id of FAMILY)CHARS[id].where='none';
  P.seated=null;P.hidden=null;P.limitYaw=null;P.x=11.6;P.z=3.0;P.yaw=-Math.PI/2;P.pitch=-0.1;P.eyeOverride=null;
  DOORS.freezer.target=1;DOORS.freezer.ang=1;DOORS.freezer.locked=false;MOZZ.visible=true;G.flags.gotMozz=false;G.flags.triedDoor=false;G.flags.coldLocked=false;G.flags.coldStage=0;
  setAmb('freezer',0.55,0.5);setAmb('hum',0.18);setMode('cine');
  await titleCard('Pepper Toni’s Family Pizzeria','10:04 PM',2.6);if(!alive(run))return;await fadeTo(0,1.6);if(!alive(run))return;
  at3(11.9,1.2,8.75,(p,t)=>SFX.tinny(p,t,10),1.2);
  thinkM('Last case of mozz, mop the line, and I’m home by eleven.',3.5);
  setMode('play');setObj('Grab a case of mozzarella from the shelf.','The cases are on the shelf against the right-hand wall of the walk-in.');
  await waitUntil(()=>G.flags.gotMozz);if(!alive(run))return;
  // the door swings shut behind him, and the latch drops
  setObj('');$('obj').hidden=true;DOORS.freezer.target=0;DOORS.freezer.locked=true;at3(11,1,6,(p,t)=>SFX.slam(p,t));await gwait(0.6);if(!alive(run))return;at3(11,1.3,6.1,(p,t)=>SFX.clunk(p,t));
  setMode('cine');scoreBase('dread');const T=CHARS.toni;toniShow(11.0,6.8,Math.PI);TONI.house=false;TONI.armed=false;toniTool(null);
  await nudge(11.0,1.6,6.0,0.7);if(!alive(run))return;SFX.sting();shake(0.02,0.4);
  T.poseOv='phoneUp';await toniSay('Take your break, Manny.',{at:[11.0,6.4]});if(!alive(run))return;T.poseOv=null;
  toniWalk(14.9,7.6,1.5).then(()=>{if(alive(run)&&G.flags.coldStage<1)toniHide();});
  await line('manny','Hey! Hey, open up! That’s not funny, man!',{expr:'angry'});if(!alive(run))return;
  G.flags.coldLocked=true;setMode('play');setObj('Get the door open.','The walk-in door. Push it.');
  await waitUntil(()=>G.flags.triedDoor);if(!alive(run))return;
  await line('manny','It won’t move. He dropped the pin on the latch.',{});if(!alive(run))return;
  // Manny at the window for what comes next
  setObj('');$('obj').hidden=true;setMode('cine');await fadeTo(1,0.35);if(!alive(run))return;
  P.x=11.0;P.z=5.5;P.yaw=Math.PI;P.pitch=-0.05;P.seated=true;P.limitYaw=[Math.PI,0.55];P.eyeOverride=1.62;await fadeTo(0,0.4);if(!alive(run))return;
  G.flags.coldStage=1;await coldDevon();if(!alive(run))return;await coldBree();if(!alive(run))return;await coldManager();}
async function coldDevon(){const run=G.run;const T=CHARS.toni,D=CHARS.devon;
  await nudge(11.9,1.4,8.75,0.8);if(!alive(run))return;
  await line('manny','Devon! DEVON! Behind you!',{expr:'fear'});if(!alive(run))return;
  for(let i=0;i<3;i++){SFX.knock(busFx,now());shake(0.012,0.15);await gwait(0.22);}if(!alive(run))return;
  thinkM('Earbuds. He can’t hear me. He never hears anything.',3);
  scoreBase('stalk');toniTool('pin');toniShow(8.6,8.1,Math.PI/2);await toniWalk(11.15,8.7,1.6);if(!alive(run))return;toniFace(D.x,D.z);await gwait(0.5);if(!alive(run))return;
  T.poseOv='swingUp';await gwait(0.45);if(!alive(run))return;T.poseOv='swingDown';await gwait(0.08);at3(D.x,1.6,D.z,(p,t)=>SFX.thud(p,t),1.6);shake(0.01,0.2);
  decal(12.0,1.35,9.87,0.6,0.5,'n',3);D.pose='crumple';setExpr(D,'pain');D.shake=0.5;await gwait(0.5);if(!alive(run))return;
  T.poseOv='swingUp';await gwait(0.4);if(!alive(run))return;T.poseOv='swingDown';await gwait(0.08);at3(D.x,1,D.z,(p,t)=>SFX.thud(p,t),1.6);shake(0.012,0.2);
  D.shake=0;setExpr(D,'dead');D.pose='limp';await tween(0.4,k=>{D.root.rotation.z=k*1.45;D.y=k*0.14;});if(!alive(run))return;decal(10.9,0.013,8.9,1.2,0.9,'up',4);
  await gwait(0.4);T.poseOv=null;await line('manny','No. No, no, no, no—',{expr:'fear'});if(!alive(run))return;
  toniWalk(8.6,8.1,1.4).then(()=>{if(alive(run)&&G.flags.coldStage===1){toniHide();}});await gwait(1.6);}
async function coldBree(){const run=G.run;const T=CHARS.toni,B=CHARS.bree;
  B.where='kitchen';setExpr(B,'fear');place(B,14.9,7.2,-Math.PI/2);B.pose='stand';await gwait(0.3);if(!alive(run))return;
  line('bree','Devon? DEVON! Oh my God—',{expr:'scream'});await npcMove(B,11.0,6.45,3.3);if(!alive(run))return;B.yaw=Math.PI;B.pose='bang';B.look=[11,1.6,5.5];
  await nudge(11.0,1.45,6.3,0.4);if(!alive(run))return;
  at3(11.4,1.1,6.1,(p,t)=>SFX.rattle(p,t));await line('bree','Manny?! Why won’t it open? Why won’t it OPEN?',{expr:'scream'});if(!alive(run))return;
  await line('manny','The pin! There’s a pin in the latch, pull it out!',{expr:'fear'});if(!alive(run))return;
  G.flags.coldStage=2;toniTool('ext');toniShow(8.6,8.1,Math.PI/2);toniWalk(10.35,7.3,1.9);await gwait(1.0);if(!alive(run))return;
  at3(11.4,1.1,6.1,(p,t)=>SFX.rattle(p,t));await line('bree','I can’t find it, I can’t—',{expr:'scream'});if(!alive(run))return;
  await waitUntil(()=>TONI.state==='idle');if(!alive(run))return;toniFace(B.x,B.z);await gwait(0.3);if(!alive(run))return;
  // he sprays her, and the window goes white
  T.poseOv='spray';setExpr(B,'scream');await gwait(0.25);if(!alive(run))return;at3(10.6,1.4,6.8,(p,t)=>SFX.hiss(p,t,1.8),2);sprayOn(true);B.shake=1;
  await tween(1.4,k=>{FZ.powder=k*0.96;if(((k*20)|0)%3===0)glassPaint();});sprayOn(false);if(!alive(run))return;glassPaint();
  T.poseOv=null;await tween(0.35,k=>{T.x=lerp(10.35,10.68,k);T.z=lerp(7.3,6.98,k);});if(!alive(run))return;toniFace(B.x,B.z);
  for(let i=0;i<2;i++){T.poseOv='swingUp';await gwait(0.35);if(!alive(run))return;T.poseOv='swingDown';await gwait(0.06);at3(11,1.5,6.4,(p,t)=>SFX.clang(p,t),1.6);shake(0.02,0.25);if(i===0){glassHand(66,30,0);B.shake=0;}}
  if(!alive(run))return;B.where='none';T.poseOv=null;toniTool(null);
  // the powder settles off the glass; her hand slides down it
  const hand=(g,k)=>{const r=mulberry(77),y=lerp(30,72,k);g.lineCap='round';
    for(let i=0;i<4;i++){const x0=60.5+i*3.6+(i===0?-1:0),top=28-(i===1||i===2?3:0)+r()*2;let yy=top;g.strokeStyle='rgba(118,8,6,.8)';
      while(yy<y-2){const seg=3+r()*7,a=0.85-0.6*(yy-top)/Math.max(1,y-top);g.strokeStyle=`rgba(${110+((r()*30)|0)},8,6,${a.toFixed(2)})`;g.lineWidth=1.6+r()*1.2;g.beginPath();g.moveTo(x0+(r()-0.5)*0.8,yy);g.lineTo(x0+(r()-0.5)*0.8,yy+seg);g.stroke();yy+=seg+r()*2.5;}}
    g.fillStyle='rgba(115,8,6,.35)';for(let yy=40;yy<y+4;yy+=2){const w=11-((yy-40)/Math.max(1,y-36))*4;g.fillRect(66-w/2+(r()-0.5),yy,w,2);}
    g.fillStyle='rgba(125,9,7,.85)';g.beginPath();g.ellipse(66,y+6,5.5,6,0.1,0,TAU);g.fill();g.fillStyle='rgba(125,9,7,.7)';g.beginPath();g.ellipse(71.5,y+3,1.6,3.5,-0.6,0,TAU);g.fill();
    g.fillStyle='rgba(150,18,12,.6)';for(let i=0;i<3;i++){g.beginPath();g.ellipse(62+i*4,y+12,1,1.6+r()*4,0,0,TAU);g.fill();}};
  await tween(3.6,k=>{FZ.powder=0.96*(1-k);FZ.layers[FZ.layers.length-1]=g=>hand(g,k);glassPaint();});
  if(!alive(run))return;toniHide();await line('manny','Bree… oh God. Bree.',{expr:'sad'});if(!alive(run))return;
  thinkM('No bars. There’s never any bars in the walk-in. Somebody call. Somebody, please.',4);await gwait(3.6);}
async function coldManager(){const run=G.run;const T=CHARS.toni,M=CHARS.manager;G.flags.coldStage=3;
  M.where='kitchen';place(M,14.9,8.6,-Math.PI/2);M.pose='phoneEar';setExpr(M,'neutral');
  line('manager','—sir. Sir. I know it’s late. Your driver is on his way. Thank you for choosing Pepper Toni’s.',{expr:'neutral'});await npcMove(M,12.9,8.35,1.0);if(!alive(run))return;await VOICE.busy;await waitUntil(()=>!DS);if(!alive(run))return;
  M.pose='stand';await line('manager','Cheap old bastard. Six bucks and he wants a parade.',{expr:'neutral'});if(!alive(run))return;
  M.look=[CHARS.devon.x-1.2,0.3,CHARS.devon.z];await gwait(0.9);if(!alive(run))return;setExpr(M,'fear');
  await line('manager','Devon? Oh, Jesus. Oh, Jesus Christ.',{expr:'fear'});if(!alive(run))return;
  // he backs away, right up against the walk-in door
  toniTool('rocker');toniShow(8.6,8.1,Math.PI/2);M.look=null;const mv=npcMove(M,11.1,6.75,0.9,{faceCh:T});await toniWalk(10.0,7.7,1.3);if(!alive(run))return;M.pose='plead';M.look=[10.0,1.75,7.7];
  mv.then(()=>{if(alive(run)){toniFace(M.x,M.z);M.yaw=Math.atan2(T.x-M.x,T.z-M.z);}});
  await line('manager','Okay. Okay, buddy. Easy. Is this about the write-up? The drawing? Nobody’s mad about the drawing—',{expr:'fear'});if(!alive(run))return;
  T.poseOv='type';await toniSay('Time for your performance review.');if(!alive(run))return;T.poseOv=null;
  line('manager','Wait— WAIT—',{expr:'scream'});
  // he spins him around and puts his face into the glass
  await tween(0.25,k=>{T.x=lerp(10.0,11.1,k);T.z=lerp(7.7,7.2,k);});if(!alive(run))return;T.yaw=Math.PI;M.yaw=Math.PI;M.look=null;M.pose='pinned';T.poseOv='grab';toniTool(null);
  await nudge(11.05,1.5,6.2,0.25);if(!alive(run))return;
  for(let i=0;i<3;i++){await tween(0.13,k=>{M.z=lerp(6.75,6.38,k);T.z=lerp(7.2,6.92,k);});if(!alive(run))return;
    at3(11,1.5,6.05,(p,t)=>{SFX.knock(p,t);SFX.crack(p,t);},1.4);shake(0.03,0.2);setExpr(M,i===2?'pain':'scream');glassCrack(58+i*5,46-i*3,6+i*3,11+i);glassBlood(60,46,10+i*7,14+i*10,21+i);
    if(i<2){await tween(0.32,k=>{M.z=lerp(6.38,6.75,k);T.z=lerp(6.92,7.2,k);});if(!alive(run))return;}}
  // he slides down the glass
  glassAdd(()=>{});await tween(1.1,k=>{M.y=-k*0.55;FZ.layers[FZ.layers.length-1]=(g)=>{g.strokeStyle='rgba(110,8,6,.8)';g.lineCap='round';g.lineWidth=9;g.beginPath();g.moveTo(60,48);g.lineTo(lerp(60,57,k),lerp(48,100,k));g.stroke();};glassPaint();});if(!alive(run))return;
  // then he's dragged down below the window, and the rocker comes down. And again.
  await tween(0.3,k=>{M.z=lerp(6.38,6.9,k);M.y=-0.55-k*0.5;T.z=lerp(6.92,7.15,k);});if(!alive(run))return;M.where='none';toniTool('rocker');T.poseOv='chopUp';await gwait(0.3);if(!alive(run))return;
  for(let i=0;i<4;i++){T.poseOv='chopUp';await gwait(0.32);if(!alive(run))return;T.poseOv='chopDown';await gwait(0.05);at3(11,0.5,6.8,(p,t)=>SFX.chop(p,t),1.4);shake(0.018,0.2);postU.uRed.value=0.12;
    glassBlood(40+R()*48,70+R()*24,22,24,40+i);await gwait(0.12);postU.uRed.value=0;}
  if(!alive(run))return;await gwait(1.1);if(!alive(run))return;
  // he stands, cleans the glass for Manny, and shows him the phone
  T.poseOv=null;toniTool('rag');{const z0=T.z;await tween(0.4,k=>{T.z=lerp(z0,6.78,k);});}if(!alive(run))return;await nudge(11.0,1.6,6.2,0.4);if(!alive(run))return;
  T.poseOv='wipe';at3(11,1.5,6.1,(p,t)=>SFX.drag(p,t,1.2),1.4);await gwait(0.9);if(!alive(run))return;glassWipe();await gwait(0.5);if(!alive(run))return;
  toniTool(null);await tween(0.2,k=>{T.z=lerp(6.78,6.82,k);});if(!alive(run))return;T.poseOv='phoneUp';await gwait(0.4);if(!alive(run))return;
  await toniSay('Keep the ovens on. Got a party coming.',{at:[11.0,6.3]});if(!alive(run))return;T.poseOv=null;
  scoreBase('dread');await toniWalk(14.9,7.6,1.5);if(!alive(run))return;toniHide();at3(18,1,30,(p,t)=>SFX.slam(p,t),3);await gwait(1.2);if(!alive(run))return;at3(18,0.5,40,(p,t)=>SFX.engine(p,t),6);
  // Manny slides down the door
  P.eyeOverride=0.8;await gwait(2.4);if(!alive(run))return;await line('manny','Kid… what did you do?',{expr:'sad'});if(!alive(run))return;
  await gwait(0.8);await fadeTo(1,2);if(!alive(run))return;for(const id of STAFF)CHARS[id].where='none';sceneCredits();}

/* ============================================================
   THE RAMIREZ HOUSE
   ============================================================ */
function houseSeat(id){const c=CHARS[id],s=HPT.seats[id];c.where='house';c.root.rotation.set(0,0,0);c.y=0;c.tilt=0;place(c,s[0]-Math.sin(s[2])*0.05,s[1]-Math.cos(s[2])*0.05,s[2],0);c.pose='sit';c.look=null;c.shake=0;}
function houseCast(){for(const id of FAMILY){houseSeat(id);if(CHARS[id].extra.hat)CHARS[id].extra.hat.visible=false;setExpr(CHARS[id],'neutral');}}
function luciaSeat(){const s=HPT.seats.lucia;P.x=s[0]-0.1;P.z=s[1];P.seated=true;P.hidden=null;P.yaw=Math.PI/2;P.pitch=-0.3;P.limitYaw=[Math.PI/2,1.95];P.eyeOverride=null;}
function houseReset(){setPower(true);DOORS.hFront.target=0;DOORS.hFront.ang=0;DOORS.hLucia.target=1;DOORS.hLucia.ang=1;DOORS.hLucia.locked=false;DOORS.hGarLaun.target=0;DOORS.hGarLaun.ang=0;
  TBOX.g.visible=false;BOXHELD.visible=false;GPHONE.visible=true;lpClose();G.where='house';G.who='lucia';TONI.house=false;TONI.sightK=1;HAI.sawHide=false;G.flags.canHide=false;G.noLeave=false;G.onHide=null;G.lpCharge=false;
  const T=CHARS.toni;T.extra.box.visible=false;T.extra.glow.visible=false;toniTool(null);T.poseOv=null;T.carrying=false;
  setAmb('freezer',0,0.5);setAmb('hum',0,0.5);setAmb('rain',0.4,1);setAmb('house',0.3,1);}
async function sceneHouse(){const run=G.run;checkpoint('house');houseReset();houseCast();luciaSeat();
  setMode('cine');await titleCard('The Ramirez house','10:41 PM',2.4);if(!alive(run))return;
  const D=CHARS.dad,GP=CHARS.grandpa,U=CHARS.uncle,A=CHARS.alex,RB=CHARS.ruben;
  setExpr(D,'sad');setExpr(A,'sad');GP.pose='sitPhone';await fadeTo(0,2.2);if(!alive(run))return;setMode('play');
  await line('grandpa','Forty minutes. Forty minutes for a six-dollar pizza.',{expr:'angry'});if(!alive(run))return;
  U.look=[GP.x,1.2,GP.z];await line('uncle','You could’ve let me cater, Pop. I offered.',{expr:'smirk'});if(!alive(run))return;
  GP.pose='sit';GP.look=[U.x,1.2,U.z];await line('grandpa','With what money?',{expr:'angry'});if(!alive(run))return;
  await line('uncle','Wow. Okay.',{expr:'smirk'});if(!alive(run))return;U.look=null;GP.look=null;
  D.look=[GP.x,1.2,GP.z];await line('dad','Can we not do this tonight? Please. Not tonight.',{expr:'sad'});if(!alive(run))return;D.look=null;
  RB.look=[A.x,1.1,A.z];A.look=[RB.x,1.1,RB.z];await line('ruben','Is your grandpa always like this?',{expr:'neutral'});if(!alive(run))return;
  await line('alex','Yeah. He’s nicer when he’s asleep.',{expr:'sad'});if(!alive(run))return;RB.look=null;A.look=null;
  D.look=[P.x,1.2,P.z];await nudge(...[D.x,1.15,D.z],0.8);if(!alive(run))return;
  await line('dad','Hey. You doing okay, mija?',{expr:'sad'});if(!alive(run))return;
  const SAY_H1=['I’m fine.','No. Are you?','Mom would’ve hated this.'];const c=await choose(SAY_H1,{who:'Lucia',timeout:8});if(!alive(run))return;G.flags.h1=c;if(c>=0){await line('lucia',SAY_H1[c],{name:'Lucia'});if(!alive(run))return;}
  if(c===0)await line('dad','Yeah. Me too.',{expr:'sad'});
  else if(c===1){await line('dad','No. But I’ve got you and your brother. That’s enough for tonight.',{expr:'sad'});remember('Your dad will remember that.');}
  else if(c===2){await line('dad','Pizza at her own wake? Yeah. She’d have ordered from the good place.',{expr:'sad'});if(!alive(run))return;await line('grandpa','The good place is twenty dollars.',{expr:'angry'});}
  else await line('dad','That’s okay. You don’t have to talk.',{expr:'sad'});
  if(!alive(run))return;D.look=null;
  // a moment to look around the table
  G.flags.freeLook=true;G.flags.seen={};setObj('Look around the table.','Mom’s photo is on the sideboard. Look at Grandpa, at your uncle, at Alex.');
  const t0=G.time;await waitUntil(()=>(Object.keys(G.flags.seen).length>=2&&noteRes===null&&G.mode==='play'&&!DS)||G.time-t0>50);if(!alive(run))return;await gwait(1.5);if(!alive(run))return;
  await waitUntil(()=>G.mode==='play'&&!DS);G.flags.freeLook=false;setObj('');$('obj').hidden=true;
  // the app: running late
  appText('Your driver is running a few minutes late.');await gwait(1.6);if(!alive(run))return;lpTrack(true);await gwait(2.6);if(!alive(run))return;lpClose();
  await line('lucia','He’s running a few minutes late.',{name:'Lucia'});if(!alive(run))return;
  await line('grandpa','A few minutes! It’s been forty! I called that place. Some manager. Very rude.',{expr:'angry'});if(!alive(run))return;
  await line('uncle','Bet he loved you, Pop.',{expr:'smirk'});if(!alive(run))return;
  await gwait(1.2);if(!alive(run))return;
  // the doorbell
  at3(179.6,1.6,3.6,(p,t)=>SFX.doorbell(p,t),3);await gwait(0.4);appText('Your driver is outside.');await gwait(1.2);if(!alive(run))return;
  await line('dad','Lucia, can you get that? Please.',{expr:'sad'});if(!alive(run))return;
  await line('grandpa','And don’t you tip him. The tip’s already in the app. Two dollars.',{expr:'angry'});if(!alive(run))return;
  await line('lucia','Two dollars? Grandpa, that’s—',{name:'Lucia'});if(!alive(run))return;
  await line('grandpa','Plenty. Go.',{expr:'angry'});if(!alive(run))return;
  // Toni on the porch, in the suit, in the rain
  const T=CHARS.toni;toniShow(181.05,3.6,-Math.PI/2);TONI.house=true;TONI.state='idle';T.carrying=true;T.extra.box.visible=true;
  P.seated=null;P.limitYaw=null;P.x=174.35;P.z=3.5;P.yaw=-Math.PI/2;P.pitch=-0.05;
  setObj('Answer the door.','The front door is through the arch on your right, in the front hall.');G.flags.atDoor=false;
  await waitUntil(()=>G.flags.atDoor);if(!alive(run))return;setObj('');$('obj').hidden=true;
  DOORS.hFront.target=1;at3(180,1,3.6,(p,t)=>SFX.door(p,t),2);setAmb('rain',0.75,0.5);setMode('cine');scoreBase('dread');await nudge(181.05,1.75,3.6,0.9);if(!alive(run))return;
  await gwait(1.6);if(!alive(run))return;await line('lucia','Um. Hi.',{name:'Lucia'});if(!alive(run))return;
  T.tilt=0.3;await gwait(1.2);if(!alive(run))return;T.tilt=0;
  setMode('play');setObj('Take the pizza.','He’s holding it out to you.');G.flags.tookPizza=false;await waitUntil(()=>G.flags.tookPizza);if(!alive(run))return;
  setObj('');$('obj').hidden=true;T.carrying=false;T.extra.box.visible=false;BOXHELD.visible=true;SFX.pick();
  setMode('cine');await line('lucia','…Thanks?',{name:'Lucia'});if(!alive(run))return;
  // he doesn't leave. He looks past her, at the house, at the photo on the sideboard.
  toniFace(171.5,0.6);await gwait(1.8);if(!alive(run))return;
  line('grandpa','Is that him? Tell him he’s late!',{expr:'angry'});await gwait(1.8);if(!alive(run))return;toniFace(P.x,P.z);await gwait(0.6);if(!alive(run))return;
  const SAY_H2=['Sorry. My grandpa’s… a lot.','You’re really late, you know.','I gotta go.'];const c2=await choose(SAY_H2,{who:'Lucia',timeout:6});if(!alive(run))return;G.flags.h2=c2;
  if(c2>=0){await line('lucia',SAY_H2[c2],{name:'Lucia'});if(!alive(run))return;}
  if(c2===0){T.tilt=0.25;await gwait(1.2);T.tilt=0;remember('Your driver noticed that.');}else if(c2===1){await gwait(1.2);remember('Your driver will remember that.');}
  if(!alive(run))return;
  toniWalk(190.4,5.2,1.3).then(()=>{if(alive(run))toniHide();});await gwait(1.8);if(!alive(run))return;
  setMode('play');await waitUntil(()=>P.x<179.2);if(!alive(run))return;DOORS.hFront.target=0;at3(180,1,3.6,(p,t)=>SFX.door(p,t),2);setAmb('rain',0.4,0.8);scoreBase(null);
  setMode('play');setObj('Bring the pizza to the table.','Back through the arch, to the dining room.');G.flags.boxDown=false;await waitUntil(()=>G.flags.boxDown);if(!alive(run))return;
  setObj('');$('obj').hidden=true;BOXHELD.visible=false;TBOX.g.visible=true;TBOX.lid.rotation.x=0;SFX.pick();
  setMode('cine');await fadeTo(1,0.3);if(!alive(run))return;luciaSeat();await fadeTo(0,0.4);if(!alive(run))return;
  await sceneRating();}

async function sceneRating(){const run=G.run;const D=CHARS.dad,GP=CHARS.grandpa,U=CHARS.uncle,A=CHARS.alex,RB=CHARS.ruben;
  GP.look=[171.5,0.8,3.5];await line('grandpa','Give it here.',{expr:'angry'});if(!alive(run))return;await tween(0.7,k=>{TBOX.lid.rotation.x=-k*2.75;});if(!alive(run))return;
  await line('grandpa','Cold. Of course it’s cold.',{expr:'angry'});if(!alive(run))return;
  GP.look=[P.x,1.2,P.z];await nudge(GP.x,1.25,GP.z,0.6);if(!alive(run))return;
  await line('grandpa','Lucia. Give him one star.',{expr:'angry'});if(!alive(run))return;
  await line('lucia',G.flags.h2===0?'Grandpa, he was just late. He looked… I don’t know. Sad.':'Grandpa, he was just late.',{name:'Lucia'});if(!alive(run))return;
  await line('grandpa','One star. Bad ratings keep them hungry, and hungry drivers hustle. And next time, the tip is smaller.',{expr:'angry'});if(!alive(run))return;
  D.look=[GP.x,1.2,GP.z];await line('dad','Pop. Come on.',{expr:'sad'});if(!alive(run))return;
  await line('grandpa','My money. Do it, Lucia.',{expr:'angry'});if(!alive(run))return;D.look=null;
  setObj('Rate the delivery.','Tap the stars on your phone.');await lpRate();if(!alive(run))return;setObj('');$('obj').hidden=true;GP.look=null;
  await gwait(2.2);if(!alive(run))return;lpClose();
  if(G.flags.triedStars)remember('Grandpa saw you try to give him more.');
  await line('lucia','Sorry, whoever you are.',{name:'Lucia'});if(!alive(run))return;
  // the family eats; Lucia doesn't
  await line('dad','Okay. Eat, everybody. Mija, you too.',{expr:'sad'});if(!alive(run))return;
  const SAY_H3=['I’m not eating six-dollar pizza.','I’m not hungry.'];const c=await choose(SAY_H3,{who:'Lucia',timeout:6});if(!alive(run))return;G.flags.h3=c;if(c>=0){await line('lucia',SAY_H3[c],{name:'Lucia'});if(!alive(run))return;}
  await line('grandpa',c===0?'Princess. More for us.':'More for us.',{expr:'angry'});if(!alive(run))return;
  for(const id of FAMILY){CHARS[id].pose='eat';}const crunch=()=>{for(const id of FAMILY){const ch=CHARS[id];if(ch.pose==='eat'&&R()<0.5)at3(ch.x,1.1,ch.z,(p,t)=>SFX.crunch(p,t),1.5);}};
  crunch();await gwait(1.4);if(!alive(run))return;crunch();
  // the text, a minute after the rating
  appText('sorry it was late');await gwait(1.4);if(!alive(run))return;lpThread();await gwait(3.2);if(!alive(run))return;lpClose();
  await line('lucia','He texted me. “Sorry it was late.” All lowercase.',{name:'Lucia'});if(!alive(run))return;
  await line('uncle','Creepy.',{expr:'smirk'});if(!alive(run))return;
  await line('grandpa','Good. He should be sorry.',{expr:'angry'});if(!alive(run))return;
  crunch();await line('alex','It tastes kind of weird.',{expr:'neutral'});if(!alive(run))return;
  await line('ruben','That’s how you know it’s cheap.',{expr:'neutral'});if(!alive(run))return;crunch();
  await line('ruben','In horror movies, this is the part where the pizza’s poisoned.',{expr:'neutral'});if(!alive(run))return;
  await line('alex','Shut up, Ruben.',{expr:'neutral'});if(!alive(run))return;
  // and it was
  scoreBase('dread');GP.pose='sit';GP.look=[GP.x,1.6,GP.z+1];at3(GP.x,1.2,GP.z,(p,t)=>SFX.buzz(p,t),1.2);await gwait(1.4);if(!alive(run))return;
  U.pose='sit';await line('uncle','Man, I’m wiped. Somebody spike the—',{expr:'neutral'});if(!alive(run))return;U.pose='slumpBack';setExpr(U,'out');await gwait(1.0);if(!alive(run))return;
  await line('grandpa','Hey. HEY. Sit up. What’s wrong with… with my…',{expr:'angry'});if(!alive(run))return;GP.pose='slumpTable';setExpr(GP,'out');at3(GP.x,0.9,GP.z,(p,t)=>SFX.thud(p,t),1.2);await gwait(0.6);if(!alive(run))return;
  A.pose='sit';await line('alex','Lucia? I feel… weird…',{expr:'sad'});if(!alive(run))return;A.pose='slumpTable';setExpr(A,'out');await gwait(0.5);if(!alive(run))return;
  RB.pose='sitScared';setExpr(RB,'fear');await line('ruben','Guys? Guys, this isn’t funny—',{expr:'fear'});if(!alive(run))return;RB.pose='slumpBack';setExpr(RB,'out');await gwait(0.6);if(!alive(run))return;
  D.pose='standUp';setExpr(D,'fear');D.look=[P.x,1.2,P.z];await nudge(D.x,1.3,D.z,0.5);if(!alive(run))return;
  await line('dad','Something’s in the… Lucia. Lucia, call…',{expr:'fear'});if(!alive(run))return;
  setExpr(D,'out');await tween(0.6,k=>{D.root.rotation.z=-k*1.4;D.y=k*0.0;D.x=lerp(169.6,169.2,k);});if(!alive(run))return;D.pose='limp';at3(D.x,0.3,D.z,(p,t)=>SFX.thud(p,t),1.2);shake(0.015,0.25);
  await line('lucia','Dad? DAD!',{name:'Lucia'});if(!alive(run))return;
  await sceneRoom(true);}

/* ---------- after they pass out: her phone, her room ---------- */
async function sceneRoom(continuing){const run=G.run;
  if(!continuing){checkpoint('room');scoreBase('dread');houseReset();houseCast();for(const id of FAMILY){const c=CHARS[id];c.pose=id==='uncle'||id==='ruben'?'slumpBack':'slumpTable';setExpr(c,'out');}
    const D=CHARS.dad;D.root.rotation.z=-1.4;D.x=169.2;D.pose='limp';TBOX.g.visible=true;TBOX.lid.rotation.x=-2.75;luciaSeat();setMode('cine');await fadeTo(0,1);if(!alive(run))return;}
  else checkpoint('room');scoreBase('dread');
  P.seated=null;P.limitYaw=null;P.x=174.3;P.z=3.5;setMode('play');setObj('Wake your dad.','He’s on the floor by the head of the table.');G.flags.shookDad=false;
  await waitUntil(()=>G.flags.shookDad);if(!alive(run))return;
  setMode('cine');await line('lucia','Dad. Dad, wake up. Please wake up.',{name:'Lucia'});if(!alive(run))return;
  thinkL('He’s breathing. They’re all breathing. They’re just… out.',3.5);await gwait(3.4);if(!alive(run))return;
  lpDead();await gwait(1.1);if(!alive(run))return;SFX.ui();lpBlack();await gwait(0.9);if(!alive(run))return;lpClose();
  await line('lucia','No. No, no, no. Not now. Not NOW.',{name:'Lucia'});if(!alive(run))return;
  setMode('play');setObj('Charge your phone. The charger’s in your room.','Your room is at the far end of the hallway, past the kitchen.');G.flags.inRoom=false;G.flags.heardGarage=false;
  // the garage door, while she's on her way
  await waitUntil(()=>G.flags.inRoom||groupAt(P.x,P.z)==='h_hall'||groupAt(P.x,P.z)==='h_kitchen');if(!alive(run))return;
  at3(153.5,1.2,0.6,(p,t)=>SFX.garage(p,t),4);await gwait(2.0);if(!alive(run))return;thinkL('The garage door. Somebody’s in the garage.',3);await gwait(2.4);if(!alive(run))return;
  toniSay('Delivery.',{at:[155,3]});await gwait(1.2);if(!alive(run))return;at3(153.5,1.2,0.6,(p,t)=>SFX.garage(p,t),4);
  setObj('Get to your room and lock the door.','Your room is at the far end of the hallway.');G.flags.locked=false;
  await waitUntil(()=>G.flags.locked);if(!alive(run))return;
  setObj('Plug in your phone.','The charger is on the nightstand, by the bed.');G.flags.plugged=false;await waitUntil(()=>G.flags.plugged);if(!alive(run))return;
  await sceneCharge();}
async function sceneCharge(){const run=G.run;checkpoint('charge');
  setObj('Wait for it to turn on.','Come on. Come on.');lpCharging();chargeT=0;G.lpCharge=true;
  scoreBase('stalk');const T=CHARS.toni;TONI.house=true;TONI.sightK=0.8;toniShow(160.6,1.6,Math.PI/2);DOORS.hGarLaun.target=1;
  // footsteps through the kitchen and down the hall
  toniWalk(164.3,7.7,1.3).then(()=>{if(alive(run))toniWalk(158.5,8.0,1.2);});await gwait(5);if(!alive(run))return;
  toniSay('Hi. I’m inside.');await gwait(6);if(!alive(run))return;
  // the power goes
  SFX.powerDown();setPower(false);G.lpCharge=false;lpNoCharge();setAmb('house',0,0.3);await gwait(1.2);if(!alive(run))return;
  await line('lucia','No, no, no, no…',{name:'Lucia'});if(!alive(run))return;lpClose();
  await waitUntil(()=>TONI.state==='idle');if(!alive(run))return;await toniWalk(153.9,8.25,1.2);if(!alive(run))return;toniFace(153.9,9.5);
  at3(153.9,1,9,(p,t)=>SFX.rattle(p,t),2);await gwait(1.2);if(!alive(run))return;
  scoreBase('dread');setObj('Hide!','Under the bed, or in the closet.');G.flags.canHide=true;let hid=false;G.onHide=()=>{hid=true;};
  at3(153.9,1,9,(p,t)=>SFX.card(p,t),2);thinkL('Is that… a card? He’s opening the lock.',2.6);
  const t0=G.time;await waitUntil(()=>hid||G.time-t0>7.5);if(!alive(run))return;
  if(!hid){DOORS.hLucia.locked=false;DOORS.hLucia.target=1;at3(153.9,1,9,(p,t)=>SFX.door(p,t),2);toniWalk(P.x,P.z,2.4);await gwait(0.9);if(!alive(run))return;
    die('SIGNED FOR.','He came through the door and you were standing right there. Hide before the lock gives.');return;}
  G.noLeave=true;setObj('');$('obj').hidden=true;await gwait(0.8);if(!alive(run))return;
  DOORS.hLucia.locked=false;DOORS.hLucia.target=1;at3(153.9,1,9,(p,t)=>SFX.door(p,t),2);await gwait(0.8);if(!alive(run))return;
  // he walks in, phone glowing, and stops by her hiding place
  const h=P.hidden;await toniWalk(153.8,10.4,1.1);if(!alive(run))return;await toniWalk(152.6,12.6,1.0);if(!alive(run))return;toniFace(150,12.7);await gwait(1.6);if(!alive(run))return;
  const spot=h.kind==='bed'?[156.2,11.7,156.3,13.2]:[151.7,10.6,150.4,10.4];await toniWalk(spot[0],spot[1],0.9);if(!alive(run))return;toniFace(spot[2],spot[3]);SFX.heartbeat(0.8);await gwait(1.4);if(!alive(run))return;
  T.tilt=0.35;await toniSay('You wrote: late and cold. Driver didn’t say a word.');if(!alive(run))return;await gwait(1.2);if(!alive(run))return;
  await toniSay('I’m saying a lot now.');if(!alive(run))return;T.tilt=0;await gwait(1.4);if(!alive(run))return;
  // a crash from the dining room: her uncle, coming round
  at3(170.5,0.6,2.4,(p,t)=>SFX.crash(p,t),3);await gwait(0.5);line('uncle','Mmh… Pop? What… what happened…',{expr:'out'});await gwait(1.2);if(!alive(run))return;
  toniFace(153.9,8);await gwait(0.7);if(!alive(run))return;await toniWalk(153.9,8.0,1.5);if(!alive(run))return;toniSay('Please tell us what went wrong.');
  await toniWalk(164.3,7.7,1.6);if(!alive(run))return;toniHide();G.noLeave=false;
  CHARS.uncle.where='none';thinkL('He’s going back for them. I have to get out. I have to get help.',3.5);
  sceneEscape(true);}

/* ---------- the escape: through the dark house to the front door ---------- */
const HAI={wp:null,pauseT:0,lostT:0,lastSeen:null,sawHide:false,checked:false,takeT:0};
const HOUSE_WP=[[161.6,1.6],[166.3,5.5],[171.5,6.2],[168.9,1.3],[174.2,5.8],[177.5,2.0],[177.5,5.5],[171.4,9.4],[174.5,11.8],[171.4,14.6],[176.8,14.6],[164.3,7.7],[159.1,8],[153.9,8],[153.6,11.5],[159.3,12.8],[164.5,12],[158.6,1.6],[155.5,6.2]];
async function sceneEscape(continuing){const run=G.run;
  if(!continuing){checkpoint('escape');houseReset();houseCast();setPower(false);setAmb('house',0,0.1);for(const id of FAMILY){const c=CHARS[id];c.pose=id==='ruben'?'slumpBack':'slumpTable';setExpr(c,'out');}
    const D=CHARS.dad;D.root.rotation.z=-1.4;D.x=169.2;D.pose='limp';CHARS.uncle.where='none';TBOX.g.visible=true;TBOX.lid.rotation.x=-2.75;
    P.seated=null;P.hidden=null;P.limitYaw=null;P.x=153.9;P.z=11.2;P.yaw=0;P.pitch=0;DOORS.hLucia.target=1;DOORS.hLucia.ang=1;setMode('cine');await fadeTo(0,0.8);if(!alive(run))return;}
  else checkpoint('escape');
  scoreBase('stalk');G.flags.canHide=true;G.onHide=null;G.flags.escaping=true;HAI.takeT=0;HAI.took=['uncle'];
  setMode('play');setObj('Get out of the house. The front door is past the living room.','Stay out of his sight. Duck behind furniture, or hide in a closet, under a bed or in the shower until he passes. He hears you run.');
  const T=CHARS.toni;TONI.house=true;TONI.sightK=0.75;toniShow(171.5,6.2,Math.PI);TONI.state='idle';await gwait(4);if(!alive(run))return;
  TONI.state='patrol';TONI.path=[];HAI.pauseT=0;HAI.lostT=0;setAmb('hunt',0.3,1.5);}
/* he carries them out one at a time, while she isn't looking */
function stepEscape(dt){if(TONI.state!=='patrol'||groupAt(camera.position.x,camera.position.z)==='h_dining')return;
  // not while she could see the table, from the living room or the kitchen
  const dt2=Math.hypot(171.5-P.x,3.5-P.z);if(dt2<13&&Math.abs(angDiff(P.yaw,yawTo(171.5,3.5)))<1.0&&!segBlocked(P.x,P.z,171.5,3.5,1.5))return;HAI.takeT+=dt;
  const order=['grandpa','ruben','alex','dad'];if(HAI.takeT>14){const id=order.find(k=>!HAI.took.includes(k));if(id){HAI.took.push(id);CHARS[id].where='none';HAI.takeT=0;at3(171.5,0.3,4,(p,t)=>SFX.drag(p,t,1.5),3);}}}
function houseThink(dt){const T=CHARS.toni;barkT-=dt;const sees=toniSees();const d=Math.hypot(P.x-T.x,P.z-T.z);
  if(sees){HAI.lastSeen=[P.x,P.z];HAI.lostT=0;}else HAI.lostT+=dt;
  postU.uDanger.value=damp(postU.uDanger.value,sees?0.75:TONI.state==='chase'?0.45:0.12,3,dt);
  if(!P.hidden&&d<0.95&&(sees||TONI.state==='chase')){caught('He caught you. Stay out of his sight: duck behind the furniture, or hide and let him pass.');return;}
  if(P.hidden&&HAI.sawHide&&d<1.8){caught('He watched you hide. Lose him first, then hide.');return;}
  if(TONI.state==='patrol'||TONI.state==='search'){
    if(sees){TONI.state='chase';SFX.sting();if(barkT<=0){barkT=6;toniSay(R()<0.5?'There you are, Lucia.':'Found you.',{quick:true});}TONI.path=pathTo(T.x,T.z,P.x,P.z);return;}
    if(TONI.state==='patrol'&&P.speed>3&&!P.hidden&&d<9){TONI.state='search';TONI.path=pathTo(T.x,T.z,P.x,P.z);TONI.speed=2.1;HAI.checked=false;if(barkT<=0){barkT=7;toniSay(R()<0.5?'Hello?':'Knock knock.',{quick:true});}return;}
    if(!TONI.path.length){HAI.pauseT-=dt;if(HAI.pauseT>0)return;
      if(TONI.state==='search'){if(P.hidden&&!HAI.checked&&Math.hypot(P.hidden.ex-T.x,P.hidden.ez-T.z)<5){HAI.checked=true;houseCheckSpot(P.hidden);return;}TONI.state='patrol';}
      const near=HOUSE_WP.filter(w=>Math.hypot(w[0]-P.x,w[1]-P.z)<9);const pool=R()<0.5&&near.length?near:HOUSE_WP;let w=pool[(R()*pool.length)|0];if(w===HAI.wp)w=pool[(R()*pool.length)|0];HAI.wp=w;
      TONI.path=pathTo(T.x,T.z,w[0],w[1]);TONI.speed=1.45;HAI.pauseT=1.2+R()*2.4;
      if(barkT<=0&&R()<0.55){barkT=10;toniSay(['Delivery.','Hello?','Please tell us what went wrong.','I can wait. I always wait.','Knock knock.'][(R()*5)|0],{quick:true});}}}
  else if(TONI.state==='chase'){TONI.speed=3.0;const ls=HAI.lastSeen||[P.x,P.z];if(sees||!TONI.path.length)TONI.path=pathTo(T.x,T.z,ls[0],ls[1]);
    if(HAI.lostT>3){TONI.state='search';TONI.path=[];HAI.pauseT=2.2;HAI.checked=false;if(barkT<=0){barkT=6;toniSay(R()<0.5?'Okay.':'I found your house. I’ll find you.',{quick:true});}}}}
async function houseCheckSpot(h){const T=CHARS.toni,run=G.run;TONI.state='walk';TONI.path=pathTo(T.x,T.z,h.ex,h.ez);TONI.speed=1.3;await new Promise(r=>{TONI.onArrive=r;});if(!alive(run))return;TONI.state='idle';toniFace(h.x,h.z);
  if(!P.hidden){TONI.state='patrol';return;}await toniSay(h.kind==='curtain'?'Occupied?':R()<0.5?'Anyone in here?':'Ding dong.');if(!alive(run))return;
  for(let i=0;i<3;i++){SFX.heartbeat(0.75);await gwait(0.9);if(!alive(run))return;}
  TONI.state='patrol';TONI.path=[];HAI.pauseT=0.5;}
function caught(why){if(G.mode==='dead')return;const T=CHARS.toni;TONI.state='idle';T.poseOv='grab';G.flags.escaping=false;at3(P.x,1.2,P.z,(p,t)=>SFX.thud(p,t));die('SIGNED FOR.',why);}

/* ---------- out the front door ---------- */
async function sceneOut(){const run=G.run;scoreBase(null);G.flags.escaping=false;setObj('');$('obj').hidden=true;setMode('cine');setAmb('hunt',0,1);postU.uDanger.value=0;
  const T=CHARS.toni;toniHide();TONI.house=false;
  // everyone he took is in the van, slumped against each other
  [['dad',193.0,2.7,-Math.PI/2-0.4,0],['alex',193.3,3.5,-Math.PI/2+0.3,0.5],['grandpa',194.1,2.4,-Math.PI/2,-0.3],['ruben',193.9,3.9,-Math.PI/2+0.5,0.4],['uncle',194.2,3.2,-Math.PI/2-0.2,-0.5]].forEach(([id,x,z,y,lean])=>{const c=CHARS[id];c.where='van';c.root.rotation.set(0,0,0);place(c,x,z,y,0.42);c.pose='sitFloor';c.tilt=lean;setExpr(c,'out');});
  DOORS.hFront.target=1;at3(180,1,3.6,(p,t)=>SFX.door(p,t),2);setAmb('rain',0.85,0.5);await gwait(0.4);if(!alive(run))return;
  // she runs out into the rain, and stops
  await tween(1.6,k=>{P.x=lerp(179.2,184.5,smooth(k));P.z=lerp(3.6,3.6,k);P.yaw=yawTo(193,3.2);P.pitch=-0.08;});if(!alive(run))return;
  await tween(2.2,k=>{P.x=lerp(184.5,187.3,k);});if(!alive(run))return;
  await nudge(193.4,1.1,3.1,0.8);if(!alive(run))return;await line('lucia','Dad…?',{name:'Lucia'});if(!alive(run))return;
  await gwait(1.0);if(!alive(run))return;
  toniShow(186.1,3.6,Math.PI/2);TONI.state='idle';T.tilt=0.25;
  await toniSay('Your order is on its way.');if(!alive(run))return;
  await nudge(186.1,1.75,3.6,0.35);if(!alive(run))return;SFX.sting();shake(0.03,0.3);await gwait(0.6);if(!alive(run))return;
  $('fade').style.transitionDuration='0s';$('fade').style.opacity='1';at3(P.x,1.2,P.z,(p,t)=>SFX.thud(p,t));setAmb('rain',0,0.2);await gwait(2.4);if(!alive(run))return;
  // and wake up at Pepper Toni's
  T.tilt=0;toniHide();setPower(true);G.where='pizzeria';G.flags.canHide=false;sceneTable();}

/* ---------- back at Pepper Toni's: what the cold open left behind ---------- */
function glassAftermath(){glassReset();const hand=(g,k)=>{const r=mulberry(77),y=lerp(30,72,k);g.lineCap='round';
    for(let i=0;i<4;i++){const x0=60.5+i*3.6+(i===0?-1:0),top=28-(i===1||i===2?3:0)+r()*2;let yy=top;g.strokeStyle='rgba(118,8,6,.8)';
      while(yy<y-2){const seg=3+r()*7,a=0.85-0.6*(yy-top)/Math.max(1,y-top);g.strokeStyle=`rgba(${110+((r()*30)|0)},8,6,${a.toFixed(2)})`;g.lineWidth=1.6+r()*1.2;g.beginPath();g.moveTo(x0+(r()-0.5)*0.8,yy);g.lineTo(x0+(r()-0.5)*0.8,yy+seg);g.stroke();yy+=seg+r()*2.5;}}
    g.fillStyle='rgba(115,8,6,.35)';for(let yy=40;yy<y+4;yy+=2){const w=11-((yy-40)/Math.max(1,y-36))*4;g.fillRect(66-w/2+(r()-0.5),yy,w,2);}
    g.fillStyle='rgba(125,9,7,.85)';g.beginPath();g.ellipse(66,y+6,5.5,6,0.1,0,TAU);g.fill();g.fillStyle='rgba(125,9,7,.7)';g.beginPath();g.ellipse(71.5,y+3,1.6,3.5,-0.6,0,TAU);g.fill();
    g.fillStyle='rgba(150,18,12,.6)';for(let i=0;i<3;i++){g.beginPath();g.ellipse(62+i*4,y+12,1,1.6+r()*4,0,0,TAU);g.fill();}};glassAdd(g=>hand(g,1));
  glassCrack(58,46,6,11);glassCrack(63,43,9,12);glassCrack(68,40,12,13);glassBlood(60,46,24,38,23);glassSmear(60,48,57,100,9);for(let i=0;i<4;i++)glassBlood(40+((i*37)%48),70+((i*13)%24),22,24,40+i);glassWipe();}
function pizzeriaReset(){G.where='pizzeria';setPower(true);setTarps(true);glassAftermath();clearDecals();decal(12.0,1.35,9.87,0.6,0.5,'n',3);decal(10.9,0.013,8.9,1.2,0.9,'up',4);decal(10.8,0.013,7.0,0.8,1.6,'up',7);
  for(const id of STAFF)CHARS[id].where='none';for(const id of FAMILY){const c=CHARS[id];c.where='party';c.root.rotation.set(0,0,0);c.y=0;c.tilt=0;seat(c,id);if(c.extra.hat)c.extra.hat.visible=true;}
  TBOX.g.visible=false;BOXHELD.visible=false;GPHONE.visible=false;lpClose();TONI.house=false;TONI.sightK=1;G.flags.escaping=false;G.flags.canHide=false;G.noLeave=false;G.onHide=null;
  setAmb('rain',0,0.5);setAmb('house',0,0.5);}
async function sceneChargeRetry(){const run=G.run;houseReset();houseCast();for(const id of FAMILY){const c=CHARS[id];c.pose=id==='uncle'||id==='ruben'?'slumpBack':'slumpTable';setExpr(c,'out');}
  const D=CHARS.dad;D.root.rotation.z=-1.4;D.x=169.2;D.pose='limp';TBOX.g.visible=true;TBOX.lid.rotation.x=-2.75;
  G.flags.locked=true;G.flags.plugged=true;DOORS.hLucia.target=0;DOORS.hLucia.ang=0;DOORS.hLucia.locked=true;P.seated=null;P.hidden=null;P.limitYaw=null;P.x=156.4;P.z=14.6;P.yaw=Math.PI*0.85;P.pitch=-0.1;
  setMode('cine');await fadeTo(0,0.8);if(!alive(run))return;setMode('play');sceneCharge();}

/* ---------- interactions ---------- */
function setupPrologue(){
  const C=()=>G.who==='manny'&&G.where==='pizzeria'&&G.ckpt==='cold';
  ix('mozz',PT.mozz,'Take the case of mozzarella',()=>{G.flags.gotMozz=true;MOZZ.visible=false;SFX.pick();sub('Took the case of mozzarella.',1.6);},()=>C()&&!G.flags.gotMozz,1.8);
  ix('coldDoor',[11,1.2,5.85],'Push the door',()=>{G.flags.triedDoor=true;at3(11,1,6,(p,t)=>SFX.clunk(p,t));shake(0.012,0.2);},()=>C()&&G.flags.coldLocked&&!G.flags.triedDoor,1.8);
  const H=()=>G.who==='lucia'&&G.where==='house';
  // at the wake
  const seen=k=>{G.flags.seen=G.flags.seen||{};G.flags.seen[k]=1;};
  ix('portrait',HPT.portrait,'Look at Mom’s photo',()=>{seen('photo');thinkL('Dad picked the one where she’s smiling. She hated this picture. Said it made her look tired.',4.5);},()=>H()&&G.flags.freeLook,4.2);
  ix('alexH',[170.95,1.0,4.68],'Look at Alex',()=>{seen('alex');setExpr(CHARS.alex,'sad');thinkL('He keeps touching his allergy bracelet. He’s done that since the hospital.',4);},()=>H()&&G.flags.freeLook,4.2);
  ix('grandpaH',[170.8,0.95,2.7],'Look at Grandpa’s phone',()=>{seen('grandpa');at3(170.7,0.8,3.05,(p,t)=>SFX.buzz(p,t),1.2);thinkL('Grandpa keeps flipping his phone face down. Who texts him this late, the night of a funeral?',4.5);},()=>H()&&G.flags.freeLook,4.2);
  ix('uncleH',[172.05,1.0,2.32],'Look at your uncle',()=>{seen('uncle');thinkL('New watch. Gold. Last month he was begging Mom for money.',4);},()=>H()&&G.flags.freeLook,4.2);
  ix('guestBook',HPT.guestBook,'Look at the guest book',()=>{seen('book');thinkL('Forty people signed it. I didn’t know half of them.',3.5);},()=>H()&&G.flags.freeLook,3.6);
  // the delivery
  ix('frontDoorAns',HPT.frontDoor,'Answer the door',()=>{G.flags.atDoor=true;},()=>H()&&!G.flags.atDoor&&CHARS.toni.root.visible&&CHARS.toni.extra.box.visible,1.8);
  ix('takePizza',[180.75,1.15,3.6],'Take the pizza',()=>{G.flags.tookPizza=true;},()=>H()&&G.flags.atDoor&&!G.flags.tookPizza,2.2);
  ix('boxDown',[171.9,0.9,3.5],'Put the pizza on the table',()=>{G.flags.boxDown=true;},()=>H()&&BOXHELD.visible&&!G.flags.boxDown,2.6);
  // after they pass out
  ix('shakeDad',[169.3,0.4,3.5],'Shake Dad',()=>{G.flags.shookDad=true;},()=>H()&&G.ckpt==='room'&&!G.flags.shookDad,2.2);
  ix('frontDoorNo',HPT.frontDoor,'The front door',()=>thinkL('I can’t leave them like this. I need my phone. I need help.',3.5),()=>H()&&G.ckpt==='room'&&G.flags.shookDad,1.8);
  ix('lockDoor',[153.9,1.2,9.3],'Close and lock the door',()=>{G.flags.locked=true;DOORS.hLucia.target=0;DOORS.hLucia.locked=true;at3(153.9,1,9,(p,t)=>{SFX.door(p,t);SFX.clunk(p,t);},2);},()=>H()&&G.ckpt==='room'&&G.flags.shookDad&&!G.flags.locked&&P.z>9.4&&groupAt(P.x,P.z)==='h_lucia',2.2);
  ix('plug',HPT.charger,'Plug in your phone',()=>{G.flags.plugged=true;SFX.pick();},()=>H()&&G.flags.locked&&!G.flags.plugged,1.8);
  // the escape
  ix('frontOut',HPT.frontDoor,'Open the front door',()=>{sceneOut();},()=>H()&&G.flags.escaping&&!P.hidden,1.8);
  ix('phoneWall',HPT.phone,'Try the phone on the wall',()=>{SFX.clunk(busFx,now());thinkL(LIGHTSET==='dark'?'Dead. No dial tone. He cut it.':'Grandpa’s old landline. Nobody uses it.',3);},()=>H(),1.6);
  ix('breaker',HPT.breaker,'Look at the breaker box',()=>thinkL(LIGHTSET==='dark'?'Every switch is off, and the handle’s snapped. He broke it.':'The breaker box. Dad’s always flipping these.',3.5),()=>H(),1.8);
  ix('fridgeH',HPT.fridge,'Look at the fridge',()=>thinkL('Alex’s drawing from third grade. And the funeral program, under the magnets. Somebody put it there like it was a report card.',4.5),()=>H()&&!G.flags.freeLook,1.8);
}
