/* ============================================================
   BOOT AND THE FRAME LOOP
   ============================================================ */
for(const r of ROOMS)buildRoom(r);
buildWindows();buildProps();buildHouse();bake();buildTarps();buildNav();buildFreezerGlass();
for(const id of ['dad','grandpa','uncle','alex','ruben','toni','manager','bree','devon'])buildChar(id);
for(const id of STAFF)CHARS[id].where='none';
paintFamilyPhotos();paintPortrait();onFonts(()=>{paintFamilyPhotos();paintPortrait();});
buildBomb();buildBalloons();buildSpareHead();
[['dad',0xf04a6a],['grandpa',0x3ac3f0],['uncle',0x7fe05a],['alex',0xf0b93a],['ruben',0xff7af0]].forEach(([id,c])=>partyHat(CHARS[id],c));
for(const id of FAMILY){seat(CHARS[id],id);CHARS[id].pose='sit';}
toniHide();setupInteractions();setupPrologue();resize();placeIdleJoy();
// a debug handle for testing; harmless in play
window.__ppmDebug={G,P,PT,CHARS,TONI,PIZZA,OVEN,DOORS,COOK,startNew,sceneManny,sceneEat,serve,ROOMS,toniSay,INTERACT,SOLIDS,NAV:()=>NAV,startHunt,HIDES,enterHide,stamp,PIE,pathTo,renderer,voPlay,toniPlay,hasVO,playTape,AC:()=>AC,master:()=>master,die,endBuild,sceneCold,sceneHouse,sceneRating,sceneRoom,sceneCharge,sceneChargeRetry,sceneEscape,sceneOut,sceneTable,enterHide,leaveHide,coldDevon,coldBree,coldManager,setPower,HPT,HAI,FZ,glassPaint,lpRate,resetWorld,checkpoint,LS,castVisible};

/* the title screen: a slow drift through the dark dining room */
const TCAM={t:0};
function titleCam(dt){TCAM.t+=dt;const t=TCAM.t*0.05;camera.position.set(19+Math.sin(t)*3,1.45+Math.sin(t*1.7)*0.08,23.5+Math.cos(t*0.8)*1.2);
  camera.lookAt(29+Math.sin(t*0.6)*3,1.35,13);}
/* which beds play, from where the camera is */
function ambience(){if(!AC)return;const g=groupAt(camera.position.x,camera.position.z);
  const humRooms={kitchen:0.4,dining:0.22,hall:0.3,office:0.18,employee:0.32,party:0.2,closet:0.15,vest:0.2,mens:0.35,womens:0.35,store:0.2};
  setAmb('hum',(humRooms[g]||0.05)*(G.mode==='title'?0.4:1),0.8);setAmb('room',0.22,1);
  const fz=g==='freezer'?0.6:Math.max(0,0.25-Math.hypot(camera.position.x-11,camera.position.z-3)*0.03);setAmb('freezer',fz,0.6);
  const ad=Math.hypot(camera.position.x-40,camera.position.z-27);setAmb('arcade',clamp(1-ad/16,0,1)*0.45*(g==='arcade'?1:0.5),0.8);
  if(!OVEN.on)setAmb('oven',OVEN.done?0.08:Math.max(0,0.08-Math.hypot(camera.position.x-22,camera.position.z-1)*0.01),1);
  // the Ramirez house: rain on the roof, louder outside, and the fridge and the clock until the power goes
  const inHouse=g.startsWith('h_');setAmb('rain',inHouse&&G.mode!=='title'?(g==='h_yard'?0.85:g==='h_garage'?0.55:0.36):0,0.8);setAmb('house',inHouse&&LIGHTSET==='on'&&G.mode!=='title'?0.28:0,0.3);
  if(inHouse){setAmb('freezer',0,0.5);setAmb('arcade',0,0.5);setAmb('oven',0,0.5);}}

let last=performance.now(),hbT=0;
function frame(t){requestAnimationFrame(frame);let dt=(t-last)/1000;last=t;if(!(dt>0))dt=0;if(dt>0.1)dt=0.1;if(window.__dtScale)dt*=window.__dtScale;
  const live=G.mode==='play'||G.mode==='cine'||G.mode==='ui';
  if(live){G.time+=dt;tickWaits(dt);}
  if(G.mode==='title'){titleCam(dt);}
  else if(G.mode!=='paused'&&G.mode!=='dead'){if(G.mode==='play')movePlayer(dt);stepNudge(dt);updateCamera(dt);}
  if(live){stepToni(dt);updateDoors(dt);stepOven(dt);stepClock(dt);stepVHS(dt);stepPrologue(dt);}
  // the family only draws when you could see them: the party room, or through its door from the dining room and hall
  for(const k in CHARS)if(k!=='toni')CHARS[k].root.visible=castVisible(k);
  if(live||G.mode==='title'){for(const k in CHARS){const c=CHARS[k];if(c.root.visible)animChar(c,dt);}stepBomb(dt);stepBalloons(dt);if(G.mode==='title')updateDoors(dt);}
  if(G.mode==='play')scanFocus();else{$('prompt').hidden=true;}
  if(PIE.hand.visible)lightPie(PIE.hand,camera.position.x,1.2,camera.position.z);
  $('bDuck').hidden=!!P.seated||(G.who!=='manny'&&!G.flags.canHide);$('joyBase').style.display=P.seated||P.hidden?'none':'';
  // the hunt: a heartbeat when he's close
  if(TONI.state==='hunt'||TONI.state==='chase'||TONI.state==='search'||TONI.state==='note'||TONI.state==='patrol'){const T=CHARS.toni;const d=Math.hypot(T.x-P.x,T.z-P.z);hbT-=dt;if(hbT<=0&&d<12){hbT=0.4+d*0.08;SFX.heartbeat(clamp(1-d/12,0.2,1)*0.8);}}
  postU.uWake.value=Math.max(0,postU.uWake.value-dt*0.04*(G.mode==='play'?1:0));
  postU.uFlash.value=Math.max(0,postU.uFlash.value-dt*2.5);postU.uTime.value=G.time+TCAM.t;
  ambience();updateListener();
  renderer.setRenderTarget(rt);renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.render(postScene,postCam);}

/* ---------- title buttons ---------- */
if(LS.get('save',null))$('contBtn').hidden=false;
$('startBtn').addEventListener('click',()=>{initAudio();stopMusic();startNew();});
$('contBtn').addEventListener('click',()=>{initAudio();stopMusic();$('title').hidden=true;loadCheckpoint();});
$('sndHint').textContent=touchMode?'Tap anywhere for sound':'Click anywhere for sound';
const wakeTitle=()=>{if(G.mode!=='title')return;initAudio();if(AC&&AC.state==='suspended')AC.resume();if(!musicOn)startTheme();$('sndHint').style.visibility='hidden';};
/* the logo on the menu and on the review card */
{const c=canvas(160,160),g=c.getContext('2d');brandMark(g,80,92,3.1);const url=c.toDataURL();BRAND_URL=url;$('titleMascot').src=url;$('rvIcon').src=url;}
/* try to start the theme right away (the Android app allows it); otherwise the first tap does */
try{initAudio();if(AC){startTheme();if(AC.state==='running')$('sndHint').style.visibility='hidden';}}catch(e){}
$('title').addEventListener('pointerdown',wakeTitle);addEventListener('keydown',wakeTitle);
setMode('title');
requestAnimationFrame(t=>{last=t;frame(t);});
