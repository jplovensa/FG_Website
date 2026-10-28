/* Architectural concept starters and reference layouts. No furnishing procurement is implied. */
(() => {
'use strict';const A=globalThis.GreenShiftAssembly;if(!A)return;
const variants={villa:{suite:'Single-suite villa',family:'Family villa',courtyard:'Courtyard villa'},commercial:{workplace:'Workplace',cafe:'Cafe & hospitality',showroom:'Retail & showroom'},landmark:{pavilion:'Public pavilion',gallery:'Double-height gallery',cultural:'Cultural destination'}};
const featureLabels={bedroom:'Bedroom illustration',lounge:'Lounge & social space',dining:'Dining layout',terrace:'Outdoor terrace',pool:'Pool concept',activity:'Work / dining / display layout',meeting:'Meeting / private space',welcome:'Reception & arrival',gallery:'Gallery displays',seating:'Public seating',canopy:'Shaded arrival',sculpture:'Sculptural focal point',landscape:'Landscape planters'};
const features={villa:['bedroom','lounge','dining','terrace','pool'],commercial:['activity','meeting','welcome','lounge','terrace'],landmark:['gallery','seating','welcome','canopy','sculpture','landscape']};
const standard={villa:['bedroom','lounge','dining','terrace'],commercial:['activity','meeting','welcome','lounge'],landmark:['gallery','seating','canopy','sculpture','landscape']};
const spec={sofa:[3.2,1,2.4],bed:[2.8,1.15,2.6],dining:[2.8,1.2,2.6],workstation:[2,1.3,1.6],meeting:[4,1.3,3],reception:[3,1.2,1.4],display:[2,1.8,1.0],planter:[1.1,1.2,1.1],pool:[3,.5,6],sculpture:[3,4,3],column:[.5,3,.5]};
function reference(type,x,z,patch={}){const [length,height,depth]=spec[type]||[2.4,2.7,.12];return A.part(type,{length,height,depth,x,z,y:.12,...patch});}
function create(context,program='villa',variant=Object.keys(variants[program])[0],wanted=standard[program],existingBrief={}){
 if(!variants[program]?.[variant])throw Error('Choose a listed concept layout.');const p=A.defaults(context);p.brief={...A.briefDefaults(),...existingBrief,program,variant,service:existingBrief.service||(program==='commercial'?'interior':'development'),features:[...wanted]};p.showFurniture=true;p.cutaway=context==='interior';const family=variant==='family',court=variant==='courtyard',landmark=program==='landmark',commercial=program==='commercial';
 p.w=landmark?26:commercial?18:22;p.d=landmark?22:commercial?16:16;p.h=landmark?10:4.5;const W=landmark?18:commercial||family||court?12:9,D=landmark?12:commercial||family?9:court?10:7,H=landmark?(variant==='gallery'?8:7.2):commercial?3.6:3,t=.15,y=.12;
 function floorRoof(type,level){const thick=type==='slab'?.12:.2;if(court)return [A.part(type,{length:(W-3)/2,depth:D,height:thick,x:-(W+3)/4,y:level}),A.part(type,{length:(W-3)/2,depth:D,height:thick,x:(W+3)/4,y:level}),A.part(type,{length:3,depth:(D-3)/2,height:thick,z:-(D+3)/4,y:level}),A.part(type,{length:3,depth:(D-3)/2,height:thick,z:(D+3)/4,y:level})];return [A.part(type,{length:W+(type==='roof'&&landmark?2:0),depth:D+(type==='roof'&&landmark?2:0),height:thick,y:level})];}
 p.parts=[...floorRoof('slab',0),A.part('wall',{length:W,height:H,depth:t,z:-D/2+t/2,y,opening:'window',ow:landmark?7:commercial?4:3,oh:landmark?3:1.5,sill:landmark?2.2:1}),A.part('wall',{length:W,height:H,depth:t,z:D/2-t/2,y,opening:'door',ow:landmark?8:commercial?1.8:1.2,oh:landmark?5.5:2.3}),A.part('wall',{length:D-2*t,height:H,depth:t,x:-W/2+t/2,angle:90,y}),A.part('wall',{length:D-2*t,height:H,depth:t,x:W/2-t/2,angle:90,y}),...floorRoof('roof',H+y)];
 for(const wall of p.parts.filter(o=>o.type==='wall'&&o.opening!=='none'))p.parts.push(A.part('glass',{length:wall.ow-.04,height:wall.oh-.04,depth:.03,x:wall.x,z:wall.z,y:wall.y+(wall.opening==='door'?0:wall.sill)+.02,angle:wall.angle,featureKey:'glazing'}));
 if(family)p.parts.push(A.part('wall',{length:4.2,height:H,depth:.12,angle:90,x:0,z:-2.25,y,opening:'door'}));
 if(landmark)for(const x of [-7.5,7.5])for(const z of [-4.5,4.5])p.parts.push(reference('column',x,z,{height:H,y}));
 const additions={};const put=(key,type,x,z,patch={})=>{(additions[key]||=[]).push(reference(type,x,z,{...patch,featureKey:key}));};
 if(program==='villa'){
  if(family){put('bedroom','bed',-3,-2.2);put('bedroom','bed',3,-2.2);put('lounge','sofa',-3,2.2);put('dining','dining',3,2.2);}
  else if(court){put('bedroom','bed',-3.8,-2.5);put('lounge','sofa',0,3.3);put('dining','dining',3.8,-2.5);}
  else{put('bedroom','bed',-2.4,-1.7);put('lounge','sofa',2,.2);put('dining','dining',-2.2,1.9);}
  put('terrace','slab',0,D/2+1,{length:W,depth:2,height:.12,y:0});put('pool','pool',W/2+2,0,{length:3,depth:6,y:0});
 }else if(program==='commercial'){
  if(variant==='workplace'){for(const x of [2,4.4])for(const z of [-2.2,0])put('activity','workstation',x,z);put('meeting','meeting',-3,-1);put('welcome','reception',-2.5,3.2);put('lounge','sofa',3,2.8);}
  else if(variant==='cafe'){for(const x of [-3,3])for(const z of [-2.1,2.1])put('activity','dining',x,z);put('meeting','sofa',0,-2.4,{length:2.4,depth:2});put('welcome','reception',0,3.2,{length:2.8,depth:1.2});put('lounge','sofa',0,.2,{length:2.4,depth:1.8});}
  else{for(const x of [-3,3])for(const z of [-2.5,2.5])put('activity','display',x,z);put('meeting','meeting',-2.5,0);put('welcome','reception',0,3.4,{length:2.6,depth:1.2});put('lounge','sofa',3,0);}
  put('terrace','slab',0,D/2+1,{length:W,depth:2,height:.12,y:0});
 }else{
  for(const x of [-5,5]){put('gallery','display',x,-3,{length:2,depth:1.2,height:2.4});put('seating','sofa',x,2,{length:3,depth:2});}
  put('welcome','reception',0,4.5,{length:4,depth:1.2});put('canopy','roof',0,D/2+1.5,{length:10,depth:3,height:.2,y:5.7});put('sculpture','sculpture',0,0,{height:variant==='cultural'?5:4});for(const x of [-10,10])for(const z of [-5,5])put('landscape','planter',x,z);
 }
 for(const key of wanted){if(!features[program].includes(key))throw Error('Choose a feature for this project type.');p.parts.push(...(additions[key]||[]));}
 if(court)p.parts.push(reference('planter',0,0,{length:2.5,depth:2.5,height:.65,y:0,featureKey:'courtyard'}));
 return A.normalize(p);
}
function applyFeatures(raw,selected){const p=A.normalize(raw),generated=create(p.context,p.brief.program,p.brief.variant,selected,p.brief),oldKeys=features[p.brief.program],next={...p,brief:{...p.brief,features:selected},parts:p.parts.filter(o=>!oldKeys.includes(o.featureKey))};for(const o of generated.parts.filter(o=>selected.includes(o.featureKey))){try{A.normalize({...next,parts:[...next.parts,o]});next.parts.push(o);}catch{const placed=A.paste(next,[o]);next.parts=placed.plan.parts;}}return A.normalize(next);}
globalThis.GreenShiftConcepts=Object.freeze({variants,features,featureLabels,standard,spec,reference,create,applyFeatures});
})();
