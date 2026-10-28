/* Beginner input adapter. The assembly model remains the geometry/takeoff authority. */
(() => {
'use strict';const A=globalThis.GreenShiftAssembly;
function number(value,label){const text=String(value??'').trim();if(!/^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(text))throw Error('Enter '+label+' as a positive number, for example 3.5 or 3,5.');const n=Number(text.replace(',','.'));if(!Number.isFinite(n))throw Error('Enter a valid '+label+'.');return n;}
function measure(raw){
 if(!['m','cm'].includes(raw.unit))throw Error('Choose metres or centimetres.');const factor=raw.unit==='cm'?.01:1,length=number(raw.length,'wall length')*factor,height=number(raw.height,'wall height')*factor,thickness=number(raw.thickness,'EPS thickness');
 if(![10,12,15,20].includes(thickness))throw Error('Choose 10, 12, 15 or 20 cm EPS.');if(length<.3||length>40||height<.3||height>24)throw Error('Keep wall length between 0.3–40 m and height between 0.3–24 m.');
 if(!Array.isArray(raw.openings)||raw.openings.length>12)throw Error('Use up to 12 measured openings.');
 const openings=raw.openings.map(o=>{if(!['door','window'].includes(o.kind))throw Error('Choose a door or window.');const w=number(o.width,'opening width')*factor,h=number(o.height,'opening height')*factor,left=number(o.left,'distance from the left edge')*factor,y=o.kind==='door'?0:number(o.sill,'window sill')*factor;return {x:-length/2+left+w/2,y,w,h,kind:o.kind};});
 const wall=A.part('wall',{length,height,depth:thickness/100,opening:'none',openings});
 const p={...A.defaults(),w:Math.max(3,length),d:3,h:Math.max(2.4,height),parts:[wall]};const q=A.estimate(p);return {wall,gross:q.grossArea,openings:q.openingArea,net:q.netArea,volume:q.volume};
}
globalThis.GreenShiftEasyEPS=Object.freeze({number,measure});
})();
