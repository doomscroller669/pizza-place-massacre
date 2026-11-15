/* ============================================================
   TONI'S VOICE. He never speaks: he types, and his phone reads it out in Pepper Toni's own voice, the bouncy
   cartoon mascot from the commercials and the training tapes. Every line is pre-recorded (tools/voices.py, as 'toni')
   and played through a little phone speaker at his position, or the PA when it's over the speakers.
   A line with no recording falls back to the device's text-to-speech (window.AndroidTTS on Android,
   speechSynthesis in a browser); with neither, a synthetic chirp so there is still a sound to dread.
   Every line is preceded by the tapping. Speakers lines get the PA chime first.
   ============================================================ */
const EMOJI={'👍':'thumbs up','😠':'angry face','🍕':'pizza','⭐':'star','🙂':'slightly smiling face','😊':'smiling face'};
function spokenOf(t){let s=t;for(const k in EMOJI)s=s.split(k).join(' '+EMOJI[k]+' ');s=s.replace(/\$2\b/g,'two dollars').replace(/\$(\d+)/g,'$1 dollars');return s.replace(/\s+/g,' ').trim();}
const VOICE={busy:Promise.resolve(),voice:null,id:0,pending:{}};
function pickVoice(){try{const vs=speechSynthesis.getVoices();if(!vs.length)return;const en=vs.filter(v=>/^en[-_]US/i.test(v.lang));
  VOICE.voice=en.find(v=>/Google US English/i.test(v.name))||en.find(v=>/Samantha|Zira|Aria|Jenny/i.test(v.name))||en.find(v=>v.default)||en[0]||vs[0];}catch(e){}}
try{if(window.speechSynthesis){pickVoice();speechSynthesis.onvoiceschanged=pickVoice;}}catch(e){}
window.__ttsEvent=(kind,id)=>{const p=VOICE.pending[id];if(!p)return;if(kind==='start')p.started=true;if(kind==='done'){delete VOICE.pending[id];p.res();}};
function hasNativeTTS(){try{return !!(window.AndroidTTS&&window.AndroidTTS.ready());}catch(e){return false;}}
/* where the phone is, relative to the listener */
function voiceSpace(pos){if(!pos)return {vol:1,pan:0};const dx=pos.x-camera.position.x,dz=pos.z-camera.position.z,d=Math.hypot(dx,dz);const rx=Math.cos(camera.rotation.y),rz=-Math.sin(camera.rotation.y);
  const pan=d<0.5?0:clamp((dx*rx+dz*rz)/d,-1,1)*0.85;let vol=clamp(2.2/(1+d*0.32),0.12,1);if(groupAt(pos.x,pos.z)!==groupAt(camera.position.x,camera.position.z))vol*=0.55;return {vol,pan};}
/* the recorded mascot voice through a cheap speaker: 'phone' (positional), 'pa' (the ceiling speakers) or 'tape' (the VHS) */
const TONI_VO={src:null};
function toniChain(channel,pos,vol){const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=channel==='pa'?240:channel==='tape'?160:320;
  const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=channel==='pa'?4300:channel==='tape'?3600:5200;
  const pk=AC.createBiquadFilter();pk.type='peaking';pk.frequency.value=channel==='tape'?1200:1900;pk.Q.value=0.9;pk.gain.value=channel==='tape'?3:5;
  const sh=AC.createWaveShaper();const n=1024,c=new Float32Array(n),k=channel==='pa'?3.2:2.2;for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(k*x)/k;}sh.curve=c;
  // the shaper has unity gain at low level (it only crunches the peaks); these gains put Toni level with the family, a touch under
  const g=AC.createGain();g.gain.value=vol*(channel==='pa'?1.15:channel==='tape'?1.0:1.1);hp.connect(pk);pk.connect(sh);sh.connect(lp);lp.connect(g);
  let out=g;if(channel==='phone'&&pos){const p=mkPanner(pos.x,1.45,pos.z,2.4);p.rolloffFactor=0.9;g.connect(p);out=p;}
  out.connect(comp);const v=AC.createGain();v.gain.value=channel==='pa'?0.42:channel==='tape'?0.08:0.2;out.connect(v);v.connect(verb);return hp;}
async function toniPlay(text,pos,channel,vol=1){if(!AC||!hasVO('toni',text))return 0;const b=await voDecode(voKey('toni',text));if(!b)return 0;toniHush();
  const s=AC.createBufferSource();s.buffer=b;s.connect(toniChain(channel,pos,vol*voiceVol));s.start(now());TONI_VO.src=s;s.onended=()=>{if(TONI_VO.src===s)TONI_VO.src=null;};return b.duration;}
function toniHush(){const s=TONI_VO.src;TONI_VO.src=null;if(s){try{s.stop();}catch(e){}}}
function speakNow(text,pos,channel){const spoken=spokenOf(text);const sp=channel==='pa'?{vol:1,pan:0}:voiceSpace(pos);const vol=sp.vol*voiceVol;
  const est=0.6+spoken.length*0.068;
  return new Promise(async res=>{let done=false;const fin=()=>{if(done)return;done=true;res();};
    if(voiceVol<=0.01){gwait(est).then(fin);return;}
    const rec=await toniPlay(text,pos,channel);if(rec){gwait(rec+0.1).then(fin);return;}
    if(hasNativeTTS()){const id='t'+(++VOICE.id);VOICE.pending[id]={res:fin};try{window.AndroidTTS.speak(spoken,id,vol,sp.pan,0.92,0.82);}catch(e){fin();}
      setTimeout(fin,(est+4)*1000);return;}
    if(window.speechSynthesis&&window.SpeechSynthesisUtterance){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(spoken);if(VOICE.voice)u.voice=VOICE.voice;u.rate=0.92;u.pitch=0.75;u.volume=clamp(vol,0,1);
        u.onend=fin;u.onerror=fin;speechSynthesis.speak(u);setTimeout(fin,(est+4)*1000);return;}catch(e){}}
    chirp(spoken,pos,channel);gwait(est).then(fin);});}
/* no TTS at all: a flat chirp per syllable */
function chirp(text,pos,channel){if(!AC)return;const dest=pos&&channel!=='pa'?mkPanner(pos.x,1.5,pos.z,2):busFx;let t=now()+0.02;const n=Math.max(2,Math.round(text.length/3));
  for(let i=0;i<n;i++){sTone(dest,t,0.07,'square',520+((i*7)%5)*14,0,0.035);t+=0.11;}}
function taps(dur,pos,channel){if(!AC)return;const dest=channel==='pa'?busFx:mkPanner(pos?pos.x:camera.position.x,1.3,pos?pos.z:camera.position.z,1.6);let t=now()+0.05;const end=t+dur;
  while(t<end){SFX.tap(dest,t);t+=0.07+Math.random()*0.11;if(Math.random()<0.12)t+=0.25;}}
/* the bubble on screen */
function bubble(state,text,channel){if(channel!=='pa'&&channel!=='app'&&typeof phoneScreen==='function')phoneScreen(state,text);const ph=$('phone');ph.classList.toggle('pa',channel==='pa');
  if(state==='off'){ph.hidden=true;ph.innerHTML='';return;}ph.hidden=false;
  const from=channel==='pa'?'Speakers · Toni':channel==='app'?'Pepper Toni’s app':'Toni';
  ph.innerHTML=`<div class="from">${from}</div><div class="bub">${state==='typing'?'<span class="dots" aria-label="typing"><i></i><i></i><i></i></span>':escapeHTML(text)}</div>`;}
function escapeHTML(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
/* toniSay(text, {pa, at:[x,z] | character, quick}) — queued, so lines never overlap */
function toniSay(text,o={}){const job=VOICE.busy.then(async()=>{const channel=o.pa?'pa':'phone';const T=CHARS.toni;
    const pos=o.at?{x:o.at[0],z:o.at[1]}:(T&&T.root.visible?{x:T.x,z:T.z}:null);
    if(channel==='pa'){SFX.chime();SFX.feedback();await gwait(1.3);}
    const typeDur=o.quick?0.5:clamp(0.7+text.length*0.03,1.0,2.4);bubble('typing','',channel);if(T&&T.root.visible&&channel!=='pa')T.typing=true;
    taps(typeDur,pos,channel);await gwait(typeDur+0.15);if(T)T.typing=false;
    bubble('text',text,channel);await speakNow(text,pos,channel);await gwait(0.6);bubble('off');});
  VOICE.busy=job.catch(()=>{});return job;}
function hushToni(){toniHush();try{if(window.AndroidTTS)window.AndroidTTS.stop();}catch(e){}try{if(window.speechSynthesis)speechSynthesis.cancel();}catch(e){}}
