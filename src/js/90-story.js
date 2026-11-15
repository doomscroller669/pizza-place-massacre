/* ============================================================
   STORY, MILESTONE 1: the table, then pizza 1 (Alex's Kiddie Pie, the tutorial).
   Order 1 is the teaching pizza: the ticket and the recipe both say "as the menu", the menu says seeds,
   and Alex's bracelet says sesame.
   ============================================================ */
const ORDER1={who:'alex',label:'Pizza 1 · Alex',tops:{pepperoni:3},allergy:'seeds',minutes:6};
const FAMILY=['dad','grandpa','uncle','alex','ruben'];
const MINUTES_LINE=['','You have one minute, Manny.','You have two minutes, Manny.','You have three minutes, Manny.','You have four minutes, Manny.','You have five minutes, Manny.','You have six minutes, Manny.'];
function yawTo(x,z){return Math.atan2(-(x-P.x),-(z-P.z));}
const NUDGE={on:false};
function nudge(x,y,z,sec=0.8){const ty=yawTo(x,z),dh=Math.hypot(x-P.x,z-P.z),tp=Math.atan2(y-P.eye,dh);NUDGE.on=true;NUDGE.t=0;NUDGE.dur=sec;NUDGE.y0=P.yaw;NUDGE.p0=P.pitch;NUDGE.y1=P.yaw+angDiff(P.yaw,ty);NUDGE.p1=clamp(tp,-0.9,0.9);return gwait(sec);}
function stepNudge(dt){if(!NUDGE.on)return;NUDGE.t+=dt;const k=smooth(clamp(NUDGE.t/NUDGE.dur,0,1));P.yaw=lerp(NUDGE.y0,NUDGE.y1,k);P.pitch=lerp(NUDGE.p0,NUDGE.p1,k);if(k>=1)NUDGE.on=false;}
const charPos=(id,dy=1.25)=>{const c=CHARS[id];return [c.x,c.y+dy,c.z];};

/* ---------- the bomb on the table, party hats, balloons ---------- */
const BOMB={cv:canvas(96,32),tex:null,mesh:null,n:0,blink:0,fast:0};
function bombDisplay(){const g=BOMB.cv.getContext('2d');g.fillStyle='#120302';g.fillRect(0,0,96,32);g.fillStyle='#3a0a06';g.font='15px '+FONT_PIX;g.textAlign='center';g.fillText('PIZZAS 88/88',48,21);g.fillStyle='#ff3b22';g.fillText(`PIZZAS ${BOMB.n}/12`,48,21);g.textAlign='left';BOMB.tex.needsUpdate=true;}
function buildBomb(){BOMB.tex=texFrom(BOMB.cv,false);const g=new THREE.Group();g.position.set(40,0.765,15.5);
  const boxM=basic({map:SIGN.pepBox});const b=new THREE.Mesh(new THREE.BoxGeometry(0.46,0.07,0.46),basic({color:0xa87a48}));b.position.y=0.035;g.add(b);
  const lid=new THREE.Mesh(new THREE.PlaneGeometry(0.46,0.46).rotateX(-Math.PI/2),basic({map:SIGN.logo}));lid.position.y=0.072;g.add(lid);
  const disp=new THREE.Mesh(new THREE.PlaneGeometry(0.3,0.11),basic({map:BOMB.tex}));disp.position.set(0.234,0.06,0);disp.rotation.y=Math.PI/2;g.add(disp);
  const disp2=disp.clone();disp2.position.x=-0.234;disp2.rotation.y=-Math.PI/2;g.add(disp2);
  const led=new THREE.Mesh(new THREE.SphereGeometry(0.018,6,4),new THREE.MeshBasicMaterial({color:0xff2010}));led.position.set(0.1,0.085,0.12);g.add(led);BOMB.led=led;
  const wireM=basic({color:0x111111});for(const k in PT.seats){const s=PT.seats[k];const dx=s[0]-40,dz=s[1]-15.5,len=Math.hypot(dx,dz);const w=new THREE.Mesh(new THREE.BoxGeometry(0.012,0.012,len),wireM);w.position.set(dx/2,0.0,dz/2);w.rotation.y=Math.atan2(dx,dz);g.add(w);
    const dn=new THREE.Mesh(new THREE.BoxGeometry(0.012,0.76,0.012),wireM);dn.position.set(dx*0.98,-0.38,dz*0.98);g.add(dn);}
  scene.add(g);BOMB.mesh=g;BOMB.mats=[b.material,lid.material,disp.material,disp2.material];bombDisplay();}
function stepBomb(dt){if(!BOMB.mesh)return;BOMB.blink-=dt*(BOMB.fast>0?6:1);BOMB.fast=Math.max(0,BOMB.fast-dt);if(BOMB.blink<=0){BOMB.blink=1;BOMB.led.visible=!BOMB.led.visible;if(BOMB.led.visible&&BOMB.fast>0)at3(40,0.9,15.5,(p,t)=>SFX.bombBeep(p,t),1.5);}
  const c=tintAt(40,1,15.5,1.4);BOMB.mats.forEach(m=>m.color.copy(c));}
function partyHat(ch,col){const hat=new THREE.Mesh(new THREE.ConeGeometry(0.07,0.2,8),basic({color:col}));hat.position.set(0.02,ch.s.h/1.78*0.27,0.0);hat.rotation.z=-0.15;ch.j.head.add(hat);ch.mats.push(hat.material);hat.material.userData.base=new THREE.Color(col);ch.extra.hat=hat;}
const BALLOONS=[];
function buildBalloons(){const cols=[0xf04a6a,0xf0b93a,0x3ac3f0,0x7fe05a,0xff7af0,0xf0b93a];let i=0;for(const k in PT.seats){if(k==='lucia')continue;const s=PT.seats[k];const bx=s[0]-Math.sin(s[2])*0.3,bz=s[1]-Math.cos(s[2])*0.3;
  const g=new THREE.Group();g.position.set(bx,0,bz);const b=new THREE.Mesh(new THREE.SphereGeometry(0.15,8,6),basic({color:cols[i%6]}));b.scale.y=1.2;b.position.y=1.85;g.add(b);
  const str=new THREE.Mesh(new THREE.BoxGeometry(0.004,0.9,0.004),basic({color:0xdddddd}));str.position.y=1.3;g.add(str);scene.add(g);BALLOONS.push({g,b,ph:i*1.3,base:new THREE.Color(cols[i%6])});i++;}}
function stepBalloons(dt){for(const B of BALLOONS){B.ph+=dt;B.b.position.x=Math.sin(B.ph*0.7)*0.05;B.b.position.y=1.85+Math.sin(B.ph*1.1)*0.03;B.b.material.color.copy(B.base).multiply(tintAt(B.g.position.x,1.8,B.g.position.z,1.4));}}
/* the spare mascot head on the closet shelf */
function buildSpareHead(){const photo=hasPhoto('toni');const cv=photo?canvas(128,128):canvas(FACE_W,FACE_H);const t=texFrom(cv,false);const g=new THREE.Group();
  if(photo){const im=new Image();im.onload=()=>{cv.getContext('2d').drawImage(im,0,0,128,128);t.needsUpdate=true;};im.src=FACE_DATA.toni.neutral;}else drawFace(cv.getContext('2d'),CAST.toni,'neutral');
  // the spare mask, stuffed out with newspaper on the shelf
  const h=new THREE.Mesh(photo?photoHeadGeo(0.09,FACE_MARKS.toni.back).scale(1,1,0.8).translate(0,0.02,0):new THREE.SphereGeometry(0.2,12,10),basic({map:t}));h.rotation.y=-Math.PI/2;g.add(h);const hat=new THREE.Mesh(photo?new THREE.CylinderGeometry(0.075,0.075,0.09,10):new THREE.CylinderGeometry(0.17,0.18,0.12,10),basic({color:0xefeae0}));hat.position.y=photo?0.14:0.2;g.add(hat);
  g.position.set(PT.spareHead[0]+0.05,PT.spareHead[1],PT.spareHead[2]);scene.add(g);const c=tintAt(17.3,1.5,31,1.3);h.material.color.copy(c);hat.material.color.copy(c);}
/* the new ticket on the rail */
const TICKET=new THREE.Mesh(new THREE.PlaneGeometry(0.17,0.26),basic({map:SIGN.ticketNew,side:THREE.DoubleSide,transparent:true,alphaTest:0.3}));
TICKET.position.set(18.7,1.72,9.75);TICKET.visible=false;scene.add(TICKET);

/* ---------- interactions ---------- */
const M=()=>G.who==='manny',L=()=>G.who==='lucia';
function setupInteractions(){
  // Lucia, at the table
  ix('alex',[41.75,0.95,16.75],'Look at Alex',async()=>{G.flags.sawBand=true;nudge(41.75,0.9,16.75,0.5);setExpr(CHARS.alex,'sad');await openNote('band','Alex’s wrist','<b>MEDICAL ALERT</b><p style="margin:.4em 0 0">SEVERE ALLERGY:</p><b>SESAME</b><p style="margin:.4em 0 0;font-size:14px">Carries epinephrine</p>');thinkL('Sesame. He can’t even touch it. Last time, he ended up in the hospital.',4);},()=>L()&&G.flags.freeLook,4.5);
  ix('bomb',[40,0.85,15.5],'Look at the box',()=>{thinkL('Wires going under every chair. And it’s counting pizzas, not seconds. Oh my God.',4.5);},()=>L()&&G.flags.freeLook,5);
  ix('banner',[40,2.4,10.2],'Read the banner',()=>{thinkL('“Ramirez, party of six,” with a smiley face. He made us a banner. That’s so messed up.',4);},()=>L()&&G.flags.freeLook,8);
  ix('dadTalk',[41.8,1.2,13.85],'Talk to Dad',async()=>{G.flags.freeLook=false;G.flags.talkedDad=true;setMode('cine');await line('lucia','Dad? What do we do?',{name:'Lucia'});await line('dad','I don’t know, mija. I don’t know. We stay calm, we do what he says, and I get you two out. Okay?',{expr:'sad'});setMode('play');G.flags.freeLook=true;},()=>L()&&G.flags.freeLook&&!G.flags.talkedDad,4);
  // Manny, back of house
  ix('freezerDoor',[11,1.2,5.75],'Push the door',()=>{DOORS.freezer.target=1;DOORS.freezer.locked=false;at3(11,1,6,(p,t)=>SFX.door(p,t,true));G.flags.outFreezer=true;setObj('Read the new ticket on the rail above the pass window.','The ticket rail hangs over the pass window, on the dining room side of the kitchen.');},()=>M()&&!G.flags.outFreezer&&G.flags.unlocked,1.8);
  ix('bodies',[10,0.4,3.4],'Look at them',()=>{thinkM(G.flags.lookedBodies?'Don’t look at them. Don’t.':'They were alive at ten. I watched him do it through that little window. I just… watched.',4.5);G.flags.lookedBodies=true;},()=>M()&&!G.flags.outFreezer&&G.ckpt!=='cold',2.4);
  ix('ticket',PT.ticket,()=>G.flags.ticketRead?'Read the ticket again':'Read the new ticket',()=>readTicket(),()=>M()&&TICKET.visible,1.9);
  ix('recipe',PT.recipe,'Read the recipe binder',()=>openNote('card','Pepper Toni’s recipe binder','<h3>KIDDIE PIE (10")</h3><ol><li>Stretch one dough ball to the ring.</li><li>One ladle of red sauce. Leave a rim.</li><li>Mozzarella, edge to edge.</li><li>Pepperoni smile! (5 to 7 pieces)</li><li>Finish the crust with <span class="star">Toni’s Famous Seeds ★</span></li></ol><p style="margin-top:.6em;font-size:13px;color:#7a5a3a">Bake 1 belt. Cut in 8. “Kids love the seeds!”</p>'),()=>M(),1.8);
  ix('seeds',PT.seeds,'Look at the shaker',()=>thinkM('“Toni’s Famous Seeds.” It’s just sesame. We put it on everything.',3.5),()=>M(),1.6);
  ix('dough',PT.dough,'Take a dough ball',()=>{take('dough');},()=>M()&&G.flags.ticketRead&&!PIZZA.have.dough&&!PIZZA.cur,1.9);
  ix('sauce',PT.sauce,'Take the sauce',()=>{take('sauce');},()=>M()&&G.flags.ticketRead&&!PIZZA.have.sauce&&!PIZZA.cur,1.8);
  ix('fridge',PT.fridge,'Open the reach-in fridge',()=>openFridge(),()=>M()&&G.flags.ticketRead&&!(PIZZA.cur&&PIZZA.cur.step>3),1.9);
  ix('pepperoni',PT.pepperoni,'Take the pepperoni',()=>{take('pepperoni');},()=>M()&&G.flags.ticketRead&&!PIZZA.have.pepperoni,1.9);
  ix('prep',PT.prep,()=>PIZZA.cur?'Keep making the pizza':'Make the pizza',async()=>{const ok=await COOK.open();if(ok){PIZZA.held='raw';PIZZA.have={};PIE.hand.visible=true;repaintPie();setCarry();setObj('Put the pizza on the oven belt, at the left end of the oven.','The conveyor oven is against the back wall. Pizzas go in on the left and come out on the right.');}},
    ()=>M()&&G.flags.ticketRead&&!PIZZA.held&&!OVEN.on&&!OVEN.done&&(PIZZA.cur||(PIZZA.have.dough&&PIZZA.have.sauce&&PIZZA.have.cheese)),1.9);
  ix('prepNeed',PT.prep,'Make the pizza (need dough, sauce and cheese)',()=>thinkM('Can’t make it yet. Dough, sauce, cheese. Come on, Manny.'),()=>M()&&G.flags.ticketRead&&!PIZZA.cur&&!(PIZZA.have.dough&&PIZZA.have.sauce&&PIZZA.have.cheese),1.9);
  ix('ovenIn',PT.ovenIn,'Put it on the belt',()=>{ovenLoad();setObj('It bakes on the belt. Don’t wander far.','The pizza comes out the right end of the oven when it’s done. Look around while you wait.');bakeLine();},()=>M()&&PIZZA.held==='raw',2);
  ix('ovenOut',PT.ovenOut,'Take the pizza off the belt',()=>{OVEN.done=false;PIE.world.visible=false;PIZZA.held='baked';PIE.hand.visible=true;SFX.pick();setCarry();setObj('Cut it on the cutting board by the pass.','The cutting board is on the counter to the right of the pass window.');},()=>M()&&OVEN.done&&!PIZZA.held,2);
  ix('cut',PT.cut,'Cut it into eight',async()=>{for(let i=0;i<4;i++){SFX.slice();await gwait(0.22);}PIZZA.cur.cut=true;PIZZA.held='cut';repaintPie();setCarry();setObj('Put it in the pass window and ring the bell.','Set it on the steel shelf in the pass window. Toni picks it up from the other side.');},()=>M()&&PIZZA.held==='baked',1.9);
  ix('pass',PT.pass,'Put it in the window and ring the bell',()=>serve(),()=>M()&&PIZZA.held==='cut'&&(TONI.state==='off'||TONI.state==='idle'),2.2);
  ix('passEarly',PT.pass,'The pass window',()=>thinkM(PIZZA.held==='baked'?'Gotta cut it first. Eight slices.':'Nothing to send out yet.'),()=>M()&&G.flags.ticketRead&&PIZZA.held!=='cut'&&!G.flags.served,1.9);
  // things to find while it bakes
  ix('tv',PT.tv,'Play the training tape',()=>playTape(),()=>M(),1.8);
  ix('board',PT.board,'Read the pinned form',()=>openNote('form','Pinned to the corkboard','<p>PEPPER TONI’S — EMPLOYEE INCIDENT REPORT</p><p>Filed by: Manny (kitchen)<br>Employee involved: the night driver</p><p>What happened: Found a drawing taped inside his locker door. People cut into slices like a pizza. Eight of them. I think it’s us.</p><p>Action taken:</p><span class="scrawl">He’s harmless. Kid barely talks. — Mgr</span>'),()=>M(),2);
  ix('mug',PT.mug,'Look at the mug',()=>thinkM('“World’s Best Boss.” Smashed in three pieces. Guess somebody disagreed.',3.5),()=>M(),1.6);
  ix('polygraph',PT.polygraph,'Look at the machine',()=>thinkM('The boss’s lie detector. Bought it to catch whoever was skimming the register. Never caught anybody.',4.5),()=>M(),1.7);
  ix('toniLocker',PT.toniLocker,'Look at the padlocked locker',()=>thinkM('Padlocked. The tape says “Driver.” That’s his.',3),()=>M(),1.6);
  ix('sketch1',PT.sketch1,'Pick up the drawing',()=>{G.flags.sketch1=true;openNote('sketch','Left on the bench',`<canvas id="sk1" width="300" height="220" aria-label="A careful pencil drawing of a young woman, eyes closed, smiling"></canvas>`).then(()=>{});setTimeout(drawSketch1,0);},()=>M(),1.6);
  ix('keypad',PT.keypad,'Look at the keypad',()=>thinkM('Eight slices, eight numbers. And I don’t have a single one.',3.5),()=>M(),1.6);
  ix('frontDoor',PT.frontDoor,'Try the front door',()=>{at3(21,1,33.9,(p,t)=>SFX.clunk(p,t));thinkM('Locked. The grate’s down outside. And his car’s still in the lot. He’s not going anywhere.',4.5);},()=>M(),1.8);
  ix('partyDoor',[33.85,1.5,12.7],'Look through the porthole',()=>{thinkM(G.flags.serving?'He’s in there with them.':'There’s a whole family in there. Kids. Balloons on the chairs. Oh God.',4);},()=>M(),1.6);
  ix('nightcaller',PT.nightcaller,'Look at the cabinet',()=>thinkM('Night Caller. “Lock every door before he calls.” No tokens, though.',3.5),()=>M(),1.7);
  ix('claw',PT.claw,'Look at the claw machine',()=>thinkM('Two bucks a try. Nobody’s ever won a thing out of that.',3),()=>M(),1.8);
  ix('spareHead',PT.spareHead,'Look at the shelf',()=>thinkM('The spare Toni head. I had to wear that thing at birthday parties. The kids used to cry.',4.5),()=>M(),1.8);
}
function take(k){PIZZA.have[k]=true;SFX.pick();setCarry();const names={dough:'a dough ball',sauce:'the sauce',pepperoni:'the pepperoni',cheese:'the mozzarella'};sub('Took '+(names[k]||k)+'.',1.6);ingredientObj();}
function ingredientObj(){const h=PIZZA.have;const need=[];if(!h.dough)need.push('dough');if(!h.sauce)need.push('sauce');if(!h.cheese)need.push('mozzarella');if(!h.pepperoni)need.push('pepperoni');
  if(need.length)setObj('Get the ingredients: '+need.join(', ')+'.','Dough is in the proofer by the freezer. Sauce is on the right-hand counter. Mozzarella is in the reach-in fridge. Pepperoni is on a storeroom shelf.');
  else setObj('Make the pizza at the prep table.','The steel island in the middle of the kitchen.');}
async function openFridge(){at3(26.9,1,0.9,(p,t)=>SFX.fridge(p,t));const opts=[];const keys2=[];const add=(k,t)=>{if(!PIZZA.have[k]){opts.push(t);keys2.push(k);}};
  add('cheese','Mozzarella');add('mushrooms','Mushrooms');add('olives','Black olives');add('onions','Onions');opts.push('Close it');
  const i=await choose(opts,{who:'Reach-in fridge',prompt:'Cold. It smells like onions.'});if(i>=0&&i<keys2.length){take(keys2[i]);}}
function drawSketch1(){const c=$('sk1');if(!c)return;const g=c.getContext('2d');g.fillStyle='#f7f3ea';g.fillRect(0,0,300,220);g.strokeStyle='rgba(40,40,46,.85)';g.lineWidth=1.2;g.lineCap='round';
  const rr5=mulberry(31);const pen=(pts,j=0.6)=>{g.beginPath();pts.forEach(([x,y],i)=>{const a=x+(rr5()-0.5)*j,b=y+(rr5()-0.5)*j;i?g.lineTo(a,b):g.moveTo(a,b);});g.stroke();};
  const arc=(cx,cy,rx,ry,a0,a1,n=24)=>{const p=[];for(let i=0;i<=n;i++){const a=lerp(a0,a1,i/n);p.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]);}return p;};
  pen(arc(150,110,52,66,0,TAU,40),1.2);pen(arc(150,96,70,80,Math.PI*1.05,Math.PI*1.95,30),1.5);pen([[86,110],[92,170],[110,205]]);pen([[214,110],[208,170],[190,205]]);
  pen(arc(128,104,10,4,0.2,Math.PI-0.2,10));pen(arc(172,104,10,4,0.2,Math.PI-0.2,10));pen([[150,108],[146,128],[153,130]]);pen(arc(150,140,14,6,0.3,Math.PI-0.3,12));
  for(let i=0;i<14;i++){g.globalAlpha=0.25;pen([[100+i*3,60+i],[96+i*3,80+i*2]]);}g.globalAlpha=1;
  g.font='34px '+FONT_HAND;g.fillStyle='rgba(40,40,46,.9)';g.fillText('K.',236,200);g.strokeStyle='rgba(180,40,40,.8)';pen([[244,40],[236,32],[244,46],[252,32],[244,40]]);}

/* ---------- the training tape ---------- */
const VHS={on:false,t:0,res:null};
const TAPE=[[0,'PEPPER TONI’S TRAINING TAPE #3'],[2.6,'Hi, team! It’s me, PEPPER TONI!'],[5.4,'Today we’re making a KIDDIE PIE!'],[8.2,'Stretch it! Sauce it! Cheese it!'],[11,'Give it a pepperoni SMILE!'],[13.8,'And never forget…'],[15.6,'TONI’S FAMOUS SEEDS on the crust!'],[18.6,'Kids LOVE ’em!'],[21,'Remember: FAMILY COMES FIRST!'],[24,'']];
function playTape(){return new Promise(res=>{VHS.on=true;VHS.t=0;VHS.said='';VHS.res=res;$('vhs').hidden=false;setMode('ui');startJingle(true);});}
function vhsEnd(){if(!VHS.on)return;VHS.on=false;toniHush();$('vhs').hidden=true;stopMusic();setMode('play');if(VHS.res)VHS.res();VHS.res=null;}
$('vhs').addEventListener('pointerdown',e=>{e.preventDefault();if(VHS.t>0.6)vhsEnd();});
function stepVHS(dt){if(!VHS.on)return;VHS.t+=dt;const t=VHS.t;const g=$('vhsCv').getContext('2d');g.fillStyle='#2a6be8';g.fillRect(0,0,320,240);
  g.fillStyle='#f0c22b';g.fillRect(0,170,320,70);g.fillStyle='#d63b2b';for(let x=0;x<320;x+=40)g.fillRect(x,170,20,6);
  // the cartoon Toni: friendlier than the real one
  const bob=Math.sin(t*6)*3;g.save();g.translate(110,92+bob);g.fillStyle='#e8b23a';g.fillRect(-26,30,52,60);g.fillStyle='#c8321f';g.fillRect(-18,36,36,44);brandMark(g,0,0,1.8);
  g.fillStyle='#fff';const wave=Math.sin(t*8)*0.5;g.save();g.translate(28,40);g.rotate(-0.8+wave);g.fillRect(0,-5,30,10);g.beginPath();g.arc(32,0,8,0,TAU);g.fill();g.restore();g.restore();
  // the pizza on the table builds up with the captions
  const st=t<8.2?0:t<11?1:t<13.8?2:3;g.save();g.translate(240,150);g.scale(1,0.45);g.fillStyle='#e8d3a8';g.beginPath();g.arc(0,0,48,0,TAU);g.fill();
  if(st>=1){g.fillStyle='#c8321f';g.beginPath();g.arc(0,0,40,0,TAU);g.fill();g.fillStyle='#f4e6b0';g.beginPath();g.arc(0,0,38,0,TAU);g.fill();}
  if(st>=2){g.fillStyle='#a3241a';[[-14,-10],[14,-10],[-20,8],[-10,16],[0,19],[10,16],[20,8]].forEach(([x,y])=>{g.beginPath();g.arc(x,y,5,0,TAU);g.fill();});}
  if(st>=3&&t>15.6){g.fillStyle='#fff';const rr6=mulberry(8);for(let i=0;i<60;i++){const a=rr6()*TAU;g.fillRect(Math.cos(a)*44,Math.sin(a)*44,2,2);}}g.restore();
  let cap='';for(const [tt,c] of TAPE)if(t>=tt)cap=c;if(cap!==VHS.said){VHS.said=cap;if(cap)toniPlay(cap,null,'tape',0.9);}g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,196,320,30);g.fillStyle='#fff';g.font='15px '+FONT_PIX;g.textAlign='center';g.fillText(cap,160,216);g.textAlign='left';
  // tape wear
  for(let i=0;i<3;i++){const y=((t*60+i*97)%260)-10;g.fillStyle='rgba(255,255,255,.08)';g.fillRect(0,y,320,3+i);}
  speck(g,320,240,180,['rgba(255,255,255,.18)','rgba(0,0,0,.25)'],1);if(((t*2)|0)%2===0){g.fillStyle='#fff';g.font='12px '+FONT_PIX;g.fillText('PLAY ▶',14,20);}
  if(t>TAPE[TAPE.length-1][0])vhsEnd();}

/* ---------- Manny: the ticket, the timer, the bake ---------- */
async function readTicket(){const first=!G.flags.ticketRead;
  await openNote('ticket','',`<div class="tk">PEPPER TONI’S<br>FAMILY PIZZERIA</div><p>TABLE: PARTY ROOM<br>RAMIREZ · PARTY OF 6<br>ORDER 1 OF 12 · 11:52 PM</p><p class="big">1x KIDDIE PIE 10"</p><p>&nbsp;&nbsp;as menu<br>&nbsp;&nbsp;red sauce · mozz<br>&nbsp;&nbsp;pepperoni smile</p><p>FOR: the brother</p><div class="hand">:)</div>`);
  if(!first)return;G.flags.ticketRead=true;ingredientObj();await toniSay(MINUTES_LINE[ORDER1.minutes],{pa:true});
  if(!G.clock)startClock(ORDER1.minutes*60,ORDER1.label);thinkM('Kiddie Pie. Like the menu. Okay. I can do this.');}
function startClock(sec,label){G.clock={t:sec,on:true,w2:sec<=120,w30:sec<=30,label};$('timer').hidden=false;$('timerLab').textContent=label;drawStrikes();}
function drawStrikes(){[...$('strikes').children].forEach((el,i)=>el.classList.toggle('on',i<G.strikes));}
function stepClock(dt){const c=G.clock;if(!c||!c.on)return;c.t-=dt;const s=Math.max(0,Math.ceil(c.t));$('clock').textContent=String((s/60)|0).padStart(2,'0')+':'+String(s%60).padStart(2,'0');$('timer').classList.toggle('low',c.t<=30);
  if(!c.w2&&c.t<=120){c.w2=true;toniSay('Two minutes. Your table is hungry.',{pa:true});}
  if(!c.w30&&c.t<=30){c.w30=true;toniSay('Thirty seconds, Manny.',{pa:true});}
  if(c.t<=0){c.on=false;latePizza();}}
async function bakeLine(){const run=G.run;const T=CHARS.toni;toniShow(18.7,12.4,Math.PI);await gwait(0.4);if(!alive(run))return;
  T.tilt=0.35;await toniSay('Oven’s on. Don’t wander far.');if(!alive(run))return;T.tilt=0;await gwait(1.2);if(!alive(run)||TONI.state!=='off'&&TONI.state!=='idle')return;
  await toniWalk(35.4,12.7,1.4);if(!alive(run))return;if(TONI.state==='idle'){toniHide();DOORS.party.target=0;}}
function ovenDone(){if(G.who!=='manny')return;setObj('Take the pizza off the right end of the belt.','The oven bell rang. It comes out on the right side.');}
async function latePizza(){const run=G.run;await toniSay('Your delivery is late.',{pa:true});if(!alive(run))return;setObj('Hide. He’s coming.','Lose him first, then hide in a locker or a bathroom stall. If he sees you hide, he’ll open it.');
  TONI.note=async()=>{G.strikes++;drawStrikes();if(G.strikes>=3){await toniSay('Three strikes. You’re fired.',{pa:true});if(alive(run))die('FIRED.','Three late pizzas. Toni doesn’t keep a cook who can’t keep time.');return;}
    startClock(180,ORDER1.label+' · again');G.clock.w2=false;if(PIZZA.held)setCarry();thinkM('He… forgives me? Okay. Okay. Breathe.');restoreObj();};
  startHunt();}
function restoreObj(){if(PIZZA.held==='raw')setObj('Put the pizza on the oven belt.');else if(PIZZA.held==='baked')setObj('Cut it on the cutting board by the pass.');else if(PIZZA.held==='cut')setObj('Put it in the pass window and ring the bell.');else if(OVEN.on)setObj('It bakes on the belt. Don’t wander far.');else if(OVEN.done)setObj('Take the pizza off the right end of the belt.');else if(PIZZA.cur)setObj('Finish the pizza at the prep table.');else ingredientObj();}

/* ---------- serving ---------- */
async function serve(){const run=G.run;G.flags.served=true;G.flags.serving=true;if(G.clock){G.clock.on=false;G.timeLeft=G.clock.t;}$('timer').hidden=true;PIZZA.held=null;PIE.hand.visible=false;setCarry();
  PIE.world.visible=true;PIE.world.position.set(17.6,0.96,9.95);lightPie(PIE.world,17.6,1.2,10.3);SFX.bell();setObj('');$('obj').hidden=true;
  G.result=checkPie(ORDER1,PIZZA.cur);saveFlags();
  setMode('cine');const T=CHARS.toni;toniShow(35.4,12.7,-Math.PI/2);DOORS.party.target=1;await gwait(0.6);if(!alive(run))return;
  thinkM('Here he comes.',2.5);await toniWalk(17.6,11.7,1.5);if(!alive(run))return;toniFace(17.6,9);await nudge(T.x,1.6,T.z,0.8);if(!alive(run))return;
  PIE.world.visible=false;T.carrying=true;PIE.table.visible=true;T.j.spine.add(PIE.table);PIE.table.position.set(0,0.28,0.3);PIE.table.rotation.set(0,0,0);SFX.pick();
  T.tilt=0.5;await gwait(1.4);if(!alive(run))return;T.tilt=0;toniWalk(35.4,12.7,1.4);await gwait(1.6);if(!alive(run))return;
  await fadeTo(1,1.2);if(!alive(run))return;await sceneEat();}

/* ---------- checkpoints ---------- */
function saveFlags(){LS.set('save',{ckpt:G.ckpt,flags:G.flags,strikes:G.strikes});}
function checkpoint(name){G.ckpt=name;LS.set('save',{ckpt:name,flags:JSON.parse(JSON.stringify(G.flags)),strikes:G.strikes});}
function resetWorld(){G.run++;scoreBase(null,true);crEnd();WAITS.length=0;TWEENS.length=0;MOVERS.length=0;clearDecals();lpClose();G.lpCharge=false;G.noLeave=false;G.onHide=null;SHAKE.t=0;VOICE.busy=Promise.resolve();hushToni();bubble('off');DS=null;$('dlg').hidden=true;$('note').hidden=true;noteRes=null;$('cook').hidden=true;$('hideMask').hidden=true;$('vhs').hidden=true;VHS.on=false;stopMusic();
  P.hidden=null;P.seated=null;P.limitYaw=null;P.crouch=false;P.eyeOverride=null;NUDGE.on=false;G.clock=null;$('timer').hidden=true;$('obj').hidden=true;$('carry').hidden=true;
  PIZZA.reset();OVEN.on=false;OVEN.done=false;PIE.hand.visible=false;PIE.world.visible=false;if(PIE.table.parent!==scene){scene.add(PIE.table);}PIE.table.visible=false;
  TONI.state='off';TONI.armed=false;TONI.path=[];TONI.note=null;TONI.house=false;TONI.sightK=1;HAI.sawHide=false;setAmb('hunt',0);setAmb('oven',0);postU.uDanger.value=0;postU.uWake.value=0;postU.uRed.value=0;
  const T=CHARS.toni;T.carrying=false;T.typing=false;T.tilt=0;T.aiming=false;T.poseOv=null;toniTool(null);T.extra.box.visible=false;T.extra.glow.visible=false;toniHide();TICKET.visible=false;
  setPower(true);setTarps(true);glassReset();MOZZ.visible=true;BOXHELD.visible=false;TBOX.g.visible=false;GPHONE.visible=false;setAmb('rain',0,0.1);setAmb('house',0,0.1);G.where='pizzeria';
  for(const id of STAFF){const c=CHARS[id];c.where='none';c.root.rotation.set(0,0,0);c.y=0;}
  DOORS.party.target=0;DOORS.party.ang=0;DOORS.freezer.target=0;DOORS.freezer.ang=0;DOORS.freezer.locked=true;BOMB.n=0;bombDisplay();
  for(const id of FAMILY){const c=CHARS[id];c.where='party';c.root.rotation.set(0,0,0);c.y=0;c.tilt=0;seat(c,id);c.pose='sit';c.shake=0;c.look=null;c.root.visible=true;if(c.extra.hat)c.extra.hat.visible=true;setExpr(c,'neutral');}
  CHARS.alex.pose='sit';$('fade').style.transitionDuration='0s';$('fade').style.opacity='1';}
function loadCheckpoint(){const sv=LS.get('save',null);$('dead').hidden=true;$('end').hidden=true;if(AC&&AC.state==='suspended')AC.resume();
  if(!sv){startNew();return;}resetWorld();G.flags=sv.flags||{};G.strikes=sv.strikes||0;G.ckpt=sv.ckpt;
  if(sv.ckpt==='manny1'){G.flags.ticketRead=false;G.flags.outFreezer=false;G.flags.served=false;G.flags.serving=false;sceneManny();}
  else if(sv.ckpt==='cold')sceneCold();else if(sv.ckpt==='house')sceneHouse();else if(sv.ckpt==='room'){G.flags.shookDad=false;G.flags.locked=false;G.flags.plugged=false;sceneRoom(false);}
  else if(sv.ckpt==='charge')sceneChargeRetry();else if(sv.ckpt==='escape')sceneEscape(false);else sceneTable();}
function startNew(){resetWorld();G.flags={};G.strikes=0;sceneCold();}

/* ============================================================
   SCENE: THE TABLE
   ============================================================ */
async function sceneTable(){const run=G.run;pizzeriaReset();checkpoint('table');G.who='lucia';$('title').hidden=true;
  const s=PT.seats.lucia;P.x=s[0]-0.1;P.z=s[1];P.seated=true;P.yaw=Math.PI/2;P.pitch=-0.35;P.limitYaw=[Math.PI/2,1.95];
  for(const id of FAMILY){CHARS[id].pose='sitOut';setExpr(CHARS[id],'out');}
  setAmb('room',0.25);setAmb('hum',0.12);setMode('cine');postU.uWake.value=1;await fadeTo(0,3);if(!alive(run))return;
  SFX.gasp(busFx,now(),0.5);await gwait(1.2);if(!alive(run))return;thinkL('Mm… where…',2.5);await gwait(2.5);if(!alive(run))return;
  await nudge(40,0.9,15.5,1.6);if(!alive(run))return;
  await toniSay('Welcome to Pepper Toni’s Family Pizzeria. Where family comes first.',{pa:true});if(!alive(run))return;
  postU.uWake.value=0.35;setMode('play');
  CHARS.dad.pose='sitScared';setExpr(CHARS.dad,'fear');CHARS.dad.look=[P.x,1.2,P.z];await line('dad','Lucia? Lucia! Mija, look at me!',{expr:'fear'});if(!alive(run))return;
  CHARS.alex.pose='sitScared';setExpr(CHARS.alex,'fear');CHARS.alex.look=charPos('dad');await line('alex','Dad? Where are we? Why is everything spinning?',{expr:'fear'});if(!alive(run))return;
  CHARS.grandpa.pose='sit';setExpr(CHARS.grandpa,'angry');await line('grandpa','What the hell is this? Who put a damn hat on me?',{expr:'angry'});if(!alive(run))return;
  CHARS.uncle.pose='sit';setExpr(CHARS.uncle,'angry');CHARS.uncle.look=[34,1.6,12.7];await line('uncle','Hey! HEY! Whoever’s out there, open the door!',{expr:'angry'});if(!alive(run))return;
  CHARS.ruben.pose='sitScared';setExpr(CHARS.ruben,'fear');await line('ruben','Why are there balloons? Nobody here has a birthday.',{expr:'fear'});if(!alive(run))return;
  postU.uWake.value=0;
  await toniSay('Ramirez, party of six. Your table is ready.',{pa:true});if(!alive(run))return;
  CHARS.dad.pose='stand';CHARS.dad.y=0;setExpr(CHARS.dad,'angry');BOMB.fast=4;await line('dad','Okay, that’s it. Kids, up. We’re leaving—',{expr:'angry'});if(!alive(run))return;
  toniSay('Please remain seated. The table is wired to a bomb.',{pa:true});await gwait(2.2);if(!alive(run))return;
  CHARS.dad.pose='sitScared';setExpr(CHARS.dad,'shock');await nudge(40,0.85,15.5,0.8);if(!alive(run))return;await VOICE.busy;if(!alive(run))return;
  await line('lucia','Dad, stop! There’s wires. They go under all of us.',{name:'Lucia'});if(!alive(run))return;
  await toniSay('Tonight’s special: twelve pizzas. Finish them all and get the code.',{pa:true});if(!alive(run))return;
  await toniSay('No substitutions. No refunds.',{pa:true});if(!alive(run))return;
  await line('uncle','Twelve pizzas? What is this, some prank show? Where’s the camera?',{expr:'angry'});if(!alive(run))return;
  // he shows himself in the doorway
  const T=CHARS.toni;toniShow(35.7,12.9,Math.PI/2+0.2);DOORS.party.target=1;at3(34,1,12.7,(p,t)=>SFX.door(p,t));SFX.sting();scoreBase('dread');await nudge(35.7,1.75,12.9,0.9);if(!alive(run))return;
  for(const id of FAMILY){CHARS[id].look=[35.7,1.7,12.9];}T.tilt=0.45;T.typing=true;await gwait(2.2);if(!alive(run))return;T.typing=false;
  await line('ruben','No. No, no, no. That’s the mascot. From the sign outside.',{expr:'fear'});if(!alive(run))return;
  await line('grandpa','I know that walk. That’s the delivery boy. Forty minutes late, and the pizza was cold.',{expr:'angry'});if(!alive(run))return;
  T.tilt=0;toniWalk(33,12.7,1.3).then(()=>{if(alive(run)){toniHide();DOORS.party.target=0;at3(34,1,12.7,(p,t)=>SFX.door(p,t));}});await gwait(1.8);if(!alive(run))return;
  for(const id of FAMILY)CHARS[id].look=null;
  // the first Telltale choice
  CHARS.grandpa.look=[P.x,1.2,P.z];await nudge(...charPos('grandpa',1.4),0.8);if(!alive(run))return;
  await line('grandpa','This is about that damn rating, isn’t it? Lucia. What did you write about him?',{expr:'angry'});if(!alive(run))return;
  const SAY_L1=['You told me to give him one star!','It was just a stupid review!','I’m sorry. This is all my fault.'];const c=await choose(SAY_L1,{who:'Lucia',prompt:'',timeout:7});if(!alive(run))return;G.flags.c1=c;if(c>=0){await line('lucia',SAY_L1[c],{name:'Lucia'});if(!alive(run))return;}
  if(c===0){await line('grandpa','Oh, so now you listen to me? Now?',{expr:'angry'});await line('dad','Enough! Both of you, stop it.',{expr:'angry'});remember('Your grandfather will remember that.');}
  else if(c===1){await line('uncle','Yeah? Go tell that to the psycho in the cheese suit.',{expr:'smirk'});}
  else if(c===2){await line('dad','No. Mija, no. Look at me. This is not on you, okay? It’s not.',{expr:'sad'});remember('Your dad will remember that.');}
  else{await line('grandpa','Nothing to say? Typical.',{expr:'angry'});remember('Your grandfather noticed you said nothing.');}
  if(!alive(run))return;
  // the clue: Alex's bracelet
  CHARS.dad.look=charPos('alex');await nudge(...charPos('alex',1.1),0.8);if(!alive(run))return;
  await line('dad','Alex. Alex, look at me. Whatever he brings you, you check it first. Every bite. No seeds, okay?',{expr:'sad'});if(!alive(run))return;
  setExpr(CHARS.alex,'sad');await line('alex','I know, Dad. I know. I’m not a baby.',{expr:'sad'});if(!alive(run))return;
  await line('ruben','Okay. Horror movie rules. Rule one, never split up. Rule two… I don’t remember rule two.',{expr:'fear'});if(!alive(run))return;
  CHARS.dad.look=null;
  // a moment to look around
  G.flags.freeLook=true;setObj('Look around the table.','Look at Alex. Look at the box in the middle of the table.');
  const t0=G.time;await waitUntil(()=>G.flags.sawBand&&noteRes===null&&G.mode==='play'||G.time-t0>45);if(!alive(run))return;await gwait(2.5);if(!alive(run))return;
  await waitUntil(()=>G.mode==='play');G.flags.freeLook=false;setObj('');$('obj').hidden=true;setMode('cine');
  await toniSay('Your cook tonight is Manny. Be nice. He’s had a long night.',{pa:true});if(!alive(run))return;
  await gwait(0.6);await fadeTo(1,1.4);if(!alive(run))return;
  sceneManny();}

/* ============================================================
   SCENE: MANNY, PIZZA 1
   ============================================================ */
async function sceneManny(){const run=G.run;scoreBase(null);G.who='manny';if(G.where!=='pizzeria'||!TARPS.meshes[0].visible)pizzeriaReset();checkpoint('manny1');
  P.seated=null;P.limitYaw=null;P.x=PT.freezerStart[0];P.z=PT.freezerStart[1];P.yaw=0;P.pitch=-0.15;P.eyeOverride=0.75;
  for(const id of FAMILY){CHARS[id].pose='sit';setExpr(CHARS[id],'fear');}
  setAmb('freezer',0.55,0.5);setAmb('hum',0.18);setMode('cine');await titleCard('Pizza 1 of 12','Kiddie Pie',2.2);if(!alive(run))return;await fadeTo(0,1.6);if(!alive(run))return;
  thinkM('Still in the walk-in. I can’t feel my fingers anymore.',3.5);await gwait(3.4);if(!alive(run))return;
  // he unlocks it and walks off. Squeaking.
  at3(11,1,6,(p,t)=>SFX.clunk(p,t));await gwait(0.5);for(let i=0;i<5;i++){at3(11.5+i*1.2,0.1,7.5+i*0.5,(p,t)=>SFX.stomp(p,t),2);await gwait(0.6);}if(!alive(run))return;
  G.flags.unlocked=true;await toniSay('New order. Ticket’s on the rail.',{pa:true});if(!alive(run))return;
  TICKET.visible=true;P.eyeOverride=null;thinkM('It’s open. Okay. Do what he says, and you go home.',3.5);
  setMode('play');setObj('Get out of the freezer.','The door is unlocked now. Walk up to it and push it.');}

/* ============================================================
   SCENE: LUCIA, THE FIRST PIZZA ARRIVES
   ============================================================ */
async function sceneEat(){const run=G.run;G.who='lucia';const res=G.result;const T=CHARS.toni,A=CHARS.alex,D=CHARS.dad;
  setAmb('freezer',0,0.3);setAmb('oven',0,0.3);const s=PT.seats.lucia;P.x=s[0]-0.1;P.z=s[1];P.seated=true;P.yaw=Math.PI/2;P.pitch=-0.25;P.limitYaw=[Math.PI/2,1.95];
  for(const id of FAMILY){CHARS[id].pose='sit';setExpr(CHARS[id],'fear');}
  toniShow(34.8,12.7,Math.PI/2);DOORS.party.target=1;setMode('cine');await fadeTo(0,1);if(!alive(run))return;
  await nudge(34.8,1.5,12.7,0.6);await toniWalk(42.7,18.1,1.3);if(!alive(run))return;toniFace(41.8,16);await nudge(41.8,1.1,16.6,0.8);if(!alive(run))return;
  T.carrying=false;scene.add(PIE.table);PIE.table.position.set(41.8,0.77,16.05);PIE.table.rotation.set(0,0,0);lightPie(PIE.table,41.8,1,16);SFX.pick();BOMB.n=1;bombDisplay();BOMB.fast=1.5;
  await toniSay('Enjoy your meal.');if(!alive(run))return;
  await line('uncle','Hey. What about her? Where’s hers?',{expr:'angry'});if(!alive(run))return;
  T.tilt=0.4;await toniSay('One Star’s order is running late.');if(!alive(run))return;T.tilt=0;
  await line('lucia','...One star.',{name:'Lucia'});if(!alive(run))return;
  A.look=[P.x,1.2,P.z];setExpr(A,'fear');await nudge(...charPos('alex',1.1),0.7);if(!alive(run))return;
  await line('alex','Lucia?',{expr:'fear'});if(!alive(run))return;
  const SAY_L2=['It’s okay, Alex. Just eat it.','Wait. Check it first.','You don’t have to do this!'];const c=await choose(SAY_L2,{who:'Lucia',timeout:6});if(!alive(run))return;G.flags.c2=c;if(c>=0){await line('lucia',SAY_L2[c],{name:'Lucia'});if(!alive(run))return;}
  if(c===1){setExpr(A,'sad');await line('alex',res.kind==='allergy'?'Dad… there’s seeds. There’s seeds all over the crust—':'No seeds. Just pepperoni. Okay. Okay.',{expr:res.kind==='allergy'?'fear':'sad'});if(!alive(run))return;
    if(res.kind==='allergy'){await toniSay('Clean plate, please.');if(!alive(run))return;TONI.armed=true;T.typing=false;T.aiming=true;T.yaw=Math.atan2(D.x-T.x,D.z-T.z);await line('dad','Okay! Okay! Just eat around them, mijo. Slow. Eat around them.',{expr:'fear'});T.aiming=false;}}
  else if(c===2){await line('dad','Lucia, stop. Don’t. Don’t give him a reason.',{expr:'fear'});}
  else if(c===0){remember('Alex will remember that.');}
  if(!alive(run))return;A.look=null;
  // Alex eats
  A.pose='eat';for(let i=0;i<3;i++){at3(A.x,1.1,A.z,(p,t)=>SFX.crunch(p,t),1.5);await gwait(1.1);if(!alive(run))return;}A.pose='sit';
  if(res.ok){await gwait(1.4);if(!alive(run))return;setExpr(A,'sad');await line('dad','That’s it. That’s it, mijo. You’re okay. You’re okay.',{expr:'sad'});if(!alive(run))return;
    await toniSay(R()<0.5?'Good job. 👍':'Five stars, Manny.');if(!alive(run))return;G.flags.alex='alive';}
  else{await toniSay('That’s not what they ordered.');if(!alive(run))return;
    if(res.kind==='allergy'){A.pose='choke';A.shake=1;setExpr(A,'choke');at3(A.x,1.2,A.z,(p,t)=>SFX.choke(p,t),2);await gwait(0.9);if(!alive(run))return;
      D.pose='stand';setExpr(D,'scream');BOMB.fast=3;line('dad','ALEX! His pen! His pen’s in his jacket! Let me get it, PLEASE—',{expr:'scream'});await gwait(1.1);if(!alive(run))return;
      TONI.armed=true;T.aiming=true;T.yaw=Math.atan2(D.x-T.x,D.z-T.z);await gwait(1.2);if(!alive(run))return;D.pose='sitScared';setExpr(D,'fear');await gwait(1.6);if(!alive(run))return;
      A.shake=0;A.pose='slumpDead';setExpr(A,'dead');at3(A.x,1,A.z,(p,t)=>SFX.gasp(p,t,0.3),2);await gwait(1.6);if(!alive(run))return;}
    else{TONI.armed=true;T.aiming=true;T.yaw=Math.atan2(A.x-T.x,A.z-T.z);await gwait(1.3);if(!alive(run))return;$('fade').style.transitionDuration='0s';$('fade').style.opacity='1';
      at3(T.x,1.4,T.z,(p,t)=>SFX.shot(p,t),3);A.pose='slumpDead';setExpr(A,'dead');await gwait(1.8);if(!alive(run))return;await fadeTo(0,0.6);if(!alive(run))return;}
    T.aiming=false;G.flags.alex='dead';setExpr(D,'sad');D.shake=0.6;await gwait(1.2);if(!alive(run))return;
    await toniSay('Ramirez, party of five.',{pa:true});if(!alive(run))return;}
  TONI.armed=false;await gwait(1);if(!alive(run))return;await fadeTo(1,1.6);if(!alive(run))return;endBuild();}

function endBuild(){setMode('end');LS.del('save');const f=G.flags;const alive_=f.alex!=='dead';
  $('endKick').textContent='Pizza 1 of 12 · end of this build';$('endTitle').textContent=alive_?'Five stars, Manny.':'Ramirez, party of five.';
  const how=G.result&&!G.result.ok?(G.result.kind==='allergy'?'Sesame on the crust':'Not what he ordered'):'Made right';
  const items=[['Alex',alive_?'Alive':'Dead'],['The pizza',how],['Late',G.strikes?G.strikes+' of 3':'Never'],['Bracelet',f.sawBand?'You saw it':'You didn’t look'],
    ['Grandpa asked',['You blamed him','"Just a review"','You took the blame','You said nothing'][f.c1===-1||f.c1==null?3:f.c1]]];
  if(f.h1!=null)items.unshift(['Dad asked',['"I’m fine."','"No. Are you?"','"Mom would’ve hated this."','You said nothing'][f.h1<0?3:f.h1]],
    ['At the door',['You apologized for Grandpa','"You’re really late."','"I gotta go."','You said nothing'][f.h2==null||f.h2<0?3:f.h2]],['The rating',f.triedStars?'You tried to give more':'One star, like he said']);
  $('sumList').innerHTML=items.map(([a,b])=>`<li><b>${a}</b><i></i><span>${escapeHTML(b)}</span></li>`).join('');
  $('endNote').textContent='Next build: the eating contest, and pizza 2 for Grandpa.';
  $('end').hidden=false;$('fade').style.opacity='0';setTimeout(()=>$('againBtn').focus({preventScroll:true}),40);}
