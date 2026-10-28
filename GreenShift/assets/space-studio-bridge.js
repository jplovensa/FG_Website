/* Explicit, undoable handoff. A brief never silently overwrites a studio plan. */
(() => {
'use strict';
const M=globalThis.GreenShiftSpace;if(!M)return;
const expected=new URLSearchParams(location.search).get('space')==='1';if(!expected)return;
const banner=document.createElement('div');banner.className='space-studio-banner';banner.hidden=true;
const copy=document.createElement('div'),title=document.createElement('strong'),description=document.createElement('p'),apply=document.createElement('button'),dismiss=document.createElement('button');
title.textContent='Your space. Ready to explore.';apply.textContent='Apply brief to a new concept';dismiss.textContent='Keep current plan';apply.type=dismiss.type='button';copy.append(title,description);banner.append(copy,apply,dismiss);document.querySelector('header').after(banner);
let brief;
function show(raw){try{brief=M.normalize(raw);const spec=M.studio(brief),isFacade=!!globalThis.GreenShiftFacadeStudio;if((spec.kind==='facade')!==isFacade)return;description.textContent=M.services[brief.service]+' / '+M.styles[brief.style]+' / '+M.number(brief.width)+' × '+M.number(brief.depth)+' × '+M.number(brief.height)+' m / '+spec.note+' Applying replaces this studio concept; Undo restores it.';banner.hidden=false;}catch{}}
show(M.read());
window.addEventListener('message',event=>{if(window.parent===window||event.origin!==location.origin||event.source!==window.parent||event.data?.type!=='greenshift:space-brief')return;show(event.data.brief);});
apply.onclick=()=>{try{const api=globalThis.GreenShiftFacadeStudio||globalThis.GreenShiftPlanner;if(api?.applySpaceBrief(brief)){banner.hidden=true;}}catch(e){description.textContent=e.message||'The brief could not be applied. Your current plan has been kept.';}};
dismiss.onclick=()=>banner.hidden=true;
})();
