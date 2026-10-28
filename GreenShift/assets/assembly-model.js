/* Shared measured assembly geometry. The renderer and takeoff consume these same parts. */
(() => {
'use strict';
const types={wall:'EPS panel',glass:'Glazed partition',slab:'Floor plate',roof:'Roof plate',column:'Structural column',sofa:'Lounge layout',bed:'Bedroom layout',dining:'Dining layout',workstation:'Workstation layout',meeting:'Meeting layout',reception:'Reception counter',display:'Display system',planter:'Landscape planter',pool:'Pool concept',sculpture:'Sculptural reference'};
const referenceTypes=['sofa','bed','dining','workstation','meeting','reception','display','planter','pool','sculpture'];
const programs={villa:'Villa',commercial:'Commercial build',landmark:'Landmark building'};
const styles=['contemporary','japandi','tropical','industrial','mediterranean','bold'];
const briefDefaults=()=>({client:'',project:'',location:'',program:'villa',service:'interior',variant:'suite',style:'contemporary',budget:'',timing:'',priorities:'',questions:'',features:[]});
const clone=x=>JSON.parse(JSON.stringify(x));
const id=()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);
const defaults=(context='interior')=>({version:1,context,w:6,d:5,h:context==='facade'?8:4.5,snap:.1,waste:5,finish:'mineral',brief:briefDefaults(),showFurniture:true,cutaway:true,light:'day',parts:[]});
function part(type='wall',patch={}){return {id:id(),type,length:2.4,height:type==='glass'?2.4:['slab','roof'].includes(type)?.15:2.7,depth:type==='wall'?.12:type==='glass'?.04:2,x:0,y:0,z:0,angle:0,opening:'none',ow:.9,oh:2.1,sill:.8,...patch};}
function holes(p){if(Array.isArray(p.openings))return p.openings;if(p.opening==='none')return [];return [{x:0,y:p.opening==='door'?0:p.sill,w:p.ow,h:p.oh}];}
function axes(p){const a=p.angle*Math.PI/180;return [[Math.cos(a),-Math.sin(a)],[Math.sin(a),Math.cos(a)]];}
function solidOverlap(a,b){if(a.y+a.height<=b.y+1e-6||b.y+b.height<=a.y+1e-6)return false;const [ax,az]=axes(a),[bx,bz]=axes(b);for(const axis of [ax,az,bx,bz]){const dot=(u,v)=>u[0]*v[0]+u[1]*v[1],ra=Math.abs(dot(ax,axis))*a.length/2+Math.abs(dot(az,axis))*a.depth/2,rb=Math.abs(dot(bx,axis))*b.length/2+Math.abs(dot(bz,axis))*b.depth/2;if(Math.abs((b.x-a.x)*axis[0]+(b.z-a.z)*axis[1])>=ra+rb-1e-6)return false;}return true;}
function solids(p){
 const hs=holes(p);if(!['wall','glass'].includes(p.type)||!hs.length)return [p];
 const xs=[...new Set([-p.length/2,p.length/2,...hs.flatMap(h=>[h.x-h.w/2,h.x+h.w/2])])].sort((a,b)=>a-b),u=axes(p)[0],out=[];
 for(let i=1;i<xs.length;i++){const left=xs[i-1],right=xs[i],x=(left+right)/2,blocked=hs.filter(h=>x>h.x-h.w/2-1e-9&&x<h.x+h.w/2+1e-9).sort((a,b)=>a.y-b.y);let y=0;
  const emit=top=>{if(top-y>1e-8)out.push({...p,length:right-left,height:top-y,x:p.x+u[0]*x,y:p.y+y,z:p.z+u[1]*x,opening:'none',openings:[]});};
  for(const h of blocked){emit(h.y);y=h.y+h.h;}emit(p.height);
 }return out;
}
function overlap(a,b){return solids(a).some(x=>solids(b).some(y=>solidOverlap(x,y)));}
function normalize(raw){
 if(!raw||raw.version!==1||!['interior','facade'].includes(raw.context)||!Array.isArray(raw.parts)||raw.parts.length>180)throw Error('Use a valid assembly plan with up to 180 elements.');
 const p={...defaults(raw.context),...raw,parts:[]};
 for(const [k,min,max] of [['w',3,40],['d',3,40],['h',2.4,24],['waste',0,20]])if(!Number.isFinite(p[k])||p[k]<min||p[k]>max)throw Error(k+' is outside this workspace range.');
 if(![.05,.1,.25,.5].includes(p.snap)||!['mineral','timber','clay','stone','concrete'].includes(p.finish))throw Error('Choose a listed snap and finish.');const ids=new Set();
 for(const o of raw.parts){
  if(!o||!Object.hasOwn(types,o.type)||typeof o.id!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(o.id)||ids.has(o.id))throw Error('Each element needs a valid, unique identity.');ids.add(o.id);
  const q={...part(o.type),...o};for(const k of ['length','height','depth','x','y','z','angle','ow','oh','sill'])if(!Number.isFinite(q[k]))throw Error('Enter finite measurements for every element.');
  if(q.length<.3||q.length>40||q.height<.05||q.height>24||q.depth<.02||q.depth>40||q.y<0||q.angle<0||q.angle>=360)throw Error('Keep element sizes and positions inside the measured workspace.');
  if(q.type==='wall'&&![.1,.12,.15,.2].some(t=>Math.abs(t-q.depth)<1e-8))throw Error('Choose 10, 12, 15 or 20 cm EPS.');
  if(!['none','door','window'].includes(q.opening)||q.ow<.2||q.oh<.2||q.sill<0||q.opening!=='none'&&!['wall','glass'].includes(q.type))throw Error('Choose a valid opening on a vertical panel.');
  if(q.openings!==undefined){if(!['wall','glass'].includes(q.type)||!Array.isArray(q.openings)||q.openings.length>12)throw Error('Use up to 12 openings on a vertical panel.');q.openings=q.openings.map(h=>{if(!h||['x','y','w','h'].some(k=>!Number.isFinite(h[k]))||h.w<.2||h.h<.2||h.y<0)throw Error('Enter valid measured opening dimensions.');return {x:h.x,y:h.y,w:h.w,h:h.h,kind:h.kind==='door'?'door':'window'};});}
  const cuts=holes(q);for(const [i,hole] of cuts.entries()){if(Math.abs(hole.x)+hole.w/2>q.length/2-.05+1e-8||hole.y+hole.h>q.height-.05+1e-8)throw Error('The opening does not fit. Leave at least 5 cm at each side and above it.');if(cuts.slice(0,i).some(h=>Math.abs(h.x-hole.x)<(h.w+hole.w)/2-1e-8&&h.y<hole.y+hole.h-1e-8&&hole.y<h.y+h.h-1e-8))throw Error('Openings overlap. Separate them so their area is deducted once.');}
  const [a,b]=axes(q),ex=Math.abs(a[0])*q.length/2+Math.abs(b[0])*q.depth/2,ez=Math.abs(a[1])*q.length/2+Math.abs(b[1])*q.depth/2;
  if(Math.abs(q.x)+ex>p.w/2+1e-6||Math.abs(q.z)+ez>p.d/2+1e-6||q.y+q.height>p.h+1e-6)throw Error('An element extends beyond the workspace. Move it inward or enlarge the workspace.');
  if(p.parts.some(other=>overlap(q,other)))throw Error('Elements overlap. Use a butt joint, move the element or stack it above the other.');p.parts.push(q);
 }
 const brief={...briefDefaults(),...p.brief};if(!Object.hasOwn(programs,brief.program)||!styles.includes(brief.style)||!['development','interior','facade'].includes(brief.service))throw Error('Choose a listed project type and design style.');for(const [k,max] of [['client',100],['project',120],['location',140],['variant',40],['budget',100],['timing',100],['priorities',800],['questions',1200]]){if(typeof brief[k]!=='string'||brief[k].length>max)throw Error('Keep the '+k+' field within its length limit.');brief[k]=brief[k].trim();}if(!Array.isArray(brief.features)||brief.features.length>12||brief.features.some(k=>typeof k!=='string'||!/^[-a-z]{1,35}$/.test(k)))throw Error('Choose valid concept features.');if(typeof p.showFurniture!=='boolean'||typeof p.cutaway!=='boolean'||!['day','golden','evening'].includes(p.light))throw Error('Choose valid presentation layers.');return {version:1,context:p.context,w:p.w,d:p.d,h:p.h,snap:p.snap,waste:p.waste,finish:p.finish,brief,showFurniture:p.showFurniture,cutaway:p.cutaway,light:p.light,parts:p.parts};
}
function estimate(raw){const p=normalize(raw),surfaces=p.parts.filter(o=>o.type==='wall').map(o=>{const gross=o.length*o.height,opening=holes(o).reduce((n,h)=>n+h.w*h.h,0),net=gross-opening;return {id:o.id,name:types[o.type],length:o.length,height:o.height,thickness:o.depth*100,grossArea:gross,openingArea:opening,netArea:net,volume:net*o.depth};});const sum=k=>surfaces.reduce((n,s)=>n+s[k],0),volume=sum('volume');return {surfaces,grossArea:sum('grossArea'),openingArea:sum('openingArea'),netArea:sum('netArea'),volume,supplyVolume:volume*(1+p.waste/100),wasteVolume:volume*p.waste/100};}
function room(raw){const p=normalize({...raw,parts:[]}),t=.12,W=p.w,D=p.d,H=Math.min(p.h-.25,2.7);p.parts=[part('wall',{length:W,height:H,x:0,z:-D/2+t/2}),part('wall',{length:W,height:H,x:0,z:D/2-t/2,opening:'door',oh:Math.min(2.1,H-.1)}),part('wall',{length:D-2*t,height:H,x:-W/2+t/2,z:0,angle:90}),part('wall',{length:D-2*t,height:H,x:W/2-t/2,z:0,angle:90})];return normalize(p);}
function transform(raw,ids,patch){const p=clone(raw);p.parts=p.parts.map(o=>ids.includes(o.id)?{...o,...patch}:o);return normalize(p);}
function paste(raw,items){
 const p=normalize(raw);if(!Array.isArray(items)||!items.length||p.parts.length+items.length>180)throw Error('Copy a selection first. A plan can contain up to 180 elements.');
 for(const item of items)normalize({...p,parts:[{...item,x:0,z:0}]});
 let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
 for(const o of items){const [a,b]=axes(o),ex=Math.abs(a[0])*o.length/2+Math.abs(b[0])*o.depth/2,ez=Math.abs(a[1])*o.length/2+Math.abs(b[1])*o.depth/2;minX=Math.min(minX,o.x-ex);maxX=Math.max(maxX,o.x+ex);minZ=Math.min(minZ,o.z-ez);maxZ=Math.max(maxZ,o.z+ez);}
 const loX=-p.w/2-minX,hiX=p.w/2-maxX,loZ=-p.d/2-minZ,hiZ=p.d/2-maxZ,limit=Math.ceil(Math.max(Math.abs(loX),Math.abs(hiX),Math.abs(loZ),Math.abs(hiZ))/p.snap);
 for(let ring=1;ring<=limit;ring++)for(let x=-ring;x<=ring;x++)for(const z of Math.abs(x)===ring?Array.from({length:ring*2+1},(_,i)=>i-ring):[-ring,ring]){
  const dx=x*p.snap,dz=z*p.snap;if(dx<loX-1e-6||dx>hiX+1e-6||dz<loZ-1e-6||dz>hiZ+1e-6)continue;
  const added=items.map(o=>({...clone(o),id:id(),x:+(o.x+dx).toFixed(6),z:+(o.z+dz).toFixed(6)}));
  try{return {plan:normalize({...p,parts:[...p.parts,...added]}),ids:added.map(o=>o.id)};}catch{}
 }
 throw Error('No clear space fits the copied elements. Make space or enlarge the workspace.');
}
function drawWall(raw,from,to,options={}){
 const plan=normalize(raw),dx=to.x-from.x,dz=to.z-from.z,length=Math.hypot(dx,dz);if(length<.3)throw Error('Draw a wall at least 30 cm long.');
 const u=[dx/length,dz/length],v=[-u[1],u[0]],wall=part('wall',{length,y:options.base??0,height:Math.min(2.7,plan.h-(options.base??0)),x:(from.x+to.x)/2,z:(from.z+to.z)/2,angle:(-Math.atan2(dz,dx)*180/Math.PI+360)%360});let start=0,end=length;
 for(const other of plan.parts){if(other.type!=='wall'||!overlap(wall,other))continue;let enter=-Infinity,leave=Infinity;const base=[from.x-other.x,from.z-other.z];for(const [axis,radius] of [[axes(other)[0],other.length/2],[axes(other)[1],other.depth/2]]){const origin=base[0]*axis[0]+base[1]*axis[1],direction=u[0]*axis[0]+u[1]*axis[1],extent=radius+Math.abs(v[0]*axis[0]+v[1]*axis[1])*wall.depth/2;if(Math.abs(direction)<1e-10){if(Math.abs(origin)>extent){enter=Infinity;break;}}else{const a=(-extent-origin)/direction,b=(extent-origin)/direction;enter=Math.max(enter,Math.min(a,b));leave=Math.min(leave,Math.max(a,b));}}
  if(enter>leave)continue;if(enter<=1e-6)start=Math.max(start,leave);else if(leave>=length-1e-6)end=Math.min(end,enter);else throw Error('This wall crosses another panel. End at its face or draw separate runs.');
 }
 wall.length=+(end-start).toFixed(6);wall.x=+(from.x+u[0]*(start+end)/2).toFixed(6);wall.z=+(from.z+u[1]*(start+end)/2).toFixed(6);return {plan:normalize({...plan,parts:[...plan.parts,wall]}),id:wall.id,trimmed:start>1e-6||end<length-1e-6};
}
// Validate the geometry separately from DOM, storage and WebGL.
globalThis.GreenShiftAssembly=Object.freeze({types,referenceTypes,programs,styles,briefDefaults,clone,id,defaults,part,holes,axes,overlap,normalize,estimate,room,transform,paste,drawWall});
})();
