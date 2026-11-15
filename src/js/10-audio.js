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
  // a last limiter, so a scream on top of a slam on top of the score never clips the phone's speaker
  const lim=AC.createDynamicsCompressor();lim.threshold.value=-4;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=0.002;lim.release.value=0.18;
  comp.connect(master);master.connect(lim);lim.connect(AC.destination);
  verb=AC.createConvolver();verb.buffer=impulse(1.6,2.6);const vg=AC.createGain();vg.gain.value=0.28;verb.connect(vg);vg.connect(comp);
  busFx=AC.createGain();busFx.gain.value=1;busFx.connect(comp);busFx.connect(verb);
  busAmb=AC.createGain();busAmb.gain.value=0.8;busAmb.connect(comp);
  busMus=AC.createGain();busMus.gain.value=0.5;busMus.connect(comp);busMus.connect(verb);
  noiseBuf=mkNoise(2,false);brownBuf=mkNoise(4,true);
  setTimeout(()=>voWarm(),200);setTimeout(()=>sfxWarm(),60);
  // beds
  // a soft electrical hum, felt more than heard (no saw, no high whine)
  amb.hum=bed(()=>{const g=AC.createGain();[[60,0.05],[120,0.025],[180,0.008]].forEach(([f,a])=>{const o=AC.createOscillator();o.type='sine';o.frequency.value=f;const og=AC.createGain();og.gain.value=a;o.connect(og);og.connect(g);o.start();});return g;},0.4);
  amb.room=bed(()=>{const n=AC.createBufferSource();n.buffer=brownBuf;n.loop=true;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=320;const g=AC.createGain();n.connect(lp);lp.connect(g);n.start();return g;},0.25);
  amb.freezer=bed(()=>{const g=AC.createGain();const n=AC.createBufferSource();n.buffer=brownBuf;n.loop=true;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=520;const ng=AC.createGain();ng.gain.value=0.9;n.connect(lp);lp.connect(ng);ng.connect(g);n.start();
    const o=AC.createOscillator();o.type='sine';o.frequency.value=50;const og=AC.createGain();og.gain.value=0.05;o.connect(og);og.connect(g);o.start();return g;},0.18);
  amb.oven=bed(()=>{const g=AC.createGain();const n=AC.createBufferSource();n.buffer=brownBuf;n.loop=true;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=260;bp.Q.value=0.8;n.connect(bp);bp.connect(g);n.start();
    const o=AC.createOscillator();o.type='triangle';o.frequency.value=43;const og=AC.createGain();og.gain.value=0.25;o.connect(og);og.connect(g);o.start();return g;});
  amb.arcade=bed(()=>{const g=AC.createGain();const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2400;lp.connect(g);arcadeLoop(lp);return g;});
  // rain on the roof and the windows of the Ramirez house, and the house's quiet
  amb.rain=bed(()=>{const g=AC.createGain();const n=AC.createBufferSource();n.buffer=noiseBuf;n.loop=true;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1400;bp.Q.value=0.4;const ng=AC.createGain();ng.gain.value=0.18;n.connect(bp);bp.connect(ng);ng.connect(g);n.start();
    const r=AC.createBufferSource();r.buffer=brownBuf;r.loop=true;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=300;const rg=AC.createGain();rg.gain.value=0.7;r.connect(lp);lp.connect(rg);rg.connect(g);r.start();
    const drip=()=>{if(!AC)return;const t=now();sTone(g,t,0.05,'sine',900+Math.random()*1400,500,0.04);setTimeout(drip,120+Math.random()*500);};drip();return g;},0.55);
  amb.house=bed(()=>{const g=AC.createGain();const o=AC.createOscillator();o.type='sine';o.frequency.value=55;const og=AC.createGain();og.gain.value=0.05;o.connect(og);og.connect(g);o.start();
    const tick=()=>{if(!AC)return;const t=now();sTone(g,t,0.03,'square',2400,0,0.02);sNoise(g,t,0.02,'bandpass',3000,4,0.05);setTimeout(tick,1000);};tick();return g;});
  amb.hunt=bed(()=>{const g=AC.createGain();const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=36.7;const o2=AC.createOscillator();o2.type='sawtooth';o2.frequency.value=37.3;
    const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=95;o.connect(lp);o2.connect(lp);const lfo=AC.createOscillator();lfo.frequency.value=1.6;const lg=AC.createGain();lg.gain.value=0.5;lfo.connect(lg);
    const vca=AC.createGain();vca.gain.value=0.5;lg.connect(vca.gain);lp.connect(vca);vca.connect(g);o.start();o2.start();lfo.start();return g;},0.12);
}
/* trim: each bed's own level, so the room tone, the freezer and the hunt sit well under the score and the effects */
function bed(make,trim=1){const g=make();const t=AC.createGain();t.gain.value=trim;const out=AC.createGain();out.gain.value=0;g.connect(t);t.connect(out);out.connect(busAmb);return out;}
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
  // ---- the cold open and the house ----
  doorbell(p,t){[[659,0],[523,0.55]].forEach(([f,d])=>{sTone(p,t+d,1.4,'sine',f,0,0.28,0.005);sTone(p,t+d,0.9,'sine',f*2.01,0,0.06,0.005);});},
  buzz(p,t){for(let i=0;i<2;i++){sTone(p||busFx,(t||now())+i*0.35,0.22,'square',150,0,0.05,0.01);sNoise(p||busFx,(t||now())+i*0.35,0.22,'lowpass',260,1,0.08,0.01);}},
  ping(){if(!AC)return;const t=now();sTone(comp,t,0.25,'sine',1175,0,0.08,0.004);sTone(comp,t+0.12,0.4,'sine',1568,0,0.07,0.004);},
  garage(p,t){sNoise(p,t,3.2,'lowpass',220,0.8,0.7,0.3,140);sTone(p,t,3.0,'sawtooth',46,52,0.12,0.4);for(let i=0;i<14;i++)sNoise(p,t+0.2+i*0.2,0.05,'bandpass',1800,5,0.12);sTone(p,t+3.0,0.3,'sine',70,40,0.4);},
  card(p,t){sNoise(p,t,0.7,'bandpass',3400,7,0.16,0.05,2200);sNoise(p,t+0.75,0.5,'bandpass',2600,6,0.14,0.05,3600);sTone(p,t+1.35,0.08,'square',900,500,0.18);sNoise(p,t+1.35,0.06,'bandpass',2400,3,0.4);},
  rattle(p,t){for(let i=0;i<7;i++){sNoise(p,t+i*0.09,0.06,'bandpass',1400+Math.random()*600,4,0.32);sTone(p,t+i*0.09,0.05,'square',220,160,0.06);}},
  powerDown(){if(!AC)return;const t=now();sTone(comp,t,0.25,'square',90,40,0.5,0.002);sNoise(comp,t,0.12,'bandpass',1800,2,0.5);sTone(comp,t+0.05,1.6,'sine',120,30,0.18,0.01);},
  thud(p,t){sTone(p,t,0.3,'sine',72,32,0.9,0.002);sNoise(p,t,0.12,'lowpass',700,1,0.7,0.002);},
  clang(p,t){[420,1130,2380].forEach((f,i)=>sTone(p,t,1.0-i*0.25,'triangle',f,f*0.97,0.22/(i+1),0.001));sNoise(p,t,0.06,'highpass',3000,1,0.5,0.001);sTone(p,t,0.2,'sine',80,40,0.6,0.002);},
  hiss(p,t,dur=2){sNoise(p,t,dur,'highpass',2200,0.5,0.55,0.05);sNoise(p,t,dur,'bandpass',800,0.7,0.25,0.05);},
  chop(p,t){sNoise(p,t,0.16,'bandpass',900,2,0.8,0.002,300);sTone(p,t,0.2,'sine',95,40,0.7,0.002);sNoise(p,t+0.04,0.25,'lowpass',500,1,0.35,0.01);},
  crack(p,t){for(let i=0;i<5;i++)sNoise(p,t+i*0.018,0.03,'highpass',4200,1,0.5,0.001);sTone(p,t,0.4,'triangle',2900,2200,0.06,0.001);},
  knock(p,t){sTone(p,t,0.12,'sine',160,90,0.6,0.002);sNoise(p,t,0.05,'bandpass',1200,2,0.4,0.001);},
  slam(p,t){sNoise(p,t,0.4,'lowpass',500,1,1.0,0.002,200);sTone(p,t,0.4,'sine',60,30,0.9,0.002);sTone(p,t+0.12,0.2,'square',140,70,0.3);},
  engine(p,t){const o=AC.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(38,t);o.frequency.linearRampToValueAtTime(70,t+1.2);o.frequency.linearRampToValueAtTime(52,t+5);const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=260;
    const g=AC.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.3,t+0.4);g.gain.linearRampToValueAtTime(0.18,t+2);g.gain.linearRampToValueAtTime(0,t+6);o.connect(lp);lp.connect(g);g.connect(p);o.start(t);o.stop(t+6.2);},
  tinny(p,t,dur=6){for(let b=0;b<dur*4;b++){const tt=t+b*0.25;sNoise(p,tt,0.03,'highpass',7000,1,0.05);if(b%4===0)sTone(p,tt,0.06,'square',110,70,0.03);if(b%2===1)sTone(p,tt,0.1,'square',[523,659,784,587][(b/2|0)%4],0,0.012);}},
  crash(p,t){sNoise(p,t,0.5,'lowpass',1400,0.8,0.8,0.002,300);sTone(p,t,0.3,'sine',90,40,0.6);for(let i=0;i<4;i++)sTone(p,t+0.05+i*0.06,0.12,'triangle',900+i*200,600,0.06);},
  drag(p,t,dur=2){sNoise(p,t,dur,'bandpass',350,1.2,0.3,0.2);},
  footstepHeavy(p,t){sTone(p,t,0.2,'sine',80,45,0.45,0.004);sNoise(p,t,0.06,'lowpass',600,1,0.25);},
  thunder(){if(!AC)return;const t=now();const s=AC.createBufferSource();s.buffer=brownBuf;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=180;const g=AC.createGain();
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.9,t+0.3);g.gain.exponentialRampToValueAtTime(0.01,t+4.5);s.connect(lp);lp.connect(g);g.connect(busAmb);s.start(t);s.stop(t+4.6);},
};


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

/* ---------- recorded sound effects ----------
   Screams, gasps, bodies, bone, glass and gore are real recordings (07-sfxdata.js, cut by tools/sfx.py from Freesound
   clips, credited in README.md). Each has a few takes; smp() plays one at random, never the same take twice running,
   with a touch of pitch variation. Until they're decoded (a moment after the audio starts) the old synth sounds stand in. */
const SBUF={};let sfxReady=false;
function b64buf(b64){const bin=atob(b64);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer;}
async function sfxWarm(){if(sfxReady||!AC||typeof SFX_DATA==='undefined')return;sfxReady=true;
  for(const k in SFX_DATA){const L=[];for(const b of SFX_DATA[k]){const buf=await new Promise(res=>{try{const p=AC.decodeAudioData(b64buf(b),res,()=>res(null));if(p&&p.catch)p.catch(()=>res(null));}catch(e){res(null);}});if(buf)L.push(buf);}SBUF[k]=L;}}
function smp(dest,t,name,vol=1,rate=1,delay=0){const L=SBUF[name];if(!AC||!L||!L.length)return false;let i=(Math.random()*L.length)|0;if(L.length>1&&i===L.last)i=(i+1)%L.length;L.last=i;
  const s=AC.createBufferSource();s.buffer=L[i];s.playbackRate.value=rate*(0.95+Math.random()*0.1);const g=AC.createGain();g.gain.value=vol;s.connect(g);g.connect(dest);s.start(Math.max(t+delay,AC.currentTime));return s;}
/* a sound from the other side of the walk-in door: duller, as if through the steel and the glass */
function thru(dest,cut=2600){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=cut;f.Q.value=0.6;f.connect(dest);return f;}
Object.assign(SFX,{
  // a body hitting the floor or a table, a weapon hitting a head
  thud(p,t){if(!smp(p,t,'bodyHit',0.9)){sTone(p,t,0.3,'sine',72,32,0.9,0.002);sNoise(p,t,0.12,'lowpass',700,1,0.7,0.002);}else sTone(p,t,0.25,'sine',62,34,0.35,0.002);},
  fall(p,t){if(!smp(p,t,'bodyFall',1))SFX.thud(p,t);},
  headHit(p,t,hard){smp(p,t,'headHit',1);smp(p,t,'bodyHit',0.55,0.85);if(hard)smp(p,t,'bone',0.8,1,0.02);sTone(p,t,0.22,'sine',70,36,0.4,0.002);},
  // Manny's knuckles on the window
  knock(p,t){if(!smp(p,t,'knock',1))sTone(p,t,0.12,'sine',160,90,0.6,0.002);},
  // a face driven into the glass: the thump through the door, the window cracking
  faceSlam(p,t,k=0){smp(p,t,'glassHit',1);smp(p,t,'slamHit',0.75,0.8);smp(p,t,'glassCrack',0.6+k*0.2,1,0.015);if(k>=2)smp(p,t,'bone',0.7,1,0.03);},
  crack(p,t){if(!smp(p,t,'glassCrack',0.9))for(let i=0;i<5;i++)sNoise(p,t+i*0.018,0.03,'highpass',4200,1,0.5,0.001);},
  // the extinguisher against her head, against the glass
  clang(p,t,hard){smp(p,t,'metalHit',0.9);smp(p,t,'headHit',0.9,0.9);smp(p,t,'glassHit',0.7);if(hard)smp(p,t,'bone',0.9,1,0.02);},
  // the rocker going in
  chop(p,t){if(!smp(p,t,'chop',1)){sNoise(p,t,0.16,'bandpass',900,2,0.8,0.002,300);return;}smp(p,t,'squelch',1,0.9,0.01);if(Math.random()<0.5)smp(p,t,'bone',0.7,1,0.03);smp(p,t,'splat',0.6,1,0.06);sTone(p,t,0.2,'sine',80,38,0.4,0.002);},
  gore(p,t){smp(p,t,'squelch',1);smp(p,t,'splat',0.7,1,0.05);},
  slam(p,t){if(!smp(p,t,'doorSlam',1)){sNoise(p,t,0.4,'lowpass',500,1,1.0,0.002,200);sTone(p,t,0.4,'sine',60,30,0.9,0.002);}},
  crash(p,t){smp(p,t,'bodyFall',1);smp(p,t,'glassBreak',0.8,1,0.08);},
  shatter(p,t){smp(p,t,'glassBreak',1);},
  // voices with no words: screams, gasps
  scream(p,t,kind='F',vol=1){return smp(p,t,'scream'+kind,vol*0.75);},
  yell(p,t,vol=1){return smp(p,t,'yellM',vol*0.75);},
  gasp(p,t,a=0.6,who='F'){if(!smp(p,t,'gasp'+who,Math.min(1.2,a*1.6)))sNoise(p,t,0.4,'bandpass',1100,1.6,a,0.03,2600);},
});

/* ---------- the score: 80s horror synth for the scary parts ----------
   Detuned saw pads, a filtered bass ostinato, bell tones and toms, all synthesized. Four cues:
   'dread'  slow: a pad that never resolves, a ticking low pulse, two bells a half step apart
   'stalk'  an eighth-note bass ostinato under the pad, a tom on the one: Toni is moving
   'chase'  sixteenths, kick and snare, stabs, a screaming lead: he's seen you
   'theme'  the main title: the Pepper Toni's jingle turned minor, over the pulse (the opening credits)
   A scene sets the base cue with scoreBase(); a chase takes over while he's after you, and death or a reset stops it. */
const SCORE={cur:null,base:null,chaseT:0};
const CUES={
  dread:{bpm:56,bars:4,gain:1.25},
  stalk:{bpm:100,bars:4,gain:1.15},
  chase:{bpm:148,bars:4,gain:1.05},
  theme:{bpm:96,bars:20,loopTo:4,gain:1.85},
};
function scoreVoices(out){
  const osc=(type,f,t,dur,peak,a=0.01,rel=0.08,dest=out,det=0)=>{const v=AC.createOscillator();v.type=type;v.frequency.value=f;v.detune.value=det;const g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);
    g.gain.setTargetAtTime(0.0001,t+Math.max(a,dur),rel);v.connect(g);g.connect(dest);v.start(t);v.stop(t+Math.max(a,dur)+rel*7);return v;};
  return {
    osc,
    // two detuned saws per note through one slow lowpass: the pad
    pad(notes,t,dur,amp,cut=900){const f=AC.createBiquadFilter();f.type='lowpass';f.Q.value=1.2;f.frequency.setValueAtTime(cut*0.6,t);f.frequency.linearRampToValueAtTime(cut,t+dur*0.6);f.connect(out);
      for(const m of notes){osc('sawtooth',mhz(m),t,dur,amp,Math.min(1.4,dur*0.4),0.7,f,-9);osc('sawtooth',mhz(m),t,dur,amp,Math.min(1.4,dur*0.4),0.7,f,9);}},
    // the ostinato: saw plus a sub, a filter that snaps shut
    bass(m,t,dur,amp,open=1100){const f=AC.createBiquadFilter();f.type='lowpass';f.Q.value=6;f.frequency.setValueAtTime(open,t);f.frequency.exponentialRampToValueAtTime(140,t+Math.max(0.06,dur*0.9));f.connect(out);
      osc('sawtooth',mhz(m),t,dur*0.9,amp,0.004,0.03,f);osc('square',mhz(m-12),t,dur*0.9,amp*0.5,0.004,0.03,f);},
    // a bell, like a detuned electric piano struck hard
    bell(m,t,amp,len=2.4){const f=mhz(m);osc('sine',f,t,0.01,amp,0.003,len/3);osc('sine',f*2.008,t,0.01,amp*0.35,0.003,len/5);osc('sine',f*3.97,t,0.01,amp*0.12,0.003,len/9);},
    lead(m,t,dur,amp){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=2600;f.connect(out);const v=osc('square',mhz(m),t,dur,amp,0.02,0.15,f);const lfo=AC.createOscillator();lfo.frequency.value=5.5;const lg=AC.createGain();lg.gain.value=18;lfo.connect(lg);lg.connect(v.detune);lfo.start(t);lfo.stop(t+dur+1);
      osc('sawtooth',mhz(m),t,dur,amp*0.5,0.02,0.15,f,7);},
    tom(t,f0=110,amp=0.5){const v=AC.createOscillator();v.frequency.setValueAtTime(f0,t);v.frequency.exponentialRampToValueAtTime(f0*0.45,t+0.35);const g=AC.createGain();g.gain.setValueAtTime(amp,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.5);v.connect(g);g.connect(out);v.start(t);v.stop(t+0.55);},
    kick(t,amp=0.6){const v=AC.createOscillator();v.frequency.setValueAtTime(150,t);v.frequency.exponentialRampToValueAtTime(40,t+0.12);const g=AC.createGain();g.gain.setValueAtTime(amp,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.28);v.connect(g);g.connect(out);v.start(t);v.stop(t+0.3);},
    snare(t,amp=0.3){sNoise(out,t,0.16,'bandpass',1700,0.8,amp,0.002);osc('triangle',180,t,0.05,amp*0.4,0.002,0.03);},
    hat(t,amp=0.05){sNoise(out,t,0.03,'highpass',7500,0.7,amp,0.001);},
    tick(t,amp=0.08){sNoise(out,t,0.02,'bandpass',3200,6,amp,0.001);},
    swell(t,dur,amp=0.12){const s=AC.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=AC.createBiquadFilter();f.type='bandpass';f.Q.value=2;f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(5000,t+dur);
      const g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(amp,t+dur);g.gain.linearRampToValueAtTime(0.0001,t+dur+0.05);s.connect(f);f.connect(g);g.connect(out);s.start(t);s.stop(t+dur+0.1);},
    boom(t,amp=0.9){const v=AC.createOscillator();v.frequency.setValueAtTime(70,t);v.frequency.exponentialRampToValueAtTime(28,t+1.6);const g=AC.createGain();g.gain.setValueAtTime(amp,t);g.gain.exponentialRampToValueAtTime(0.0001,t+2.4);v.connect(g);g.connect(out);v.start(t);v.stop(t+2.5);
      sNoise(out,t,1.8,'lowpass',900,0.7,amp*0.35,0.003);},
  };}
/* one bar of a cue, scheduled at t0 */
function scoreBar(name,V,b,t0,spb){const e8=spb/2,s16=spb/4;
  if(name==='dread'){const ch=[[57,60,64],[58,62,65],[57,60,64],[56,59,62]][b%4];V.pad(ch,t0,spb*4,0.035,700);V.osc('sine',mhz(ch[0]-24),t0,spb*4,0.12,0.8,0.8);
    for(let i=0;i<8;i++){V.bass(33,t0+i*e8,e8*0.5,i%2?0.05:0.08,420);V.tick(t0+i*e8+e8*0.5,0.025);}
    if(b%2===0)V.bell(b%4===0?76:77,t0+spb*0.02,0.09,3.2);if(b%4===3)V.swell(t0+spb*2,spb*2,0.06);return;}
  if(name==='stalk'){const ost=b%2?[33,33,45,33,31,31,43,32]:[33,33,45,33,33,33,46,33];ost.forEach((m,i)=>V.bass(m,t0+i*e8,e8*0.85,0.16,b%4===3?1500:1000));
    V.pad(b%4<2?[57,60,64]:[53,57,60],t0,spb*4,0.022,800);V.tom(t0,95,0.45);V.tom(t0+spb*2,95,0.3);for(let i=0;i<8;i++)V.hat(t0+i*e8,i%2?0.035:0.02);
    if(b%4===0){[[76,0],[77,1],[76,2],[72,3]].forEach(([m,q])=>V.bell(m,t0+q*spb,0.07,1.6));}if(b%4===2)V.bell(71,t0,0.06,3);return;}
  if(name==='chase'){const ost=[45,45,57,45,45,45,48,45,45,45,57,45,51,50,48,47];ost.forEach((m,i)=>V.bass(b%4===3&&i>=12?m+2:m,t0+i*s16,s16*0.9,0.15,1600));
    for(let q=0;q<4;q++){V.kick(t0+q*spb,0.5);if(q%2)V.snare(t0+q*spb,0.26);for(let k=0;k<4;k++)V.hat(t0+q*spb+k*s16,k%2?0.04:0.025);}
    for(let q=0;q<4;q++)[69,72,76].forEach(m=>V.osc('square',mhz(m),t0+q*spb+e8,e8*0.35,0.018,0.003,0.03));
    if(b%2===0)V.lead(b%4===0?88:89,t0,spb*1.8,0.035);if(b%4===0)sNoise(V.out,t0,1.2,'highpass',5000,0.5,0.1,0.003);return;}
  if(name==='theme'){// C minor: Cm, Ab, Fm, G; the jingle's tune, turned minor, enters at bar 4
    const CH=[[48,51,55],[44,48,51],[41,44,48],[43,47,50]],ch=CH[b%4];const root=[36,32,29,31][b%4];
    const loud=b>=16?1.25:b>=12?1.1:1;
    for(let i=0;i<8;i++){V.bass(i%2?root+12:root,t0+i*e8,e8*0.8,0.13*loud,b>=12?1500:900);}
    V.pad(ch.map(m=>m+12),t0,spb*4,b<2?0.016:0.028,b>=12?1300:800);
    if(b>=12){V.tom(t0,90,0.45);V.tom(t0+spb*2,90,0.35);V.kick(t0,0.45);for(let i=0;i<8;i++)V.hat(t0+i*e8,0.03);if(b%4===3)for(let k=0;k<4;k++)V.tom(t0+spb*3+k*s16,150-k*15,0.3);}
    if(b>=16){const AR=[[72,75,79,84],[68,72,75,80],[65,68,72,77],[67,71,74,79]][b%4];for(let i=0;i<16;i++)V.osc('square',mhz(AR[i%4]),t0+i*s16,s16*0.6,0.014,0.002,0.02);}
    const MEL=['C5-D#5-G5-D#5-','G#5-G5D#5-C5--','F5-G#5-C6-G#5-','G5---D5-D#5F5','D#5-G5-C6-G5-','G#5G5D#5-C5-D#5-','F5-D#5-D5-C5-','D5---G4---'];
    if(b>=4){const mb=MEL[(b-4)%8],up=b>=16?12:0;for(const [k,n,len] of parseBar(mb))V.bell(midi(n)+up,t0+k*e8,b>=12?0.11:0.09,Math.max(1.2,len*e8*2));}
    if(b===3)V.swell(t0+spb*2,spb*2,0.08);if(b===12||b===16)sNoise(V.out,t0,1.6,'highpass',4500,0.5,0.12,0.003);}}
function scoreCue(name){if(!AC)return;if(SCORE.cur&&SCORE.cur.name===name)return;scoreStop(1.4);const C=CUES[name];if(!C)return;
  const out=AC.createGain();out.gain.value=0;out.gain.setTargetAtTime(C.gain,AC.currentTime,0.6);out.connect(busMus);const V=scoreVoices(out);V.out=out;
  const st={name,alive:true,out};SCORE.cur=st;const spb=60/C.bpm,bar=spb*4;let b=0,t=now()+0.1;
  const tick=()=>{if(!st.alive)return;while(t<AC.currentTime+0.7){scoreBar(name,V,b,t,spb);t+=bar;b++;if(b>=C.bars)b=C.loopTo||0;}st.timer=setTimeout(tick,150);};tick();
  st.stop=(fade)=>{st.alive=false;clearTimeout(st.timer);out.gain.cancelScheduledValues(AC.currentTime);out.gain.setTargetAtTime(0,AC.currentTime,fade/3);setTimeout(()=>{try{out.disconnect();}catch(e){}},fade*1000+3000);};}
function scoreStop(fade=1.4){if(SCORE.cur){SCORE.cur.stop(fade);SCORE.cur=null;}}
function scoreBase(name,now){SCORE.base=name||null;if(now&&AC){if(name)scoreCue(name);else scoreStop(0.15);}}
/* one hit for the end of the title: a boom under everything */
function scoreHit(amp=0.9){if(!AC)return;const g=AC.createGain();g.gain.value=1;g.connect(busMus);scoreVoices(g).boom(now(),amp);setTimeout(()=>{try{g.disconnect();}catch(e){}},4000);}
/* each frame: the base cue, or the chase while he's after you (it lingers a few seconds after he loses you) */
function stepScore(dt){if(!AC)return;let want=SCORE.base;const after=TONI.state==='chase'||TONI.state==='aim';if(after)SCORE.chaseT=5;else SCORE.chaseT=Math.max(0,SCORE.chaseT-dt);
  if(want&&SCORE.chaseT>0)want='chase';if(G.mode==='dead'||G.mode==='title')want=null;
  const cur=SCORE.cur&&SCORE.cur.name;if(cur!==want){if(want)scoreCue(want);else if(cur)scoreStop(G.mode==='dead'?0.1:1.6);}}

/* the arcade cabinets' attract modes, heard through the wall */
function arcadeLoop(dest){const step=()=>{if(!AC)return;const t=now();const base=[262,330,392,523][(Math.random()*4)|0];
  for(let i=0;i<6;i++){if(Math.random()<0.7)sTone(dest,t+i*0.11,0.08,Math.random()<0.5?'square':'triangle',base*[1,1.5,2,1.25][(Math.random()*4)|0],0,0.05);}
  setTimeout(step,900+Math.random()*1600);};step();}
