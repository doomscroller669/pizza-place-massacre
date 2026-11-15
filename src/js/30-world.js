/* ============================================================
   WORLD: a static-geometry builder. Quads go into one bucket per texture; at the end every vertex is lit
   once from the room's lamps (the light never leaks through walls, because each lamp lights only its own
   room group) and each bucket becomes a single mesh.
   ============================================================ */
const WALL_T=0.2;
const SB=new Map();
function bucket(key){let b=SB.get(key);if(!b){b={pos:[],nrm:[],uv:[],tint:[]};SB.set(key,b);}return b;}
const _v=[0,0,0];
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function norm(a){const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];}
/* quad: corners o, o+U, o+U+V, o+V; the front face points along U x V */
function quad(key,o,U,V,opts={}){
  const b=bucket(key);const n=opts.n||norm(cross(U,V));
  const lu=Math.hypot(U[0],U[1],U[2]),lv=Math.hypot(V[0],V[1],V[2]);
  const nu=opts.nu||Math.max(1,Math.min(24,Math.round(lu/(opts.step||1.25)))),nv=opts.nv||Math.max(1,Math.min(12,Math.round(lv/(opts.step||1.25))));
  const s=(TX[key.replace(/^!/,'')]||{s:1}).s,fit=opts.fit,tint=opts.tint||[1,1,1];
  const P=(i,j)=>[o[0]+U[0]*i/nu+V[0]*j/nv,o[1]+U[1]*i/nu+V[1]*j/nv,o[2]+U[2]*i/nu+V[2]*j/nv];
  const UV=(p,i,j)=>{if(fit){const f=fit===true?[0,0,1,1]:fit;return [f[0]+(f[2]-f[0])*i/nu,f[1]+(f[3]-f[1])*j/nv];}
    let u,v;if(Math.abs(n[1])>0.7){u=p[0]/s;v=-p[2]/s;}else if(Math.abs(n[0])>=Math.abs(n[2])){u=(n[0]>0?-p[2]:p[2])/s;v=p[1]/s;}else{u=(n[2]>0?p[0]:-p[0])/s;v=p[1]/s;}
    if(opts.uvOff){u+=opts.uvOff[0];v+=opts.uvOff[1];}return [u,v];};
  for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=P(i,j),bb=P(i+1,j),c=P(i+1,j+1),d=P(i,j+1);const ua=UV(a,i,j),ub=UV(bb,i+1,j),uc=UV(c,i+1,j+1),ud=UV(d,i,j+1);
    for(const [p,uv] of [[a,ua],[bb,ub],[c,uc],[a,ua],[c,uc],[d,ud]]){b.pos.push(p[0],p[1],p[2]);b.nrm.push(n[0],n[1],n[2]);b.uv.push(uv[0],uv[1]);b.tint.push(tint[0],tint[1],tint[2]);}}
}
/* contact shadows: a soft dark patch on the floor under furniture, so nothing looks pasted on.
   round=true for cylinders. k = how far the soft edge reaches past the footprint. */
function shadowRect(x0,x1,z0,z1,k=0.14,round=false){const X0=Math.min(x0,x1)-k,X1=Math.max(x0,x1)+k,Z0=Math.min(z0,z1)-k,Z1=Math.max(z0,z1)+k;
  quad(round?'!shadowRound':'!shadowRect',[X0,0.006,Z1],[X1-X0,0,0],[0,0,-(Z1-Z0)],{fit:true,nu:1,nv:1});}
/* collision: axis-aligned rects on the floor plan. top = height, used for sight lines and ducking */
const SOLIDS=[];
function solid(x0,x1,z0,z1,top=3,tag){const r={x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1),top,tag,on:true};SOLIDS.push(r);return r;}
/* box prop. faces: string of n s e w t b (default all but bottom). key may be an object per face */
function box(key,x0,x1,y0,y1,z0,z1,opts={}){
  const f=opts.faces||'nsewt',K=c=>typeof key==='string'?key:(key[c]||key.d),dx=x1-x0,dy=y1-y0,dz=z1-z0,o2=Object.assign({},opts);delete o2.faces;
  const fo=c=>opts.fitFace&&opts.fitFace[c]?Object.assign({},o2,{fit:opts.fitFace[c]}):o2;
  if(f.includes('e'))quad(K('e'),[x1,y0,z1],[0,0,-dz],[0,dy,0],fo('e'));
  if(f.includes('w'))quad(K('w'),[x0,y0,z0],[0,0,dz],[0,dy,0],fo('w'));
  if(f.includes('s'))quad(K('s'),[x0,y0,z1],[dx,0,0],[0,dy,0],fo('s'));
  if(f.includes('n'))quad(K('n'),[x1,y0,z0],[-dx,0,0],[0,dy,0],fo('n'));
  if(f.includes('t'))quad(K('t'),[x0,y1,z1],[dx,0,0],[0,0,-dz],fo('t'));
  if(f.includes('b'))quad(K('b'),[x0,y0,z0],[dx,0,0],[0,0,dz],fo('b'));
  if(opts.collide!==false&&y0<1.6&&y1>0.25)solid(x0,x1,z0,z1,y1,opts.tag);
  if(opts.shadow!==false&&y0<0.02&&y1>0.2&&Math.min(x1-x0,z1-z0)>0.12&&!/^!/.test(typeof key==='string'?key:'x'))shadowRect(x0,x1,z0,z1,Math.min(0.2,0.08+(y1-y0)*0.06));
}
function cyl(key,cx,cz,y0,y1,r,seg=8,opts={}){for(let i=0;i<seg;i++){const a0=i/seg*TAU,a1=(i+1)/seg*TAU;const p0=[cx+Math.cos(a0)*r,y0,cz+Math.sin(a0)*r],p1=[cx+Math.cos(a1)*r,y0,cz+Math.sin(a1)*r];
    quad(key,p1,[p0[0]-p1[0],0,p0[2]-p1[2]],[0,y1-y0,0],Object.assign({nu:1,nv:1},opts));}
  if(opts.top!==false){for(let i=0;i<seg;i++){const a0=i/seg*TAU,a1=(i+1)/seg*TAU;const b=bucket(opts.topKey||key);const t=opts.tint||[1,1,1];const s=(TX[(opts.topKey||key).replace(/^!/,'')]||{s:1}).s;
    const pts=[[cx,y1,cz],[cx+Math.cos(a1)*r,y1,cz+Math.sin(a1)*r],[cx+Math.cos(a0)*r,y1,cz+Math.sin(a0)*r]];pts.forEach(p=>{b.pos.push(p[0],p[1],p[2]);b.nrm.push(0,1,0);b.uv.push(p[0]/s,-p[2]/s);b.tint.push(t[0],t[1],t[2]);});}}
  if(opts.collide)solid(cx-r,cx+r,cz-r,cz+r,y1);
  if(y0<0.02&&y1>0.2&&opts.shadow!==false)shadowRect(cx-r,cx+r,cz-r,cz+r,0.12,true);}
/* a flat picture on a wall: n is the direction it faces (one of 'n','s','e','w'); (x,z) on the wall surface */
function sign(name,x,y,z,w,h,face,opts={}){const key=SIGN[name]?'sign:'+name:name;const d=0.012;const o2=Object.assign({fit:true,nu:1,nv:1},opts);
  if(face==='s')quad(key,[x-w/2,y,z+d],[w,0,0],[0,h,0],o2);if(face==='n')quad(key,[x+w/2,y,z-d],[-w,0,0],[0,h,0],o2);
  if(face==='e')quad(key,[x+d,y,z+w/2],[0,0,-w],[0,h,0],o2);if(face==='w')quad(key,[x-d,y,z-w/2],[0,0,w],[0,h,0],o2);
  if(face==='up')quad(key,[x-w/2,y,z+h/2],[w,0,0],[0,0,-h],o2);}

/* ---------- rooms ---------- */
const ROOMS=[
  {id:'store',  n:'Storeroom',       x0:0, x1:8, z0:0, z1:10,h:3.0,floor:'concrete',wall:'block',ceil:'ceilDirty',g:'store',surf:'tile'},
  {id:'freezer',n:'Walk-in freezer', x0:8, x1:14,z0:0, z1:6, h:2.6,floor:'diamond',wall:'steel',ceil:'steel',g:'freezer',surf:'metal'},
  {id:'kback',  n:'Kitchen',         x0:8, x1:14,z0:6, z1:10,h:3.0,floor:'quarry',wall:'kitchenTile',ceil:'ceilDirty',g:'kitchen',surf:'tile'},
  {id:'kitchen',n:'Kitchen',         x0:14,x1:28,z0:0, z1:10,h:3.0,floor:'quarry',wall:'kitchenTile',ceil:'ceilDirty',g:'kitchen',surf:'tile'},
  {id:'office', n:"Manager's office",x0:28,x1:36,z0:0, z1:8, h:2.8,floor:'officeCarpet',wall:'panel',ceil:'ceil',g:'office',surf:'carpet'},
  {id:'employee',n:'Employee room',  x0:36,x1:46,z0:0, z1:8, h:2.8,floor:'vct',wall:'blockPaint',ceil:'ceil',g:'employee',surf:'tile'},
  {id:'hall',   n:'Back hall',       x0:28,x1:46,z0:8, z1:10,h:2.8,floor:'vct',wall:'blockPaint',ceil:'ceil',g:'hall',surf:'tile'},
  {id:'dining', n:'Dining room',     x0:10,x1:34,z0:10,z1:28,h:3.4,floor:'checker',wall:'dining',ceil:'ceil',g:'dining',surf:'tile'},
  {id:'party',  n:'Party room',      x0:34,x1:46,z0:10,z1:21,h:3.0,floor:'partyCarpet',wall:'party',ceil:'ceil',g:'party',surf:'carpet'},
  {id:'arcade', n:'Game zone',       x0:34,x1:46,z0:21,z1:34,h:3.4,floor:'arcadeCarpet',wall:'arcadeWall',ceil:'ceilDark',g:'arcade',surf:'carpet'},
  {id:'fun',    n:'Fun zone',        x0:0, x1:10,z0:10,z1:34,h:6.0,floor:'foam',wall:'funWall',ceil:'ceilDark',g:'fun',surf:'foam'},
  {id:'closet', n:'Storage closet',  x0:10,x1:18,z0:28,z1:34,h:2.8,floor:'concrete',wall:'blockPaint',ceil:'ceil',g:'closet',surf:'tile'},
  {id:'vest',   n:'Front entrance',  x0:18,x1:24,z0:28,z1:34,h:3.0,floor:'checker',wall:'dining',ceil:'ceil',g:'vest',surf:'tile'},
  {id:'mens',   n:"Men's room",      x0:24,x1:29,z0:28,z1:34,h:2.8,floor:'smallTile',wall:'bathTile',ceil:'ceil',g:'mens',surf:'tile'},
  {id:'womens', n:"Women's room",    x0:29,x1:34,z0:28,z1:34,h:2.8,floor:'smallTile',wall:'bathTile',ceil:'ceil',g:'womens',surf:'tile'},
];
const ROOM=Object.fromEntries(ROOMS.map(r=>[r.id,r]));
/* openings on the boundary lines between rooms. ax 'x': the line x=c, running a0..a1 along z. ax 'z': the line z=c, along x.
   y0>0 makes a window (still solid to walk into). */
const OPENINGS=[
  {ax:'x',c:8, a0:7.4,a1:8.8, id:'storeDoor'},
  {ax:'z',c:6, a0:10.3,a1:11.7,id:'freezerDoor'},
  {ax:'x',c:14,a0:6.0,a1:10, y1:3.0,id:'kbackArch'},
  {ax:'x',c:28,a0:5.0,a1:6.4, id:'officeKitchen'},
  {ax:'x',c:28,a0:8.2,a1:9.8, id:'hallKitchen'},
  {ax:'z',c:8, a0:33,a1:34.4, id:'officeHall'},
  {ax:'z',c:8, a0:39,a1:40.4, id:'employeeHall'},
  {ax:'z',c:10,a0:29,a1:30.6, id:'hallDining'},
  {ax:'z',c:10,a0:15,a1:21, y0:0.95,y1:1.85,id:'pass',open:true},
  {ax:'z',c:10,a0:24,a1:25.6, id:'swing'},
  {ax:'x',c:34,a0:12,a1:13.4, id:'partyDoor'},
  {ax:'x',c:10,a0:12,a1:27.5, y1:3.4,id:'funArch'},
  {ax:'x',c:34,a0:22,a1:27.5, y1:3.4,id:'arcadeArch'},
  {ax:'z',c:28,a0:15,a1:16.4, id:'closetDoor'},
  {ax:'z',c:28,a0:19,a1:23, y1:2.6,id:'vestArch'},
  {ax:'z',c:28,a0:25,a1:26.2, id:'mensDoor'},
  {ax:'z',c:28,a0:30,a1:31.2, id:'womensDoor'},
  {ax:'z',c:34,a0:20,a1:22, y1:2.3,id:'frontDoor',outside:true},
  // windows to the parking lot, all grated
  {ax:'x',c:0, a0:14,a1:17, y0:1.0,y1:2.5,win:true},{ax:'x',c:0,a0:20,a1:23,y0:1.0,y1:2.5,win:true},{ax:'x',c:0,a0:26,a1:29,y0:1.0,y1:2.5,win:true},
  {ax:'x',c:46,a0:13,a1:15.4,y0:1.0,y1:2.3,win:true},{ax:'x',c:46,a0:16.6,a1:19,y0:1.0,y1:2.3,win:true},
  {ax:'x',c:46,a0:3,a1:5,y0:1.2,y1:2.2,win:true},
  {ax:'z',c:34,a0:18.6,a1:19.6,y0:0.6,y1:2.6,win:true},{ax:'z',c:34,a0:22.4,a1:23.4,y0:0.6,y1:2.6,win:true},
];
const OPEN=Object.fromEntries(OPENINGS.filter(o=>o.id).map(o=>[o.id,o]));
function roomAt(x,z){for(const r of ROOMS)if(x>=r.x0&&x<=r.x1&&z>=r.z0&&z<=r.z1)return r;return null;}
function groupAt(x,z){const r=roomAt(x,z);return r?r.g:'out';}

function buildRoom(r){
  const H=r.h,t=WALL_T/2;
  quad(r.floor,[r.x0,0,r.z1],[r.x1-r.x0,0,0],[0,0,-(r.z1-r.z0)],{step:1});
  quad(r.ceil,[r.x0,H,r.z0],[r.x1-r.x0,0,0],[0,0,r.z1-r.z0],{step:r.ceilStep||1.5});
  const edges=[
    {ax:'z',c:r.z0,a0:r.x0,a1:r.x1,inward:1,k:'n'},{ax:'z',c:r.z1,a0:r.x0,a1:r.x1,inward:-1,k:'s'},
    {ax:'x',c:r.x0,a0:r.z0,a1:r.z1,inward:1,k:'w'},{ax:'x',c:r.x1,a0:r.z0,a1:r.z1,inward:-1,k:'e'}];
  for(const e of edges){const wallKey=(r.walls&&r.walls[e.k])||r.wall;
    const ops=OPENINGS.filter(o=>o.ax===e.ax&&Math.abs(o.c-e.c)<0.01&&o.a1>e.a0&&o.a0<e.a1).map(o=>({a0:Math.max(o.a0,e.a0),a1:Math.min(o.a1,e.a1),y0:o.y0||0,y1:Math.min(o.y1||2.2,H),o})).sort((p,q)=>p.a0-q.a0);
    const w=e.c+e.inward*t;
    // a face spanning a range along the edge, from y0 to y1
    const face=(a0,a1,y0,y1)=>{if(a1-a0<0.01||y1-y0<0.01)return;
      if(e.ax==='z'){if(e.inward>0)quad(wallKey,[a0,y0,w],[a1-a0,0,0],[0,y1-y0,0]);else quad(wallKey,[a1,y0,w],[a0-a1,0,0],[0,y1-y0,0]);}
      else{if(e.inward>0)quad(wallKey,[w,y0,a1],[0,0,a0-a1],[0,y1-y0,0]);else quad(wallKey,[w,y0,a0],[0,0,a1-a0],[0,y1-y0,0]);}};
    const s0=e.a0+t,s1=e.a1-t;let a=s0;
    for(const p of ops){face(a,p.a0,0,H);face(p.a0,p.a1,0,p.y0);face(p.a0,p.a1,p.y1,H);a=p.a1;
      // half the jambs, sill and lintel, out to the boundary line
      const mid=e.c;
      if(e.ax==='z'){quad(wallKey,[p.a0,p.y0,w],[0,0,-e.inward*t],[0,p.y1-p.y0,0],{n:[1,0,0],nu:1});quad(wallKey,[p.a1,p.y0,mid],[0,0,e.inward*t],[0,p.y1-p.y0,0],{n:[-1,0,0],nu:1});
        quad(wallKey,[p.a0,p.y1,w],[p.a1-p.a0,0,0],[0,0,-e.inward*t],{n:[0,-1,0],nv:1});if(p.y0>0)quad(wallKey,[p.a0,p.y0,mid],[p.a1-p.a0,0,0],[0,0,e.inward*t],{n:[0,1,0],nv:1});}
      else{quad(wallKey,[w,p.y0,p.a0],[-e.inward*t,0,0],[0,p.y1-p.y0,0],{n:[0,0,1],nu:1});quad(wallKey,[mid,p.y0,p.a1],[e.inward*t,0,0],[0,p.y1-p.y0,0],{n:[0,0,-1],nu:1});
        quad(wallKey,[mid,p.y1,p.a0],[e.inward*t,0,0],[0,0,p.a1-p.a0],{n:[0,-1,0],nu:1});if(p.y0>0)quad(wallKey,[w,p.y0,p.a0],[-e.inward*t,0,0],[0,0,p.a1-p.a0],{n:[0,1,0],nu:1});}
      }
    face(a,s1,0,H);
    // collision along the edge, leaving walkable openings
    let c0=e.a0;for(const p of ops){if(p.y0===0){addWallSolid(e,c0,p.a0);c0=p.a1;}}addWallSolid(e,c0,e.a1);
  }
}
function addWallSolid(e,a0,a1){if(a1-a0<0.01)return;if(e.ax==='z')solid(a0,a1,e.c-WALL_T/2,e.c+WALL_T/2,4,'wall');else solid(e.c-WALL_T/2,e.c+WALL_T/2,a0,a1,4,'wall');}
/* windows: a grate and the night outside. Fit UVs run left to right as seen from inside. */
function buildWindows(){for(const o of OPENINGS){if(!o.win)continue;const y0=o.y0||0,y1=o.y1||2.2,w=o.a1-o.a0,h=y1-y0,am=(o.a0+o.a1)/2;
  const inside=o.ax==='x'?(roomAt(o.c+0.3,am)?1:-1):(roomAt(am,o.c+0.3)?1:-1);const out=o.c-inside*(o.view?0.3:0.45),gr=o.c-inside*0.05;
  const view=o.view?'!sign:'+o.view:'!night',sash=o.view?'sign:sash':'grate',sopt=o.view?{fit:true,nu:1,nv:1}:{};
  if(o.ax==='x'){const z0=inside>0?o.a1:o.a0,dz=inside>0?-w:w;
    quad(view,[out,y0-0.25,z0],[0,0,dz],[0,h+0.5,0],{fit:true,nu:1,nv:1,n:[inside,0,0],tint:[0.85,0.85,0.9]});
    quad(sash,[gr,y0,z0],[0,0,dz],[0,h,0],Object.assign({n:[inside,0,0]},sopt));solid(o.c-0.12,o.c+0.12,o.a0,o.a1,4,'wall');}
  else{const x0=inside>0?o.a0:o.a1,dx=inside>0?w:-w;
    quad(view,[x0,y0-0.25,out],[dx,0,0],[0,h+0.5,0],{fit:true,nu:1,nv:1,n:[0,0,inside],tint:[0.85,0.85,0.9]});
    quad(sash,[x0,y0,gr],[dx,0,0],[0,h,0],Object.assign({n:[0,0,inside]},sopt));solid(o.a0,o.a1,o.c-0.12,o.c+0.12,4,'wall');}}}

/* ---------- lamps and baked light ---------- */
const LAMPS=[];const AMB={};const AMB_DARK={};
/* house power: 'on' while the lights work, 'dark' once Toni cuts it. A lamp with set:'on' only lights the first, set:'dark' only the second. */
let LIGHTSET='on';
function lamp(x,y,z,col,range,g,opts={}){LAMPS.push({x,y,z,c:col,r:range,g:Array.isArray(g)?g:[g],down:opts.down||0,set:opts.set||null});
  if(opts.panel){const w=opts.panel[0],d=opts.panel[1];quad('!white',[x-w/2,y-0.01,z-d/2],[w,0,0],[0,0,d],{fit:true,nu:1,nv:1,tint:opts.ptint||[1.15,1.15,1.05]});}}
function lightAt(x,y,z,n,grp){const g=grp||groupAt(x+(n?n[0]*0.25:0),z+(n?n[2]*0.25:0));const a=(LIGHTSET==='dark'&&AMB_DARK[g])||AMB[g]||[0.12,0.1,0.09];let r=a[0],gg=a[1],b=a[2];
  for(const L of LAMPS){if(!L.g.includes(g)||(L.set&&L.set!==LIGHTSET))continue;const dx=L.x-x,dy=L.y-y,dz=L.z-z,d=Math.hypot(dx,dy,dz);if(d>=L.r)continue;let att=1-d/L.r;att*=att;
    let lam=1;if(n){const ndl=(n[0]*dx+n[1]*dy+n[2]*dz)/(d||1);lam=Math.max(0,ndl)*0.72+0.28;}
    if(L.down){const cosd=-dy/(d||1);att*=lerp(1,clamp(cosd*1.4,0.15,1),L.down);}
    r+=L.c[0]*att*lam;gg+=L.c[1]*att*lam;b+=L.c[2]*att*lam;}
  const k=(0.82+0.18*clamp(y/1.4,0,1))*LIGHT_GAIN;return [r*k,gg*k,b*k];}
const LIGHT_GAIN=1.6;
const BAKED=[];
function bake(){const meshes=[];
  for(const [key,b] of SB){const unlit=key[0]==='!';const name=key.replace(/^!/,'');const n=b.pos.length/3;const col=new Float32Array(n*3);let dark=null;
    for(let i=0;i<n;i++){const p=[b.pos[i*3],b.pos[i*3+1],b.pos[i*3+2]],nn=[b.nrm[i*3],b.nrm[i*3+1],b.nrm[i*3+2]];
      let L=unlit?[1,1,1]:lightAt(p[0],p[1],p[2],nn);let h=unlit?1:0.95+((Math.sin(p[0]*12.99+p[1]*78.2+p[2]*37.7)*43758.5)%1+1)%1*0.08;
      if(!unlit)h*=occlusion(p,nn);
      col[i*3]=Math.min(1.25,L[0]*b.tint[i*3]*h);col[i*3+1]=Math.min(1.25,L[1]*b.tint[i*3+1]*h);col[i*3+2]=Math.min(1.25,L[2]*b.tint[i*3+2]*h);
      if(unlit&&name==='white'&&p[0]>HOUSE_X0&&p[0]<181){if(!dark)dark=col.slice();dark[i*3]=col[i*3]*0.07;dark[i*3+1]=col[i*3+1]*0.07;dark[i*3+2]=col[i*3+2]*0.08;}
      if(!unlit&&p[0]>HOUSE_X0){if(!dark)dark=col.slice();LIGHTSET='dark';const D=lightAt(p[0],p[1],p[2],nn);LIGHTSET='on';
        dark[i*3]=Math.min(1.25,D[0]*b.tint[i*3]*h);dark[i*3+1]=Math.min(1.25,D[1]*b.tint[i*3+1]*h);dark[i*3+2]=Math.min(1.25,D[2]*b.tint[i*3+2]*h);}}
    if(dark)for(let i=0;i<n;i++){if(!(b.pos[i*3]>HOUSE_X0)){dark[i*3]=col[i*3];dark[i*3+1]=col[i*3+1];dark[i*3+2]=col[i*3+2];}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(b.pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));geo.setAttribute('color',new THREE.BufferAttribute(col,3));
    const map=name.startsWith('sign:')?SIGN[name.slice(5)]:(TX[name]&&TX[name].t);
    const cut=['grate','blood','night','plush','ballpit'].includes(name)||name.startsWith('sign:');const shade=name.startsWith('shadow');
    const m=basic({map,vertexColors:true,transparent:name==='glass'||shade,opacity:1,alphaTest:cut?0.4:0,side:THREE.DoubleSide,depthWrite:name!=='glass'&&!shade});
    if(shade){m.polygonOffset=true;m.polygonOffsetFactor=-2;m.polygonOffsetUnits=-2;}
    if(name==='night'||name==='white'||name==='sky'||name.startsWith('sign:yard')||name==='sign:vanTop'||name==='flame')m.fog=false;
    const mesh=new THREE.Mesh(geo,m);mesh.matrixAutoUpdate=false;scene.add(mesh);meshes.push(mesh);if(dark){mesh.userData.cols={on:col,dark};BAKED.push(mesh);}}
  SB.clear();return meshes;}
/* the house's lights: on, or cut at the breaker */
function setPower(on){LIGHTSET=on?'on':'dark';for(const m of BAKED){const a=m.geometry.attributes.color;a.array.set(m.userData.cols[LIGHTSET]);a.needsUpdate=true;}}

/* soft occlusion baked into the vertex light: the bottom of a wall, the edge of a floor, the corners of a ceiling */
function occlusion(p,n){const r=roomAt(p[0],p[2]);let k=1;
  if(Math.abs(n[1])<0.5){k*=lerp(0.7,1,clamp(p[1]/0.9,0,1));if(r)k*=lerp(0.88,1,clamp((r.h-p[1])/0.6,0,1));}
  else if(r){const d=Math.min(p[0]-r.x0,r.x1-p[0],p[2]-r.z0,r.z1-p[2]);k*=lerp(n[1]>0?0.72:0.8,1,clamp(d/1.1,0,1));}
  return k;}
/* light a dynamic object: one color sampled where it stands */
function tintAt(x,y,z,k=1){const L=lightAt(x,y,z,null);return new THREE.Color(Math.min(1.2,L[0]*k),Math.min(1.2,L[1]*k),Math.min(1.2,L[2]*k));}

/* ---------- collision for the player and Toni ---------- */
function collide(o,rad,yTop){for(let pass=0;pass<2;pass++)for(const s of SOLIDS){if(!s.on)continue;if(yTop!=null&&s.top<0.35)continue;
  const cx=clamp(o.x,s.x0,s.x1),cz=clamp(o.z,s.z0,s.z1);let dx=o.x-cx,dz=o.z-cz;const d2=dx*dx+dz*dz;
  if(d2<rad*rad){if(d2>1e-8){const d=Math.sqrt(d2);o.x=cx+dx/d*rad;o.z=cz+dz/d*rad;}
    else{const l=o.x-s.x0,r_=s.x1-o.x,t_=o.z-s.z0,b_=s.z1-o.z;const m=Math.min(l,r_,t_,b_);if(m===l)o.x=s.x0-rad;else if(m===r_)o.x=s.x1+rad;else if(m===t_)o.z=s.z0-rad;else o.z=s.z1+rad;}}}}
/* 2D segment vs rects. minTop: only rects at least this tall block */
function segBlocked(x0,z0,x1,z1,minTop=1.5,skip){for(const s of SOLIDS){if(!s.on||s.top<minTop||s===skip)continue;if(segRect(x0,z0,x1,z1,s.x0,s.x1,s.z0,s.z1))return true;}return false;}
function segRect(x0,z0,x1,z1,a0,a1,b0,b1){let t0=0,t1=1;const dx=x1-x0,dz=z1-z0;const p=[-dx,dx,-dz,dz],q=[x0-a0,a1-x0,z0-b0,b1-z0];
  for(let i=0;i<4;i++){if(Math.abs(p[i])<1e-9){if(q[i]<0)return false;}else{const r=q[i]/p[i];if(p[i]<0){if(r>t1)return false;if(r>t0)t0=r;}else{if(r<t0)return false;if(r<t1)t1=r;}}}return true;}
