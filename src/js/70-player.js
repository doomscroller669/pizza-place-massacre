/* ============================================================
   GAME STATE, TIMERS, PLAYER, INPUT, HUD, DIALOGUE
   ============================================================ */
const G={mode:'title',who:'lucia',flags:{},strikes:0,clock:null,run:0,ckpt:null,time:0};
window.__ppm=G;
/* game-time waits: they freeze while paused, so scripted scenes pause with the game */
const WAITS=[];
function gwait(s){return new Promise(res=>WAITS.push({t:s,res,run:G.run}));}
function tickWaits(dt){for(let i=WAITS.length-1;i>=0;i--){const w=WAITS[i];if(w.run!==G.run){WAITS.splice(i,1);continue;}w.t-=dt;if(w.t<=0){WAITS.splice(i,1);w.res();}}}
/* a script run is abandoned (never resolves) when the player reloads a checkpoint */
function alive(run){return run===G.run;}
async function waitUntil(fn,step=0.1){const run=G.run;while(!fn()){await gwait(step);if(!alive(run))return new Promise(()=>{});}}

function setMode(m){G.mode=m;const play=m==='play';$('hud').hidden=!(play||m==='cine'||m==='ui');$('touch').hidden=!(play&&touchMode);
  $('reticle').style.visibility=play?'visible':'hidden';if(!play){$('prompt').hidden=true;releaseLock();}updateLockHint();}

/* ---------- player ---------- */
const P={x:0,z:0,yaw:0,pitch:0,eye:1.62,crouch:false,seated:null,hidden:null,speed:0,bob:0,stepT:0,lookYaw:0,lookPitch:0,inPit:false,limitYaw:null};
const keys={};const joy={x:0,y:0,mag:0};
function eyeHeight(){if(P.eyeOverride!=null)return P.eyeOverride;if(P.hidden)return P.hidden.eye;if(P.seated)return 1.12;if(P.inPit)return P.crouch?0.28:1.2;return P.crouch?0.92:(G.who==='manny'?1.66:1.5);}
function movePlayer(dt){
  if(P.seated||P.hidden){P.speed=0;return;}
  let fx=0,fz=0;if(keys.KeyW||keys.ArrowUp)fz+=1;if(keys.KeyS||keys.ArrowDown)fz-=1;if(keys.KeyA||keys.ArrowLeft)fx-=1;if(keys.KeyD||keys.ArrowRight)fx+=1;
  let mag=Math.hypot(fx,fz);if(mag>1){fx/=mag;fz/=mag;mag=1;}if(joy.mag>0.08){fx=joy.x;fz=joy.y;mag=joy.mag;}
  const run=(keys.ShiftLeft||keys.ShiftRight||joy.mag>0.92)&&!P.crouch&&!P.inPit;
  const top=P.inPit?0.9:P.crouch?1.1:run?3.7:2.25;const sp=top*Math.min(1,mag);
  const sy=Math.sin(P.yaw),cy=Math.cos(P.yaw);const vx=(fx*cy-fz*sy)*sp,vz=(-fx*sy-fz*cy)*sp;
  const o={x:P.x+vx*dt,z:P.z+vz*dt};collide(o,0.3,true);P.x=o.x;P.z=o.z;P.speed=Math.hypot(vx,vz);
  const pit=PT.pit;P.inPit=!!pit&&P.x>pit.x0&&P.x<pit.x1&&P.z>pit.z0&&P.z<pit.z1;
  if(P.speed>0.2){P.bob+=dt*P.speed*3.1;P.stepT-=dt*P.speed;if(P.stepT<=0){P.stepT=run?1.25:1.05;const r=roomAt(P.x,P.z);if(P.inPit)SFX.balls(busFx,now());else SFX.step(r?r.surf:'tile',run);}}
}
function updateCamera(dt){const e=eyeHeight();P.eye=damp(P.eye,e,10,dt);
  if(P.limitYaw){const c=P.limitYaw[0],w=P.limitYaw[1];const d=angDiff(c,P.yaw);if(d>w)P.yaw=c+w;if(d<-w)P.yaw=c-w;}
  const bob=reduceMotion?0:Math.sin(P.bob)*0.035*clamp(P.speed/2,0,1);
  camera.position.set(P.x,P.eye+bob+(P.seated?Math.sin(G.time*1.3)*0.004:0),P.z);camera.rotation.set(P.pitch,P.yaw,0);}
function look(dx,dy,k){P.yaw-=dx*k*sens;P.pitch=clamp(P.pitch-dy*k*sens,-1.35,1.35);}
function doorPushers(){const a=[{x:P.x,z:P.z}];if(CHARS.toni&&CHARS.toni.root.visible)a.push({x:CHARS.toni.x,z:CHARS.toni.z});return a;}

/* ---------- interaction ---------- */
const INTERACT={};let focus=null;
function ix(id,pos,label,use,on,r=1.7){INTERACT[id]={id,pos,label,use,on:on||(()=>true),r};}
const _f=new THREE.Vector3(),_d=new THREE.Vector3();
function scanFocus(){focus=null;if(G.mode!=='play')return;camera.getWorldDirection(_f);let best=0.8;
  if(P.hidden){focus={id:'unhide',label:'Get out',use:()=>leaveHide()};return showPrompt();}
  for(const k in INTERACT){const it=INTERACT[k];if(!it.on())continue;const p=it.pos;_d.set(p[0]-camera.position.x,p[1]-camera.position.y,p[2]-camera.position.z);const d=_d.length();if(d>it.r)continue;
    _d.normalize();const dot=_d.dot(_f);const sc=dot-d*0.02;if(dot>0.72&&sc>best-0.02&&(!focus||sc>best)){best=sc;focus=it;}}
  for(const h of HIDES){if(!canHide())break;if(!!h.house!==(G.where==='house'))continue;const d=Math.hypot(h.ex-P.x,h.ez-P.z);if(d>1.3)continue;_d.set(h.x-camera.position.x,(h.kind==='bed'?0.4:1.2)-camera.position.y,h.z-camera.position.z).normalize();const dot=_d.dot(_f);
    if(dot>0.6&&(!focus||dot>best)){best=dot;focus={id:h.id,label:HIDE_LABEL[h.kind]||'Hide in the locker',use:()=>enterHide(h)};}}
  showPrompt();}
function showPrompt(){const pr=$('prompt');if(!focus){pr.hidden=true;$('reticle').classList.remove('hot');$('bUse').classList.remove('ready');return;}
  $('pKey').textContent=touchMode?'USE':'E';$('pText').textContent=typeof focus.label==='function'?focus.label():focus.label;pr.hidden=false;$('reticle').classList.add('hot');$('bUse').classList.add('ready');}
function tryUse(){if(G.mode!=='play')return;if(focus&&focus.use){SFX.ui();focus.use();}}
const HIDE_LABEL={stall:'Hide in the stall',locker:'Hide in the locker',closet:'Hide in the closet',bed:'Hide under the bed',curtain:'Hide behind the shower curtain'};
function canHide(){return (G.who==='manny'||G.flags.canHide)&&!P.seated;}
/* hiding: lockers and stalls. The ball pit and anything you duck behind work without a button. */
function enterHide(h){const seen=!!(CHARS.toni&&CHARS.toni.root.visible&&toniSees(1));
  P.hidden=h;P.x=h.x;P.z=h.z;P.yaw=h.yaw;P.pitch=h.kind==='bed'?0.05:0;P.limitYaw=[h.yaw,h.kind==='bed'?0.5:0.7];P.crouch=false;const m=$('hideMask');m.className=h.kind==='stall'?'stall':h.kind==='bed'?'bed':h.kind==='curtain'?'curtain':'slats';m.hidden=false;
  at3(h.x,1,h.z,(p,t)=>h.kind==='stall'||h.kind==='closet'?SFX.door(p,t):h.kind==='bed'||h.kind==='curtain'?SFX.drag(p,t,0.5):SFX.locker(p,t));G.flags.hidSeen=TONI.state==='chase'&&seen;if(TONI.house)HAI.sawHide=seen;if(G.onHide)G.onHide(h);}
function leaveHide(){const h=P.hidden;if(!h)return;if(G.noLeave)return;P.hidden=null;P.limitYaw=null;P.x=h.ex;P.z=h.ez;$('hideMask').hidden=true;at3(h.x,1,h.z,(p,t)=>h.kind==='closet'?SFX.door(p,t):h.kind==='bed'||h.kind==='curtain'?SFX.drag(p,t,0.4):SFX.locker(p,t));}
function isHidden(){if(P.hidden)return true;if(P.inPit&&P.crouch)return true;return false;}

/* ---------- HUD bits ---------- */
let subT=0;
function sub(text,dur=3,who){const el=$('sub');el.innerHTML=(who?`<span class="who">${escapeHTML(who)}</span>`:'')+escapeHTML(text);el.hidden=false;clearTimeout(subT);subT=setTimeout(()=>{el.hidden=true;},dur*1000);}
async function think(text,dur,who){who=who||G.who;const vd=await voPlay(who,text,null);sub(text,vd?vd+0.8:(dur||Math.max(2.6,text.length*0.065)),who==='manny'?'Manny':'Lucia');}
const thinkL=(t,d)=>think(t,d,'lucia'),thinkM=(t,d)=>think(t,d,'manny');
let objHint='';
function setObj(t,hint){const o=$('obj');o.hidden=!t;if(!t)return;if($('objText').textContent!==t){$('objText').textContent=t;o.classList.remove('flash');void o.offsetWidth;o.classList.add('flash');}objHint=hint||'';}
function setCarry(){const c=$('carry');const items=PIZZA.carry();c.hidden=!items.length;c.innerHTML='Carrying · <b>'+items.join(', ')+'</b>';}
function remember(text){const r=$('remember');r.textContent=text;r.classList.add('on');SFX.remember();setTimeout(()=>r.classList.remove('on'),3800);}
function fadeTo(v,sec=1){const f=$('fade');f.style.transitionDuration=sec+'s';f.style.opacity=String(v);return gwait(sec);}
async function titleCard(k,t,hold=2.2){$('cardK').textContent=k;$('cardT').textContent=t;$('card').classList.add('on');await gwait(hold);$('card').classList.remove('on');await gwait(0.8);}

/* ---------- dialogue: Telltale-style lines and timed choices ---------- */
let DS=null;
function line(who,text,o={}){return new Promise(async res=>{const ch=CHARS[who];const name=o.name||(ch?ch.s.name:who==='lucia'?'Lucia':who==='manny'?'Manny':who);
  $('dlg').hidden=false;$('dlgWho').textContent=name;$('dlgText').textContent=text;$('dlgChoices').innerHTML='';$('dlgBar').hidden=true;$('dlgMore').hidden=false;
  if(ch&&o.expr)setExpr(ch,o.expr);
  const pos=ch&&ch.root.visible&&who!=='lucia'&&who!=='manny'?{x:ch.x,y:1.3,z:ch.z}:null;
  const run=G.run;let done=false;const t0=Date.now();
  const fin=()=>{if(done)return;done=true;if(o.dur)voStop(0.12);DS=null;$('dlg').hidden=true;res();};
  DS={skip:()=>{if(Date.now()-t0>250){voStop();fin();}}};
  const vd=await voPlay(who,text,pos);if(!alive(run)||done)return;
  let dur;if(vd)dur=o.dur?Math.min(o.dur,vd+0.1):vd+0.55;else dur=o.dur||clamp(1.6+text.length*0.065,2.2,8);   // everyone but Toni is silent: the line is read, not heard
  if(ch)say(ch,vd?Math.min(vd,dur):dur*0.8);
  gwait(dur).then(()=>{if(alive(run))fin();});});}
function choose(opts,o={}){return new Promise(res=>{$('dlg').hidden=false;$('dlgWho').textContent=o.who||'';$('dlgText').textContent=o.prompt||'';$('dlgMore').hidden=true;
  const box=$('dlgChoices');box.innerHTML='';let done=false;const run=G.run;
  const fin=i=>{if(done)return;done=true;DS=null;$('dlg').hidden=true;box.innerHTML='';SFX.ui();res(i);};
  opts.forEach((t,i)=>{const b=document.createElement('button');b.className='choice';b.type='button';b.innerHTML=`<span class="k">${touchMode?'':i+1}</span><span>${escapeHTML(t)}</span>`;
    b.addEventListener('click',e=>{e.stopPropagation();fin(i);});box.append(b);});
  DS={pick:i=>{if(i<opts.length)fin(i);}};
  if(o.timeout){const bar=$('dlgBar');bar.hidden=false;const b=bar.firstElementChild;let left=o.timeout;
    const tick=()=>{if(done||!alive(run))return;left-=0.05;b.style.transform=`scaleX(${Math.max(0,left/o.timeout)})`;if(left<=0){fin(-1);return;}gwait(0.05).then(tick);};tick();}});}
$('dlg').addEventListener('click',()=>{if(DS&&DS.skip)DS.skip();});

/* ---------- notes ---------- */
let noteRes=null;
function openNote(kind,title,html){return new Promise(res=>{SFX.paper();const p=$('paper');p.className='paper '+(kind||'');$('noteTitle').textContent=title||'';$('noteBody').innerHTML=html;$('note').hidden=false;
  const prev=G.mode;setMode('ui');noteRes=()=>{$('note').hidden=true;setMode(prev==='ui'?'play':prev);noteRes=null;res();};setTimeout(()=>$('noteClose').focus({preventScroll:true}),30);});}
$('noteClose').addEventListener('click',()=>{if(noteRes)noteRes();});

/* ---------- input ---------- */
const canvasEl=$('view');let expectUnlock=false,hasLock=false,mouseDown=false;
function requestLock(){if(touchMode)return;try{const p=canvasEl.requestPointerLock();if(p&&p.catch)p.catch(()=>{});}catch(e){}}
function releaseLock(){if(document.pointerLockElement){expectUnlock=true;try{document.exitPointerLock();}catch(e){}}}
function updateLockHint(){$('lockHint').hidden=!(G.mode==='play'&&!touchMode&&!document.pointerLockElement&&!mouseDown);}
document.addEventListener('pointerlockchange',()=>{const locked=document.pointerLockElement===canvasEl;if(locked)hasLock=true;else if(G.mode==='play'&&!expectUnlock&&hasLock)pauseGame();expectUnlock=false;updateLockHint();});
canvasEl.addEventListener('mousedown',()=>{if(G.mode==='play'&&!touchMode){mouseDown=true;requestLock();updateLockHint();}});
addEventListener('mouseup',()=>{mouseDown=false;updateLockHint();});
addEventListener('mousemove',e=>{if(G.mode!=='play')return;if(document.pointerLockElement===canvasEl||mouseDown)look(e.movementX||0,e.movementY||0,0.0022);});
addEventListener('keydown',e=>{
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)&&G.mode!=='title')e.preventDefault();
  keys[e.code]=true;
  if(VHS.on){if(!e.repeat&&['Escape','KeyE','Space','Enter'].includes(e.code))vhsEnd();return;}
  if(CR.on){if(!e.repeat&&['Escape','KeyE','Space','Enter'].includes(e.code))crSkip();return;}
  if(!$('cook').hidden){COOK.key(e);return;}
  if(DS){if(/^Digit[1-9]$/.test(e.code)&&DS.pick)DS.pick(+e.code.slice(5)-1);else if(['Space','Enter','KeyE'].includes(e.code)&&!e.repeat&&DS.skip)DS.skip();return;}
  if(noteRes&&!e.repeat&&['Escape','KeyE','Space','Enter'].includes(e.code)){e.preventDefault();noteRes();return;}
  if(G.mode==='play'){if(e.code==='KeyE'&&!e.repeat)tryUse();if((e.code==='KeyC'||e.code==='ControlLeft')&&!e.repeat)toggleDuck();if(e.code==='Escape'||e.code==='KeyP')pauseGame();}
  else if(G.mode==='cine'&&(e.code==='Escape'||e.code==='KeyP'))pauseGame();
  else if(G.mode==='paused'&&(e.code==='Escape'||e.code==='KeyP'))resumeGame();});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&(G.mode==='play'||G.mode==='cine'))pauseGame();});
function toggleDuck(){if(P.seated||P.hidden)return;P.crouch=!P.crouch;$('bDuck').classList.toggle('ready',P.crouch);}
// touch: left half moves, right half looks
const tl=$('touch');let joyId=null,joyO=null,lookId=null,lookP=null;
function placeIdleJoy(){const jb=$('joyBase');jb.style.left='96px';jb.style.top=(innerHeight-140)+'px';}
function joyEnd(){joyId=null;joy.x=joy.y=joy.mag=0;const jb=$('joyBase');jb.classList.add('idle');placeIdleJoy();$('joyKnob').style.transform='';}
function markTouch(){if(!touchMode){touchMode=true;$('touch').hidden=G.mode!=='play';updateLockHint();}}
addEventListener('touchstart',markTouch,{passive:true});
tl.addEventListener('pointerdown',e=>{if(e.target.closest('.tb'))return;e.preventDefault();markTouch();
  if(e.clientX<innerWidth*0.45&&joyId===null&&!P.seated&&!P.hidden){joyId=e.pointerId;joyO={x:e.clientX,y:e.clientY};const jb=$('joyBase');jb.classList.remove('idle');jb.style.left=e.clientX+'px';jb.style.top=e.clientY+'px';}
  else if(lookId===null){lookId=e.pointerId;lookP={x:e.clientX,y:e.clientY};}
  try{tl.setPointerCapture(e.pointerId);}catch(err){}});
tl.addEventListener('pointermove',e=>{if(e.pointerId===joyId){let dx=e.clientX-joyO.x,dy=e.clientY-joyO.y;const d=Math.hypot(dx,dy),mx=52;if(d>mx){dx=dx/d*mx;dy=dy/d*mx;}
    joy.x=dx/mx;joy.y=-dy/mx;joy.mag=Math.min(1,d/mx);$('joyKnob').style.transform=`translate(${dx}px,${dy}px)`;}
  else if(e.pointerId===lookId&&G.mode==='play'){look(e.clientX-lookP.x,e.clientY-lookP.y,0.0052);lookP={x:e.clientX,y:e.clientY};}});
const tEnd=e=>{if(e.pointerId===joyId)joyEnd();if(e.pointerId===lookId)lookId=null;};
tl.addEventListener('pointerup',tEnd);tl.addEventListener('pointercancel',tEnd);
const tbtn=(id,down)=>{const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();markTouch();down();});b.addEventListener('click',e=>e.preventDefault());};
tbtn('bUse',tryUse);tbtn('bDuck',toggleDuck);
$('pauseBtn').addEventListener('click',()=>pauseGame());
['gesturestart','gesturechange','gestureend'].forEach(t=>document.addEventListener(t,e=>e.preventDefault(),{passive:false}));
document.addEventListener('touchmove',e=>{if(e.touches&&e.touches.length>1)e.preventDefault();},{passive:false});

/* ---------- menus ---------- */
let pausedFrom='play';
function pauseGame(){if(G.mode!=='play'&&G.mode!=='cine')return;pausedFrom=G.mode;setMode('paused');$('pauseCtl').innerHTML=ctlHTML();$('pauseCtl').hidden=true;$('sens').value=String(sens);$('vol').value=String(voiceVol);
  $('pObj').textContent=$('objText').textContent||'Stay alive.';$('pHint').textContent=objHint?'Hint: '+objHint:'';$('pause').hidden=false;
  if(AC)AC.suspend();try{if(window.speechSynthesis)speechSynthesis.pause();}catch(e){}setTimeout(()=>$('resumeBtn').focus({preventScroll:true}),30);}
function resumeGame(){$('pause').hidden=true;if(AC)AC.resume();try{if(window.speechSynthesis)speechSynthesis.resume();}catch(e){}setMode(pausedFrom);}
$('resumeBtn').addEventListener('click',resumeGame);
$('pCtlBtn').addEventListener('click',()=>{const p=$('pauseCtl');p.hidden=!p.hidden;$('pCtlBtn').setAttribute('aria-expanded',String(!p.hidden));});
$('sens').addEventListener('input',e=>{sens=parseFloat(e.target.value)||1;LS.set('sens',sens);});
$('vol').addEventListener('input',e=>{voiceVol=parseFloat(e.target.value);LS.set('vol',voiceVol);});
$('restartBtn').addEventListener('click',()=>{$('pause').hidden=true;if(AC)AC.resume();loadCheckpoint();});
$('retryBtn').addEventListener('click',()=>{$('dead').hidden=true;if(AC&&AC.state==='suspended')AC.resume();loadCheckpoint();});
const toTitle=()=>{location.reload();};
$('quitBtn').addEventListener('click',toTitle);$('deadQuit').addEventListener('click',toTitle);$('endQuit').addEventListener('click',toTitle);
$('againBtn').addEventListener('click',()=>{LS.del('save');location.reload();});
function die(head,lineTxt){if(G.mode==='dead')return;G.run++;scoreBase(null,true);hushToni();bubble('off');setMode('dead');P.hidden=null;$('hideMask').hidden=true;$('dlg').hidden=true;DS=null;
  setAmb('hunt',0,0.3);postU.uFlash.value=0.9;SFX.sting();$('deadHead').textContent=head||'ORDER UP.';$('deadLine').textContent=lineTxt||'';
  setTimeout(()=>{$('dead').hidden=false;setTimeout(()=>$('retryBtn').focus({preventScroll:true}),30);},900);}
