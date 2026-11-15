/* ============================================================
   AUDIO: everything is synthesized. Beds fade with the room you're in; one-shots are positional.
   ============================================================ */
let AC=null,master,comp,busFx,busAmb,busMus,verb,noiseBuf,brownBuf;
const amb={};
function initAudio(){
  if(AC){if(AC.state==='suspended')AC.resume();return;}
  try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){AC=null;return;}
  master=AC.createGain();master.gain.value=0.9;
  comp=AC.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=4;
  comp.connect(master);master.connect(AC.destination);
  verb=AC.createConvolver();verb.buffer=impulse(1.6,2.6);const vg=AC.createGain();vg.gain.value=0.28;verb.connect(vg);vg.connect(comp);
  busFx=AC.createGain();busFx.gain.value=1;busFx.connect(comp);busFx.connect(verb);
  busAmb=AC.createGain();busAmb.gain.value=0.8;busAmb.connect(comp);
  busMus=AC.createGain();busMus.gain.value=0.5;busMus.connect(comp);busMus.connect(verb);
  noiseBuf=mkNoise(2,false);brownBuf=mkNoise(4,true);
  setTimeout(()=>voWarm(),200);
  // beds
  // a soft electrical hum, felt more than heard (no saw, no high whine)
  amb.hum=bed(()=>{const g=AC.createGain();[[60,0.05],[120,0.025],[180,0.008]].forEach(([f,a])=>{const o=AC.createOscillator();o.type='sine';o.frequency.value=f;const og=AC.createGain();og.gain.value=a;o.connect(og);og.connect(g);o.start();});return g;});
  amb.room=bed(()=>{const n=AC.createBufferSource();n.buffer=brownBuf;n.loop=true;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=320;const g=AC.createGain();n.connect(lp);lp.connect(g);n.start();return g;});
  amb.freezer=bed(()=>{const g=AC.createGain();const n=AC.createBufferSource();n.buffer=brownBuf;n.loop=true;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=520;const ng=AC.createGain();ng.gain.value=0.9;n.connect(lp);lp.connect(ng);ng.connect(g);n.start();
    const o=AC.createOscillator();o.type='sine';o.frequency.value=50;const og=AC.createGain();og.gain.value=0.05;o.connect(og);og.connect(g);o.start();return g;});
  amb.oven=bed(()=>{const g=AC.createGain();const n=AC.createBufferSource();n.buffer=brownBuf;n.loop=true;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=260;bp.Q.value=0.8;n.connect(bp);bp.connect(g);n.start();
    const o=AC.createOscillator();o.type='triangle';o.frequency.value=43;const og=AC.createGain();og.gain.value=0.25;o.connect(og);og.connect(g);o.start();return g;});
  amb.arcade=bed(()=>{const g=AC.createGain();const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2400;lp.connect(g);arcadeLoop(lp);return g;});
  amb.hunt=bed(()=>{const g=AC.createGain();const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=36.7;const o2=AC.createOscillator();o2.type='sawtooth';o2.frequency.value=37.3;
    const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=140;o.connect(lp);o2.connect(lp);const lfo=AC.createOscillator();lfo.frequency.value=1.6;const lg=AC.createGain();lg.gain.value=0.5;lfo.connect(lg);
    const vca=AC.createGain();vca.gain.value=0.5;lg.connect(vca.gain);lp.connect(vca);vca.connect(g);o.start();o2.start();lfo.start();return g;});
}
function bed(make){const g=make();const out=AC.createGain();out.gain.value=0;g.connect(out);out.connect(busAmb);return out;}
function setAmb(name,v,tc=0.6){if(AC&&amb[name])amb[name].gain.setTargetAtTime(v,AC.currentTime,tc);}
function impulse(sec,decay){const len=Math.floor(AC.sampleRate*sec);const b=AC.createBuffer(2,len,AC.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,decay);}return b;}
function mkNoise(sec,brown){const len=Math.floor(AC.sampleRate*sec);const b=AC.createBuffer(1,len,AC.sampleRate);const d=b.getChannelData(0);let last=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;if(brown){last=(last+0.02*w)/1.02;d[i]=last*3.5;}else d[i]=w;}return b;}
const now=()=>AC?AC.currentTime+0.02:0;
function sNoise(dest,t,dur,type,freq,q,peak,a=0.005,f2){if(!AC)return;const s=AC.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=AC.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(freq,t);if(f2)f.frequency.exponentialRampToValueAtTime(f2,t+a+dur);f.Q.value=q;
  const g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+dur);s.connect(f);f.connect(g);g.connect(dest);s.start(t,Math.random()*1.5);s.stop(t+a+dur+0.05);}
function sTone(dest,t,dur,type,f0,f1,peak,a=0.005){if(!AC)return;const o=AC.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+a+dur);
  const g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+dur);o.connect(g);g.connect(dest);o.start(t);o.stop(t+a+dur+0.05);}
/* positional one-shots */
function mkPanner(x,y,z,ref=1.6){const p=AC.createPanner();p.panningModel='equalpower';p.distanceModel='inverse';p.refDistance=ref;p.rolloffFactor=1.2;p.maxDistance=60;
  if(p.positionX){p.positionX.value=x;p.positionY.value=y;p.positionZ.value=z;}else p.setPosition(x,y,z);p.connect(busFx);return p;}
function at3(x,y,z,fn,ref){if(!AC)return;const p=mkPanner(x,y,z,ref);fn(p,now());setTimeout(()=>{try{p.disconnect();}catch(e){}},4000);}
function updateListener(){if(!AC)return;const L=AC.listener;const p=camera.position;const fx=-Math.sin(camera.rotation.y),fz=-Math.cos(camera.rotation.y);
  if(L.positionX){L.positionX.value=p.x;L.positionY.value=p.y;L.positionZ.value=p.z;L.forwardX.value=fx;L.forwardY.value=0;L.forwardZ.value=fz;L.upX.value=0;L.upY.value=1;L.upZ.value=0;}
  else{L.setPosition(p.x,p.y,p.z);L.setOrientation(fx,0,fz,0,1,0);}}

/* ---------- sound effects ---------- */
const SFX={
  step(surface,run){if(!AC)return;const t=now();const k=run?1.3:1;
    if(surface==='carpet'){sNoise(busFx,t,0.08,'lowpass',500,0.7,0.16*k);}
    else if(surface==='foam'){sNoise(busFx,t,0.1,'lowpass',300,0.7,0.2*k);}
    else if(surface==='metal'){sNoise(busFx,t,0.06,'bandpass',1800,2,0.12*k);sTone(busFx,t,0.08,'triangle',320,260,0.03*k);}
    else{sNoise(busFx,t,0.05,'bandpass',1300+Math.random()*400,1.4,0.2*k);sNoise(busFx,t+0.01,0.06,'lowpass',260,0.8,0.18*k);}},
  // Toni's step: a heavy, padded thud. A low body thump, a muffled knock that small phone speakers can still play, and the suit's swish
  stomp(p,t){const r=Math.random();sTone(p,t,0.24,'sine',88+r*12,40,0.6,0.004);sTone(p,t,0.14,'sine',170+r*20,85,0.28,0.004);
    sNoise(p,t,0.13,'lowpass',260,0.8,0.55,0.003,90);sNoise(p,t+0.004,0.07,'bandpass',380,1.1,0.16);sNoise(p,t+0.03,0.2,'lowpass',700,0.5,0.05,0.04);},
  pick(){if(!AC)return;const t=now();sNoise(busFx,t,0.09,'highpass',2600,0.7,0.2);sTone(busFx,t+0.02,0.08,'triangle',520,780,0.06);},
  paper(){if(!AC)return;const t=now();sNoise(busFx,t,0.14,'highpass',3200,0.7,0.22);sNoise(busFx,t+0.12,0.1,'highpass',3800,0.7,0.16);},
  door(p,t,heavy){sNoise(p,t,heavy?0.5:0.3,'bandpass',heavy?420:700,1.4,0.5,0.02,heavy?240:400);sTone(p,t+0.04,0.25,'sine',heavy?90:140,heavy?60:90,0.3);},
  clunk(p,t){sTone(p,t,0.18,'square',140,70,0.25);sNoise(p,t,0.08,'bandpass',2200,3,0.45);},
  fridge(p,t){sNoise(p,t,0.4,'lowpass',380,0.6,0.35,0.05);sTone(p,t,0.12,'sine',220,180,0.08);},
  bell(){if(!AC)return;const t=now();[2093,3136,4186].forEach((f,i)=>sTone(busFx,t,1.6-i*0.4,'sine',f,0,0.16/(i+1)));},
  chime(){if(!AC)return;const t=now();sTone(busFx,t,0.9,'sine',784,0,0.22,0.01);sTone(busFx,t+0.45,1.2,'sine',622,0,0.22,0.01);sTone(busFx,t,0.9,'sine',1568,0,0.04,0.01);},
  feedback(){if(!AC)return;const t=now()+0.9;sTone(busFx,t,0.7,'sine',2950,3100,0.035,0.2);sNoise(busFx,t,0.25,'bandpass',180,1,0.08);},
  tap(p,t){sNoise(p,t,0.018,'bandpass',2600+Math.random()*1800,5,0.5,0.001);sTone(p,t,0.012,'square',180+Math.random()*60,0,0.04,0.001);},
  sauce(){if(!AC)return;sNoise(busFx,now(),0.18,'lowpass',420,2,0.18,0.03,200);},
  cheese(){if(!AC)return;const t=now();for(let i=0;i<4;i++)sNoise(busFx,t+i*0.03,0.03,'highpass',3600,0.8,0.08);},
  plop(){if(!AC)return;const t=now();sTone(busFx,t,0.08,'sine',380,160,0.18);sNoise(busFx,t,0.04,'lowpass',800,1,0.12);},
  stretch(){if(!AC)return;sNoise(busFx,now(),0.2,'bandpass',600,3,0.12,0.04,300);},
  shake(){if(!AC)return;const t=now();for(let i=0;i<5;i++)sNoise(busFx,t+i*0.05,0.03,'highpass',5000,1,0.12);},
  slice(){if(!AC)return;const t=now();sNoise(busFx,t,0.22,'bandpass',2400,4,0.2,0.01,1200);},
  beep(){if(!AC)return;sTone(busFx,now(),0.06,'square',1760,0,0.06);},
  bombBeep(p,t){sTone(p,t,0.09,'square',2200,0,0.1);},
  ui(){if(!AC)return;sTone(comp,now(),0.035,'square',660,0,0.03);},
  remember(){if(!AC)return;const t=now();sTone(comp,t,0.4,'sine',988,0,0.07,0.01);sTone(comp,t+0.12,0.6,'sine',1319,0,0.06,0.01);},
  heartbeat(a){if(!AC)return;const t=now();sTone(comp,t,0.13,'sine',64,38,a);sTone(comp,t+0.21,0.15,'sine',58,34,a*0.8);},
  sting(){if(!AC)return;const t=now();sTone(comp,t,1.6,'sawtooth',73,36,0.35);sNoise(comp,t,0.9,'lowpass',600,0.7,0.6);[311,330,349].forEach(f=>sTone(comp,t,1.4,'sawtooth',f,f*0.97,0.06,0.01));},
  shot(p,t){sNoise(p,t,0.35,'lowpass',3000,0.7,1.2,0.001,300);sTone(p,t,0.25,'square',120,40,0.6,0.001);},
  gasp(p,t,a=0.6){sNoise(p,t,0.4,'bandpass',1100,1.6,a,0.03,2600);},
  choke(p,t){for(let i=0;i<6;i++){sNoise(p,t+i*0.32,0.22,'bandpass',700+Math.random()*300,4,0.5,0.03,400);sTone(p,t+i*0.32,0.18,'sawtooth',140,90,0.08,0.02);}},
  zip(p,t){sNoise(p,t,0.25,'bandpass',3200,6,0.15,0.01,1800);},
  crunch(p,t){for(let i=0;i<5;i++)sNoise(p,t+Math.random()*0.15,0.03,'highpass',2600,1,0.25);},
  locker(p,t){sNoise(p,t,0.22,'bandpass',1500,6,0.2,0.01,900);sTone(p,t+0.18,0.2,'triangle',300,220,0.12);},
  balls(p,t){for(let i=0;i<10;i++)sTone(p,t+Math.random()*0.35,0.04,'sine',600+Math.random()*900,300,0.05);},
  slideNote(p,t){sNoise(p,t,0.6,'highpass',2600,0.6,0.25,0.1);},
};

/* family voices: a soft murmur under each subtitle, never real words, so Toni's phone stays the only real voice */
const VOX={dad:{f0:118,F:[650,1100]},grandpa:{f0:102,F:[560,950],shake:1},uncle:{f0:110,F:[620,1250]},alex:{f0:190,F:[800,1500]},ruben:{f0:205,F:[820,1600]},lucia:{f0:215,F:[850,1700]},manny:{f0:104,F:[600,1000]}};
function murmur(who,text,pos){if(!AC||!VOX[who])return;const v=VOX[who];const n=Math.max(2,Math.min(14,Math.round(text.replace(/[^a-z]/gi,'').length/3.4)));
  const dest=pos?mkPanner(pos.x,pos.y,pos.z,2):busFx;let t=now()+0.03;
  for(let i=0;i<n;i++){const d=0.07+Math.random()*0.09;const o=AC.createOscillator();o.type='sawtooth';const f=v.f0*(0.88+Math.random()*0.28);o.frequency.setValueAtTime(f,t);o.frequency.linearRampToValueAtTime(f*(0.92+Math.random()*0.12),t+d);
    const f1=AC.createBiquadFilter();f1.type='bandpass';f1.frequency.value=v.F[0]*(0.8+Math.random()*0.4);f1.Q.value=5;const f2=AC.createBiquadFilter();f2.type='bandpass';f2.frequency.value=v.F[1]*(0.8+Math.random()*0.5);f2.Q.value=7;
    const g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.11,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
    o.connect(f1);o.connect(f2);f1.connect(g);f2.connect(g);g.connect(dest);o.start(t);o.stop(t+d+0.05);t+=d+0.025+Math.random()*0.04;if(Math.random()<0.15)t+=0.12;}}

/* ---------- music: "Pepper Toni's", the theme song ----------
   A 90s pizza-chain jingle on a worn tape: drawbar organ lead, oom-pah bass, off-beat chord stabs, a little drum kit,
   glockenspiel on the chorus, then the announcer's tag. Every few loops the tape drags and the pitch sags.
   Notes are written per bar as eight eighth-note slots: a note name, '-' to hold, '.' for a rest. */
const THEME={bpm:128,
  chords:['C','Am','F','G', 'C','Am','F','G','C','Am','F','G', 'F','G','Em','Am','F','G','C','C', 'C','C','F','G'],
  mel:[
    '........','........','........','....G4.A4B4',
    'C5-E5-G5-E5-','A5-G5E5-C5--','F5-A5-C6-A5-','G5---D5-E5F5',
    'E5-G5-C6-G5-','A5G5E5-C5-E5-','F5-E5-D5-C5-','D5---G4---',
    'C6--A5C6-A5-','B5--G5B5-G5-','G5-E5-G5-B5-','C6---A5---',
    'A5-A5-C6-A5-','G5-G5-B5-D6-','C6---G5-E5-','C5------.',
    '........','........','........','........'],
  glock:[12,19]};
const CHORD={C:[48,52,55],Am:[45,48,52],F:[41,45,48],G:[43,47,50],Em:[40,43,47]};
const midi=n=>{const m=/^([A-G])(#?)(\d)$/.exec(n);return ({C:0,D:2,E:4,F:5,G:7,A:9,B:11})[m[1]]+(m[2]?1:0)+(+m[3]+1)*12;};
const mhz=m=>440*Math.pow(2,(m-69)/12);
function parseBar(str){const out=[];let i=0;const toks=[];while(i<str.length){if(str[i]==='.'||str[i]==='-'){toks.push(str[i]);i++;}else{const m=/^[A-G]#?\d/.exec(str.slice(i));toks.push(m[0]);i+=m[0].length;}}
  for(let k=0;k<toks.length;k++){const t=toks[k];if(t!=='.'&&t!=='-'){let len=1;while(toks[k+len]==='-')len++;out.push([k,t,len]);}}return out;}
let musicOn=null;
function startTheme(o={}){if(!AC)return;stopMusic();const st={alive:true,loop:0,o};musicOn=st;const spb=60/(THEME.bpm*(o.fast?1.08:1)),e8=spb/2,bar=spb*4;
  const out=AC.createGain();out.gain.value=o.quiet?0.32:0.55;const tone=AC.createBiquadFilter();tone.type='lowpass';tone.frequency.value=o.muffled?1300:5200;out.connect(tone);tone.connect(busMus);
  // the tape: one detune source feeds every oscillator, so wow, flutter and the sag move the whole band together
  const tape=AC.createConstantSource();tape.offset.value=0;tape.start();const wow=AC.createOscillator();wow.frequency.value=0.55;const wg=AC.createGain();wg.gain.value=o.warped?16:5;wow.connect(wg);wg.connect(tape.offset);wow.start();
  const osc=(type,f,t,dur,peak,a=0.008,dest=out,rel)=>{const v=AC.createOscillator();v.type=type;v.frequency.value=f;tape.connect(v.detune);const g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);
    g.gain.setTargetAtTime(0.0001,t+dur,rel||0.05);v.connect(g);g.connect(dest);v.start(t);v.stop(t+dur+(rel||0.05)*6);};
  const organ=(m,t,dur,amp)=>{const f=mhz(m);osc('sine',f,t,dur,amp*0.55);osc('sine',f*2,t,dur,amp*0.28);osc('sine',f*3,t,dur,amp*0.12);osc('square',f,t,dur,amp*0.05);};
  const glock=(m,t,amp)=>{const f=mhz(m+12);osc('sine',f,t,0.02,amp,0.002,out,0.25);osc('sine',f*2.76,t,0.01,amp*0.3,0.002,out,0.12);};
  const kick=t=>{const v=AC.createOscillator();v.frequency.setValueAtTime(140,t);v.frequency.exponentialRampToValueAtTime(42,t+0.12);const g=AC.createGain();g.gain.setValueAtTime(0.55,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.25);v.connect(g);g.connect(out);v.start(t);v.stop(t+0.3);};
  const snare=t=>{sNoise(out,t,0.13,'bandpass',1900,0.9,0.32,0.002);osc('triangle',190,t,0.04,0.12,0.002);};
  const hat=(t,a)=>sNoise(out,t,0.035,'highpass',7000,0.7,a,0.001);
  const crash=t=>sNoise(out,t,1.4,'highpass',5000,0.5,0.16,0.003);
  const schedBar=(b,t0)=>{const ch=CHORD[THEME.chords[b]];const tag=b>=20;
    // bass: oom-pah, root then fifth
    if(!tag||b===20){for(let q=0;q<4;q++){const m=(q%2?ch[2]:ch[0])-12;osc('triangle',mhz(m),t0+q*spb,spb*0.55,0.42,0.005);osc('square',mhz(m),t0+q*spb,spb*0.3,0.05,0.005);}}
    // chord stabs on the off-beats, a held chord under the tag
    if(b<4||(b>=4&&b<20)){for(let q=0;q<4;q++)ch.forEach(m=>osc('square',mhz(m+12),t0+q*spb+e8,e8*0.6,0.03,0.004));}
    if(tag&&b<23)ch.forEach(m=>organ(m+12,t0,bar*0.98,0.08));
    // drums
    if(!tag||b===20){for(let q=0;q<4;q++){if(q%2===0)kick(t0+q*spb);else snare(t0+q*spb);hat(t0+q*spb,0.05);hat(t0+q*spb+e8,0.08);}}
    if(b===3||b===11||b===19){for(let k=0;k<4;k++)snare(t0+2*spb+k*e8*0.5+spb);}
    if(b===4||b===12||b===20)crash(t0);
    // melody
    for(const [k,n,len] of parseBar(THEME.mel[b])){const t=t0+k*e8;organ(midi(n),t,len*e8*0.92,0.22);if(b>=THEME.glock[0]&&b<=THEME.glock[1])glock(midi(n),t,0.09);}
    // the announcer's tag
    if(b===20&&!o.noTag){const key=voKey('announcer',"Pepper Toni's! Where family comes first!");voDecode(key).then(buf=>{if(!buf||!st.alive)return;const s=AC.createBufferSource();s.buffer=buf;const g=AC.createGain();g.gain.value=0.9;s.connect(g);g.connect(busMus);s.start(Math.max(AC.currentTime,t0+spb*0.5));});}
    // the tape drags at the end of every third loop
    if(b===23&&st.loop%3===2){tape.offset.cancelScheduledValues(t0);tape.offset.setValueAtTime(0,t0);tape.offset.linearRampToValueAtTime(-260,t0+bar);tape.offset.linearRampToValueAtTime(0,t0+bar+0.4);}};
  let b=0,t=now()+0.15;const tick=()=>{if(!st.alive)return;while(t<AC.currentTime+0.6){schedBar(b,t);t+=bar;b++;if(b>=THEME.chords.length){b=0;st.loop++;t+=bar*0.5;}}st.timer=setTimeout(tick,120);};tick();
  st.stop=()=>{st.alive=false;clearTimeout(st.timer);out.gain.setTargetAtTime(0,AC.currentTime,0.25);setTimeout(()=>{try{out.disconnect();tape.stop();wow.stop();}catch(e){}},1600);};}
function startJingle(slow){startTheme(slow?{warped:true,quiet:true,noTag:true}:{});}
function stopMusic(){if(musicOn&&musicOn.stop)musicOn.stop();musicOn=null;}

/* the arcade cabinets' attract modes, heard through the wall */
function arcadeLoop(dest){const step=()=>{if(!AC)return;const t=now();const base=[262,330,392,523][(Math.random()*4)|0];
  for(let i=0;i<6;i++){if(Math.random()<0.7)sTone(dest,t+i*0.11,0.08,Math.random()<0.5?'square':'triangle',base*[1,1.5,2,1.25][(Math.random()*4)|0],0,0.05);}
  setTimeout(step,900+Math.random()*1600);};step();}
