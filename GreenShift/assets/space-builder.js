(() => {
'use strict';
const M=globalThis.GreenShiftSpace,$=id=>document.getElementById(id),builder=$('space-builder');if(!M||!builder)return;
let state=M.read()||M.initial(),step=state.step;state.photo='';const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const error=message=>{$('space-error').textContent=message;$('space-error').hidden=!message;};
const status=message=>$('space-save-status').textContent=message;
try{const shared=new URLSearchParams(location.search).get('spacebrief');if(shared){state=M.decode(shared);step=3;status('Shared brief opened');}}catch(e){error(e.message);}
function collect(){return M.normalize({...state,city:$('space-city').value,origin:$('space-origin').value,goal:$('space-goal').value,width:Number($('space-width').value),depth:Number($('space-depth').value),height:Number($('space-height').value),timing:$('space-timing').value,notes:$('space-notes').value,step});}
function save(){try{localStorage.setItem(M.STORE,JSON.stringify(state));status('Saved on this device');}catch{status('Browser storage unavailable / Download your brief to keep it');}}
function updateDraft(){try{state=collect();save();preview();}catch{ /* Keep incomplete input editable; validate before continuing. */ }}
function field(id,value){$(id).value=value;}
function sync(){field('space-city',state.city);field('space-origin',state.origin);field('space-goal',state.goal);field('space-width',state.width);field('space-depth',state.depth);field('space-height',state.height);field('space-timing',state.timing);field('space-notes',state.notes);preview();}
function preview(){
 const facade=state.service==='facade',prefix=facade?'facade':'interior';
 document.querySelectorAll('[data-space-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.spaceChoice===state.service)));
 document.querySelectorAll('[data-space-style]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.spaceStyle===state.style));b.querySelector('img').src=`./assets/space-${prefix}-${b.dataset.spaceStyle}.webp`;});
 $('space-preview-label').textContent='YOUR DIRECTION / '+M.styles[state.style].toUpperCase();$('space-style-preview').src=`./assets/space-${prefix}-${state.style}.webp`;$('space-style-preview').alt=M.styles[state.style]+' '+(facade?'facade':'interior')+' style reference, an illustrative concept';
 $('space-area').textContent=M.number(state.width*(facade?state.height:state.depth))+' m²';$('space-area-label').textContent=facade?'Front elevation area / Before openings':'Planning footprint';
 $('space-dimension-help').textContent=facade?'Measure the front elevation: width, building depth and total facade height.':'Measure one room or planning zone. Approximate dimensions are welcome.';
 // Numeric values come only from the validated schema. No project text is inserted as HTML.
 const w=state.width,d=facade?state.height:state.depth,scale=Math.min(240/w,120/d),rw=w*scale,rh=d*scale,x=(320-rw)/2,y=(160-rh)/2;
 $('space-plan').innerHTML=`<defs><pattern id="space-grid" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M 12 0 L 0 0 0 12" fill="none" stroke="#17352d12" stroke-width=".7"/></pattern></defs><rect width="320" height="190" fill="url(#space-grid)"/><rect x="${x}" y="${y}" width="${rw}" height="${rh}" fill="#c1d6b3" stroke="#245b45" stroke-width="2"/><path d="M${x},${y+rh+12}h${rw}" stroke="#57745f"/><text x="160" y="${y+rh+28}" text-anchor="middle" fill="#24513d" font-size="11" font-family="Inter,Arial">${M.number(w)} m</text><text x="${x+rw+10}" y="${y+rh/2}" fill="#24513d" font-size="11" font-family="Inter,Arial">${M.number(d)} m</text>`;
 const dl=$('space-summary');dl.replaceChildren(...M.summary(state).map(([label,value])=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;if(['Project city','Priorities'].includes(label))dd.dataset.userContent='true';row.append(dt,dd);return row;}));
 $('space-studio-scope').textContent=M.studio(state).note;
 const labels=facade?['Openings, shading & circulation','A fresh exterior identity','A new purpose for the building']:state.service==='development'?['Define the spatial plan','A distinctive architectural direction','Explore the site’s potential']:Object.values(M.goals);
 [...$('space-goal').options].forEach((o,i)=>o.textContent=labels[i]);
}
function go(next,focus=true){
 if(next>step){try{state=collect();}catch(e){error(e.message);if(step!==1)next=1;else{$('space-width').focus();return;}}}
 step=Math.max(0,Math.min(3,next));state.step=step;save();preview();
 if(step===3&&focus)globalThis.GreenShiftJourney?.('brief_completed',state.service,'space');
 document.querySelectorAll('[data-space-panel]').forEach(p=>p.hidden=+p.dataset.spacePanel!==step);
 document.querySelectorAll('[data-space-step]').forEach(b=>{if(+b.dataset.spaceStep===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
 $('space-back').hidden=step===0;$('space-next').hidden=step===3;$('space-next').firstChild.textContent=['Measurements ','Choose direction ','Build my brief ',''][step];
 if(focus){const panel=document.querySelector('[data-space-panel="'+step+'"]'),legend=panel.querySelector('legend');legend.tabIndex=-1;legend.focus({preventScroll:true});if(innerWidth<761)$('space-builder').scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});}
}
$('space-form').addEventListener('submit',e=>{e.preventDefault();error('');go(step+1);});$('space-back').onclick=()=>{error('');go(step-1);};document.querySelectorAll('[data-space-step]').forEach(b=>b.onclick=()=>{error('');go(+b.dataset.spaceStep);});
$('space-form').addEventListener('input',e=>{if(e.target.type!=='file')updateDraft();});$('space-form').addEventListener('change',e=>{if(e.target.type!=='file')updateDraft();});
function service(key){try{state=collect();}catch{}state.service=key;preview();save();globalThis.GreenShiftJourney?.('service_selected',key,'space');}
document.querySelectorAll('[data-space-choice]').forEach(b=>b.onclick=()=>service(b.dataset.spaceChoice));document.querySelectorAll('[data-space-service]').forEach(b=>b.onclick=()=>{service(b.dataset.spaceService);go(0,false);$('start-with-space').scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});});
document.querySelectorAll('[data-space-style]').forEach(b=>b.onclick=()=>{state.style=b.dataset.spaceStyle;updateDraft();});
$('space-reset').onclick=()=>{state=M.initial();step=0;try{localStorage.removeItem(M.STORE);}catch{}const url=new URL(location.href);url.searchParams.delete('spacebrief');history.replaceState(null,'',url);sync();go(0);status('Cleared / Start a new brief');error('');};
$('space-open-studio').onclick=()=>{try{state=collect();save();globalThis.GreenShiftJourney?.('studio_opened',state.service,'space');const launch=$('space-dialog-launch');launch.dataset.experience=M.studio(state).kind;launch.click();}catch(e){error(e.message);}};
$('space-review-project').onclick=()=>{
 try{state=collect();save();const form=$('inquiry'),messageField=form.querySelector('[name=message]'),start='[GreenShift space brief]',end='[/GreenShift space brief]',existing=messageField.value.replace(/\n*\[GreenShift space brief\][\s\S]*?\[\/GreenShift space brief\]/g,'').trim(),brief=start+'\n'+M.text(state)+'\n'+end,next=(existing?existing+'\n\n':'')+brief;if(next.length>messageField.maxLength)throw Error('Your inquiry notes are nearly full. Download this brief, or shorten the inquiry before adding it.');messageField.value=next;form.querySelector('[name=interest]').value=M.services[state.service];field('field-city',state.city);field('field-origin',state.origin);field('field-area',Number((state.width*(state.service==='facade'?state.height:state.depth)).toFixed(2)));field('field-timing',state.timing);form.dispatchEvent(new Event('input',{bubbles:true}));$('contact').scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});$('field-name').focus({preventScroll:true});status('Your brief is added to the project inquiry');}catch(e){error(e.message);}
};
function download(name,body,type){const url=URL.createObjectURL(new Blob([body],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
$('space-download').onclick=()=>{try{state=collect();const b={...state};delete b.photo;download('greenshift-space-brief.json',JSON.stringify(b,null,2),'application/json');status('Brief downloaded');}catch(e){error(e.message);}};
$('space-copy-link').onclick=async()=>{try{state=collect();const url=new URL(location.href);url.search='';url.searchParams.set('spacebrief',M.encode(state));url.searchParams.set('lang',globalThis.GreenShiftLanguage?.language||'en');url.hash='start-with-space';await navigator.clipboard.writeText(url.href);status('Brief link copied');}catch{error('Link could not be copied by this browser. Download your brief instead.');}};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
$('space-print').onclick=()=>{try{state=collect();const page=window.open('','_blank');if(!page)throw Error('Allow the print window, or use Download brief instead.');page.opener=null;const tr=s=>globalThis.GreenShiftLanguage?.t(s)||s;page.document.write('<!doctype html><html lang="en"><title>GreenShift — Your Space Brief</title><style>body{font:15px/1.6 Arial,sans-serif;color:#17352d;max-width:800px;margin:40px auto;padding:20px}h1{font-size:42px;line-height:1.1}dt{font-weight:bold}dd{margin:0 0 14px;white-space:pre-wrap}img{max-width:100%;max-height:260px;object-fit:contain}button{padding:12px 24px;background:#17352d;color:white;border:0}@media print{button{display:none}body{margin:0}}</style><p>GREENSHIFT / DESIGN & DEVELOPMENT / PART OF FJÄLL GROUP</p><h1>Your space.<br>A different possibility.</h1><dl>'+M.summary(state).map(([k,v])=>'<dt>'+escape(tr(k))+'</dt><dd>'+escape(['Project city','Priorities'].includes(k)?v:tr(v))+'</dd>').join('')+'</dl>'+'<p>'+escape(tr(M.studio(state).note))+'</p><p>Illustrative brief. Measured design, scope, specification, fees and programme require review.</p><p>greenshift.id / +62 877 8601 0290</p><button onclick="window.print()">Print / Save PDF</button></html>');page.document.close();page.document.documentElement.lang=globalThis.GreenShiftLanguage?.language||'en';page.document.title=tr(page.document.title);const walker=page.document.createTreeWalker(page.document.body,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode())){if(!node.parentElement.closest('style,dd'))node.nodeValue=tr(node.nodeValue);}status('Print-ready brief opened');}catch(e){error(e.message);}};
window.addEventListener('greenshift:language',()=>preview());
globalThis.GreenShiftSpaceDraft=()=>M.normalize(state);
builder.hidden=false;$('space-fallback').hidden=true;sync();go(step,false);
// Hide the mobile action while the visitor is already working or contacting us.
if('IntersectionObserver' in window){const visible=new Set(),watch=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting)visible.add(e.target.id);else visible.delete(e.target.id);}document.body.classList.toggle('has-active-brief',visible.size>0);},{threshold:.05});watch.observe($('start-with-space'));watch.observe($('contact'));}
})();
