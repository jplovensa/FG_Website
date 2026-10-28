// The introduction is optional enhancement: the static homepage always exists.
(() => {
  const app = document.getElementById('app');
  if (!app) return;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const intro = document.createElement('section');
  intro.className = 'studio-intro';
  intro.setAttribute('role', 'dialog');
  intro.setAttribute('aria-modal', 'true');
  intro.setAttribute('aria-label', 'GreenShift introduction — from 540 to 45 days, part of Fjäll Group');
  intro.dataset.sequence = 'cinematic-countdown-v2';
  intro.innerHTML = `<video class="intro-video" muted loop playsinline preload="auto" poster="./assets/hero-architecture-poster.jpg" aria-hidden="true"><source src="./assets/hero-architecture.mp4" type="video/mp4"></video><div class="intro-shade"></div><div class="intro-grain" aria-hidden="true"></div><div class="intro-letterbox intro-letterbox-top" aria-hidden="true"></div><div class="intro-letterbox intro-letterbox-bottom" aria-hidden="true"></div><div class="intro-edition" aria-hidden="true"><span class="intro-signal"></span> GREENSHIFT <span>/</span> A NEW WAY TO BUILD</div><button class="intro-skip" type="button">Skip intro <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 13 13 3M3 3h10v10" stroke="currentColor" stroke-width="1.2"/></svg></button><div class="intro-orbit" aria-hidden="true"><span></span></div><div class="intro-count" aria-hidden="true"><p class="intro-chapter">01 / RETHINK TIME</p><p class="intro-title">Build your home.<br><span>Without the wait.</span></p><div class="intro-number-wrap"><span class="intro-number">${reduced ? '45' : '540'}</span><span class="intro-days">DAYS</span></div><p class="intro-count-caption">The way it was. <span>The way forward.</span></p></div><div class="intro-timeline" aria-hidden="true"><div class="intro-timeline-labels"><span>540 <small>DAYS</small></span><span class="intro-stage">RETHINK THE WAIT</span><span>45 <small>DAYS</small></span></div><div class="intro-track"><span class="intro-track-fill"></span></div><div class="intro-ticks"></div></div><div class="intro-brand" aria-hidden="true"><div class="intro-brand-sheet"><p class="intro-chapter">THE FUTURE. BROUGHT FORWARD.</p><img class="intro-greenshift" src="./assets/logo.png" alt="GreenShift"><div class="intro-brand-divider"></div><p class="eyebrow">Part of</p><img class="intro-fjall" src="./assets/fjall-group.png" alt="Fjäll Group"><p class="intro-promise">45 days. Without the wait.</p></div></div><div class="intro-footnote" aria-hidden="true"><span>DESIGN. DEVELOP. TRANSFORM. / 45 DAYS FOR ELIGIBLE MODULAR PROJECTS.</span><span class="intro-scene">540 → 45</span></div>`;
  let closed = false, frame = 0;
  const timers = [];
  const previousFocus = document.activeElement;
  const previousInert = app.inert;
  const media = intro.querySelector('video');
  const skip = intro.querySelector('button');
  function finish() {
    if (closed) return;
    closed = true;
    timers.forEach(clearTimeout);
    cancelAnimationFrame(frame);
    media.pause();
    const restoreFocus = intro.contains(document.activeElement);
    intro.remove();
    app.inert = previousInert;
    document.body.classList.remove('intro-open');
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('visibilitychange', onVisibility);
    if (restoreFocus) {
      const target = previousFocus && previousFocus !== document.body ? previousFocus : app.querySelector('a, button');
      if (target) target.focus({preventScroll:true});
    }
  }
  function onKey(event) {
    if (event.key === 'Escape') { event.preventDefault(); finish(); }
    else if (event.key === 'Tab') { event.preventDefault(); skip.focus(); }
  }
  function onVisibility() { if (document.hidden) finish(); }
  // Independent upper bound: failed video, missing logo, or interrupted animation
  // must never trap visitors behind a loader.
  timers.push(setTimeout(finish, 8500));
  skip.addEventListener('click', finish);
  document.addEventListener('keydown', onKey);
  document.addEventListener('visibilitychange', onVisibility);
  document.body.appendChild(intro);
  app.inert = true;
  document.body.classList.add('intro-open');
  skip.focus({preventScroll:true});
  function reveal() {
    intro.querySelector('.intro-number').textContent = '45';
    intro.classList.add('is-brand');
    intro.querySelector('.intro-stage').textContent = 'THE FUTURE. BROUGHT FORWARD.';
    timers.push(setTimeout(() => {
      intro.classList.add('is-leaving');
      timers.push(setTimeout(finish, reduced ? 0 : 800));
    }, reduced ? 900 : 1900));
  }
  if (reduced) {
    intro.classList.add('is-reduced');
    reveal();
    return;
  }
  media.play().catch(() => {}); // Poster remains visible if playback is unavailable.
  const start = performance.now();
  const number = intro.querySelector('.intro-number');
  const stage = intro.querySelector('.intro-stage');
  function tick(now) {
    if (closed) return;
    // Hold the starting point, accelerate, then settle deliberately on 45.
    // This is a brand timeline, independent of network or video load progress.
    const progress = Math.max(0, Math.min(1, (now - start - 650) / 3500));
    const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
    number.textContent = String(Math.round(540 - 495 * eased));
    intro.style.setProperty('--intro-progress', eased.toFixed(4));
    intro.classList.toggle('is-running', progress > 0);
    if (progress > .72) stage.textContent = 'PRECISION. AT A NEW PACE.';
    else if (progress > .28) stage.textContent = 'BRING THE FUTURE FORWARD';
    if (progress < 1) frame = requestAnimationFrame(tick);
    else {
      intro.classList.add('is-arrived');
      stage.textContent = '45 DAYS. WITHOUT THE WAIT.';
      timers.push(setTimeout(reveal, 700));
    }
  }
  frame = requestAnimationFrame(tick);
})();
(() => {
const reduced = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : {matches:true};
const icon = name => `<i class="ph ph-${name}" aria-hidden="true"></i>`;
const header = document.getElementById('site-header');
const toggle = document.getElementById('menu-toggle');
const menu = document.getElementById('mobile-menu');
const main = document.querySelector('main');
const footer = document.querySelector('footer');
function setMenu(open) {
  menu.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  toggle.innerHTML = icon(open ? 'x' : 'list');
  header.classList.toggle('is-menu-open', open);
  document.body.classList.toggle('menu-open', open);
  main.inert = open;
  footer.inert = open;
}
toggle.addEventListener('click',()=>setMenu(menu.hidden));
menu.addEventListener('click',event=>{if(event.target.closest('a'))setMenu(false);});
header.querySelector('a').addEventListener('click',()=>setMenu(false));
function updateHeader(){header.classList.toggle('is-scrolled',window.scrollY>80);}
window.addEventListener('scroll', updateHeader, {passive:true});updateHeader();
window.addEventListener('resize',()=>{if(window.innerWidth>1200)setMenu(false);});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape' && !menu.hidden){setMenu(false);toggle.focus();}
 if(event.key==='Tab' && !menu.hidden){const focusables=[toggle,...menu.querySelectorAll('a')];const idx=focusables.indexOf(document.activeElement);event.preventDefault();focusables[(idx+(event.shiftKey?-1:1)+focusables.length)%focusables.length].focus();}
});
const videos=[...document.querySelectorAll('main video:not([data-native-playback])')];
const videoObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries=>{for(const entry of entries){const video=entry.target;if(entry.isIntersecting && (!reduced.matches || video.dataset.manualPlayback==='true') && video.dataset.userPaused!=='true' && !video.ended)video.play().catch(()=>{});else video.pause();}},{threshold:.15}) : null;
for(const video of videos){video.muted=true;if(videoObserver)videoObserver.observe(video);}
const heroVideo=document.querySelector('#hero video');
if(heroVideo){
 const button=document.createElement('button');button.className='video-toggle';button.type='button';button.setAttribute('aria-label','Play hero video');button.innerHTML=icon('play');document.getElementById('hero').appendChild(button);
 const sync=()=>{button.innerHTML=icon(heroVideo.paused?'play':'pause');button.setAttribute('aria-label',heroVideo.paused?'Play hero video':'Pause hero video');};heroVideo.addEventListener('play',sync);heroVideo.addEventListener('pause',sync);
 button.addEventListener('click',()=>{if(heroVideo.paused)heroVideo.play().catch(()=>{});else heroVideo.pause();});
}
const onReduced=()=>{if(reduced.matches){videos.forEach(v=>v.pause());document.querySelectorAll('dialog video').forEach(v=>v.pause());}};
if(reduced.addEventListener)reduced.addEventListener('change',onReduced);else if(reduced.addListener)reduced.addListener(onReduced);
const keys=['Mid-Range','Luxury','Avant-Garde','Adaptive Reuse'];
const dialog=document.getElementById('tier-dialog');
let origin=null;
function closeDialog(){dialog.close();}
function openTier(card){
 const idx=keys.indexOf(card.dataset.tier);if(idx<0)return;
 origin=card;
 dialog.replaceChildren(document.getElementById('tier-template-'+idx).content.cloneNode(true));
 dialog.querySelector('.close-tier').addEventListener('click',closeDialog);
 dialog.querySelector('.tier-inquiry').addEventListener('click',()=>{document.querySelector('[name=interest]').value=['Commercial','Premium','Bespoke','Retrofit'][idx];closeDialog();document.getElementById('contact').scrollIntoView({behavior:reduced.matches?'instant':'smooth'});document.querySelector('[name=name]').focus({preventScroll:true});});
 dialog.showModal();document.body.classList.add('dialog-open');
 const video=dialog.querySelector('video');if(video){video.muted=true;if(!reduced.matches)video.play().catch(()=>{});}
}
for(const card of document.querySelectorAll('[data-tier]')){card.addEventListener('click',()=>openTier(card));card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openTier(card);}});}
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closeDialog();});
dialog.addEventListener('close',()=>{dialog.querySelectorAll('video').forEach(v=>v.pause());document.body.classList.remove('dialog-open');if(origin)origin.focus({preventScroll:true});});
const form=document.getElementById('inquiry');
const review=document.getElementById('inquiry-review');
form.addEventListener('submit',event=>{
 event.preventDefault();if(!form.reportValidity())return;
 const data=new FormData(form),tr=s=>globalThis.GreenShiftLanguage?.t(s)||s;
 const rows=[['Full name',data.get('name')],['Email',data.get('email')],['Company',data.get('company')||'—'],['Interest',tr(data.get('interest'))],['Project city',data.get('city')||tr('To be confirmed')],['Approximate area',data.get('area')?data.get('area')+' m²':tr('To be confirmed')],['Desired timing',tr(data.get('timing')||'Exploring options')],['Planning from',tr(data.get('origin')||'In Indonesia')],['Preferred language',data.get('language')||'English'],['Investment range',tr(data.get('budget')||'To discuss')]];
 const text=tr('GreenShift project inquiry')+'\n\n'+rows.map(([key,value])=>tr(key)+': '+value).join('\n')+'\n\n'+data.get('message');
 review.querySelector('pre').textContent=text;review.querySelector('a').href='https://wa.me/6287786010290?text='+encodeURIComponent(text);review.hidden=false;review.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'});
});
form.addEventListener('input',()=>{review.hidden=true;review.querySelector('a').removeAttribute('href');});document.getElementById('edit-inquiry').addEventListener('click',()=>{review.hidden=true;document.querySelector('[name=message]').focus();});
})();

(() => {
 const projects = {
  drop: { title: 'Drop Pod Villas — Client Walkthrough', url: 'https://jplovensa.github.io/Drop-Pod-Experience-/experience.html' },
  spatial: { title: 'Garuda Spark Innovation Hub — WebGL Presentation', url: './assets/spatial-presentation.html', external: 'https://jplovensa.github.io/SCH-FG_GSIH_MCC/' },
  facade: { title: 'GreenShift — Facade Facelift Studio', url: './assets/facade-studio.html?v=modeller5.1' },
  renovation: { title: 'GreenShift — Asset Repurposing Studio', url: './assets/renovation-studio.html?v=modeller5.1' }
 };
 const dialog = document.getElementById('experience-dialog');
 const host = document.getElementById('experience-frame');
 let trigger;
 for (const button of document.querySelectorAll('[data-experience]')) {
  button.addEventListener('click', () => {
   const project = projects[button.dataset.experience];
   if (!project) return;
   trigger = button.id === 'space-dialog-launch' ? document.getElementById('space-open-studio') : button;
   document.getElementById('experience-dialog-title').textContent = project.title;
   document.getElementById('experience-external').href = project.external || project.url;
   const frame = document.createElement('iframe');
   frame.title = project.title;
   const fromSpace = button.id === 'space-dialog-launch';
   const studioURL = project.url + (fromSpace ? (project.url.includes('?') ? '&' : '?') + 'space=1' : '') + (['facade','renovation'].includes(button.dataset.experience) ? '&lang='+(globalThis.GreenShiftLanguage?.language||'en') : '') + (['facade','renovation'].includes(button.dataset.experience) ? (fromSpace||button.dataset.guided ? '&guided=1' : '&assembly=1') : '') + (button.dataset.panel ? '&panel='+encodeURIComponent(button.dataset.panel) : '');
   frame.src = studioURL;
   document.getElementById('experience-external').href = project.external || studioURL;
   if (fromSpace) frame.addEventListener('load', () => {
    const brief = globalThis.GreenShiftSpaceDraft?.();
    if (brief) frame.contentWindow.postMessage({type:'greenshift:space-brief',brief}, location.origin);
   }, {once:true});
   frame.allow = 'fullscreen; autoplay; xr-spatial-tracking';
   frame.allowFullscreen = true;
   frame.referrerPolicy = 'strict-origin-when-cross-origin';
   host.replaceChildren(frame);
   dialog.showModal();
   document.body.classList.add('dialog-open');
   document.getElementById('experience-close').focus();
  });
 }
 document.getElementById('experience-close').addEventListener('click', () => dialog.close());
 dialog.addEventListener('close', () => {
  host.replaceChildren();
  document.body.classList.remove('dialog-open');
  trigger?.focus({preventScroll: true});
 });
 dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
 });
})();

(() => {
 const grid=document.querySelector('.deployment-grid');
 const cards=[...grid.querySelectorAll('[data-deployment-kind]')];
 const filters=[...document.querySelectorAll('[data-deployment-filter]')];
 const descriptions={all:'Four approaches. One studio.',new:'Three approaches for your new build.',existing:'Refurbish and repurpose your existing space.'};
 filters.forEach(button=>button.addEventListener('click',()=>{
  const kind=button.dataset.deploymentFilter;
  for (const filter of filters) filter.setAttribute('aria-pressed',String(filter===button));
  for (const card of cards) card.hidden=kind!=='all'&&card.dataset.deploymentKind!==kind;
  grid.classList.toggle('is-existing',kind==='existing');
  document.getElementById('deployment-status').textContent=descriptions[kind];
 }));
})();

(() => {
 const materials=JSON.parse(document.getElementById('asset-material-data').textContent);
 const selected=new Set();let goal='layout',detailKey=null,detailOrigin=null;
 const goals={layout:{label:'Make the layout work harder',title:'Layout & circulation',copy:'Review how people move, meet and use the space. Explore new zones, partitions, openings and circulation around the existing structure.'},identity:{label:'Give the interior a new identity',title:'Materials & atmosphere',copy:'Explore a coordinated palette of finishing panels, surfaces, ceilings and lighting to change how an existing interior feels.'},repurpose:{label:'Prepare the asset for a new use',title:'Asset repositioning',copy:'Start with the intended new use. Review spatial needs, retained elements and the design changes needed to give the asset its next purpose.'}};
 const byKey=key=>materials.find(m=>m.key===key);
 const summary=document.getElementById('asset-brief-list');
 function syncSelection(){
  document.querySelectorAll('[data-asset-save]').forEach(input=>input.checked=selected.has(input.dataset.assetSave));
  summary.replaceChildren();
  if(!selected.size){const li=document.createElement('li');li.textContent='No finishes selected yet. Explore the material library.';summary.append(li);}
  for(const key of selected){const li=document.createElement('li'),text=document.createElement('span'),remove=document.createElement('button');text.textContent=byKey(key).title;remove.type='button';remove.textContent='Remove';remove.setAttribute('aria-label','Remove '+byKey(key).title+' from brief');remove.addEventListener('click',()=>{selected.delete(key);syncSelection();(summary.querySelector("button")||document.getElementById("asset-inquiry")).focus({preventScroll:true});});li.append(text,remove);summary.append(li);}
  document.getElementById('asset-brief-goal').textContent=goals[goal].label;
  document.getElementById('asset-brief-status').textContent=selected.size?selected.size+' renovation '+(selected.size===1?'category':'categories')+' saved to your brief.':'Your direction and selected finishes will be added to the inquiry.';
  if(detailKey){const active=selected.has(detailKey);document.getElementById('asset-detail-save').textContent=active?'Remove from my brief':'Add to my brief';document.getElementById('asset-detail-save').setAttribute('aria-pressed',String(active));}
 }
 document.querySelectorAll('[data-asset-goal]').forEach(button=>button.addEventListener('click',()=>{goal=button.dataset.assetGoal;document.querySelectorAll('[data-asset-goal]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.getElementById('asset-goal-title').textContent=goals[goal].title;document.getElementById('asset-goal-copy').textContent=goals[goal].copy;syncSelection();}));
 document.querySelectorAll('[data-asset-filter]').forEach(button=>button.addEventListener('click',()=>{const family=button.dataset.assetFilter;document.querySelectorAll('[data-asset-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelectorAll('[data-asset-family]').forEach(card=>card.hidden=family!=='all'&&card.dataset.assetFamily!==family);}));
 document.querySelectorAll('[data-asset-save]').forEach(input=>input.addEventListener('change',()=>{if(input.checked)selected.add(input.dataset.assetSave);else selected.delete(input.dataset.assetSave);syncSelection();}));
 const detail=document.getElementById('asset-material-dialog');
 document.querySelectorAll('[data-asset-detail]').forEach(button=>button.addEventListener('click',()=>{detailKey=button.dataset.assetDetail;detailOrigin=button;const material=byKey(detailKey);const image=document.getElementById('asset-detail-image');image.src='./assets/'+(material.imageFile||material.image+'.jpg');image.parentElement.classList.toggle('material-atlas',material.imageFile==='studio-material-atlas.png');image.parentElement.style.setProperty('--tile-x',material.tileX||0);image.parentElement.style.setProperty('--tile-y',material.tileY||0);image.alt='Original concept study of '+material.title.toLowerCase();for(const [id,text] of Object.entries({'asset-material-title':material.title,'asset-material-intro':material.intro,'asset-material-options':material.options,'asset-material-uses':material.uses,'asset-material-resolve':material.resolve}))document.getElementById(id).textContent=text;syncSelection();detail.showModal();document.body.classList.add('dialog-open');detail.querySelector('.asset-material-close').focus();}));
 detail.querySelector('.asset-material-close').addEventListener('click',()=>detail.close());
 document.getElementById('asset-detail-save').addEventListener('click',()=>{if(selected.has(detailKey))selected.delete(detailKey);else selected.add(detailKey);syncSelection();});
 detail.addEventListener('close',()=>{document.body.classList.remove('dialog-open');detailOrigin?.focus({preventScroll:true});});
 document.getElementById('asset-inquiry').addEventListener('click',event=>{const form=document.getElementById('inquiry'),message=form.querySelector('[name=message]');const block='[GreenShift asset repurposing brief]\nDirection: '+goals[goal].label+'\nRenovation palette: '+([...selected].map(key=>byKey(key).title).join(', ')||'To explore with the studio')+'\n[/GreenShift asset repurposing brief]';const notes=message.value.replace(/\n*\[GreenShift asset repurposing brief\][\s\S]*?\[\/GreenShift asset repurposing brief\]/g,'');const localized=globalThis.GreenShiftLanguage?.t(block)||block;const next=notes.trim()?notes+'\n\n'+localized:localized;if(next.length>message.maxLength){event.preventDefault();document.getElementById('asset-brief-status').textContent='Your existing notes leave too little room for this brief. Shorten the inquiry message before adding it.';return;}message.value=next;form.querySelector('[name=interest]').value='Retrofit';form.dispatchEvent(new Event('input',{bubbles:true}));});
 const background=document.getElementById('asset-film'),toggle=document.getElementById('asset-film-toggle');
 function syncFilm(){const paused=background.paused;toggle.innerHTML='<i class="ph ph-'+(paused?'play':'pause')+'" aria-hidden="true"></i>';toggle.setAttribute('aria-label',(background.ended?'Replay':paused?'Play':'Pause')+' concept film');}
 background.addEventListener('play',syncFilm);background.addEventListener('pause',syncFilm);background.addEventListener('ended',syncFilm);syncFilm();
 toggle.addEventListener('click',()=>{if(background.paused){background.dataset.userPaused='false';background.dataset.manualPlayback='true';background.play().catch(()=>{});}else{background.dataset.userPaused='true';background.pause();}});
 const film=document.getElementById('asset-film-dialog'),video=film.querySelector('video'),opener=document.getElementById('asset-film-open');
 opener.addEventListener('click',()=>{background.pause();film.showModal();document.body.classList.add('dialog-open');video.play().catch(()=>{});film.querySelector('.asset-film-close').focus();});
 film.querySelector('.asset-film-close').addEventListener('click',()=>film.close());
 film.addEventListener('close',()=>{video.pause();document.body.classList.remove('dialog-open');opener.focus({preventScroll:true});const rect=background.getBoundingClientRect();if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&background.dataset.userPaused!=='true'&&!background.ended&&rect.bottom>0&&rect.top<innerHeight)background.play().catch(()=>{});});
 for(const dialog of [detail,film])dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
})();

// A client presentation deck within the single working studio.
(() => {
 const buttons=[...document.querySelectorAll('[data-client-select]')];
 const slides=[...document.querySelectorAll('[data-client-slide]')];
 function select(key){buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.clientSelect===key)));slides.forEach((slide,index)=>{const active=slide.dataset.clientSlide===key;slide.hidden=!active;if(!active)slide.querySelectorAll('video').forEach(video=>video.pause());else document.getElementById('client-slide-count').textContent=String(index+1).padStart(2,'0')+' / 03';});}
 buttons.forEach(button=>button.addEventListener('click',()=>select(button.dataset.clientSelect)));select('film');
})();

// Brief controls link to the visible studio sections.
document.querySelectorAll('.studio-brief-edit').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.studioNext==='renovate'?'asset-direction':'material-library').scrollIntoView({block:'start',behavior:'instant'})));

// Accept a brief only from our own, currently open renovation planner.
(() => {
 const dialog=document.getElementById('experience-dialog');
 function addPlan(plan){
  if(!plan||plan.version!==1||!Number.isFinite(plan.area)||plan.area<9||plan.area>(plan.kind==='assembly'?1600:plan.service==='Facade facelift'?400:144))return false;
  for(const key of ['room','floor','wall','objects','layout'])if(typeof plan[key]!=='string'||plan[key].length>5000)return false;
  const form=document.getElementById('inquiry'),field=form.querySelector('[name=message]');
  const start='[GreenShift renovation simulation]',end='[/GreenShift renovation simulation]';
  const existing=field.value.replace(/\n*\[GreenShift renovation simulation\][\s\S]*?\[\/GreenShift renovation simulation\]/g,'').trim();
  const heading=start+(plan.service==='Facade facelift'?'\nService: Facade facelift':'')+'\nAsset: '+plan.room+' ('+plan.area+' m²)\nFloor: '+plan.floor+'\nWalls: '+plan.wall+'\nObjects: '+plan.objects;
  const eps=typeof plan.eps==='string'&&plan.eps.length<=1000?'\n'+plan.eps:'';
  let brief=heading+eps+'\nLayout:\n'+plan.layout+'\nConcept only; requires design review.\n'+end;
  if((existing+'\n\n'+brief).length>field.maxLength)brief=heading+eps+'\nPositions retained in the downloadable plan.\nConcept only; requires design review.\n'+end;
  const next=(existing?existing+'\n\n':'')+brief;if(next.length>field.maxLength)return false;
  field.value=globalThis.GreenShiftLanguage?.language==='id'?(existing?existing+'\n\n':'')+GreenShiftLanguage.t(brief):next;form.querySelector('[name=interest]').value=plan.service==='Development concept'?'Development concept':plan.service==='Facade facelift'?'Facade facelift':'Interior refurbishment';form.dispatchEvent(new Event('input',{bubbles:true}));
  const focus=()=>{document.getElementById('contact').scrollIntoView({block:'start',behavior:'instant'});form.querySelector('[name=name]').focus({preventScroll:true});};
  if(dialog.open){dialog.addEventListener('close',()=>requestAnimationFrame(focus),{once:true});dialog.close();}else focus();return true;
 }
 window.addEventListener('message',event=>{
  const frame=document.querySelector('#experience-frame iframe');
  if(event.origin!==location.origin||!dialog.open||!frame||event.source!==frame.contentWindow||!['/assets/renovation-studio.html','/assets/facade-studio.html'].some(path=>new URL(frame.src).pathname.endsWith(path))||event.data?.type!=='greenshift:renovation-plan')return;
  const ok=addPlan(event.data.plan);event.source.postMessage({type:'greenshift:renovation-result',message:ok?'Your concept has been added to the project inquiry.':'Your existing inquiry has too little space. Download the plan or shorten the notes first.'},location.origin);
 });
 if(new URLSearchParams(location.search).get('renovation')==='1'){
  try{const raw=localStorage.getItem('greenshift:pending-renovation');if(raw&&addPlan(JSON.parse(raw)))localStorage.removeItem('greenshift:pending-renovation');}catch{}
 }
})();

// First-party integration hooks: no analytics requests and no personal brief data.
globalThis.GreenShiftJourney=(event,service='general',source='website')=>{
 if(!['service_selected','brief_completed','studio_opened','inquiry_prepared','whatsapp_clicked'].includes(event))return;
 window.dispatchEvent(new CustomEvent('greenshift:journey',{detail:{event,service,source}}));
};
document.getElementById('inquiry').addEventListener('submit',()=>{if(document.getElementById('inquiry').checkValidity())GreenShiftJourney('inquiry_prepared','general','contact');});
document.addEventListener('click',e=>{const link=e.target.closest('a');if(link?.href.startsWith('https://wa.me/'))GreenShiftJourney('whatsapp_clicked','general',link.classList.contains('review-send')?'inquiry':'direct');});

// One studio hub: tools are requested explicitly, not repeated along the page.
(() => {
 const tabs=[...document.querySelectorAll('[data-studio-mode]')];
 const panels=[...document.querySelectorAll('[data-studio-panel]')];
 function show(mode,focus=false){
  tabs.forEach(tab=>{const active=tab.dataset.studioMode===mode;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;if(active&&focus)tab.focus();});
  panels.forEach(panel=>{const active=panel.dataset.studioPanel===mode;panel.hidden=!active;if(!active)panel.querySelectorAll('video').forEach(v=>v.pause());});
 }
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>show(tab.dataset.studioMode));tab.addEventListener('keydown',e=>{let next=i;if(e.key==='ArrowRight')next=(i+1)%tabs.length;else if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();show(tabs[next].dataset.studioMode,true);});});
 function reveal(target){if(!target)return;const panel=target.closest('[data-studio-panel]');if(panel)show(panel.dataset.studioPanel);let parent=target.parentElement;while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}}
 document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a)reveal(document.getElementById(a.getAttribute('href').slice(1)));});
 document.querySelectorAll('.studio-brief-edit').forEach(b=>b.addEventListener('click',()=>{const target=document.getElementById(b.dataset.studioNext==='renovate'?'asset-direction':'material-library');reveal(target);target?.scrollIntoView({block:'start',behavior:'smooth'});}));
 const hash=()=>{const target=document.getElementById(location.hash.slice(1));reveal(target);};window.addEventListener('hashchange',hash);hash();
})();
