/* ============================================================
   TONI: a waypoint graph for walking, scripted walks for cutscenes, and the hunt that follows a late pizza.
   Rule of the hunt: break his line of sight, then hide. If he sees you, he raises the gun.
   ============================================================ */
const NAVP=[
  [4,9],[4,2],[1.6,2],[1.6,9],[6.6,2],[6.6,9],[7,8.1],[9,8.1],[11,8.3],[11,6.6],[11,3.5],[13,8.2],
  [16,3],[20,3.2],[25,3.2],[16,7.8],[22,7.8],[26.5,7.8],[24.8,9.3],[26.5,5.5],[27.2,5.7],
  [29,5.7],[30,5],[30,1.6],[34,5],[33.7,7.2],[33.7,9],[28.6,9],[29.8,9],[39.7,9],[44,9],[39.7,7.2],[39.7,4],[43,3],[38,3.2],
  [29.8,10.8],[24.8,10.8],[16,12.2],[20,12.2],[27.5,12.2],[33,12.7],[35,12.7],[36,13],[44.5,12.4],[44.5,18.6],[36,18.6],
  [12,14],[16.2,18],[20.7,18],[25.2,18.6],[30,18],[16.2,22],[20.7,22],[25.2,22.4],[30,22.2],[12,26.5],[16,26.5],[21,26.5],[25.6,26.5],[30.6,26.5],[33,24.5],
  [35,24.7],[36.5,23],[39.5,24.2],[43.6,24.8],[36.5,29.5],[40,31.5],[43.6,31],[40.5,26.5],
  [9,19.7],[8.4,13],[8.4,25],[5,23.5],[2.5,23.5],[5,26.3],[4.4,28.5],
  [15.7,29.2],[15.7,31],[12,31.2],[16.2,32.4],[21,29],[21,32],[25.6,29.2],[25.6,30.8],[27.4,30.6],[30.6,29.2],[30.6,30.8],[32.4,30.6]];
let NAV=null;
function buildNav(){const n=NAVP.map(([x,z],i)=>({i,x,z,e:[]}));const fat=(a,b)=>{const dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1,px=-dz/l*0.28,pz=dx/l*0.28;
    const blocked=(x0,z0,x1,z1)=>{for(const s of SOLIDS){if(s.tag==='door'||s.top<0.3)continue;if(segRect(x0,z0,x1,z1,s.x0,s.x1,s.z0,s.z1))return true;}return false;};
    return blocked(a.x,a.z,b.x,b.z)||blocked(a.x+px,a.z+pz,b.x+px,b.z+pz)||blocked(a.x-px,a.z-pz,b.x-px,b.z-pz);};
  for(let i=0;i<n.length;i++)for(let j=i+1;j<n.length;j++){const a=n[i],b=n[j],d=Math.hypot(a.x-b.x,a.z-b.z);if(d<11&&!fat(a,b)){a.e.push([j,d]);b.e.push([i,d]);}}
  NAV=n;}
function nearestNode(x,z,needSight=true){let best=null,bd=1e9;for(const n of NAV){const d=Math.hypot(n.x-x,n.z-z);if(d<bd&&(!needSight||!segBlocked(x,z,n.x,n.z,0.3))){bd=d;best=n;}}return best||NAV.reduce((a,b)=>Math.hypot(a.x-x,a.z-z)<Math.hypot(b.x-x,b.z-z)?a:b);}
function pathTo(x0,z0,x1,z1){if(!segBlockedNav(x0,z0,x1,z1))return [[x1,z1]];const s=nearestNode(x0,z0),t=nearestNode(x1,z1);const open=[[0,s.i]],g={[s.i]:0},from={};
  while(open.length){open.sort((a,b)=>a[0]-b[0]);const [,c]=open.shift();if(c===t.i)break;for(const [j,d] of NAV[c].e){const ng=g[c]+d;if(g[j]==null||ng<g[j]){g[j]=ng;from[j]=c;open.push([ng+Math.hypot(NAV[j].x-t.x,NAV[j].z-t.z),j]);}}}
  const out=[[x1,z1]];let c=t.i;while(c!==undefined&&c!==s.i){out.unshift([NAV[c].x,NAV[c].z]);c=from[c];}out.unshift([s.x,s.z]);
  // drop leading nodes we can already skip
  while(out.length>1&&!segBlockedNav(x0,z0,out[1][0],out[1][1]))out.shift();return out;}
function segBlockedNav(x0,z0,x1,z1){for(const s of SOLIDS){if(!s.on||s.tag==='door'||s.top<0.3)continue;if(segRect(x0,z0,x1,z1,s.x0-0.2,s.x1+0.2,s.z0-0.2,s.z1+0.2))return true;}return false;}

const TONI={state:'off',path:[],speed:1.5,seenT:0,lostT:0,lastSeen:null,aimT:0,stepT:0,onArrive:null,target:null,note:null,huntT:0};
function toniShow(x,z,yaw){const T=CHARS.toni;T.root.visible=true;place(T,x,z,yaw);T.pose='stand';}
function toniHide(){const T=CHARS.toni;T.root.visible=false;TONI.state='off';TONI.path=[];}
/* walk somewhere; resolves on arrival */
function toniWalk(x,z,speed=1.5){return new Promise(res=>{const T=CHARS.toni;TONI.path=pathTo(T.x,T.z,x,z);TONI.speed=speed;TONI.state='walk';TONI.onArrive=()=>{TONI.state='idle';res();};});}
function toniFace(x,z){const T=CHARS.toni;T.yawT=Math.atan2(x-T.x,z-T.z);}
function toniSees(slack=1){const T=CHARS.toni;if(!T||!T.root.visible||isHidden())return false;const dx=P.x-T.x,dz=P.z-T.z,d=Math.hypot(dx,dz);
  const range=(P.crouch?6.5:15)*slack*(TONI.sightK||1);if(d>range)return false;if(d>1.6){const f=angDiff(T.yaw,Math.atan2(dx,dz));if(Math.abs(f)>1.25)return false;}
  if(segBlocked(T.x,T.z,P.x,P.z,P.crouch?0.72:1.55))return false;return true;}
function stepToni(dt){const T=CHARS.toni;if(!T||!T.root.visible)return;
  // doors open for him
  for(const k of TONI.house?['hGarLaun','hLaunKit','hBath','hAlex']:['party','freezer']){const d=DOORS[k];if(!d)continue;const near=Math.hypot(T.x-(d.hx+(d.along==='x'?d.w/2:0)),T.z-(d.hz+(d.along==='z'?d.w/2:0)))<1.6;if(near&&!(k==='freezer'&&d.locked))d.target=1;else if(d.autoClose&&TONI.state!=='off')d.target=d.locked?0:d.target;}
  let moving=false;
  if(TONI.state==='walk'||TONI.state==='hunt'||TONI.state==='chase'||TONI.state==='return'||TONI.state==='patrol'||TONI.state==='search'&&TONI.house){
    if(TONI.path.length){const [tx,tz]=TONI.path[0];const dx=tx-T.x,dz=tz-T.z,d=Math.hypot(dx,dz);
      if(d<0.35){TONI.path.shift();if(!TONI.path.length&&TONI.onArrive){const f=TONI.onArrive;TONI.onArrive=null;f();}}
      else{const sp=TONI.speed;const o={x:T.x+dx/d*sp*dt,z:T.z+dz/d*sp*dt};const saved=[];for(const k in DOORS){if(DOORS[k].sol.on&&Math.hypot(T.x-DOORS[k].hx,T.z-DOORS[k].hz)<2.2){saved.push(DOORS[k].sol);DOORS[k].sol.on=false;}}
        collide(o,0.32,true);saved.forEach(s=>s.on=true);T.x=o.x;T.z=o.z;T.yaw=T.yaw+angDiff(T.yaw,Math.atan2(dx,dz))*Math.min(1,dt*7);moving=true;}}
    else if(TONI.onArrive){const f=TONI.onArrive;TONI.onArrive=null;f();}}
  if(T.yawT!=null&&!moving){T.yaw+=angDiff(T.yaw,T.yawT)*Math.min(1,dt*5);if(Math.abs(angDiff(T.yaw,T.yawT))<0.02)T.yawT=null;}
  T.speed=moving?TONI.speed:0;if(moving){T.walkPh+=dt*TONI.speed*4.2;TONI.stepT-=dt*TONI.speed;if(TONI.stepT<=0){TONI.stepT=0.72;at3(T.x,0.1,T.z,(p,t)=>SFX.stomp(p,t),2.2);}}
  T.pose=T.poseOv||((TONI.state==='aim'||T.aiming)?'aim':T.typing?(T.tilt?'typeHead':'type'):(T.carrying?'carry':'stand'));
  if(T.extra.screen)T.extra.screen.material.color.setHex(T.typing||T.poseOv==='phoneUp'?0xffffff:0x8fa3bf);if(T.extra.phone){const up=T.poseOv==='phoneUp';T.extra.phone.rotation.set(up?-(POSES.phoneUp.shR+POSES.phoneUp.elR):-0.3,0,0);}
  if(T.extra.nozzle){const spr=!!(T.extra.tools.ext.visible&&T.poseOv==='spray');T.extra.nozzle.visible=spr;T.extra.extStub.visible=!spr;T.extra.phone.visible=!spr;hoseUpdate(T,spr);}
  if(T.extra.gun)T.extra.gun.visible=!!TONI.armed;
  if(TONI.house){if(T.extra.glow)T.extra.glow.visible=LIGHTSET==='dark';if(TONI.state==='patrol'||TONI.state==='chase'||TONI.state==='search')houseThink(dt);}
  else if(TONI.state==='hunt'||TONI.state==='chase'||TONI.state==='aim'||TONI.state==='search')huntThink(dt);}

/* the extinguisher's hose: tank to horn, sagging between his hands while he sprays */
const HOSE={g:new THREE.Group(),segs:[],mat:basic({color:0x1c1c1c})};
{const geo=new THREE.CylinderGeometry(0.014,0.014,1,5);for(let i=0;i<9;i++){const m=new THREE.Mesh(geo,HOSE.mat);HOSE.g.add(m);HOSE.segs.push(m);}HOSE.g.visible=false;scene.add(HOSE.g);}
const _ha=new THREE.Vector3(),_hb=new THREE.Vector3(),_hc=new THREE.Vector3(),_hp=new THREE.Vector3(),_hq=new THREE.Vector3(),_hup=new THREE.Vector3(0,1,0);
function hosePt(t,o){const u=1-t;return o.set(u*u*_ha.x+2*u*t*_hc.x+t*t*_hb.x,u*u*_ha.y+2*u*t*_hc.y+t*t*_hb.y,u*u*_ha.z+2*u*t*_hc.z+t*t*_hb.z);}
function hoseUpdate(T,on){HOSE.g.visible=on&&T.root.visible;if(!HOSE.g.visible)return;T.root.updateMatrixWorld(true);
  T.extra.hoseA.getWorldPosition(_ha);T.extra.hoseB.getWorldPosition(_hb);_hc.copy(_ha).add(_hb).multiplyScalar(0.5);_hc.y-=0.24;
  const n=HOSE.segs.length;for(let i=0;i<n;i++){hosePt(i/n,_hp);hosePt((i+1)/n,_hq);const m=HOSE.segs[i];m.position.copy(_hp).add(_hq).multiplyScalar(0.5);_hq.sub(_hp);m.scale.set(1,_hq.length()*1.1,1);m.quaternion.setFromUnitVectors(_hup,_hq.normalize());}
  HOSE.mat.color.setHex(0x1c1c1c).multiply(tintAt(T.x,1.2,T.z,1.1));}

/* ---------- the hunt ---------- */
function startHunt(){const T=CHARS.toni;scoreBase('stalk');TONI.armed=true;TONI.huntT=0;TONI.lostT=0;TONI.lastSeen=[P.x,P.z];G.flags.hidSeen=false;
  if(!T.root.visible)toniShow(35.4,12.7,-Math.PI/2);DOORS.party.target=1;TONI.state='hunt';TONI.speed=2.1;TONI.path=pathTo(T.x,T.z,P.x,P.z);setAmb('hunt',0.55,1.5);}
let barkT=0;
function huntThink(dt){const T=CHARS.toni;TONI.huntT+=dt;barkT-=dt;const sees=toniSees();
  if(sees){TONI.lastSeen=[P.x,P.z];TONI.lostT=0;}else TONI.lostT+=dt;
  postU.uDanger.value=damp(postU.uDanger.value,sees?0.8:0.25,3,dt);
  const d=Math.hypot(P.x-T.x,P.z-T.z);
  if(TONI.state==='aim'){T.yaw+=angDiff(T.yaw,Math.atan2(P.x-T.x,P.z-T.z))*Math.min(1,dt*8);TONI.aimT-=dt;
    if(TONI.aimT<=0){if(sees&&d<11){at3(T.x,1.4,T.z,(p,t)=>SFX.shot(p,t),3);die('ORDER UP.','You got too close. Toni shoots anyone he can see. Break his line of sight, then hide.');}else{TONI.state='chase';TONI.path=pathTo(T.x,T.z,TONI.lastSeen[0],TONI.lastSeen[1]);}}return;}
  if(TONI.state==='hunt'||TONI.state==='search'){if(sees){TONI.state='chase';SFX.sting();if(barkT<=0){barkT=6;toniSay(R()<0.5?'There you are, Manny.':'Found you.',{quick:true});}}
    else if(!TONI.path.length){// go where he last heard you, then check hiding spots in that room
      if(P.hidden&&TONI.huntT>9){TONI.state='note';toniCheckSpot(P.hidden);return;}
      const r=roomAt(P.x,P.z);const tx=P.hidden?P.hidden.ex:(r?(r.x0+r.x1)/2+(R()-0.5)*3:P.x),tz=P.hidden?P.hidden.ez:(r?(r.z0+r.z1)/2+(R()-0.5)*3:P.z);
      TONI.path=pathTo(T.x,T.z,tx,tz);TONI.speed=1.7;if(barkT<=0){barkT=8;toniSay(['Hello?','Delivery.',"I'm outside.",'Your driver is nearby.','I can wait. I always wait.'][(R()*5)|0],{quick:true});}}}
  if(TONI.state==='chase'){TONI.speed=3.1;if(sees&&d<7.5){TONI.state='aim';TONI.aimT=0.85;TONI.path=[];return;}
    if(sees||!TONI.path.length)TONI.path=pathTo(T.x,T.z,TONI.lastSeen[0],TONI.lastSeen[1]);
    if(TONI.lostT>3.5){TONI.state='search';TONI.path=[];if(barkT<=0){barkT=5;toniSay('Okay.',{quick:true});}}}
  if(P.hidden&&G.flags.hidSeen&&d<2.4){toniOpensSpot();return;}}
async function toniCheckSpot(h){const T=CHARS.toni,run=G.run;TONI.path=pathTo(T.x,T.z,h.ex,h.ez+(h.ez>h.z?0.4:-0.4));TONI.speed=1.4;TONI.state='walk';
  await new Promise(r=>{TONI.onArrive=r;});if(!alive(run))return;TONI.state='idle';toniFace(h.x,h.z);
  if(!P.hidden){TONI.state='hunt';return;}
  await toniSay(h.kind==='stall'?'Occupied?':'Anyone in here?');if(!alive(run))return;
  for(let i=0;i<3;i++){SFX.heartbeat(0.7);await gwait(0.9);if(!alive(run))return;}
  if(!P.hidden){TONI.state='hunt';return;}
  at3(h.ex,0.1,h.ez,(p,t)=>SFX.slideNote(p,t));await gwait(0.8);if(!alive(run))return;
  TONI.armed=false;setAmb('hunt',0,2);postU.uDanger.value=0;scoreBase(null);
  TONI.state='return';toniWalk(35.4,12.7,1.5).then(()=>{if(alive(run)){toniHide();DOORS.party.target=0;}});
  await openNote('hand','Slid under the door','<p>It’s okay.</p><p>I forgive you.</p><p>Just do your job.</p>');
  if(TONI.note)TONI.note();}
function toniOpensSpot(){TONI.state='idle';at3(P.x,1,P.z,(p,t)=>SFX.locker(p,t));die('HE SAW YOU HIDE.','He watched you get in. Lose him first, then hide.');}
