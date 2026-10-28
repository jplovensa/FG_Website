import { drawResidentialPlan } from './residential-plans.js';
export function mountResidential({t,text,onChange}) {
 const section=document.querySelector('#solution');
 const plan=section.querySelector('#view-plan'),spec=section.querySelector('#view-specification');
 const baseline={spec:spec.innerHTML};
 let size=36;
 function translate(){section.querySelectorAll('[data-mockup-home]').forEach(img=>img.alt=`FAD R ${size} — ${t('mock'+img.dataset.mockupHome+'Alt')}`);section.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));section.querySelectorAll('[data-aria]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.aria)));section.querySelectorAll('[data-alt]').forEach(el=>el.alt=t(el.dataset.alt));}
 function choose(value){
  size=value;
  section.querySelectorAll('[data-residential]').forEach(button=>{button.setAttribute('aria-pressed',String(Number(button.dataset.residential)===size));});
  section.querySelector('.residential-code').textContent=`FAD R / ${size}`;
  section.querySelector('[data-residential-area]').textContent=`${size} m²`;
  const layout=section.querySelector('[data-residential-layout]');layout.dataset.i18n=`r${size}Layout`;
  section.querySelector('[data-residential-footprint]').textContent=({18:'3 × 6 m',36:'6 × 6 m',72:'6 × 12 m'})[size];
  section.querySelector('.residential-current').textContent=String(size);
  section.querySelector('.product-tag').innerHTML=size===36?text('type'):`FAD R ${size} / ${text('rConcept')}`;
  section.querySelector('#finish-controls').dataset.concept=String(size!==36);
  plan.innerHTML=drawResidentialPlan(size,{t,text});
  spec.innerHTML=size===36?baseline.spec:`<p class="eyebrow">FAD R ${size}</p><h3>${text('rSpecTitle')}</h3><p>${text('rSpecText')}</p><table class="spec-table"><tbody>${[['rConfig',`r${size}Config`],['rSystem','rSystemText'],['rSite','rSiteText'],['rServices','rServicesText'],['rFinishes','rFinishesText'],['rDelivery','rDeliveryText']].map(([key,value])=>`<tr><th scope="row">${text(key)}</th><td>${text(value)}</td></tr>`).join('')}</tbody></table>`;
  section.querySelectorAll('[data-mockup-home]').forEach(img=>img.src=`./public/images/residential/fad-r-${size}-${img.dataset.mockupHome}.webp`);
  translate();onChange(size);
 }
 const buttons=[...section.querySelectorAll('[data-residential]')];
 buttons.forEach((button,index)=>{
  button.addEventListener('click',()=>choose(Number(button.dataset.residential)));
  button.addEventListener('keydown',e=>{let next=index;if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(index+1)%buttons.length;else if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(index+buttons.length-1)%buttons.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=buttons.length-1;else return;e.preventDefault();buttons[next].focus();choose(Number(buttons[next].dataset.residential));});
 });
 document.addEventListener('fad-language-change',translate);
 choose(36);
}
