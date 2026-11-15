/* ============================================================
   THE RAMIREZ HOUSE: the prologue's level. A big single-storey house on a dark street, the night of the mother's
   funeral. It sits far east of the restaurant (x 150+), so the two never see each other. Every lamp here is on the
   house's power (set:'on'); when Toni cuts it at the breaker, the vertex light swaps to the 'dark' set: moonlight at
   the windows, and the memorial candles, which stay lit.
   ============================================================ */
const HOUSE_X0=140;
const hr=mulberry(150);
/* ---------- surfaces ---------- */
defTex('hardwood',1.6,64,64,(g)=>{for(let i=0;i<8;i++){const k=hr()*18;g.fillStyle=`rgb(${120+k},${78+k*0.7},${44+k*0.4})`;g.fillRect(0,i*8,64,8);
  for(let x=0;x<64;x+=2){g.fillStyle=`rgba(60,32,12,${0.06+hr()*0.12})`;g.fillRect(x,i*8+1+((hr()*6)|0),2,1);}g.fillStyle='rgba(40,20,8,.55)';g.fillRect(0,i*8,64,1);
  const j=(hr()*56)|0;g.fillRect(j,i*8,1,8);}speck(g,64,64,90,['rgba(255,220,170,.06)','rgba(40,20,8,.12)'],1,hr);blot(g,22,40,14,'rgba(255,230,190,.07)');});
defTex('tileK',0.9,32,32,(g)=>{g.fillStyle='#a69f8e';g.fillRect(0,0,32,32);for(let y=0;y<2;y++)for(let x=0;x<2;x++){const k=hr()*10;g.fillStyle=`rgb(${222+k},${214+k},${196+k})`;g.fillRect(x*16+1,y*16+1,15,15);}
  speck(g,32,32,50,['rgba(150,130,100,.25)','rgba(255,255,255,.2)'],1,hr);});
defTex('lino',1,32,32,(g)=>{g.fillStyle='#b9b4a2';g.fillRect(0,0,32,32);for(let y=0;y<4;y++)for(let x=0;x<4;x++){if((x+y)%2){g.fillStyle='#a8a390';g.fillRect(x*8,y*8,8,8);}}speck(g,32,32,60,['rgba(0,0,0,.08)'],1,hr);});
defTex('carpetL',1,32,32,(g)=>{g.fillStyle='#8f7f86';g.fillRect(0,0,32,32);speck(g,32,32,420,['#9b8b92','#83737a','#a3949a'],1,hr);});
defTex('carpetA',1,32,32,(g)=>{g.fillStyle='#4f5a68';g.fillRect(0,0,32,32);speck(g,32,32,420,['#5a6574','#46505d','#626e7c'],1,hr);});
defTex('garageFloor',2.2,64,64,(g)=>{g.fillStyle='#6e6c66';g.fillRect(0,0,64,64);speck(g,64,64,900,['#64625c','#77756f','#5d5b55'],1,hr);blot(g,30,34,16,'rgba(20,18,14,.45)');blot(g,36,30,8,'rgba(10,10,8,.4)');g.fillStyle='rgba(30,28,24,.35)';g.fillRect(0,63,64,1);});
defTex('grass',2,64,64,(g)=>{g.fillStyle='#1f2a17';g.fillRect(0,0,64,64);for(let i=0;i<700;i++){const k=hr();g.fillStyle=k<0.4?'#2a3a1e':k<0.7?'#18210f':'#33452a';g.fillRect((hr()*64)|0,(hr()*64)|0,1,2);}});
defTex('asphalt',2,64,64,(g)=>{g.fillStyle='#2a2a2c';g.fillRect(0,0,64,64);speck(g,64,64,700,['#333336','#222224','#3c3c40'],1,hr);});
defTex('pavement',1.2,32,32,(g)=>{g.fillStyle='#7a776f';g.fillRect(0,0,32,32);speck(g,32,32,200,['#6d6a63','#86837b'],1,hr);g.fillStyle='rgba(30,28,24,.5)';g.fillRect(0,31,32,1);});
defTex('porchWood',1,32,32,(g)=>{for(let i=0;i<4;i++){const k=hr()*12;g.fillStyle=`rgb(${110+k},${92+k},${76+k})`;g.fillRect(0,i*8,32,7);}g.fillStyle='rgba(20,14,8,.6)';for(let i=0;i<4;i++)g.fillRect(0,i*8+7,32,1);});
// walls: v covers floor to 3.2 m
const baseboard=(g,col)=>{g.fillStyle=col||'#f2efe6';g.fillRect(0,121,64,7);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,120,64,1);};
defTex('hwDining',3.2,64,128,(g)=>{g.fillStyle='#5f6b55';g.fillRect(0,0,64,92);g.fillStyle='rgba(205,200,160,.18)';for(let y=6;y<92;y+=16)for(let x=(y/16|0)%2*16;x<64;x+=32){g.beginPath();g.ellipse(x+8,y+4,4,6,0,0,TAU);g.fill();g.fillRect(x+7,y+10,2,4);}
  g.fillStyle='#ece8dc';g.fillRect(0,92,64,36);g.fillStyle='#d9d4c4';g.fillRect(0,92,64,3);[[3,98],[35,98]].forEach(([x,y])=>{g.strokeStyle='rgba(120,110,90,.45)';g.strokeRect(x+0.5,y+0.5,26,20);});baseboard(g,'#f4f1e8');});
defTex('hwLiving',3.2,64,128,(g)=>{g.fillStyle='#b8a48a';g.fillRect(0,0,64,128);speck(g,64,120,300,['rgba(255,240,220,.08)','rgba(90,70,50,.1)'],1,hr);g.fillStyle='#d8cfbe';g.fillRect(0,0,64,3);baseboard(g);});
defTex('hwHall',3.2,64,128,(g)=>{g.fillStyle='#a8a395';g.fillRect(0,0,64,128);speck(g,64,120,260,['rgba(255,255,240,.08)','rgba(60,60,50,.1)'],1,hr);g.fillStyle='rgba(0,0,0,.08)';g.fillRect(0,64,64,1);baseboard(g);});
defTex('hwKitchen',3.2,64,128,(g)=>{g.fillStyle='#d6c9a8';g.fillRect(0,0,64,128);speck(g,64,80,160,['rgba(255,250,230,.12)','rgba(110,90,60,.1)'],1,hr);
  for(let y=78;y<120;y+=6)for(let x=((y-78)/6|0)%2*6;x<64;x+=12){g.fillStyle='#ecebe6';g.fillRect(x,y,11,5);g.fillStyle='rgba(120,120,110,.35)';g.fillRect(x,y+5,12,1);}baseboard(g);});
defTex('hwLucia',3.2,64,128,(g)=>{g.fillStyle='#8a7f93';g.fillRect(0,0,64,128);speck(g,64,120,240,['rgba(255,240,255,.08)','rgba(50,40,60,.12)'],1,hr);baseboard(g);});
defTex('hwAlex',3.2,64,128,(g)=>{g.fillStyle='#3d4f6a';g.fillRect(0,0,64,128);speck(g,64,120,240,['rgba(220,230,255,.07)','rgba(10,20,40,.15)'],1,hr);g.fillStyle='#e8e2d2';g.fillRect(0,70,64,3);baseboard(g);});
defTex('hwPlain',3.2,64,128,(g)=>{g.fillStyle='#cfc8b6';g.fillRect(0,0,64,128);speck(g,64,120,200,['rgba(0,0,0,.06)','rgba(255,255,255,.08)'],1,hr);baseboard(g);});
defTex('hwBath',3.2,64,128,(g)=>{g.fillStyle='#9fb3ba';g.fillRect(0,0,64,128);for(let y=80;y<121;y+=8)for(let x=0;x<64;x+=8){g.fillStyle='#ecefed';g.fillRect(x,y,7,7);}g.fillStyle='#d8dcda';g.fillRect(0,78,64,3);});
defTex('hwGarage',3.2,64,128,(g)=>{g.fillStyle='#9a958a';g.fillRect(0,0,64,128);speck(g,64,128,300,['#8f8a7f','#a5a095'],1,hr);g.fillStyle='rgba(240,236,224,.35)';g.fillRect(31,0,3,128);g.fillStyle='rgba(60,55,45,.3)';g.fillRect(0,118,64,10);});
defTex('hceil',1.4,32,32,(g)=>{g.fillStyle='#e4e0d6';g.fillRect(0,0,32,32);speck(g,32,32,220,['#d8d4ca','#eeeae0','#cfcabe'],1,hr);});
defTex('siding',3.2,64,128,(g)=>{for(let y=0;y<128;y+=6){g.fillStyle='#a9aca8';g.fillRect(0,y,64,6);g.fillStyle='#7e817d';g.fillRect(0,y+5,64,1);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(0,y,64,1);}speck(g,64,128,120,['rgba(0,0,0,.08)'],1,hr);
  g.fillStyle='#55584f';g.fillRect(0,118,64,10);});
defTex('yardEdge',14,128,128,(g)=>{const gr=g.createLinearGradient(0,0,0,128);gr.addColorStop(0,'#05070f');gr.addColorStop(0.75,'#0c1222');gr.addColorStop(0.86,'#141a26');g.fillStyle=gr;g.fillRect(0,0,128,128);
  for(let i=0;i<50;i++){g.fillStyle=`rgba(220,230,255,${0.3+hr()*0.5})`;g.fillRect((hr()*128)|0,(hr()*80)|0,1,1);}
  // neighbours' houses and trees against the sky
  g.fillStyle='#070a10';[[4,96,30,18],[44,92,34,22],[90,95,32,19]].forEach(([x,y,w,h])=>{g.fillRect(x,y,w,h+10);g.beginPath();g.moveTo(x-3,y);g.lineTo(x+w/2,y-10);g.lineTo(x+w+3,y);g.fill();});
  [[12,104],[60,100],[98,103]].forEach(([x,y])=>{g.fillStyle='rgba(255,200,110,.75)';g.fillRect(x,y,4,4);g.fillRect(x+10,y,4,4);});
  for(let i=0;i<7;i++){const x=hr()*128,h=18+hr()*14;g.fillStyle='#04060a';g.beginPath();g.arc(x,104-h*0.5,h*0.45,0,TAU);g.fill();}
  g.fillStyle='#0d140b';g.fillRect(0,110,128,18);for(let x=0;x<128;x+=3){g.fillStyle=hr()<0.5?'#121c0f':'#0a1008';g.fillRect(x,108+hr()*4,3,4);}});
defTex('sky',16,128,128,(g)=>{g.fillStyle='#060912';g.fillRect(0,0,128,128);for(let i=0;i<120;i++){g.fillStyle=`rgba(230,235,255,${0.25+hr()*0.6})`;g.fillRect((hr()*128)|0,(hr()*128)|0,1,1);}});
defTex('flame',1,8,16,(g)=>{g.clearRect(0,0,8,16);const gr=g.createRadialGradient(4,11,0,4,10,6);gr.addColorStop(0,'rgba(255,250,210,1)');gr.addColorStop(0.4,'rgba(255,190,70,.95)');gr.addColorStop(1,'rgba(255,120,20,0)');g.fillStyle=gr;g.beginPath();g.ellipse(4,10,3,6,0,0,TAU);g.fill();});
defTex('cabinet',1,32,32,(g)=>{g.fillStyle='#e9e4d6';g.fillRect(0,0,32,32);g.strokeStyle='rgba(120,110,90,.55)';g.strokeRect(3.5,3.5,25,25);g.fillStyle='rgba(255,255,255,.3)';g.fillRect(4,4,24,1);g.fillStyle='#8a8478';g.fillRect(24,14,2,5);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(31,0,1,32);});
defTex('granite',0.8,32,32,(g)=>{g.fillStyle='#2b2826';g.fillRect(0,0,32,32);speck(g,32,32,260,['#3b3734','#4a4642','#1d1b1a','#6a645c'],1,hr);});
defTex('darkwood',1,32,32,(g)=>{g.fillStyle='#3e2414';g.fillRect(0,0,32,32);for(let y=0;y<32;y+=2){g.fillStyle=`rgba(20,8,2,${0.15+hr()*0.25})`;g.fillRect(0,y,32,1);}g.fillStyle='rgba(255,200,150,.06)';g.fillRect(0,6,32,2);});
defTex('sofa',0.7,32,32,(g)=>{g.fillStyle='#5b4a3e';g.fillRect(0,0,32,32);speck(g,32,32,260,['#655345','#4f3f34','#6e5b4c'],1,hr);g.fillStyle='rgba(0,0,0,.2)';g.fillRect(0,15,32,1);});
defTex('fabricL',0.6,32,32,(g)=>{g.fillStyle='#d6c2cc';g.fillRect(0,0,32,32);g.fillStyle='rgba(150,90,120,.35)';for(let y=0;y<32;y+=8)for(let x=(y/8)%2*4;x<32;x+=8){g.beginPath();g.arc(x+2,y+2,1.6,0,TAU);g.fill();}});
defTex('fabricA',0.8,32,32,(g)=>{g.fillStyle='#24345a';g.fillRect(0,0,32,32);for(let i=0;i<24;i++){g.fillStyle=hr()<0.5?'#f4e9a0':'#dfe8ff';g.fillRect((hr()*32)|0,(hr()*32)|0,1,1);}g.fillStyle='#e8d070';g.beginPath();g.arc(22,9,3,0,TAU);g.fill();g.fillStyle='#24345a';g.beginPath();g.arc(23.5,8,2.6,0,TAU);g.fill();});
defTex('linen',0.6,16,16,(g)=>{g.fillStyle='#ece8de';g.fillRect(0,0,16,16);speck(g,16,16,30,['#e0dccf','#f6f3ea'],1,hr);});
defTex('appliance',1,16,16,(g)=>{g.fillStyle='#c4c8c8';g.fillRect(0,0,16,16);for(let y=0;y<16;y++){g.fillStyle=`rgba(255,255,255,${hr()*0.1})`;g.fillRect(0,y,16,1);}});

/* ---------- pictures and fronts (whole-quad UVs) ---------- */
signTex('sash',64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#ece8de';g.fillRect(0,0,w,4);g.fillRect(0,h-5,w,5);g.fillRect(0,0,4,h);g.fillRect(w-4,0,4,h);g.fillRect(30,0,4,h);g.fillRect(0,30,w,3);
  g.fillStyle='rgba(180,200,220,.1)';g.fillRect(4,4,26,26);g.fillRect(34,4,26,26);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(6,6,2,20);g.fillRect(36,6,2,20);});
signTex('yardView',64,64,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#070b16');gr.addColorStop(0.55,'#101a2c');gr.addColorStop(0.75,'#141c22');gr.addColorStop(1,'#0c120a');g.fillStyle=gr;g.fillRect(0,0,w,h);
  blot(g,48,12,12,'rgba(180,200,255,.18)');g.fillStyle='#dfe6ff';g.beginPath();g.arc(48,12,3,0,TAU);g.fill();for(let i=0;i<14;i++){g.fillStyle='rgba(230,235,255,.5)';g.fillRect((hr()*64)|0,(hr()*30)|0,1,1);}
  g.fillStyle='#05070a';[[4,30,12],[22,26,14],[52,30,10]].forEach(([x,y,r])=>{g.beginPath();g.arc(x,y+r*0.5,r*0.75,0,TAU);g.fill();g.fillRect(x-1,y+r,2,12);});
  g.fillStyle='#0a0f08';g.fillRect(0,46,w,18);g.fillStyle='rgba(255,200,110,.6)';g.fillRect(30,40,3,3);g.fillRect(36,40,3,3);
  // rain on the glass
  g.strokeStyle='rgba(200,215,235,.18)';for(let i=0;i<16;i++){const x=hr()*64,y=hr()*64;g.beginPath();g.moveTo(x,y);g.lineTo(x+0.5,y+3+hr()*5);g.stroke();}});
signTex('hDoor',32,64,(g,w,h)=>{g.fillStyle='#e8e4da';g.fillRect(0,0,w,h);g.strokeStyle='rgba(120,112,95,.55)';[[4,4,24,16],[4,24,24,18],[4,46,10,14],[18,46,10,14]].forEach(([x,y,a,b])=>g.strokeRect(x+0.5,y+0.5,a,b));
  g.fillStyle='#b89a50';g.beginPath();g.arc(26,33,1.6,0,TAU);g.fill();g.fillStyle='rgba(0,0,0,.15)';g.fillRect(0,0,1,h);g.fillRect(w-1,0,1,h);});
signTex('hFrontDoor',32,64,(g,w,h)=>{g.fillStyle='#5c1a16';g.fillRect(0,0,w,h);g.fillStyle='#4a1310';[[4,26,24,14],[4,44,24,16]].forEach(([x,y,a,b])=>g.fillRect(x,y,a,b));
  g.fillStyle='rgba(160,180,210,.55)';g.fillRect(6,5,20,17);g.fillStyle='#4a1310';g.fillRect(15,5,2,17);g.fillRect(6,12,20,2);g.fillStyle='#d9b45a';g.fillRect(25,34,2,5);g.beginPath();g.arc(26,32,1.5,0,TAU);g.fill();});
signTex('louver',32,64,(g,w,h)=>{g.fillStyle='#e6e1d4';g.fillRect(0,0,w,h);for(let y=4;y<h-4;y+=3){g.fillStyle='rgba(90,84,70,.5)';g.fillRect(3,y,w-6,1);}g.fillStyle='rgba(0,0,0,.2)';g.fillRect(15,0,2,h);g.fillStyle='#b89a50';g.fillRect(13,30,2,4);g.fillRect(17,30,2,4);});
signTex('garageDoorIn',128,64,(g,w,h)=>{g.fillStyle='#b9b6ae';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=16){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(0,y,w,1);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(0,y+1,w,1);}
  g.fillStyle='#55534d';g.fillRect(4,0,2,h);g.fillRect(w-6,0,2,h);g.fillStyle='#2a2926';g.fillRect(60,44,8,2);});
signTex('breaker',32,48,(g,w,h)=>{g.fillStyle='#8c9093';g.fillRect(0,0,w,h);g.fillStyle='#6a6e70';g.fillRect(2,2,w-4,h-4);g.fillStyle='#222';for(let r=0;r<8;r++){g.fillRect(6,6+r*5,8,3);g.fillRect(18,6+r*5,8,3);}g.fillStyle='#c33';g.fillRect(12,2,8,3);});
signTex('fridgeH',32,64,(g,w,h)=>{g.fillStyle='#b9bdbd';g.fillRect(0,0,w,h);for(let y=0;y<h;y++){g.fillStyle=`rgba(255,255,255,${hr()*0.08})`;g.fillRect(0,y,w,1);}g.fillStyle='#777';g.fillRect(15,0,2,h);g.fillRect(12,14,1,26);g.fillRect(19,14,1,26);
  // a kid's drawing and the funeral program under magnets
  g.fillStyle='#fff';g.fillRect(3,10,8,10);g.fillStyle='#c33';g.fillRect(5,13,4,2);g.fillStyle='#36c';g.fillRect(4,16,6,1);g.fillStyle='#f4efe2';g.fillRect(21,20,8,11);g.fillStyle='#333';g.fillRect(22,22,6,1);g.fillRect(22,25,5,1);g.fillRect(22,27,6,1);
  ['#e33','#3a3','#fc0'].forEach((c,i)=>{g.fillStyle=c;g.fillRect(6+i*8,9+i*12,2,2);});});
signTex('stove',32,32,(g,w,h)=>{g.fillStyle='#1c1c1e';g.fillRect(0,0,w,h);g.fillStyle='#333';g.fillRect(3,10,26,18);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(4,11,24,2);g.fillStyle='#bbb';for(let i=0;i<4;i++)g.fillRect(4+i*7,3,4,4);g.fillStyle='#888';g.fillRect(6,8,20,1);});
signTex('washer',32,32,(g,w,h)=>{g.fillStyle='#e8e8e4';g.fillRect(0,0,w,h);g.fillStyle='#ccc';g.fillRect(0,0,w,6);g.fillStyle='#555';g.beginPath();g.arc(16,19,9,0,TAU);g.fill();g.fillStyle='#8aa';g.beginPath();g.arc(16,19,7,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.3)';g.fillRect(12,14,3,6);});
signTex('tvOff',64,40,(g,w,h)=>{g.fillStyle='#0a0a0c';g.fillRect(0,0,w,h);g.fillStyle='#16171c';g.fillRect(2,2,w-4,h-4);g.fillStyle='rgba(255,255,255,.05)';g.beginPath();g.moveTo(4,4);g.lineTo(30,4);g.lineTo(10,34);g.lineTo(4,34);g.fill();});
signTex('books',64,32,(g,w,h)=>{g.clearRect(0,0,w,h);let x=0;const c=['#6a2a20','#2a4a6a','#c9b48a','#3a5a3a','#7a6a4a','#1e1e28','#8a3a5a'];while(x<62){const ww=2+((hr()*4)|0),hh=20+((hr()*10)|0);g.fillStyle=c[(hr()*c.length)|0];g.fillRect(x,h-hh,ww,hh);g.fillStyle='rgba(255,230,180,.25)';g.fillRect(x,h-hh+4,ww,1);x+=ww+1;}});
signTex('lily',64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='#2f4a24';g.lineWidth=2;for(let i=0;i<7;i++){const x=12+i*7,top=6+hr()*20;g.beginPath();g.moveTo(32,64);g.quadraticCurveTo(x,40,x,top+8);g.stroke();
    g.fillStyle=i%3?'#f4f1ea':'#f0d8e0';g.beginPath();for(let k=0;k<5;k++){const a=k/5*TAU;g.ellipse(x+Math.cos(a)*3,top+Math.sin(a)*3,4,2,a,0,TAU);}g.fill();g.fillStyle='#e0a030';g.fillRect(x-1,top-1,2,2);}
  g.fillStyle='#3a5a2a';for(let i=0;i<8;i++){g.beginPath();g.ellipse(14+i*5,46+hr()*8,5,2,hr()*3,0,TAU);g.fill();}});
signTex('memorialCard',64,48,(g,w,h)=>{g.fillStyle='#f4efe2';g.fillRect(0,0,w,h);g.strokeStyle='#b89a50';g.strokeRect(2.5,2.5,w-5,h-5);g.fillStyle='#4a3a2a';g.textAlign='center';g.font='9px '+FONT_HAND;g.fillText('In loving memory',32,16);
  g.font='7px '+FONT_TYPE;g.fillText('Mom',32,27);g.fillText('1982 – 2026',32,36);g.fillStyle='#b89a50';g.fillRect(24,40,16,1);g.textAlign='left';});
signTex('guestBook',48,32,(g,w,h)=>{g.fillStyle='#f6f1e4';g.fillRect(0,0,w,h);g.fillStyle='#ddd5c2';g.fillRect(23,0,2,h);g.strokeStyle='rgba(30,30,60,.6)';for(let i=0;i<5;i++){g.beginPath();g.moveTo(3,6+i*5);g.lineTo(6+hr()*14,6+i*5+hr());g.stroke();g.beginPath();g.moveTo(27,6+i*5);g.lineTo(30+hr()*14,6+i*5);g.stroke();}});
signTex('pizzaBox',64,64,(g,w,h)=>{g.fillStyle='#e9e2d0';g.fillRect(0,0,w,h);g.fillStyle='#b8261a';g.fillRect(0,0,w,6);g.fillRect(0,h-6,w,6);brandMark(g,32,30,0.9);g.fillStyle='#b8261a';g.font='7px '+FONT_BRAND;g.textAlign='center';g.fillText("PEPPER TONI'S",32,53);g.textAlign='left';
  g.fillStyle='rgba(120,70,30,.25)';blot(g,48,46,8,'rgba(150,90,40,.3)');});
signTex('vanSide',128,48,(g,w,h)=>{g.fillStyle='#e9e4d8';g.fillRect(0,0,w,h);g.fillStyle='#b8261a';g.fillRect(0,30,w,6);g.fillStyle='#f0b93a';g.fillRect(0,36,w,2);brandMark(g,22,17,0.7);
  g.fillStyle='#b8261a';g.font='10px '+FONT_BRAND;g.fillText("PEPPER TONI'S",40,15);g.fillStyle='#3a2a1a';g.font='7px '+FONT_TYPE;g.fillText('Family Pizzeria · We deliver!',40,25);g.fillStyle='rgba(0,0,0,.15)';g.fillRect(0,h-4,w,4);
  g.fillStyle='rgba(120,90,60,.3)';for(let i=0;i<20;i++)g.fillRect(hr()*w,38+hr()*8,2,1);});
signTex('vanFront',64,48,(g,w,h)=>{g.fillStyle='#e9e4d8';g.fillRect(0,0,w,h);g.fillStyle='#1a2230';g.fillRect(4,4,56,18);g.fillStyle='rgba(150,170,200,.2)';g.fillRect(6,6,20,8);g.fillStyle='#222';g.fillRect(8,30,48,10);
  g.fillStyle='#fff8d0';g.fillRect(2,28,8,6);g.fillRect(54,28,8,6);g.fillStyle='#b8261a';g.fillRect(0,42,w,3);});
signTex('vanTop',64,24,(g,w,h)=>{g.fillStyle='#f0b93a';g.fillRect(0,0,w,h);g.fillStyle='#b8261a';g.font='9px '+FONT_BRAND;g.textAlign='center';g.fillText("TONI'S",32,16);g.textAlign='left';});
signTex('suvSide',96,32,(g,w,h)=>{g.fillStyle='#22262c';g.fillRect(0,0,w,h);g.fillStyle='#3b4450';g.fillRect(14,3,30,11);g.fillRect(48,3,30,11);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(14,3,30,2);g.fillStyle='#111';g.beginPath();g.arc(20,30,7,0,TAU);g.arc(76,30,7,0,TAU);g.fill();g.fillStyle='#888';g.fillRect(40,17,6,1);});
signTex('posterL',48,64,(g,w,h)=>{g.fillStyle='#1d1a2a';g.fillRect(0,0,w,h);g.fillStyle='#e8c0d8';g.beginPath();g.arc(24,26,14,0,TAU);g.fill();g.fillStyle='#1d1a2a';g.beginPath();g.arc(28,22,12,0,TAU);g.fill();g.fillStyle='#f4e6f0';g.font='8px '+FONT_BRAND;g.textAlign='center';g.fillText('MOON',24,52);g.fillText('TOUR',24,60);g.textAlign='left';});
signTex('posterA',48,64,(g,w,h)=>{g.fillStyle='#0d0a08';g.fillRect(0,0,w,h);g.fillStyle='#8a1a10';g.fillRect(0,0,w,14);g.fillStyle='#f0e0c0';g.font='9px '+FONT_BRAND;g.textAlign='center';g.fillText('IT CAME',24,10);
  g.fillStyle='#2a2a2a';g.beginPath();g.ellipse(24,36,12,16,0,0,TAU);g.fill();g.fillStyle='#d8e85a';g.fillRect(17,32,4,3);g.fillRect(27,32,4,3);g.fillStyle='#f0e0c0';g.font='7px '+FONT_PIX;g.fillText('FROM THE DRAIN',24,60);g.textAlign='left';});
signTex('phoneWall',16,24,(g,w,h)=>{g.fillStyle='#e8e4d8';g.fillRect(0,0,w,h);g.fillStyle='#bbb';g.fillRect(2,2,12,8);g.fillStyle='#555';for(let r=0;r<4;r++)for(let c=0;c<3;c++)g.fillRect(3+c*4,12+r*3,2,2);});
signTex('mirror',32,48,(g,w,h)=>{g.fillStyle='#8a6a3a';g.fillRect(0,0,w,h);const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#3a4450');gr.addColorStop(0.5,'#6a7888');gr.addColorStop(1,'#2a3038');g.fillStyle=gr;g.fillRect(3,3,w-6,h-6);});
signTex('thermostat',16,16,(g,w,h)=>{g.fillStyle='#ece8e0';g.fillRect(0,0,w,h);g.fillStyle='#253';g.fillRect(3,4,10,6);g.fillStyle='#7f7';g.font='6px '+FONT_PIX;g.fillText('68',4,9);});
/* the framed portrait of Mom, from the generated portrait (PORTRAIT_DATA, tools/faces_pack.py) */
signTex('portrait',48,60,(g,w,h)=>{g.fillStyle='#2a1a10';g.fillRect(0,0,w,h);g.fillStyle='#c9a85a';g.fillRect(2,2,w-4,h-4);g.fillStyle='#4a3a30';g.fillRect(5,5,w-10,h-10);});
/* family photos in frames: drawn from the cast's photo faces once they load */
const FAMILY_PHOTOS=[];
function familyPhoto(name,w,h,people,bg){signTex(name,w,h,(g)=>{g.fillStyle='#1a120c';g.fillRect(0,0,w,h);const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,bg[0]);gr.addColorStop(1,bg[1]);g.fillStyle=gr;g.fillRect(3,3,w-6,h-6);});
  FAMILY_PHOTOS.push({name,w,h,people,bg});}
function paintFamilyPhotos(){for(const f of FAMILY_PHOTOS){const t=SIGN[f.name];const g=t.userData.canvas.getContext('2d');const n=f.people.length;let left=n;
    f.people.forEach(([id,col],i)=>{const src=id==='mom'&&typeof PORTRAIT_DATA!=='undefined'&&PORTRAIT_DATA.mom?PORTRAIT_DATA.mom:(typeof FACE_DATA!=='undefined'&&FACE_DATA[id]&&FACE_DATA[id].neutral);if(!src)return;
      const im=new Image();im.onload=()=>{const cx=3+(f.w-6)*(i+0.5)/n,s=Math.min((f.w-6)/n*1.05,f.h*0.62),cy=f.h-3-s*0.55;g.save();g.beginPath();g.rect(3,3,f.w-6,f.h-6);g.clip();
        g.fillStyle=col;g.beginPath();g.ellipse(cx,f.h,s*0.48,s*0.42,0,0,TAU);g.fill();g.beginPath();g.ellipse(cx,cy,s*0.33,s*0.4,0,0,TAU);g.clip();
        if(id==='mom')g.drawImage(im,cx-s*0.4,cy-s*0.42,s*0.8,s*1.0);else g.drawImage(im,cx-s*0.5,cy-s*0.47,s,s);g.restore();
        if(--left===0){g.fillStyle='rgba(255,230,190,.08)';g.fillRect(3,3,f.w-6,f.h-6);}t.needsUpdate=true;};im.src=src;});}}
familyPhoto('photoFam',48,36,[['dad','#1b1c22'],['mom','#6a1a2a'],['lucia','#2a2a2a'],['alex','#d8d4cc']],['#7fb0d8','#d8c08a']);
familyPhoto('photoKids',32,40,[['lucia','#6a2a4a'],['alex','#2a4a7a']],['#a8c890','#5a7a4a']);
familyPhoto('photoParents',32,40,[['dad','#2a2a30'],['mom','#e8e0d8']],['#e8d8b8','#b89a7a']);
familyPhoto('photoLuciaMom',32,40,[['mom','#6a1a2a'],['lucia','#e8b0c0']],['#f0c890','#c87a50']);
function paintPortrait(){if(typeof PORTRAIT_DATA==='undefined'||!PORTRAIT_DATA.mom)return;const im=new Image();im.onload=()=>{const t=SIGN.portrait,g=t.userData.canvas.getContext('2d');g.drawImage(im,5,5,38,50);
  g.fillStyle='rgba(255,220,170,.07)';g.fillRect(5,5,38,50);t.needsUpdate=true;};im.src=PORTRAIT_DATA.mom;}

/* ---------- the plan ---------- */
ROOMS.push(
  {id:'h_garage', n:'Garage',        x0:150,x1:157,z0:0,z1:7, h:2.8,floor:'garageFloor',wall:'hwGarage',ceil:'hwGarage',g:'h_garage',surf:'tile'},
  {id:'h_laundry',n:'Laundry room',  x0:157,x1:160,z0:0,z1:3.5,h:2.6,floor:'lino',wall:'hwPlain',ceil:'hceil',g:'h_laundry',surf:'tile'},
  {id:'h_pantry', n:'Pantry',        x0:157,x1:160,z0:3.5,z1:7,h:2.6,floor:'lino',wall:'hwPlain',ceil:'hceil',g:'h_pantry',surf:'tile'},
  {id:'h_kitchen',n:'Kitchen',       x0:160,x1:168,z0:0,z1:7, h:2.7,floor:'tileK',wall:'hwKitchen',ceil:'hceil',g:'h_kitchen',surf:'tile'},
  {id:'h_dining', n:'Dining room',   x0:168,x1:175,z0:0,z1:7, h:2.7,floor:'hardwood',wall:'hwDining',ceil:'hceil',g:'h_dining',surf:'wood'},
  {id:'h_foyer',  n:'Front hall',    x0:175,x1:180,z0:0,z1:7, h:2.9,floor:'hardwood',wall:'hwDining',ceil:'hceil',g:'h_foyer',surf:'wood'},
  {id:'h_hall',   n:'Hallway',       x0:150,x1:168,z0:7,z1:9, h:2.6,floor:'hardwood',wall:'hwHall',ceil:'hceil',g:'h_hall',surf:'wood'},
  {id:'h_living', n:'Living room',   x0:168,x1:180,z0:7,z1:16,h:2.7,floor:'hardwood',wall:'hwLiving',ceil:'hceil',g:'h_living',surf:'wood'},
  {id:'h_lucia',  n:'Lucia’s room',  x0:150,x1:157.5,z0:9,z1:16,h:2.6,floor:'carpetL',wall:'hwLucia',ceil:'hceil',g:'h_lucia',surf:'carpet'},
  {id:'h_bath',   n:'Bathroom',      x0:157.5,x1:161,z0:9,z1:16,h:2.6,floor:'smallTile',wall:'hwBath',ceil:'hceil',g:'h_bath',surf:'tile'},
  {id:'h_alex',   n:'Alex’s room',   x0:161,x1:168,z0:9,z1:16,h:2.6,floor:'carpetA',wall:'hwAlex',ceil:'hceil',g:'h_alex',surf:'carpet'},
  {id:'h_yard',   n:'Front yard',    x0:180,x1:196,z0:-3,z1:19,h:14,floor:'grass',wall:'yardEdge',walls:{w:'siding'},ceil:'!sky',ceilStep:6,g:'h_yard',surf:'grass'},
);
OPENINGS.push(
  {ax:'x',c:157,a0:1.0,a1:2.2,id:'hGarLaun'},{ax:'x',c:160,a0:1.0,a1:2.2,id:'hLaunKit'},{ax:'x',c:160,a0:4.8,a1:5.8,id:'hPantry'},
  {ax:'x',c:168,a0:3.6,a1:6.2,y1:2.35,id:'hKitDin'},{ax:'x',c:175,a0:2.2,a1:5.0,y1:2.35,id:'hDinFoy'},
  {ax:'z',c:7,a0:163.6,a1:165.0,id:'hKitHall'},{ax:'x',c:168,a0:7.2,a1:8.8,id:'hHallLiv'},
  {ax:'z',c:7,a0:169.6,a1:173.4,y1:2.35,id:'hDinLiv'},{ax:'z',c:7,a0:176.2,a1:178.8,y1:2.35,id:'hFoyLiv'},
  {ax:'z',c:9,a0:153.4,a1:154.4,id:'hLucia'},{ax:'z',c:9,a0:158.6,a1:159.6,id:'hBath'},{ax:'z',c:9,a0:164.4,a1:165.4,id:'hAlex'},
  {ax:'x',c:180,a0:3.0,a1:4.2,id:'hFront'},
  // windows onto the yard and the street
  {ax:'z',c:0,a0:162.8,a1:165.2,y0:1.05,y1:2.05,win:true,view:'yardView'},
  {ax:'z',c:0,a0:168.9,a1:170.2,y0:0.9,y1:2.1,win:true,view:'yardView'},{ax:'z',c:0,a0:172.8,a1:174.1,y0:0.9,y1:2.1,win:true,view:'yardView'},
  {ax:'z',c:0,a0:177.2,a1:178.6,y0:1.0,y1:2.2,win:true,view:'yardView'},{ax:'z',c:0,a0:158.0,a1:159.0,y0:1.4,y1:2.0,win:true,view:'yardView'},
  {ax:'z',c:16,a0:170.4,a1:174.6,y0:0.7,y1:2.2,win:true,view:'yardView'},{ax:'z',c:16,a0:176.4,a1:178.6,y0:0.8,y1:2.2,win:true,view:'yardView'},
  {ax:'x',c:150,a0:11.8,a1:13.6,y0:0.9,y1:2.0,win:true,view:'yardView'},{ax:'z',c:16,a0:152.0,a1:154.0,y0:0.9,y1:2.0,win:true,view:'yardView'},
  {ax:'z',c:16,a0:163.4,a1:165.6,y0:0.9,y1:2.0,win:true,view:'yardView'},{ax:'z',c:16,a0:158.8,a1:159.8,y0:1.5,y1:2.1,win:true,view:'yardView'},
);
for(const r of ROOMS.slice(-12))ROOM[r.id]=r;for(const o of OPENINGS)if(o.id)OPEN[o.id]=o;

/* ---------- the house's furniture ---------- */
const HPT={};const CANDLES=[];
function hchair(x,z,yaw){chair(x,z,yaw,{seat:'darkwood'});}
function pframe(name,x,y,z,w,h,face){box('darkwood',face==='s'?x-w/2-0.02:face==='n'?x-w/2-0.02:x-0.015,face==='s'?x+w/2+0.02:face==='n'?x+w/2+0.02:x+0.015,y-0.02,y+h+0.02,face==='e'||face==='w'?z-w/2-0.02:z-0.015,face==='e'||face==='w'?z+w/2+0.02:z+0.015,{collide:false,shadow:false});
  const d=0.02;sign(name,face==='e'?x+d:face==='w'?x-d:x,y,face==='s'?z+d:face==='n'?z-d:z,w,h,face);}
function candle(x,y,z,h=0.18,r=0.025){cyl('linen',x,z,y,y+h,r,6,{tint:[1.05,1.0,0.92]});const f=new THREE.Mesh(new THREE.PlaneGeometry(0.035,0.07),basic({map:TX.flame.t,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
  f.material.fog=false;f.position.set(x,y+h+0.035,z);scene.add(f);CANDLES.push({m:f,ph:hr()*10,base:y+h+0.035});}
function stepCandles(dt){for(const c of CANDLES){c.ph+=dt*(8+Math.sin(c.ph*0.7)*3);c.m.scale.set(1+Math.sin(c.ph*1.3)*0.08,1+Math.sin(c.ph)*0.18,1);c.m.position.y=c.base+Math.sin(c.ph)*0.004;c.m.lookAt(camera.position.x,c.m.position.y,camera.position.z);}}
function hbed(x0,x1,z0,z1,key,headAt){box('darkwood',x0,x1,0,0.32,z0,z1,{collide:false});box('linen',x0+0.03,x1-0.03,0.32,0.5,z0+0.03,z1-0.03,{collide:false});
  const along=x1-x0>z1-z0;// duvet over the lower two thirds, a pillow at the head
  if(along){const hx=headAt==='e'?x1:x0,dir=headAt==='e'?-1:1;box(key,Math.min(hx+dir*0.45,x1-(dir>0?0:0.45)),dir>0?x1-0.02:hx-0.45,0.5,0.56,z0-0.01,z1+0.01,{collide:false});
    box('linen',headAt==='e'?x1-0.42:x0+0.08,headAt==='e'?x1-0.08:x0+0.42,0.5,0.62,z0+0.12,z1-0.12,{collide:false});box('darkwood',headAt==='e'?x1-0.06:x0,headAt==='e'?x1:x0+0.06,0,1.05,z0,z1,{collide:false});}
  solid(x0,x1,z0,z1,0.6,'bed');}
function closet(x0,x1,z0,z1,face){box('hwPlain',x0,x1,0,2.15,z0,z1,{collide:false,faces:face==='e'?'nswt':face==='w'?'nset':face==='s'?'ewnt':'ewst'});
  if(face==='e')sign('louver',x1+0.005,0.02,(z0+z1)/2,z1-z0-0.06,2.08,'e');if(face==='w')sign('louver',x0-0.005,0.02,(z0+z1)/2,z1-z0-0.06,2.08,'w');
  if(face==='s')sign('louver',(x0+x1)/2,0.02,z1+0.005,x1-x0-0.06,2.08,'s');if(face==='n')sign('louver',(x0+x1)/2,0.02,z0-0.005,x1-x0-0.06,2.08,'n');solid(x0,x1,z0,z1,2.15,'closet');}

function buildHouse(){houseNav();
  /* light: 'on' while the power works; 'dark' after the cut. The memorial candles and the moon are in both. */
  const W=[1.05,0.86,0.62],Wd=[0.9,0.72,0.5];
  const on={set:'on'},dk={set:'dark'};
  for(const g of ['h_garage','h_laundry','h_pantry','h_kitchen','h_dining','h_foyer','h_hall','h_living','h_lucia','h_bath','h_alex']){AMB[g]=[0.13,0.11,0.1];AMB_DARK[g]=[0.095,0.105,0.16];}
  AMB.h_yard=[0.13,0.14,0.2];AMB_DARK.h_yard=[0.13,0.14,0.2];AMB.h_garage=[0.1,0.1,0.1];AMB_DARK.h_garage=[0.06,0.065,0.09];
  lamp(153.5,2.7,3.5,[0.85,0.85,0.8],7.5,'h_garage',Object.assign({panel:[1.2,0.25]},on));
  lamp(158.5,2.55,1.8,W,4.2,'h_laundry',Object.assign({panel:[0.3,0.3]},on));lamp(158.5,2.55,5.2,Wd,4,'h_pantry',on);
  lamp(164,2.65,3.5,[1.0,0.95,0.82],7.5,'h_kitchen',Object.assign({panel:[1.0,0.5],ptint:[1.2,1.15,1.0]},on));lamp(164,1.7,0.6,[0.5,0.42,0.3],2.6,'h_kitchen',on);
  lamp(171.5,2.25,3.5,[1.15,0.86,0.55],6.4,'h_dining',Object.assign({down:0.4},on));
  lamp(177.5,2.8,3.5,W,6,'h_foyer',Object.assign({panel:[0.4,0.4]},on));
  [155,161,166].forEach(x=>lamp(x,2.55,8,Wd,4.5,'h_hall',Object.assign({panel:[0.3,0.3]},on)));
  lamp(174,2.6,11.5,[0.9,0.74,0.52],7.5,'h_living',on);lamp(178.6,1.6,14.6,[1.0,0.72,0.42],4,'h_living',on);
  lamp(153.8,2.55,12.5,[0.95,0.8,0.7],6,'h_lucia',Object.assign({panel:[0.4,0.4]},on));lamp(156.9,0.9,14.6,[0.9,0.6,0.4],2.4,'h_lucia',on);
  lamp(159.2,2.55,12,[0.95,0.97,1.0],5.5,'h_bath',Object.assign({panel:[0.5,0.3]},on));
  lamp(164.5,2.55,12.5,[0.9,0.85,0.8],6,'h_alex',Object.assign({panel:[0.4,0.4]},on));
  // moonlight through every window, both sets (it only shows once the lamps are off)
  const MOON=[0.26,0.32,0.52];
  [[164,1.6,0.6,'h_kitchen'],[169.5,1.5,0.6,'h_dining'],[173.4,1.5,0.6,'h_dining'],[177.9,1.6,0.6,'h_foyer'],[158.5,1.7,0.5,'h_laundry'],[172.5,1.4,15.4,'h_living'],[177.5,1.4,15.4,'h_living'],
   [150.6,1.4,12.7,'h_lucia'],[153,1.4,15.4,'h_lucia'],[164.5,1.4,15.4,'h_alex'],[159.3,1.8,15.4,'h_bath']].forEach(([x,y,z,g])=>lamp(x,y,z,MOON,4.4,g,dk));
  // the memorial candles: the only warm light left after the cut
  lamp(171.5,1.15,0.45,[0.8,0.5,0.22],3.2,'h_dining',dk);lamp(171.5,1.15,0.45,[0.35,0.22,0.1],2.2,'h_dining',on);
  // the street lamp, the porch light and the van's headlights outside; the garage door, left open, lets the street in
  lamp(195.4,5.5,12,[1.0,0.72,0.38],17,'h_yard');lamp(180.4,2.3,2.4,[1.0,0.8,0.5],5,'h_yard',on);lamp(193.3,1.0,-0.8,[0.9,0.88,0.75],7,'h_yard');
  lamp(153.5,1.2,0.4,[0.45,0.36,0.24],5.5,'h_garage',dk);

  /* ---------------- GARAGE ---------------- */
  sign('garageDoorIn',153.5,0,0.11,5.8,2.35,'s');box('hwGarage',150.5,156.5,2.35,2.5,0.1,0.35,{collide:false});
  // the family SUV, nose to the door
  box({d:'black',s:'black',n:'black',t:'black'},151.8,153.9,0.25,1.05,1.0,5.9);box({d:'black',t:'black'},151.95,153.75,1.05,1.75,2.0,5.4,{collide:false});
  sign('suvSide',151.79,0.2,3.45,4.9,1.6,'w');sign('suvSide',153.91,0.2,3.45,4.9,1.6,'e');box('!white',152.0,152.4,0.6,0.75,0.98,1.0,{collide:false,tint:[0.9,0.9,0.8]});box('!white',153.3,153.7,0.6,0.75,0.98,1.0,{collide:false,tint:[0.9,0.9,0.8]});
  [[152.0,1.6],[153.7,1.6],[152.0,5.2],[153.7,5.2]].forEach(([x,z])=>cyl('black',x,z,0,0.36,0.33,8,{top:false}));solid(151.8,153.9,1.0,5.9,1.75,'car');
  box('wood',150.3,154.8,0,0.9,6.3,6.85);shelfUnit(150.15,150.6,1.0,3.6,2.0,4,['cans','shelfStuff'],'e');sign('breaker',156.2,1.1,6.89,0.36,0.5,'n');HPT.breaker=[156.2,1.35,6.6];
  box('cardboard',155.6,156.8,0,0.5,5.0,5.8);box('cardboard',155.8,156.6,0.5,0.85,5.1,5.7,{collide:false});cyl('blue',156.4,3.8,0,0.9,0.28,8,{collide:true});
  /* ---------------- LAUNDRY & PANTRY ---------------- */
  box('appliance',157.15,157.95,0,0.95,0.12,0.85);sign('washer',157.55,0.08,0.86,0.7,0.7,'s');box('appliance',158.05,158.85,0,0.95,0.12,0.85);sign('washer',158.45,0.08,0.86,0.7,0.7,'s');
  box('cabinet',157.1,159.9,1.6,2.3,0.1,0.45,{collide:false});box('white',159.0,159.85,0,0.85,2.5,3.35,{tint:[0.9,0.9,0.86]});
  shelfUnit(157.15,157.6,3.7,6.8,2.1,5,['cans','shelfStuff'],'e');shelfUnit(157.6,159.6,6.4,6.85,2.1,5,['shelfStuff','cans'],'n');
  /* ---------------- KITCHEN ---------------- */
  box({d:'cabinet',t:'granite'},160.15,166.9,0,0.92,0.1,0.72);box('granite',160.15,166.9,0.92,0.96,0.08,0.76,{collide:false});
  box('steel',163.4,164.6,0.93,0.97,0.2,0.6,{collide:false,faces:'t'});box('metal',163.95,164.05,0.96,1.25,0.15,0.2,{collide:false});
  sign('stove',161.4,0.08,0.73,0.76,0.76,'s');box('black',161.02,161.78,0.96,0.98,0.14,0.7,{collide:false});
  box('cabinet',160.15,162.7,1.55,2.35,0.1,0.45,{collide:false});box('cabinet',165.3,166.9,1.55,2.35,0.1,0.45,{collide:false});
  box('appliance',166.95,167.9,0,1.95,0.1,0.9);sign('fridgeH',167.42,0,0.91,0.9,1.92,'s');HPT.fridge=[167.4,1.3,1.1];
  box({d:'cabinet',t:'granite'},162.5,165.5,0,0.92,3.0,4.2);box('granite',162.45,165.55,0.92,0.96,2.95,4.25,{collide:false});
  [163,164,165].forEach(x=>{cyl('metal',x,4.75,0,0.68,0.03,5,{top:false});cyl('darkwood',x,4.75,0.68,0.72,0.18,8);});
  // casseroles from the neighbours, foil over each one, and a bowl of lemons nobody touched
  [[162.9,3.4],[163.7,3.75],[164.6,3.35]].forEach(([x,z])=>{box('steel',x-0.2,x+0.2,0.96,1.03,z-0.14,z+0.14,{collide:false,tint:[1.05,1.05,1.05]});});
  cyl('white',165.1,3.85,0.96,1.03,0.13,8,{tint:[0.9,0.85,0.75]});[[165.05,3.82],[165.15,3.9],[165.1,3.78]].forEach(([x,z])=>cyl('yellow',x,z,1.02,1.08,0.035,5));
  sign('phoneWall',160.11,1.3,2.9,0.16,0.24,'e');HPT.phone=[160.3,1.42,2.9];
  cyl('black',167.5,6.3,0,0.7,0.2,8,{collide:true});
  /* ---------------- DINING ROOM: the wake ---------------- */
  box({d:'darkwood',t:'darkwood'},170.2,172.8,0.72,0.77,2.85,4.15,{collide:false});shadowRect(170.2,172.8,2.85,4.15,0.3);
  [[170.4,3.0],[172.6,3.0],[170.4,4.0],[172.6,4.0]].forEach(([x,z])=>box('darkwood',x-0.05,x+0.05,0,0.72,z-0.05,z+0.05,{collide:false}));solid(170.2,172.8,2.85,4.15,0.77,'table');
  quad('sign:rug',[169.0,0.008,5.3],[5,0,0],[0,0,-3.6],{fit:true,nu:1,nv:1});
  HPT.seats={dad:[169.65,3.5,Math.PI/2],grandpa:[170.95,2.32,0],uncle:[172.05,2.32,0],alex:[170.95,4.68,Math.PI],ruben:[172.05,4.68,Math.PI],lucia:[173.35,3.5,-Math.PI/2]};
  for(const k in HPT.seats){const s=HPT.seats[k];hchair(s[0],s[1],s[2]);}
  // place settings, glasses, the empty bread basket
  for(const k in HPT.seats){const s=HPT.seats[k];const px=s[0]+Math.sin(s[2])*0.72,pz=s[1]+Math.cos(s[2])*0.72;cyl('white',px,pz,0.77,0.785,0.12,10,{tint:[1,1,0.97]});cyl('glass',px+0.15,pz-0.12,0.77,0.9,0.035,6,{tint:[1,1,1]});}
  // the chandelier
  cyl('metal',171.5,3.5,2.35,2.7,0.015,4,{top:false});cyl('darkwood',171.5,3.5,2.25,2.35,0.28,8);[0,1,2,3,4].forEach(i=>{const a=i/5*TAU;cyl('!white',171.5+Math.cos(a)*0.26,3.5+Math.sin(a)*0.26,2.3,2.42,0.04,5,{tint:[1.3,1.1,0.8]});});
  // the sideboard and the memorial: her photo, candles, lilies, the card, the guest book
  box({d:'darkwood',t:'darkwood'},170.1,172.9,0,0.88,0.1,0.58);[170.8,171.5,172.2].forEach(x=>sign('cabinet',x,0.1,0.585,0.6,0.62,'s'));
  box('darkwood',171.25,171.75,0.88,0.92,0.2,0.35,{collide:false});pframe('portrait',171.5,0.93,0.3,0.46,0.58,'s');HPT.portrait=[171.5,1.2,0.6];
  candle(170.75,0.88,0.38,0.22);candle(170.95,0.88,0.3,0.16);candle(172.05,0.88,0.3,0.16);candle(172.25,0.88,0.38,0.22);
  cyl('glass',170.45,0.35,0.88,1.12,0.07,6,{tint:[1,1,1]});quad('sign:lily',[170.15,0.95,0.36],[0.6,0,0],[0,0.62,0],{fit:true,nu:1,nv:1});
  cyl('glass',172.55,0.35,0.88,1.12,0.07,6,{tint:[1,1,1]});quad('sign:lily',[172.25,0.95,0.36],[0.6,0,0],[0,0.62,0],{fit:true,nu:1,nv:1});
  quad('sign:memorialCard',[171.32,0.89,0.52],[0.36,0,0],[0,0.07,0.2],{fit:true,nu:1,nv:1});
  box('darkwood',174.0,174.7,0,0.95,0.6,1.1);quad('sign:guestBook',[174.05,0.955,1.05],[0.6,0,0],[0,0,-0.4],{fit:true,nu:1,nv:1});HPT.guestBook=[174.35,1.05,0.85];
  pframe('photoParents',168.11,1.5,1.6,0.42,0.52,'e');
  /* ---------------- FOYER ---------------- */
  closet(175.3,177.0,0.1,0.85,'s');HPT.coatCloset=[176.15,1.2,1.0];
  box('darkwood',178.0,179.7,0,0.82,0.12,0.48);box('!white',178.6,179.1,0.82,0.86,0.2,0.38,{collide:false,tint:[0.6,0.5,0.4]});sign('mirror',178.85,1.2,0.11,0.7,0.95,'s');
  quad('sign:rug',[176,0.008,5.6],[3.6,0,0],[0,0,-4],{fit:true,nu:1,nv:1});cyl('darkwood',179.4,6.4,0,1.75,0.04,5,{collide:true});[0,1,2].forEach(i=>box('black',179.2+i*0.12,179.3+i*0.12,1.45,1.75,6.3,6.5,{collide:false}));
  /* ---------------- HALL ---------------- */
  pframe('photoFam',157,1.45,8.89,0.62,0.46,'n');pframe('photoKids',161.7,1.45,8.89,0.36,0.46,'n');pframe('photoLuciaMom',167,1.45,8.89,0.36,0.46,'n');
  pframe('photoParents',151.5,1.45,7.11,0.36,0.46,'s');sign('thermostat',162.4,1.45,7.11,0.12,0.12,'s');
  quad('sign:runner',[150.6,0.008,8.45],[17,0,0],[0,0,-0.9],{fit:true,nu:1,nv:1});
  /* ---------------- LIVING ROOM ---------------- */
  box('darkwood',168.1,168.6,0,0.55,10.3,13.7);box('black',168.15,168.25,0.55,1.55,10.6,13.4,{collide:false});sign('tvOff',168.26,0.62,12.0,2.7,0.9,'e');
  box('sofa',172.0,172.95,0,0.45,10.0,14.0);box('sofa',172.6,172.95,0.45,0.95,10.0,14.0,{collide:false});box('sofa',172.0,172.95,0.45,0.68,10.0,10.25,{collide:false});box('sofa',172.0,172.95,0.45,0.68,13.75,14.0,{collide:false});solid(172.0,172.95,10.0,14.0,0.95,'sofa');
  box({d:'darkwood',t:'darkwood'},169.8,171.0,0.38,0.44,11.2,12.8);[[169.9,11.3],[170.9,11.3],[169.9,12.7],[170.9,12.7]].forEach(([x,z])=>box('darkwood',x-0.03,x+0.03,0,0.38,z-0.03,z+0.03,{collide:false}));solid(169.8,171.0,11.2,12.8,0.44,'table');
  cyl('glass',170.4,12.0,0.44,0.62,0.08,6,{tint:[1,1,1]});quad('sign:lily',[170.1,0.5,12.0],[0.6,0,0],[0,0.55,0],{fit:true,nu:1,nv:1});
  box('sofa',174.0,174.9,0,0.45,8.4,9.3);box('sofa',174.0,174.9,0.45,0.9,8.4,8.6,{collide:false});solid(174.0,174.9,8.4,9.3,0.9,'chair');
  cyl('metal',178.6,14.6,0,1.45,0.02,4,{top:false});cyl('!white',178.6,14.6,1.45,1.7,0.18,8,{tint:[1.2,1.0,0.75]});
  box('darkwood',179.45,179.95,0,2.1,9.4,12.6);[0.25,0.75,1.25,1.7].forEach(y=>sign('books',179.44,y,11.0,3.0,0.36,'w'));
  box('block',179.3,179.95,0,1.15,13.0,15.4);box('black',179.29,179.31,0.15,0.8,13.6,14.8,{collide:false});box('darkwood',179.15,179.95,1.15,1.22,12.85,15.55,{collide:false});
  pframe('photoFam',179.9,1.3,14.2,0.5,0.38,'w');pframe('photoKids',179.9,1.27,13.4,0.26,0.33,'w');
  quad('sign:rug',[169.2,0.008,14.6],[3.4,0,0],[0,0,-4.4],{fit:true,nu:1,nv:1});
  /* ---------------- LUCIA'S ROOM ---------------- */
  hbed(155.5,157.45,12.4,13.8,'fabricL','e');HPT.bedL=[156.4,0.4,12.3];
  box('darkwood',156.95,157.45,0,0.55,14.0,14.55);HPT.charger=[157.2,0.7,14.25];box('black',157.1,157.3,0.55,0.57,14.15,14.35,{collide:false});
  box('wood',152.0,154.0,0.72,0.76,15.35,15.95);[[152.05,15.4],[153.95,15.4]].forEach(([x,z])=>box('wood',x-0.03,x+0.03,0,0.72,z-0.03,z+0.03,{collide:false}));solid(152,154,15.35,15.95,0.76,'desk');chair(153,14.85,Math.PI,{seat:'fabricL'});
  closet(150.1,151.0,9.4,11.4,'e');HPT.closetL=[151.1,1.2,10.4];
  box('wood',155.2,156.9,0,0.95,9.1,9.6);pframe('photoLuciaMom',156.05,0.96,9.4,0.22,0.28,'s');sign('mirror',155.4,1.15,9.11,0.5,0.8,'s');
  sign('posterL',150.11,1.2,14.8,0.5,0.66,'e');sign('posterL',157.39,1.3,10.6,0.48,0.64,'w');quad('sign:rugRound',[152.2,0.009,13.6],[2.2,0,0],[0,0,-2.2],{fit:true,nu:1,nv:1});
  /* ---------------- BATHROOM ---------------- */
  box({d:'cabinet',t:'granite'},157.6,158.2,0,0.85,9.6,10.9);sign('mirror',157.61,1.2,10.25,0.7,0.85,'e');cyl('white',157.95,10.25,0.85,0.88,0.16,8,{tint:[0.95,0.95,0.95]});
  box('white',160.4,160.9,0,0.42,11.6,12.2,{tint:[0.95,0.95,0.93]});box('white',160.75,160.95,0.42,0.9,11.65,12.15,{collide:false,tint:[0.95,0.95,0.93]});
  box('white',157.6,160.95,0,0.55,14.5,15.95,{tint:[0.95,0.95,0.95]});quad('sign:curtain',[157.6,0.1,14.45],[3.35,0,0],[0,2.0,0],{fit:true,nu:1,nv:1});box('metal',157.6,160.95,2.1,2.13,14.43,14.47,{collide:false});
  /* ---------------- ALEX'S ROOM ---------------- */
  hbed(161.15,163.2,13.3,14.7,'fabricA','w');HPT.bedA=[162.2,0.4,13.2];
  closet(167.1,167.95,9.5,11.5,'w');HPT.closetA=[167.0,1.2,10.5];
  box('wood',165.8,167.8,0.72,0.76,15.35,15.95);solid(165.8,167.8,15.35,15.95,0.76,'desk');box('black',166.4,167.2,0.76,1.2,15.65,15.8,{collide:false});sign('screen2',166.8,0.8,15.64,0.7,0.36,'n');
  box('fabricL',164.0,166.0,0,0.14,13.4,14.3,{tint:[0.45,0.6,0.85]});box('linen',164.0,164.4,0.14,0.24,13.5,14.2,{collide:false});
  sign('posterA',161.11,1.2,10.4,0.5,0.66,'e');sign('posterA',167.89,1.3,13.4,0.48,0.64,'w');box('blue',161.6,162.2,0,0.45,9.2,9.6);
  /* ---------------- YARD ---------------- */
  box('porchWood',180.0,182.6,0,0.03,1.6,5.6,{collide:false,shadow:false});[1.75,5.45].forEach(z=>cyl('white',182.45,z,0,2.6,0.07,6,{collide:true,tint:[0.95,0.95,0.92]}));box('white',180,182.7,2.6,2.75,1.5,5.7,{collide:false,faces:'nsewtb',tint:[0.8,0.8,0.78]});
  box('!white',180.12,180.2,2.0,2.25,2.3,2.5,{collide:false,tint:[1.3,1.1,0.7]});
  quad('pavement',[182.6,0.01,4.2],[9,0,0],[0,0,-1.2],{step:1});quad('asphalt',[191.6,0.012,19],[4.4,0,0],[0,0,-22],{step:2});box('pavement',191.4,191.6,0,0.12,-3,19,{collide:false});
  cyl('metal',190.9,2.2,0,1.05,0.04,4,{collide:true});box('black',190.75,191.1,1.05,1.3,2.0,2.45,{collide:false});
  cyl('metal',195.4,12,0,5.6,0.07,5,{collide:true});box('black',194.9,195.6,5.5,5.65,11.85,12.15,{collide:false});
  [[186.5,12.5,1.3],[187.5,-1.2,1.0],[183.5,15.5,0.9]].forEach(([x,z,s])=>{cyl('darkwood',x,z,0,2.2*s,0.14*s,6,{collide:true});const g=new THREE.Mesh(new THREE.SphereGeometry(1.4*s,7,5),basic({color:0x0c1409}));g.position.set(x,3.0*s,z);g.scale.y=1.2;scene.add(g);HOUSE_DYN.push(g);});
  // Pepper Toni's delivery van, at the curb, side door open
  const vx0=192.3,vx1=194.5,vz0=0.0,vz1=6.0;
  const VT=[0.95,0.93,0.88];box({d:'white',t:'white'},vx0,vx1,0.35,2.4,vz0,vz1,{collide:false,faces:'nset',tint:VT});
  // the street side has its sliding door open: the body is built around the gap, and it's dark inside
  quad('white',[vx0,0.35,vz0],[0,0,2.2],[0,2.05,0],{tint:VT});quad('white',[vx0,0.35,3.9],[0,0,vz1-3.9],[0,2.05,0],{tint:VT});quad('white',[vx0,2.15,2.2],[0,0,1.7],[0,0.25,0],{tint:VT});quad('white',[vx0,0.35,2.2],[0,0,1.7],[0,0.07,0],{tint:VT});
  box('black',vx0+0.04,vx1-0.04,0.42,2.36,vz0+0.04,vz1-0.04,{collide:false,faces:'nset',tint:[0.35,0.3,0.28]});box('black',vx0+0.04,vx1-0.04,0.35,0.42,vz0+0.3,vz1-0.3,{collide:false,faces:'t',tint:[0.5,0.45,0.4]});
  box('white',vx0-0.09,vx0-0.03,0.42,2.12,3.95,5.6,{collide:false,faces:'nswe',tint:[0.9,0.88,0.84]});sign('vanSide',vx0-0.1,1.05,4.75,1.6,0.6,'w');
  sign('vanSide',vx1+0.01,0.5,(vz0+vz1)/2,5.6,1.7,'e');sign('vanFront',(vx0+vx1)/2,0.4,vz0-0.01,2.2,1.65,'n');lamp(193.4,2.1,3.1,[0.6,0.48,0.32],2.8,'h_yard');
  box('!sign:vanTop',193.0,193.8,2.4,2.68,2.6,3.3,{collide:false,faces:'nsewt',fit:true,nu:1,nv:1});
  [[vx0+0.1,0.9],[vx1-0.1,0.9],[vx0+0.1,5.1],[vx1-0.1,5.1]].forEach(([x,z])=>cyl('black',x,z,0,0.38,0.36,8,{top:false}));solid(vx0,vx1,vz0,vz1,2.4,'van');
  HPT.vanDoor=[vx0-0.4,1.3,3.05];HPT.frontDoor=[179.6,1.3,3.6];HPT.porch=[181.3,3.6];
  /* ---------------- doors and hiding places ---------------- */
  DOORS.hGarLaun=mkDoor('hGarLaun','sign:hDoor',157,1.0,1.2,'z',1);DOORS.hLaunKit=mkDoor('hLaunKit','sign:hDoor',160,1.0,1.2,'z',-1,{open:1});
  DOORS.hPantry=mkDoor('hPantry','sign:louver',160,4.8,1.0,'z',1);
  DOORS.hLucia=mkDoor('hLucia','sign:hDoor',153.4,9,1.0,'x',1,{open:1});DOORS.hBath=mkDoor('hBath','sign:hDoor',158.6,9,1.0,'x',1,{open:1});DOORS.hAlex=mkDoor('hAlex','sign:hDoor',164.4,9,1.0,'x',1,{open:1});
  DOORS.hFront=mkDoor('hFront','sign:hFrontDoor',180,3.0,1.2,'z',-1);
  HIDES.push({id:'hClosetL',kind:'closet',x:150.55,z:10.4,yaw:-Math.PI/2,ex:151.45,ez:10.4,eye:1.45,house:1},
    {id:'hBedL',kind:'bed',x:156.4,z:13.1,yaw:0,ex:156.4,ez:11.95,eye:0.2,house:1},
    {id:'hClosetA',kind:'closet',x:167.5,z:10.5,yaw:Math.PI/2,ex:166.6,ez:10.5,eye:1.45,house:1},
    {id:'hBedA',kind:'bed',x:162.2,z:14.0,yaw:0,ex:162.2,ez:12.85,eye:0.2,house:1},
    {id:'hShower',kind:'curtain',x:159.25,z:15.2,yaw:0,ex:159.25,ez:13.9,eye:1.35,house:1},
    {id:'hPantry',kind:'closet',x:158.7,z:5.3,yaw:-Math.PI/2,ex:160.6,ez:5.3,eye:1.45,house:1},
    {id:'hCoat',kind:'closet',x:176.15,z:0.45,yaw:Math.PI,ex:176.15,ez:1.4,eye:1.45,house:1});
}
signTex('rug',64,48,(g,w,h)=>{g.fillStyle='#5a1e1a';g.fillRect(0,0,w,h);g.strokeStyle='#c9a85a';g.lineWidth=2;g.strokeRect(4,4,w-8,h-8);g.strokeStyle='#2a3a5a';g.strokeRect(8,8,w-16,h-16);
  for(let i=0;i<10;i++){g.fillStyle=['#c9a85a','#2a3a5a','#8a3a2a'][i%3];g.beginPath();g.arc(16+(i%5)*8,18+((i/5)|0)*12,2,0,TAU);g.fill();}speck(g,w,h,120,['rgba(0,0,0,.15)'],1,hr);});
signTex('runner',128,16,(g,w,h)=>{g.fillStyle='#3a4a5a';g.fillRect(0,0,w,h);g.fillStyle='#c9b48a';g.fillRect(0,2,w,1);g.fillRect(0,h-3,w,1);for(let x=8;x<w;x+=16){g.fillStyle='#8a3a2a';g.fillRect(x,6,4,4);}});
signTex('rugRound',64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#d8c8d0';g.beginPath();g.arc(32,32,31,0,TAU);g.fill();g.strokeStyle='#b0a0b0';for(let r=8;r<31;r+=6){g.beginPath();g.arc(32,32,r,0,TAU);g.stroke();}});
signTex('curtain',64,64,(g,w,h)=>{g.fillStyle='#d8e0e2';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=8){g.fillStyle='rgba(120,140,150,.25)';g.fillRect(x,0,3,h);}g.fillStyle='rgba(90,150,170,.35)';for(let y=6;y<h;y+=12)for(let x=(y/12|0)%2*6;x<w;x+=12){g.beginPath();g.arc(x+3,y,2,0,TAU);g.fill();}});
const HOUSE_DYN=[];
/* Toni's walking graph through the house and out to the van (added at boot, before buildNav) */
function houseNav(){NAVP.push([155.5,1.6],[155.5,6.2],[152.5,6.4],[156.4,1.6],[157.6,1.6],[158.6,1.6],[159.4,1.6],[160.6,1.6],
  [161.6,1.6],[166.3,1.5],[161.6,5.5],[166.3,5.5],[164.3,6.3],[160.6,5.3],[164.3,7.7],
  [151.5,8],[153.9,8],[159.1,8],[164.9,8],[167.4,8],
  [153.9,9.7],[153.6,11.5],[152.2,13.6],[155.2,11.2],[159.1,9.8],[159.3,12.8],[164.9,9.8],[164.5,12],[166.5,12.6],
  [168.8,8],[169.4,9.0],[171.4,9.4],[171.4,14.6],[174.5,11.8],[176.8,9.6],[176.8,14.6],[178.6,11.2],
  [168.9,1.3],[174.2,1.3],[168.9,5.8],[174.2,5.8],[171.5,6.2],[171.5,7.8],[175.8,3.6],[177.5,2.0],[177.5,5.5],[179.2,3.6],[177.5,7.8],
  [181.3,3.6],[184,3.6],[188,3.6],[190.4,5.2],[188,9],[186,0.5]);}
