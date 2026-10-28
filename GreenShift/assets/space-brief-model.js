/* Shared, bounded brief schema. No remote service or personal-photo upload. */
(() => {
'use strict';
const STORE='greenshift:space-brief:v1';
const services={interior:'Interior refurbishment',facade:'Facade facelift',development:'Development concept'};
const styles={contemporary:'Contemporary',japandi:'Japandi',tropical:'Tropical modern',industrial:'Industrial',mediterranean:'Mediterranean',bold:'Urban colour'};
const goals={layout:'A more useful layout',identity:'A fresh identity',repurpose:'A new purpose for the space'};
const timings=['Exploring options','Within 3 months','3–6 months','Later this year'];
const initial=()=>({version:1,service:'interior',origin:'In Indonesia',goal:'layout',city:'',width:6,depth:5,height:2.7,style:'japandi',timing:timings[0],notes:'',step:0,photo:''});
function normalize(raw){
 if(!raw||raw.version!==1)throw Error('This brief format could not be read.');
 if(!Object.hasOwn(services,raw.service)||!Object.hasOwn(styles,raw.style)||!Object.hasOwn(goals,raw.goal)||!timings.includes(raw.timing))throw Error('Choose a listed service, goal, style and timing.');
 for(const [key,min,max] of [['width',1,100],['depth',1,100],['height',2.2,30]])if(typeof raw[key]!=='number'||!Number.isFinite(raw[key])||raw[key]<min||raw[key]>max)throw Error(key==='height'?'Enter a height from 2.2 to 30 m.':'Enter width and depth from 1 to 100 m.');
 for(const [key,max] of [['city',80],['notes',600]])if(typeof raw[key]!=='string'||raw[key].length>max)throw Error('Keep your city and notes within the displayed limits.');
 const photo=typeof raw.photo==='string'&&raw.photo.length<=700000&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(raw.photo)?raw.photo:'';
 if(raw.origin!==undefined&&!['In Indonesia','Overseas'].includes(raw.origin))throw Error('Choose where you are planning from.');
 return {version:1,service:raw.service,origin:raw.origin||'In Indonesia',goal:raw.goal,city:raw.city.trim(),width:raw.width,depth:raw.depth,height:raw.height,style:raw.style,timing:raw.timing,notes:raw.notes.trim(),step:Number.isInteger(raw.step)&&raw.step>=0&&raw.step<=3?raw.step:0,photo};
}
const number=n=>Number(n.toFixed(2)).toLocaleString(globalThis.GreenShiftLanguage?.language==='id'?'id-ID':'en',{maximumFractionDigits:2});
function goalLabel(b){const labels=b.service==='facade'?['Openings, shading & circulation','A fresh exterior identity','A new purpose for the building']:b.service==='development'?['Define the spatial plan','A distinctive architectural direction','Explore the site’s potential']:Object.values(goals);return labels[Object.keys(goals).indexOf(b.goal)];}
function summary(raw){const b=normalize(raw);return [['Service',services[b.service]],['Planning from',b.origin],['Goal',goalLabel(b)],['Project city',b.city||'To be confirmed'],['Dimensions',`${number(b.width)} × ${number(b.depth)} m; ${number(b.height)} m high`],[b.service==='facade'?'Front elevation area':'Planning footprint',number(b.width*(b.service==='facade'?b.height:b.depth))+' m²'],['Direction',styles[b.style]],['Desired timing',b.timing],['Priorities',b.notes||'To discuss in design review']];}
function text(raw){const tr=s=>globalThis.GreenShiftLanguage?.t(s)||s;return tr('GreenShift / Start with your space')+'\n\n'+summary(raw).map(([k,v])=>tr(k)+': '+(['Project city','Priorities'].includes(k)?v:tr(v))).join('\n')+'\n\n'+tr('Illustrative concept brief. Measurements, scope, fees and programme require review. Photo remains in the owner’s browser; attach it separately in WhatsApp if needed.');}
function studio(raw){const b=normalize(raw),facade=b.service==='facade',clamp=(n,min,max)=>Math.max(min,Math.min(max,n));let w=facade?clamp(b.width,3,20):clamp(Math.round(b.width*2)/2,3,12),d=facade?clamp(b.depth,3,20):clamp(Math.round(b.depth*2)/2,3,12),h=facade?clamp(b.height,2.4,12):clamp(b.height,2.4,4.5);const adjusted=w!==b.width||d!==b.depth||h!==b.height;return {kind:facade?'facade':'renovation',w,d,h,style:b.style,adjusted,note:adjusted?`Your brief keeps ${number(b.width)} × ${number(b.depth)} × ${number(b.height)} m. The studio opens a ${number(w)} × ${number(d)} × ${number(h)} m study zone within its model limits; this is not the full project estimate.`:b.service==='development'?'Explore this planning zone in the interior studio. Site feasibility and full development massing require a separate design review.':'Your dimensions and style can be applied in the studio. Existing saved plans are retained until you choose Apply brief; Undo can restore the previous plan.'};}
function read(){try{const raw=localStorage.getItem(STORE);return raw?normalize(JSON.parse(raw)):null;}catch{return null;}}
function encode(raw){const b=normalize(raw);delete b.photo;b.step=3;const bytes=new TextEncoder().encode(JSON.stringify(b));let s='';bytes.forEach(v=>s+=String.fromCharCode(v));return btoa(s).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');}
function decode(value){if(typeof value!=='string'||value.length>9000||!/^[\w-]+$/.test(value))throw Error('That shared brief link is not valid.');const binary=atob(value.replaceAll('-','+').replaceAll('_','/'));return normalize({...JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(binary,c=>c.charCodeAt(0)))),photo:''});}
globalThis.GreenShiftSpace=Object.freeze({STORE,services,styles,goals,timings,initial,normalize,summary,text,studio,read,encode,decode,number});
})();
