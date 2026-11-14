/* ============================================================
   TEXTURES: every surface of Pepper Toni's, painted at load.
   Each entry is [texture, meters per repeat]. World-aligned UVs keep seams continuous.
   ============================================================ */
const TX={};
function defTex(name,s,w,h,draw,rep=true){TX[name]={t:tex(w,h,draw,rep),s};}
const rr=mulberry(77);
// floors
defTex('checker',1,64,64,(g)=>{for(let y=0;y<2;y++)for(let x=0;x<2;x++){g.fillStyle=(x+y)%2?'#1c1a17':'#d8d0bc';g.fillRect(x*32,y*32,32,32);}
  speck(g,64,64,260,['rgba(60,40,20,.25)','rgba(0,0,0,.2)','rgba(255,255,255,.12)'],1,rr);g.fillStyle='rgba(40,30,20,.35)';g.fillRect(0,31,64,1);g.fillRect(31,0,1,64);blot(g,44,20,14,'rgba(90,60,20,.18)');});
defTex('quarry',1.2,64,64,(g)=>{g.fillStyle='#4a2a1c';g.fillRect(0,0,64,64);for(let y=0;y<4;y++)for(let x=0;x<4;x++){const k=rr()*16-8;g.fillStyle=`rgb(${148+k},${66+k*0.5},${44+k*0.3})`;g.fillRect(x*16+1,y*16+1,14,14);}
  speck(g,64,64,200,['rgba(0,0,0,.25)','rgba(255,220,180,.1)'],1,rr);blot(g,20,40,18,'rgba(30,15,5,.3)');});
defTex('concrete',2,64,64,(g)=>{g.fillStyle='#6b665c';g.fillRect(0,0,64,64);speck(g,64,64,900,['#5d584f','#77726a','#625d54','#81796c'],1,rr);blot(g,40,30,22,'rgba(30,25,15,.25)');g.fillStyle='rgba(30,25,20,.4)';g.fillRect(0,63,64,1);});
defTex('diamond',1,32,32,(g)=>{g.fillStyle='#8c9396';g.fillRect(0,0,32,32);g.fillStyle='#a9b0b3';for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.save();g.translate(x*8+4,y*8+4);g.rotate((x+y)%2?0.7:-0.7);g.fillRect(-3,-1,6,2);g.restore();}speck(g,32,32,60,['rgba(0,0,0,.15)'],1,rr);});
defTex('officeCarpet',1,32,32,(g)=>{g.fillStyle='#4b3a2a';g.fillRect(0,0,32,32);speck(g,32,32,400,['#56432f','#3f3022','#5c4a36'],1,rr);});
defTex('vct',1.2,64,64,(g)=>{for(let y=0;y<2;y++)for(let x=0;x<2;x++){const k=rr()*14;g.fillStyle=`rgb(${190+k},${180+k},${158+k})`;g.fillRect(x*32,y*32,32,32);}speck(g,64,64,300,['rgba(80,70,50,.35)','rgba(120,100,70,.25)'],1,rr);g.fillStyle='rgba(60,50,40,.3)';g.fillRect(0,31,64,1);g.fillRect(31,0,1,64);});
defTex('smallTile',0.6,32,32,(g)=>{g.fillStyle='#8f9a98';g.fillRect(0,0,32,32);for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.fillStyle=(x*7+y*3)%5?'#e2e6e0':'#c7d2cf';g.fillRect(x*8+1,y*8+1,7,7);}});
defTex('partyCarpet',1.5,64,64,(g)=>{g.fillStyle='#3a1340';g.fillRect(0,0,64,64);const cols=['#f0b93a','#3ac3f0','#f04a6a','#7fe05a'];for(let i=0;i<40;i++){g.fillStyle=cols[i%4];const x=rr()*64,y=rr()*64;if(i%3)g.fillRect(x,y,3,3);else{g.save();g.translate(x,y);g.rotate(rr()*3);g.fillRect(-4,-1,8,2);g.restore();}}});
defTex('arcadeCarpet',1.6,64,64,(g)=>{g.fillStyle='#0b0a24';g.fillRect(0,0,64,64);g.lineWidth=2;const cols=['#ff3fd0','#3ff0ff','#fff03f','#7f5bff'];for(let i=0;i<14;i++){g.strokeStyle=cols[i%4];g.beginPath();const x=rr()*64,y=rr()*64;g.moveTo(x,y);g.lineTo(x+6,y-6);g.lineTo(x+12,y);g.lineTo(x+18,y-6);g.stroke();}
  for(let i=0;i<10;i++){g.fillStyle=cols[(i+1)%4];g.beginPath();g.arc(rr()*64,rr()*64,2+rr()*2,0,TAU);g.fill();}});
defTex('foam',2,64,64,(g)=>{const cols=['#d63b2b','#2b6fd6','#f0c22b','#3aa84a'];for(let y=0;y<2;y++)for(let x=0;x<2;x++){g.fillStyle=cols[(x+y*2)%4];g.fillRect(x*32,y*32,32,32);g.fillStyle='rgba(0,0,0,.2)';for(let k=0;k<4;k++){g.fillRect(x*32+k*8+2,y*32,4,2);g.fillRect(x*32,y*32+k*8+2,2,4);}}speck(g,64,64,200,['rgba(0,0,0,.18)'],1,rr);});
defTex('ballpit',1,64,64,(g)=>{g.fillStyle='#222';g.fillRect(0,0,64,64);const cols=['#e8332a','#2a6be8','#f2d12a','#33b54a','#e86fd2','#f28b2a'];for(let i=0;i<70;i++){g.fillStyle=cols[(rr()*6)|0];const x=rr()*64,y=rr()*64;g.beginPath();g.arc(x,y,4.2,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x-2,y-2,2,2);}});
// walls (v covers floor to 3.2 m)
defTex('dining',3.2,64,128,(g)=>{g.fillStyle='#7d1f17';g.fillRect(0,0,64,88);for(let x=0;x<64;x+=16){g.fillStyle='#e9d7ae';g.fillRect(x+5,0,6,88);}
  speck(g,64,88,120,['rgba(0,0,0,.18)','rgba(255,240,200,.08)'],1,rr);g.fillStyle='#3a2414';g.fillRect(0,88,64,40);g.fillStyle='#4d3019';for(let x=0;x<64;x+=8)g.fillRect(x,90,6,36);g.fillStyle='#2a1a10';g.fillRect(0,86,64,4);g.fillRect(0,124,64,4);
  blot(g,30,100,16,'rgba(20,10,0,.3)');});
defTex('kitchenTile',1,64,64,(g)=>{g.fillStyle='#8a8f86';g.fillRect(0,0,64,64);for(let y=0;y<8;y++)for(let x=0;x<4;x++){const off=(y%2)*8;const k=rr()*12;g.fillStyle=`rgb(${214+k},${218+k},${206+k})`;g.fillRect((x*16+off)%64+1,y*8+1,14,6);if(off)g.fillRect(0,y*8+1,7,6);}
  speck(g,64,64,90,['rgba(120,110,60,.3)','rgba(60,50,30,.25)'],1,rr);blot(g,48,52,14,'rgba(110,90,40,.22)');});
defTex('party',3.0,64,128,(g)=>{g.fillStyle='#5a1f7a';g.fillRect(0,0,64,92);const cols=['#f0b93a','#3ac3f0','#f04a6a','#7fe05a','#ffffff'];for(let i=0;i<46;i++){g.fillStyle=cols[i%5];g.fillRect(rr()*64,rr()*90,2,2);}
  for(let i=0;i<4;i++){const x=8+i*16,y=18+(i%2)*32;g.fillStyle=cols[i];g.beginPath();g.ellipse(x,y,5,6,0,0,TAU);g.fill();g.strokeStyle='rgba(255,255,255,.5)';g.beginPath();g.moveTo(x,y+6);g.quadraticCurveTo(x+3,y+14,x,y+20);g.stroke();}
  g.fillStyle='#f0b93a';g.fillRect(0,90,64,4);g.fillStyle='#2a0f3a';g.fillRect(0,94,64,34);speck(g,64,34,40,['#3d1852'],2,rr);});
defTex('arcadeWall',3.4,64,128,(g)=>{g.fillStyle='#09081a';g.fillRect(0,0,64,128);g.lineWidth=3;[['#ff3fd0',30],['#3ff0ff',52]].forEach(([c,y])=>{g.strokeStyle=c;g.beginPath();for(let x=0;x<=64;x+=8)g.lineTo(x,y+((x/8)%2?6:-6));g.stroke();});
  for(let i=0;i<30;i++){g.fillStyle=['#fff03f','#7f5bff','#ff3fd0'][i%3];g.fillRect(rr()*64,70+rr()*50,2,2);}});
defTex('funWall',3,64,64,(g)=>{g.fillStyle='#f0c22b';g.fillRect(0,0,64,64);g.fillStyle='#2b6fd6';g.beginPath();g.arc(16,16,9,0,TAU);g.fill();g.fillStyle='#d63b2b';g.beginPath();g.moveTo(40,8);g.lineTo(56,30);g.lineTo(24,30);g.fill();
  g.fillStyle='#3aa84a';g.fillRect(8,40,18,18);g.fillStyle='#e86fd2';g.beginPath();g.arc(48,48,8,0,TAU);g.fill();speck(g,64,64,160,['rgba(0,0,0,.15)'],1,rr);});
defTex('panel',2.8,64,64,(g)=>{for(let x=0;x<64;x+=8){const k=rr()*14;g.fillStyle=`rgb(${92+k},${62+k*0.7},${36+k*0.5})`;g.fillRect(x,0,8,64);g.fillStyle='rgba(20,10,4,.6)';g.fillRect(x,0,1,64);}speck(g,64,64,120,['rgba(30,15,5,.3)'],1,rr);});
defTex('steel',1.2,32,32,(g)=>{g.fillStyle='#9ea6a9';g.fillRect(0,0,32,32);for(let y=0;y<32;y++){g.fillStyle=`rgba(255,255,255,${rr()*0.12})`;g.fillRect(0,y,32,1);}g.fillStyle='rgba(40,50,55,.35)';g.fillRect(0,31,32,1);g.fillRect(31,0,1,32);});
defTex('block',1.6,64,64,(g)=>{g.fillStyle='#6f6a62';g.fillRect(0,0,64,64);for(let r=0;r<4;r++){const off=(r%2)*16;for(let c=-1;c<3;c++){const k=rr()*12;g.fillStyle=`rgb(${148+k},${142+k},${130+k})`;g.fillRect(c*32+off+1,r*16+1,30,14);}}speck(g,64,64,300,['rgba(0,0,0,.2)','rgba(255,255,255,.08)'],1,rr);});
defTex('blockPaint',1.6,64,64,(g)=>{g.fillStyle='#8a8270';g.fillRect(0,0,64,64);for(let r=0;r<4;r++){const off=(r%2)*16;for(let c=-1;c<3;c++){g.fillStyle='#cfc4a6';g.fillRect(c*32+off+1,r*16+1,30,14);}}speck(g,64,64,160,['rgba(0,0,0,.12)'],1,rr);});
defTex('bathTile',0.8,32,32,(g)=>{g.fillStyle='#a8868a';g.fillRect(0,0,32,32);for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.fillStyle=(x+y)%3?'#e8bfc4':'#d9a9b0';g.fillRect(x*8+1,y*8+1,7,7);}});
// ceilings
defTex('ceil',1.2,32,32,(g)=>{g.fillStyle='#b9b2a2';g.fillRect(0,0,32,32);speck(g,32,32,140,['#a9a291','#c6bfae','#9d9585'],1,rr);g.fillStyle='#6e675a';g.fillRect(0,0,32,1);g.fillRect(0,0,1,32);if(rr()<1)blot(g,20,14,9,'rgba(120,80,30,.35)');});
defTex('ceilDirty',1.2,32,32,(g)=>{g.fillStyle='#9a9384';g.fillRect(0,0,32,32);speck(g,32,32,200,['#8a8373','#ada594','#7f7768'],1,rr);g.fillStyle='#5a5448';g.fillRect(0,0,32,1);g.fillRect(0,0,1,32);blot(g,12,20,12,'rgba(90,60,20,.4)');});
defTex('ceilDark',2,32,32,(g)=>{g.fillStyle='#17141c';g.fillRect(0,0,32,32);speck(g,32,32,60,['#221e29','#100e14'],1,rr);g.fillStyle='#2c2733';g.fillRect(0,0,32,1);g.fillRect(0,0,1,32);});
// furniture and fixtures
defTex('wood',1,32,32,(g)=>{g.fillStyle='#8a5a32';g.fillRect(0,0,32,32);for(let y=0;y<32;y+=2){g.fillStyle=`rgba(60,30,10,${0.1+rr()*0.25})`;g.fillRect(0,y,32,1);}});
defTex('formica',1,32,32,(g)=>{g.fillStyle='#c9b48a';g.fillRect(0,0,32,32);speck(g,32,32,90,['#b7a074','#d8c49a','#a38d63'],1,rr);});
defTex('vinyl',0.6,32,32,(g)=>{g.fillStyle='#a3241a';g.fillRect(0,0,32,32);for(let x=0;x<32;x+=8){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x,0,1,32);g.fillStyle='rgba(255,180,160,.15)';g.fillRect(x+3,0,2,32);}speck(g,32,32,30,['rgba(0,0,0,.3)'],1,rr);});
defTex('metal',1,16,16,(g)=>{g.fillStyle='#3c3f42';g.fillRect(0,0,16,16);speck(g,16,16,30,['#46494c','#323538'],1,rr);});
defTex('red',1,8,8,(g)=>{g.fillStyle='#b8261a';g.fillRect(0,0,8,8);g.fillStyle='rgba(0,0,0,.15)';g.fillRect(0,7,8,1);});
defTex('yellow',1,8,8,(g)=>{g.fillStyle='#e8ad2c';g.fillRect(0,0,8,8);g.fillStyle='rgba(0,0,0,.12)';g.fillRect(0,7,8,1);});
defTex('blue',1,8,8,(g)=>{g.fillStyle='#2a5fc4';g.fillRect(0,0,8,8);});
defTex('green',1,8,8,(g)=>{g.fillStyle='#2f9a44';g.fillRect(0,0,8,8);});
defTex('white',1,8,8,(g)=>{g.fillStyle='#e6e2d6';g.fillRect(0,0,8,8);});
defTex('black',1,8,8,(g)=>{g.fillStyle='#141210';g.fillRect(0,0,8,8);});
defTex('cardboard',0.8,32,32,(g)=>{g.fillStyle='#a87a48';g.fillRect(0,0,32,32);g.fillStyle='rgba(60,35,10,.35)';g.fillRect(0,14,32,3);speck(g,32,32,40,['rgba(60,35,10,.2)'],1,rr);});
defTex('locker',1,32,64,(g)=>{g.fillStyle='#4c5f6e';g.fillRect(0,0,32,64);g.fillStyle='#2b3740';g.fillRect(0,0,1,64);g.fillRect(31,0,1,64);for(let i=0;i<5;i++){g.fillRect(8,6+i*3,16,1);g.fillRect(8,48+i*3,16,1);}g.fillStyle='#9aa7ae';g.fillRect(24,30,3,8);});
defTex('stall',1.5,32,32,(g)=>{g.fillStyle='#b8a98a';g.fillRect(0,0,32,32);speck(g,32,32,50,['rgba(0,0,0,.15)'],1,rr);g.fillStyle='rgba(30,20,10,.5)';g.font='8px monospace';g.fillText('A+K',6,12);});
defTex('glass',1,8,8,(g)=>{g.fillStyle='rgba(170,210,220,.25)';g.fillRect(0,0,8,8);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(1,1,2,6);});
defTex('grate',0.5,32,32,(g)=>{g.clearRect(0,0,32,32);g.fillStyle='#4a4d50';g.fillRect(0,0,4,32);g.fillRect(16,0,4,32);g.fillRect(0,14,32,3);g.fillStyle='#6a6e72';g.fillRect(1,0,1,32);g.fillRect(17,0,1,32);});
defTex('ovenFront',1,64,32,(g)=>{g.fillStyle='#8e969a';g.fillRect(0,0,64,32);g.fillStyle='#1a1410';g.fillRect(8,10,48,14);g.fillStyle='#ff5a1a';g.fillRect(9,22,46,2);g.fillStyle='#333';for(let i=0;i<4;i++){g.beginPath();g.arc(6,6+i*7,2,0,TAU);g.fill();}g.fillStyle='#e33';g.fillRect(56,4,4,3);});
defTex('fridge',1,32,64,(g)=>{g.fillStyle='#b6bcbf';g.fillRect(0,0,32,64);g.fillStyle='#5d6669';g.fillRect(0,31,32,2);g.fillRect(26,8,3,18);g.fillRect(26,38,3,18);speck(g,32,64,40,['rgba(0,0,0,.08)'],1,rr);});
defTex('tarp',1.2,32,32,(g)=>{g.fillStyle='#3d5f8a';g.fillRect(0,0,32,32);for(let i=0;i<8;i++){g.fillStyle=`rgba(255,255,255,${0.05+rr()*0.1})`;g.fillRect(0,rr()*32,32,1);}g.fillStyle='rgba(240,240,255,.35)';speck(g,32,32,60,['rgba(240,248,255,.45)'],1,rr);});
defTex('frost',1,32,32,(g)=>{g.fillStyle='#7d1414';g.fillRect(0,0,32,32);speck(g,32,32,120,['#a42020','#5a0c0c','rgba(230,240,255,.5)'],1,rr);});
defTex('blood',1,64,64,(g)=>{g.clearRect(0,0,64,64);g.fillStyle='rgba(90,6,4,.92)';g.beginPath();g.ellipse(32,32,22,16,0.4,0,TAU);g.fill();for(let i=0;i<9;i++){g.beginPath();g.arc(32+Math.cos(i)*24,32+Math.sin(i*1.3)*18,2+rr()*4,0,TAU);g.fill();}},false);
defTex('night',1,64,64,(g)=>{const gr=g.createLinearGradient(0,0,0,64);gr.addColorStop(0,'#050812');gr.addColorStop(0.6,'#0b1020');gr.addColorStop(1,'#1d1a14');g.fillStyle=gr;g.fillRect(0,0,64,64);blot(g,46,30,18,'rgba(255,170,60,.35)');g.fillStyle='rgba(255,190,90,.9)';g.fillRect(44,20,4,2);g.fillStyle='#14120e';g.fillRect(45,22,2,30);g.fillStyle='rgba(230,220,180,.25)';for(let x=0;x<64;x+=12)g.fillRect(x,58,7,1);},false);

/* signs and pictures: full-quad UVs */
const SIGN={};
function signTex(name,w,h,draw){const t=tex(w,h,draw,false);SIGN[name]=t;onFonts(()=>{const g=t.userData.canvas.getContext('2d');g.clearRect(0,0,w,h);draw(g,w,h);t.needsUpdate=true;});return t;}
function brandMark(g,cx,cy,s){g.save();g.translate(cx,cy);g.scale(s,s);g.fillStyle='#f0b93a';g.beginPath();g.arc(0,0,20,0,TAU);g.fill();g.fillStyle='#b8261a';g.beginPath();g.arc(-7,-4,5,0,TAU);g.arc(7,-4,5,0,TAU);g.fill();
  g.fillStyle='#2a0806';g.beginPath();g.arc(0,5,10,0,Math.PI);g.fill();g.fillStyle='#eee';g.fillRect(-12,-28,24,9);g.beginPath();g.arc(-7,-28,6,0,TAU);g.arc(7,-28,6,0,TAU);g.fill();g.restore();}
signTex('logo',256,64,(g,w,h)=>{g.fillStyle='#b8261a';g.fillRect(0,0,w,h);g.fillStyle='#f0b93a';g.fillRect(0,0,w,4);g.fillRect(0,h-4,w,4);brandMark(g,32,34,0.95);
  g.fillStyle='#fff3d6';fitText(g,"PEPPER TONI'S",190,30,FONT_BRAND);g.fillText("PEPPER TONI'S",60,34);g.fillStyle='#f0b93a';fitText(g,'FAMILY PIZZERIA',190,16,FONT_BRAND);g.fillText('FAMILY PIZZERIA',62,54);});
signTex('menu',256,96,(g,w,h)=>{g.fillStyle='#16110d';g.fillRect(0,0,w,h);g.strokeStyle='#f0b93a';g.lineWidth=2;g.strokeRect(2,2,w-4,h-4);
  g.fillStyle='#f0b93a';fitText(g,'ALL YOU CAN EAT BUFFET  $5.99',240,15,FONT_BRAND);g.fillText('ALL YOU CAN EAT BUFFET  $5.99',10,20);
  const items=[['LARGE ANY KIND','$6'],['SUPREME (DOUBLE IT!)','$9'],['VEGGIE GARDEN','$7'],["TONI'S HAWAIIAN SURPRISE",'$8']];g.font='13px '+FONT_PIX;
  items.forEach(([n,p],i)=>{g.fillStyle='#efe2c4';g.fillText(n,12,38+i*13);g.fillStyle='#ff5a3a';g.fillText(p,140,38+i*13);});
  g.fillStyle='#ffe08a';g.fillRect(168,30,80,58);g.fillStyle='#b8261a';g.font='11px '+FONT_BRAND;g.fillText('KIDDIE PIE',174,42);
  g.fillStyle='#e8ad2c';g.beginPath();g.arc(208,66,16,0,TAU);g.fill();g.fillStyle='#d9c08a';g.lineWidth=3;g.strokeStyle='#d9c08a';g.beginPath();g.arc(208,66,16,0,TAU);g.stroke();
  g.fillStyle='#fff';for(let i=0;i<14;i++){const a=i/14*TAU;g.fillRect(208+Math.cos(a)*16,66+Math.sin(a)*16,1,1);}g.fillStyle='#b8261a';[[202,62],[214,62],[200,70],[204,73],[208,74],[212,73],[216,70]].forEach(([x,y])=>{g.beginPath();g.arc(x,y,2,0,TAU);g.fill();});
  g.fillStyle='#16110d';g.font='9px '+FONT_PIX;g.fillText('w/ famous seed crust!',170,86);});
signTex('party',256,48,(g,w,h)=>{g.fillStyle='#f0b93a';g.fillRect(0,0,w,h);g.fillStyle='#5a1f7a';fitText(g,'PARTY ROOM',230,28,FONT_BRAND);g.textAlign='center';g.fillText('PARTY ROOM',w/2,34);g.textAlign='left';});
signTex('banner',256,64,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<8;i++){g.fillStyle=['#f04a6a','#f0b93a','#3ac3f0','#7fe05a'][i%4];g.beginPath();g.moveTo(i*32,0);g.lineTo(i*32+32,0);g.lineTo(i*32+16,24);g.fill();}
  g.fillStyle='#fff';g.fillRect(14,28,228,32);g.fillStyle='#c62d1d';g.font='30px '+FONT_HAND;g.textAlign='center';g.fillText('Ramirez party of 6!! :)',w/2,52);g.textAlign='left';});
signTex('fun',256,64,(g,w,h)=>{g.fillStyle='#2b6fd6';g.fillRect(0,0,w,h);const c=['#f0c22b','#d63b2b','#3aa84a','#e86fd2','#fff'];g.textAlign='center';fitText(g,"TONI'S FUN ZONE",236,34,FONT_BRAND);[...("TONI'S FUN ZONE")].forEach((ch,i,a)=>{g.fillStyle=c[i%5];});
  g.fillStyle='#f0c22b';g.fillText("TONI'S FUN ZONE",w/2,44);g.textAlign='left';});
signTex('arcade',256,48,(g,w,h)=>{g.fillStyle='#09081a';g.fillRect(0,0,w,h);g.textAlign='center';g.shadowColor='#ff3fd0';g.shadowBlur=8;g.fillStyle='#ff9ff0';fitText(g,'GAME ZONE',230,30,FONT_BRAND);g.fillText('GAME ZONE',w/2,35);g.shadowBlur=0;g.textAlign='left';});
signTex('exit',64,24,(g,w,h)=>{g.fillStyle='#200';g.fillRect(0,0,w,h);g.fillStyle='#ff2a1a';g.font='18px '+FONT_PIX;g.textAlign='center';g.fillText('EXIT',w/2,18);g.textAlign='left';});
signTex('restroom',128,32,(g,w,h)=>{g.fillStyle='#1d3f6e';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.font='18px '+FONT_PIX;g.textAlign='center';g.fillText('RESTROOMS',w/2,22);g.textAlign='left';});
signTex('employee',128,64,(g,w,h)=>{g.fillStyle='#f3ecd9';g.fillRect(0,0,w,h);g.fillStyle='#b8261a';g.fillRect(0,0,w,14);g.fillStyle='#fff';g.font='11px '+FONT_PIX;g.fillText('EMPLOYEE OF THE MONTH',8,11);
  g.fillStyle='#5d4632';g.fillRect(10,20,34,38);g.fillStyle='#c79a72';g.beginPath();g.arc(27,34,10,0,TAU);g.fill();g.fillStyle='#3a2414';g.fillRect(17,24,20,5);g.fillRect(19,40,16,7);g.fillStyle='#b8261a';g.fillRect(14,48,26,10);
  g.fillStyle='#1d1611';g.font='22px '+FONT_HAND;g.fillText('MANNY',54,40);g.font='10px '+FONT_PIX;g.fillText('"Always on time!"',52,54);});
signTex('wash',96,64,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='#1d3f6e';g.font='12px '+FONT_PIX;g.fillText('EMPLOYEES MUST',8,16);g.fillText('WASH HANDS',8,30);g.fillText('BEFORE RETURNING',8,44);g.fillText('TO WORK',8,58);});
signTex('smile',96,128,(g,w,h)=>{g.fillStyle='#f0b93a';g.fillRect(0,0,w,h);brandMark(g,48,52,1.5);g.fillStyle='#b8261a';g.font='15px '+FONT_BRAND;g.textAlign='center';g.fillText('SMILE!',48,98);g.font='10px '+FONT_PIX;g.fillStyle='#1d1611';g.fillText("You're Pepper Toni!",48,116);g.textAlign='left';});
signTex('nightcaller',64,48,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);g.fillStyle='#2a2';g.font='10px '+FONT_PIX;g.textAlign='center';g.fillText('NIGHT',32,14);g.fillText('CALLER',32,24);g.fillStyle='#4f4';g.fillRect(14,30,36,12);g.fillStyle='#000';g.fillRect(16,32,32,8);g.fillStyle='#f22';g.fillRect(30,34,4,4);g.textAlign='left';});
signTex('screen1',64,48,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);g.fillStyle='#ff0';g.beginPath();g.arc(20,24,8,0.3,TAU-0.3);g.lineTo(20,24);g.fill();g.fillStyle='#fff';for(let i=0;i<4;i++)g.fillRect(34+i*7,23,2,2);g.fillStyle='#33f';g.fillRect(0,4,64,2);g.fillRect(0,42,64,2);});
signTex('screen2',64,48,(g,w,h)=>{g.fillStyle='#012';g.fillRect(0,0,w,h);g.fillStyle='#0ff';for(let i=0;i<5;i++)g.fillRect(6+i*12,8,8,5);g.fillStyle='#f0f';g.fillRect(28,38,8,4);g.fillStyle='#fff';g.font='8px '+FONT_PIX;g.fillText('INSERT COIN',10,30);});
signTex('tvToni',64,48,(g,w,h)=>{g.fillStyle='#3a7bf0';g.fillRect(0,0,w,h);brandMark(g,32,26,0.8);g.fillStyle='#fff';g.font='8px '+FONT_PIX;g.textAlign='center';g.fillText('PARTY TIME!',32,45);g.textAlign='left';});
signTex('keypad',64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#d9a64a';g.beginPath();g.arc(32,32,30,0,TAU);g.fill();g.fillStyle='#f0c25a';g.beginPath();g.arc(32,32,25,0,TAU);g.fill();g.strokeStyle='#8a5a20';g.lineWidth=1.5;for(let i=0;i<8;i++){const a=i/8*TAU;g.beginPath();g.moveTo(32,32);g.lineTo(32+Math.cos(a)*25,32+Math.sin(a)*25);g.stroke();}
  g.fillStyle='#b8261a';for(let i=0;i<8;i++){const a=(i+0.5)/8*TAU;g.beginPath();g.arc(32+Math.cos(a)*16,32+Math.sin(a)*16,3,0,TAU);g.fill();}g.fillStyle='#111';g.fillRect(24,29,16,6);g.fillStyle='#f22';g.fillRect(26,31,2,2);});
signTex('board',128,96,(g,w,h)=>{g.fillStyle='#a8784a';g.fillRect(0,0,w,h);speck(g,w,h,300,['#986a3e','#b78656'],1,rr);g.fillStyle='#5a3a1a';g.fillRect(0,0,w,3);g.fillRect(0,h-3,w,3);
  [['#fff',8,8,30,38],['#ffe08a',44,6,34,30],['#f3ecd9',84,10,36,44],['#fff',14,52,40,36],['#cfe8ff',62,50,52,38]].forEach(([c,x,y,ww,hh])=>{g.fillStyle=c;g.fillRect(x,y,ww,hh);g.fillStyle='rgba(0,0,0,.4)';for(let k=0;k<hh/6-1;k++)g.fillRect(x+3,y+5+k*6,ww-8-rr()*8,1);g.fillStyle='#c22';g.fillRect(x+ww/2-1,y+1,3,3);});});
signTex('ticket',32,48,(g,w,h)=>{g.fillStyle='#f3ecd9';g.fillRect(0,0,w,h);g.fillStyle='#333';for(let i=0;i<8;i++)g.fillRect(4,6+i*4,8+rr()*16,1);g.fillStyle='#b1261a';g.fillRect(4,40,14,3);});
signTex('ticketNew',32,48,(g,w,h)=>{g.fillStyle='#fffbe8';g.fillRect(0,0,w,h);g.fillStyle='#111';g.fillRect(4,4,24,3);for(let i=0;i<6;i++)g.fillRect(4,12+i*4,8+rr()*16,1);g.fillStyle='#d4261a';g.beginPath();g.arc(16,40,5,0,Math.PI);g.fill();g.beginPath();g.arc(13,37,1.2,0,TAU);g.arc(19,37,1.2,0,TAU);g.fill();});
signTex('door',32,64,(g,w,h)=>{g.fillStyle='#6b4528';g.fillRect(0,0,w,h);g.fillStyle='#5a3a20';g.fillRect(4,4,24,26);g.fillRect(4,34,24,26);g.fillStyle='#c9a35a';g.fillRect(25,32,3,3);});
signTex('steelDoor',32,64,(g,w,h)=>{g.fillStyle='#8e969a';g.fillRect(0,0,w,h);g.fillStyle='#5d6669';g.fillRect(0,0,1,h);g.fillRect(w-1,0,1,h);g.fillStyle='#232a2e';g.fillRect(9,12,14,14);g.fillStyle='rgba(140,190,210,.6)';g.fillRect(10,13,12,12);g.fillStyle='#333';g.fillRect(24,34,5,10);});
signTex('swing',32,64,(g,w,h)=>{g.fillStyle='#9aa3a6';g.fillRect(0,0,w,h);g.fillStyle='#2a2f31';g.beginPath();g.arc(16,18,7,0,TAU);g.fill();g.fillStyle='rgba(255,230,180,.55)';g.beginPath();g.arc(16,18,5.5,0,TAU);g.fill();g.fillStyle='#6b7376';g.fillRect(4,44,24,14);});
signTex('partyDoor',32,64,(g,w,h)=>{g.fillStyle='#5a1f7a';g.fillRect(0,0,w,h);g.fillStyle='#f0b93a';g.fillRect(0,0,w,3);g.fillStyle='#1a0a22';g.beginPath();g.arc(16,18,7,0,TAU);g.fill();g.fillStyle='rgba(255,200,120,.55)';g.beginPath();g.arc(16,18,5.5,0,TAU);g.fill();g.fillStyle='#c9a35a';g.fillRect(25,34,3,6);});
signTex('frontDoor',64,64,(g,w,h)=>{g.fillStyle='#2b2b2b';g.fillRect(0,0,w,h);g.fillStyle='rgba(30,40,60,.85)';g.fillRect(3,3,27,58);g.fillRect(34,3,27,58);g.fillStyle='rgba(255,190,90,.35)';g.fillRect(40,10,8,4);g.fillStyle='#c62d1d';g.font='7px '+FONT_PIX;g.fillText('OPEN',8,30);g.fillStyle='#ccc';g.fillRect(27,30,2,10);g.fillRect(35,30,2,10);
  g.fillStyle='#fff';g.font='6px '+FONT_PIX;g.fillText('PUSH',40,44);});
signTex('shelfStuff',64,32,(g,w,h)=>{g.clearRect(0,0,w,h);const c=['#b8261a','#e8ad2c','#3aa84a','#d9d2c0','#a87a48','#2a5fc4'];let x=1;while(x<62){const ww=5+rr()*9,hh=10+rr()*18;g.fillStyle=c[(rr()*6)|0];g.fillRect(x,h-hh,ww,hh);g.fillStyle='rgba(255,255,255,.3)';g.fillRect(x+1,h-hh+3,ww-2,3);x+=ww+1;}});
signTex('cans',64,32,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<5;i++){g.fillStyle='#b9bdc0';g.fillRect(i*12+1,4,11,28);g.fillStyle=i%2?'#c62d1d':'#e8ad2c';g.fillRect(i*12+1,10,11,14);g.fillStyle='#fff';g.fillRect(i*12+3,14,7,2);}});
signTex('pepBox',32,32,(g,w,h)=>{g.fillStyle='#a87a48';g.fillRect(0,0,w,h);g.fillStyle='#b8261a';g.fillRect(2,8,28,14);g.fillStyle='#fff';g.font='7px '+FONT_PIX;g.fillText('PEPPERONI',3,17);g.fillText('SLICED 5LB',3,28);});
signTex('plush',64,64,(g,w,h)=>{g.fillStyle='#211';g.fillRect(0,0,w,h);const c=['#f0b93a','#e86fd2','#3ac3f0','#7fe05a','#f04a6a','#fff'];for(let i=0;i<40;i++){g.fillStyle=c[i%6];const x=rr()*64,y=rr()*64;g.beginPath();g.arc(x,y,5+rr()*3,0,TAU);g.fill();g.fillStyle='#000';g.fillRect(x-2,y-1,1,1);g.fillRect(x+1,y-1,1,1);}});
signTex('poster1',64,96,(g,w,h)=>{g.fillStyle='#120a26';g.fillRect(0,0,w,h);g.fillStyle='#ff3fd0';g.font='12px '+FONT_BRAND;g.fillText('HIGH',6,20);g.fillText('SCORE',6,34);g.fillStyle='#3ff0ff';g.font='16px '+FONT_PIX;g.fillText('1. TONI',6,56);g.fillText('2. TONI',6,70);g.fillText('3. TONI',6,84);});
signTex('slider',64,64,(g,w,h)=>{g.fillStyle='#1a1a1a';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.font='9px '+FONT_PIX;g.fillText('NO SHOES',6,14);g.fillText('IN THE',6,26);g.fillText('BALL PIT',6,38);g.fillStyle='#f0c22b';g.fillText('ALL AGES!',6,54);});
