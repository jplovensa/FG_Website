export function mountHeroMotion(t){
 const hero=document.querySelector('.hero'),layers=[...hero.querySelectorAll('.hero-image')],button=hero.querySelector('.hero-motion-toggle');
 const sources=['./public/images/campus.jpg','./public/images/residential/fad-r-36-render.webp','./public/images/workers-concept.jpg','./public/images/school-concept.jpg','./public/images/hospital-concept.jpg'];
 const preference=matchMedia('(prefers-reduced-motion: reduce)');let paused=preference.matches||Boolean(navigator.connection?.saveData),visible=true,index=0,active=0,timer,loading=false,revision=0;
 hero.dataset.heroSlide='0';
 function sync(){clearTimeout(timer);hero.classList.toggle('hero-motion-paused',paused||!visible||document.hidden||document.querySelector('#app').inert);button.setAttribute('aria-pressed',String(paused));button.dataset.i18n=paused?'heroMotionPlay':'heroMotionPause';button.textContent=t(button.dataset.i18n);if(!paused&&visible&&!document.hidden&&!document.querySelector('#app').inert)timer=setTimeout(advance,6500);}
 async function advance(){if(loading)return;loading=true;const version=revision,next=(index+1)%sources.length,target=layers[1-active];try{target.src=sources[next];await target.decode();if(version!==revision||paused||!visible||document.hidden)return;target.classList.add('is-active');layers[active].classList.remove('is-active');active=1-active;index=next;hero.dataset.heroSlide=String(index);}catch{/* Keep a usable image if an individual slide cannot load. */}finally{loading=false;sync();}}
 button.addEventListener('click',()=>{paused=!paused;revision++;sync();});preference.addEventListener('change',e=>{paused=e.matches;revision++;sync();});document.addEventListener('visibilitychange',()=>{revision++;sync();});document.addEventListener('fad-language-change',sync);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;revision++;sync();}).observe(hero);
 // The fullscreen introduction makes the site inert. Start the hero when it closes.
 new MutationObserver(sync).observe(document.querySelector('#app'),{attributes:true,attributeFilter:['inert']});sync();
}
