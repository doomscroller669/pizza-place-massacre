/* ============================================================
   THE PIZZA: ingredients Manny carries, the hands-on prep minigame, the conveyor oven and the order check.
   ============================================================ */
const TOPS={pepperoni:{n:'Pepperoni',c:'#a3241a'},mushrooms:{n:'Mushrooms',c:'#d8c8a6'},olives:{n:'Black olives',c:'#1a1714'},onions:{n:'Onions',c:'#efe6f0'}};
const PIZZA={have:{},cur:null,held:null,
  carry(){const out=[];const h=this.have;if(h.dough)out.push('dough');if(h.sauce)out.push('sauce');if(h.cheese)out.push('mozzarella');for(const k in TOPS)if(h[k])out.push(TOPS[k].n.toLowerCase());
    if(this.held)out.push(this.held==='raw'?'raw pizza':this.held==='baked'?'hot pizza':'sliced pizza');return out;},
  reset(){this.have={};this.cur=null;this.held=null;}};
function newPie(){return {r:34,drag:0,sauce:new Uint8Array(32*32),sauceDots:[],cheese:new Uint8Array(32*32),shreds:[],tops:[],finish:null,bake:0,cut:false};}
/* ---------- drawing ---------- */
function drawPizza(g,pz,S=240){const cx=S/2,cy=S/2,k=S/240,r=pz.r*k;const bake=pz.bake||0;
  g.save();
  // dough with a lumpy edge
  g.fillStyle=bake>0.5?'#c98a3c':'#e8d3a8';g.beginPath();for(let i=0;i<=40;i++){const a=i/40*TAU,w=r*(1+Math.sin(a*7+1)*0.02+Math.sin(a*3)*0.015);i?g.lineTo(cx+Math.cos(a)*w,cy+Math.sin(a)*w):g.moveTo(cx+Math.cos(a)*w,cy+Math.sin(a)*w);}g.fill();
  if(bake>0){g.fillStyle=`rgba(150,80,20,${bake*0.35})`;g.beginPath();g.arc(cx,cy,r,0,TAU);g.fill();}
  // sauce, then cheese, clipped inside the crust
  g.save();g.beginPath();g.arc(cx,cy,r*0.86,0,TAU);g.clip();
  g.fillStyle=bake>0.5?'#9a2614':'#c8321f';for(const [x,y] of pz.sauceDots){g.beginPath();g.arc(cx+x*k,cy+y*k,13*k,0,TAU);g.fill();}
  for(const s of pz.shreds){g.fillStyle=bake>0.5?(s[3]?'#f2c75a':'#e8a838'):(s[3]?'#fff6d8':'#f4e6b0');g.save();g.translate(cx+s[0]*k,cy+s[1]*k);g.rotate(s[2]);g.fillRect(-4*k,-1.2*k,8*k,2.4*k);g.restore();}
  if(bake>0.5&&pz.shreds.length>40){g.fillStyle='rgba(255,220,120,.25)';g.beginPath();g.arc(cx,cy,r*0.8,0,TAU);g.fill();speck(g,S,S,30,['rgba(170,90,20,.5)'],3*k,mulberry(4));}
  g.restore();
  for(const t of pz.tops){const x=cx+t[1]*k,y=cy+t[2]*k;g.save();g.translate(x,y);g.rotate(t[3]||0);
    if(t[0]==='pepperoni'){g.fillStyle=bake>0.5?'#7a1610':'#a3241a';g.beginPath();g.arc(0,0,7.5*k,0,TAU);g.fill();g.fillStyle='rgba(60,5,5,.6)';g.fillRect(-3*k,-2*k,2*k,2*k);g.fillRect(2*k,1*k,2*k,2*k);}
    else if(t[0]==='mushrooms'){g.fillStyle='#cdb896';g.beginPath();g.arc(0,-1*k,6*k,Math.PI,TAU);g.fill();g.fillRect(-2*k,-1*k,4*k,6*k);}
    else if(t[0]==='olives'){g.strokeStyle='#1a1714';g.lineWidth=2.5*k;g.beginPath();g.arc(0,0,4*k,0,TAU);g.stroke();}
    else if(t[0]==='onions'){g.strokeStyle='#efe6f0';g.lineWidth=2*k;g.beginPath();g.arc(0,0,6*k,0.3,2.6);g.stroke();}
    g.restore();}
  // the crust finish
  if(pz.finish==='seeds'){g.fillStyle='#f6eed2';const rr4=mulberry(17);for(let i=0;i<110;i++){const a=rr4()*TAU,w=r*(0.88+rr4()*0.1);g.save();g.translate(cx+Math.cos(a)*w,cy+Math.sin(a)*w);g.rotate(a);g.fillRect(-1.6*k,-0.8*k,3.2*k,1.6*k);g.restore();}}
  if(pz.finish==='butter'){g.strokeStyle='rgba(255,226,120,.55)';g.lineWidth=r*0.1;g.beginPath();g.arc(cx,cy,r*0.93,0,TAU);g.stroke();}
  if(pz.cut){g.strokeStyle='rgba(60,25,8,.75)';g.lineWidth=1.4*k;for(let i=0;i<4;i++){const a=i/4*Math.PI+0.2;g.beginPath();g.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);g.lineTo(cx-Math.cos(a)*r,cy-Math.sin(a)*r);g.stroke();}}
  g.restore();}
/* the 3D pizza: a disc whose top is the same drawing */
const pieCv=canvas(64,64),pieTex=texFrom(pieCv,false);pieTex.magFilter=THREE.NearestFilter;
function pieMesh(){const g=new THREE.Group();const top=new THREE.Mesh(new THREE.CircleGeometry(0.2,16).rotateX(-Math.PI/2),psx(new THREE.MeshBasicMaterial({map:pieTex,transparent:true,alphaTest:0.4})));top.position.y=0.022;
  const pan=new THREE.Mesh(new THREE.CylinderGeometry(0.215,0.205,0.02,16),psx(new THREE.MeshBasicMaterial({color:0x8a9094})));pan.position.y=0.01;g.add(pan,top);g.userData.mats=[top.material,pan.material];return g;}
function repaintPie(){if(!PIZZA.cur)return;const g=pieCv.getContext('2d');g.clearRect(0,0,64,64);g.save();g.scale(64/240,64/240);const f=114/Math.max(60,PIZZA.cur.r);g.translate(120,120);g.scale(f,f);g.translate(-120,-120);drawPizza(g,PIZZA.cur,240);g.restore();pieTex.needsUpdate=true;}
const PIE={hand:pieMesh(),world:pieMesh(),table:pieMesh()};
PIE.hand.position.set(0.0,-0.3,-0.52);PIE.hand.rotation.x=0.62;PIE.hand.visible=false;held.add(PIE.hand);
PIE.world.visible=false;scene.add(PIE.world);PIE.table.visible=false;scene.add(PIE.table);
function lightPie(m,x,y,z){const c=tintAt(x,y,z,1.1);m.userData.mats.forEach(mm=>mm.color.copy(c));}

/* ---------- the prep minigame ---------- */
const COOK={step:0,tool:null,down:false,last:null,res:null,
  steps:['Dough','Sauce','Cheese','Toppings','Crust'],
  how:['Drag across the dough to stretch it out to the ring.','Drag the ladle in circles to spread sauce. Leave a rim of crust.','Drag to scatter the mozzarella over the sauce.','Pick a topping, then tap the pizza to place it. Tap Undo to take the last one off.','Finish the crust, then slide it into the oven.'],
  open(){return new Promise(res=>{this.res=res;if(!PIZZA.cur)PIZZA.cur=newPie();this.step=PIZZA.cur.step||0;$('cook').hidden=false;setMode('ui');this.ui();this.draw();});},
  close(done){$('cook').hidden=true;setMode('play');PIZZA.cur.step=this.step;const r=this.res;this.res=null;repaintPie();if(r)r(!!done);},
  meter(){const pz=PIZZA.cur;if(this.step===0)return clamp((pz.r-34)/(94-34),0,1);if(this.step===1)return cover(pz.sauce,pz)/0.8;if(this.step===2)return cover(pz.cheese,pz)/0.72;if(this.step===3)return 1;return pz.finish?1:0;},
  ui(){const s=this.step,pz=PIZZA.cur;$('cookStep').textContent=`Step ${s+1} of 5 · ${this.steps[s]}`;$('cookHow').textContent=this.how[s];
    const tools=$('cookTools');tools.innerHTML='';const add=(id,txt,fn,sel)=>{const b=document.createElement('button');b.className='btn'+(sel?' sel':'');b.type='button';b.textContent=txt;b.addEventListener('click',()=>{SFX.ui();fn();});tools.append(b);};
    if(s===3){let any=false;for(const k in TOPS){if(!PIZZA.have[k])continue;any=true;add(k,TOPS[k].n,()=>{this.tool=k;this.ui();},this.tool===k);}
      if(!any)$('cookHow').textContent='You didn’t bring any toppings. Tap Next for a plain cheese pizza.';else if(!this.tool||!PIZZA.have[this.tool])this.tool=Object.keys(TOPS).find(k=>PIZZA.have[k]);
      if(pz.tops.length)add('undo','Undo',()=>{pz.tops.pop();this.draw();this.ui();});}
    if(s===4){add('seeds','Toni’s seeds',()=>{pz.finish='seeds';SFX.shake();this.draw();this.ui();},pz.finish==='seeds');add('butter','Garlic butter',()=>{pz.finish='butter';SFX.sauce();this.draw();this.ui();},pz.finish==='butter');add('plain','Plain crust',()=>{pz.finish='plain';this.draw();this.ui();},pz.finish==='plain');}
    $('cookNext').textContent=s===4?'Into the oven':'Next';this.refresh();},
  refresh(){const m=clamp(this.meter(),0,1);$('cookMeter').style.width=(m*100)+'%';$('cookNext').disabled=m<1;},
  next(){if($('cookNext').disabled)return;if(this.step<4){this.step++;this.tool=null;this.ui();this.draw();}else this.close(true);},
  draw(){const c=$('cookCv'),g=c.getContext('2d');g.fillStyle='#5f6669';g.fillRect(0,0,240,240);for(let y=0;y<240;y+=2){g.fillStyle=`rgba(255,255,255,${(y*7%11)/180})`;g.fillRect(0,y,240,1);}
    g.fillStyle='rgba(240,230,200,.18)';g.beginPath();g.arc(120,120,112,0,TAU);g.fill();
    if(this.step===0){g.strokeStyle='rgba(240,185,58,.8)';g.setLineDash([6,5]);g.lineWidth=2;g.beginPath();g.arc(120,120,94,0,TAU);g.stroke();g.setLineDash([]);}
    drawPizza(g,PIZZA.cur,240);this.refresh();},
  point(e){const c=$('cookCv'),r=c.getBoundingClientRect();const s=Math.min(r.width,r.height);const ox=r.left+(r.width-s)/2,oy=r.top+(r.height-s)/2;return [((e.clientX-ox)/s)*240-120,((e.clientY-oy)/s)*240-120];},
  down_(e){e.preventDefault();this.down=true;const p=this.point(e);this.last=p;if(this.step===3)this.place(p);else this.paint(p,p);try{$('cookCv').setPointerCapture(e.pointerId);}catch(err){}},
  move_(e){if(!this.down)return;const p=this.point(e);this.paint(this.last,p);this.last=p;},
  paint(a,b){const pz=PIZZA.cur;const d=Math.hypot(b[0]-a[0],b[1]-a[1]);
    if(this.step===0){pz.drag+=d;const nr=clamp(34+pz.drag*0.09,34,94);if(Math.floor(nr/8)!==Math.floor(pz.r/8))SFX.stretch();pz.r=nr;}
    else if(this.step===1||this.step===2){const n=Math.max(1,Math.ceil(d/5));for(let i=0;i<=n;i++){const x=lerp(a[0],b[0],i/n),y=lerp(a[1],b[1],i/n);if(Math.hypot(x,y)>pz.r*0.9)continue;
        if(this.step===1){pz.sauceDots.push([x,y]);stamp(pz.sauce,pz,x,y,13);if(R()<0.05)SFX.sauce();}
        else{for(let k=0;k<2;k++){const sx=x+(R()-0.5)*22,sy=y+(R()-0.5)*22;if(Math.hypot(sx,sy)<pz.r*0.84)pz.shreds.push([sx,sy,R()*3,R()<0.3]);}stamp(pz.cheese,pz,x,y,11);if(R()<0.06)SFX.cheese();}}}
    this.draw();},
  place(p){const pz=PIZZA.cur;if(!this.tool||!PIZZA.have[this.tool])return;if(Math.hypot(p[0],p[1])>pz.r*0.8)return;pz.tops.push([this.tool,p[0],p[1],R()*3]);SFX.plop();this.draw();this.ui();},
  key(e){if(e.code==='Escape'){this.close(false);}else if(e.code==='Enter'||e.code==='Space'){e.preventDefault();this.next();}}};
function stamp(grid,pz,x,y,rad){const S=32,cell=240/S;for(let j=0;j<S;j++)for(let i=0;i<S;i++){const cx=(i+0.5)*cell-120,cy=(j+0.5)*cell-120;if(Math.hypot(cx-x,cy-y)<rad)grid[j*S+i]=1;}}
function cover(grid,pz){const S=32,cell=240/S;let tot=0,hit=0;for(let j=0;j<S;j++)for(let i=0;i<S;i++){const cx=(i+0.5)*cell-120,cy=(j+0.5)*cell-120;if(Math.hypot(cx,cy)<pz.r*0.8){tot++;if(grid[j*S+i])hit++;}}return tot?hit/tot:0;}
{const c=$('cookCv');c.addEventListener('pointerdown',e=>COOK.down_(e));c.addEventListener('pointermove',e=>COOK.move_(e));const up=()=>{COOK.down=false;};c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);}
$('cookNext').addEventListener('click',()=>{SFX.ui();COOK.next();});$('cookBack').addEventListener('click',()=>{SFX.ui();COOK.close(false);});

/* ---------- the oven ---------- */
const OVEN={on:false,t:0,dur:40,done:false};
function ovenLoad(){OVEN.on=true;OVEN.t=0;OVEN.done=false;PIZZA.held=null;PIE.hand.visible=false;PIE.world.visible=true;setAmb('oven',0.35,1);setCarry();}
function stepOven(dt){if(!OVEN.on&&!OVEN.done)return;const [x0,,z]=PT.ovenIn,x1=PT.ovenOut[0];
  if(OVEN.on){OVEN.t+=dt;const k=clamp(OVEN.t/OVEN.dur,0,1);PIZZA.cur.bake=smooth(clamp((k-0.25)/0.6,0,1));if(((OVEN.t*4)|0)!==(((OVEN.t-dt)*4)|0))repaintPie();
    PIE.world.position.set(lerp(x0,x1,k),0.955,z);if(k>=1){OVEN.on=false;OVEN.done=true;setAmb('oven',0.12,2);SFX.bell();at3(x1,1,z,(p,t)=>{sTone(p,t,0.4,'sine',1400,0,0.2);},3);ovenDone();}}
  lightPie(PIE.world,PIE.world.position.x,1,PIE.world.position.z);}

/* ---------- checking an order against what came out of the oven ---------- */
function checkPie(order,pz){const counts={};for(const t of pz.tops)counts[t[0]]=(counts[t[0]]||0)+1;
  if(order.allergy&&pz.finish===order.allergy)return {ok:false,kind:'allergy'};
  for(const k in counts)if(!order.tops[k])return {ok:false,kind:'wrong',why:'extra '+k};
  for(const k in order.tops)if((counts[k]||0)<order.tops[k])return {ok:false,kind:'wrong',why:'missing '+k};
  return {ok:true};}
