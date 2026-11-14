/* ============================================================
   THE CAST'S VOICES. Every line the family, Lucia and Manny say is pre-recorded (tools/voices.py renders them with
   a local neural voice and embeds them as VO_DATA). Toni is the only one left on the device's text-to-speech:
   the flat phone voice stays his alone.
   ============================================================ */
const VO={buf:{},src:null,gain:null,queue:null,ready:false};
function voKey(who,text){let h=0x811c9dc5;const s=who+'|'+text;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return h.toString(16).padStart(8,'0');}
function voDecode(key){if(VO.buf[key])return Promise.resolve(VO.buf[key]);if(!AC||typeof VO_DATA==='undefined'||!VO_DATA[key])return Promise.resolve(null);
  const b64=VO_DATA[key];const bin=atob(b64);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  return new Promise(res=>{try{const p=AC.decodeAudioData(u.buffer,b=>{VO.buf[key]=b;res(b);},()=>res(null));if(p&&p.catch)p.catch(()=>res(null));}catch(e){res(null);}});}
/* decode everything quietly after the audio wakes up, a few at a time */
async function voWarm(){if(VO.ready||!AC||typeof VO_DATA==='undefined')return;VO.ready=true;const keys=Object.keys(VO_DATA);for(let i=0;i<keys.length;i++){await voDecode(keys[i]);if(i%4===3)await new Promise(r=>setTimeout(r,30));}}
function hasVO(who,text){return typeof VO_DATA!=='undefined'&&!!VO_DATA[voKey(who,text)];}
/* play a line; resolves with its length in seconds (0 when there's no recording) */
async function voPlay(who,text,pos){if(!AC)return 0;const b=await voDecode(voKey(who,text));if(!b)return 0;voStop();
  if(!VO.gain){VO.gain=AC.createGain();VO.gain.gain.value=1.15;VO.gain.connect(comp);const v=AC.createGain();v.gain.value=0.18;VO.gain.connect(v);v.connect(verb);}
  const s=AC.createBufferSource();s.buffer=b;let out=VO.gain;
  if(pos){const p=AC.createPanner();p.panningModel='equalpower';p.distanceModel='inverse';p.refDistance=3;p.rolloffFactor=0.6;if(p.positionX){p.positionX.value=pos.x;p.positionY.value=pos.y;p.positionZ.value=pos.z;}else p.setPosition(pos.x,pos.y,pos.z);p.connect(VO.gain);out=p;}
  const g=AC.createGain();g.gain.value=1;s.connect(g);g.connect(out);s.start(now());VO.src={s,g};s.onended=()=>{if(VO.src&&VO.src.s===s)VO.src=null;};return b.duration;}
function voStop(fade=0.06){const v=VO.src;if(!v)return;VO.src=null;try{v.g.gain.setTargetAtTime(0,AC.currentTime,fade/3);v.s.stop(AC.currentTime+fade);}catch(e){}}
