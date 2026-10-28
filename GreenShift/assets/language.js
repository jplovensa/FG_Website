/* Local, reversible language layer. User inputs and canonical form values never change. */
(() => {
'use strict';
const dictionary=globalThis.GreenShiftTranslations||{},STORE='greenshift:language',sources=new WeakMap(),attributes=new WeakMap();
let language='en';try{const query=new URLSearchParams(location.search).get('lang');language=['id','en'].includes(query)?query:localStorage.getItem(STORE)||(/\bid\b/i.test(navigator.language)?'id':'en');}catch{language=/^id/i.test(navigator.language)?'id':'en';}if(!['id','en'].includes(language))language='en';
const phraseKeys=Object.keys(dictionary).filter(k=>k.length>=6).sort((a,b)=>b.length-a.length);
const phrasePattern=new RegExp('(?<![\\p{L}\\p{N}])(?:'+phraseKeys.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')(?![\\p{L}\\p{N}])','gu');
function t(value,target=language){
 const raw=String(value??'');if(target!=='id')return raw;
 const core=raw.trim().replace(/\s+/g,' ');if(Object.hasOwn(dictionary,core))return raw.replace(raw.trim(),dictionary[core]);
 if(raw.includes('\n'))return raw.split('\n').map(s=>t(s,target)).join('\n');
 let match;
 if((match=core.match(/^Your brief keeps (.+?) m\. The studio opens a (.+?) m study zone within its model limits; this is not the full project estimate\.$/)))return `Arahan Anda tetap menyimpan ${match[1]} m. Studio membuka zona studi ${match[2]} m sesuai batas model; ini bukan estimasi seluruh proyek.`;
 if(core.startsWith('YOUR DIRECTION / '))return 'ARAH PILIHAN / '+t(core.slice(17),target);
 if((match=core.match(/^(.+?): (.*)$/))&&Object.hasOwn(dictionary,match[1]))return t(match[1],target)+': '+t(match[2],target);
 if((match=core.match(/^(\d+) objects$/)))return match[1]+' objek';
 if((match=core.match(/^(\d+) pcs$/)))return match[1]+' unit';
 return phraseKeys.length?raw.replace(phrasePattern,match=>dictionary[match]):raw;
}
const skip=element=>!element||!!element.closest('script,style,textarea,pre,[data-user-content],[data-language]');
function translateText(node){if(skip(node.parentElement)||!node.nodeValue?.trim())return;const prior=sources.get(node),current=node.nodeValue,source=prior&&current===prior.last?prior.source:current;
 if(node.parentElement.tagName==='OPTION'&&!node.parentElement.hasAttribute('value'))node.parentElement.value=source.trim();
 const translated=t(source);sources.set(node,{source,last:translated});if(current!==translated)node.nodeValue=translated;
}
function translateAttributes(element){if(skip(element))return;let entries=attributes.get(element);if(!entries){entries={};attributes.set(element,entries);}for(const key of ['aria-label','placeholder','title','alt']){const current=element.getAttribute(key);if(current===null)continue;const prior=entries[key],source=prior&&current===prior.last?prior.source:current,next=t(source);entries[key]={source,last:next};if(current!==next)element.setAttribute(key,next);}}
function apply(root=document.body){if(!root)return;if(root.nodeType===3){translateText(root);return;}if(root.nodeType!==1)return;translateAttributes(root);const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);let n;while((n=walker.nextNode())){if(n.nodeType===3)translateText(n);else translateAttributes(n);}}
const baseTitle=document.title;
function set(next,persist=true){if(!['en','id'].includes(next)||next==='id'&&!phraseKeys.length)return;language=next;document.documentElement.lang=next;if(persist)try{localStorage.setItem(STORE,next);}catch{}document.title=t(baseTitle);if(persist){const url=new URL(location.href);if(url.searchParams.has('lang')){url.searchParams.set('lang',next);history.replaceState(null,'',url);}}const preferred=document.getElementById('field-language');if(preferred&&!preferred.dataset.chosen)preferred.value=next==='id'?'Bahasa Indonesia':'English';document.querySelectorAll('[data-whatsapp-link]').forEach(link=>link.href='https://wa.me/6287786010290?text='+encodeURIComponent(next==='id'?'Halo GreenShift, saya ingin mendiskusikan proyek di Indonesia.':'Hello GreenShift, I’d like to discuss a project in Indonesia.'));document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===next)));apply();const video=document.querySelector('[data-client-slide="film"] video');if(video)for(const track of video.textTracks)track.mode=next==='id'&&track.language==='id'?'showing':'disabled';window.dispatchEvent(new CustomEvent('greenshift:language',{detail:{language:next}}));}
globalThis.GreenShiftLanguage=Object.freeze({get language(){return language;},t,set,apply});
document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>{set(button.dataset.language);const frame=document.querySelector('#experience-frame iframe');if(frame)frame.contentWindow.postMessage({type:'greenshift:language',language},location.origin);}));
window.addEventListener('message',event=>{if(window.parent!==window&&event.source===window.parent&&event.origin===location.origin&&event.data?.type==='greenshift:language')set(event.data.language,false);});
window.addEventListener('storage',event=>{if(event.key===STORE)set(event.newValue,false);});
document.getElementById('field-language')?.addEventListener('change',event=>event.target.dataset.chosen='true');
if(!phraseKeys.length){language='en';document.querySelectorAll('[data-language="id"]').forEach(button=>{button.disabled=true;button.title='Bahasa Indonesia belum dapat dimuat. Coba muat ulang.';});}
set(language,false);
let scheduled=false;const pending=new Set();new MutationObserver(records=>{for(const record of records){const root=record.type==='characterData'?record.target:record.target;pending.add(root);}if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;const roots=[...pending];pending.clear();for(const root of roots)if(root.isConnected)apply(root);});}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder','title','alt']});
// Local/remote paths support keyboard tab selection and carry origin into the inquiry.
const tabs=[...document.querySelectorAll('[data-client-path]')];
function path(button,focus=false){tabs.forEach(b=>{const active=b===button;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;document.getElementById(b.getAttribute('aria-controls')).hidden=!active;});if(focus)button.focus();}
for(const button of tabs){button.addEventListener('click',()=>path(button));button.addEventListener('keydown',event=>{const i=tabs.indexOf(button);let next;if(event.key==='ArrowRight'||event.key==='ArrowLeft')next=tabs[(i+1)%tabs.length];else if(event.key==='Home')next=tabs[0];else if(event.key==='End')next=tabs.at(-1);if(next){event.preventDefault();path(next,true);}});}
document.querySelectorAll('[data-project-origin]').forEach(a=>a.addEventListener('click',()=>{const origin=document.getElementById('field-origin');if(origin)origin.value=a.dataset.projectOrigin;const briefOrigin=document.getElementById('space-origin');if(briefOrigin){briefOrigin.value=a.dataset.projectOrigin;briefOrigin.dispatchEvent(new Event('change',{bubbles:true}));}}));
})();

// Fit both studios below their actual translated chrome and optional brief banner.
if(document.querySelector('.studio-language')&&'ResizeObserver' in window){const nodes=[document.querySelector('body>header'),document.querySelector('.studio-language'),document.querySelector('.studio-switch'),document.querySelector('.space-studio-banner')].filter(Boolean);const measure=()=>document.documentElement.style.setProperty('--studio-chrome',nodes.reduce((n,e)=>n+e.getBoundingClientRect().height,0)+'px');const observer=new ResizeObserver(measure);nodes.forEach(n=>observer.observe(n));measure();}
