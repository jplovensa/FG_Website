import { projectSelectionMarkup, mountProjectSelection } from './development-planner.js';
import { mountHeroMotion } from './hero-motion.js';
import { mountResidential } from './residential.js';
import { content } from './content.js';
import { mountWebGLIcons } from './webgl.js';
import { mountFadMotion } from './motion.js';

const icons = {
 arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', diagonal: '<path d="M6 18 18 6M6 6h12v12"/>', download: '<path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5"/>',
 home: '<path d="m3 11 9-8 9 8M5 9v12h14V9M9 21v-8h6v8"/>', speed: '<path d="m14 2-9 12h7l-2 8 9-12h-7l2-8"/>', layers: '<path d="m12 3 10 5-10 5L2 8l10-5Zm-10 10 10 5 10-5M2 18l10 5 10-5"/>', grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>', check: '<path d="m5 12 4 4L19 6"/>', plus: '<path d="M12 5v14M5 12h14"/>', close: '<path d="m6 6 12 12M18 6 6 18"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', whatsapp: '<path d="M20.5 11.7a8.5 8.5 0 0 1-12.8 7.5L3 21l1.6-4.8A8.5 8.5 0 1 1 20.5 11.7Z"/><path d="M8 7c-2 4 2 8 6 9l2-2-3-2-1 1c-1-1-2-2-2-3l1-1-2-2H8Z"/>', chevron: '<path d="m6 9 6 6 6-6"/>', building: '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 8h1m4 0h1M9 12h1m4 0h1M10 21v-5h4v5"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18"/>',
};
const simpleIcon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const icon = (name, cls = '') => ['home','building','grid','layers','speed','hospital'].includes(name) ? `<span class="icon spatial-icon ${cls}" data-webgl="${name}" aria-hidden="true"><canvas></canvas><img class="spatial-fallback" src="./public/brand/fad-mark.svg" alt=""></span>` : simpleIcon(name,cls);
const logo = `<img class="brand-icon fad-mark" src="./public/brand/fad-mark.svg" alt="">`;
const groupLogo = `<img class="group-logo" src="./public/brand/fjall-group.png" alt="Fjäll Group">`;
let lang = 'en';
try { lang = localStorage.getItem('fjall-language') === 'id' ? 'id' : 'en'; } catch {}
let finish = 'olive';
let housingSize = 36;
let housingFinishChosen = false;
let brief = '';
let lastFocus;
const t = key => content[lang][key] || key;
const text = key => `<span data-i18n="${key}">${t(key)}</span>`;
const arrow = icon('arrow');
const field = (key, type, placeholderKey, extra = '') => `<label class="field">${text(key)} <span class="required-mark" aria-hidden="true">*</span><input name="${key}" type="${type}" ${placeholderKey ? `placeholder="${t(placeholderKey)}" data-placeholder="${placeholderKey}"` : ''} required ${extra}></label>`;
const select = (key, options) => `<label class="field">${text(key)} <span class="required-mark" aria-hidden="true">*</span><span class="select-wrap"><select name="${key}" required><option value="" data-i18n="select">${t('select')}</option>${options.map(k => `<option value="${k}" data-i18n="${k}">${t(k)}</option>`).join('')}</select>${icon('chevron')}</span></label>`;

const sectorPresentation = (key,code,sector) => `<section class="solution section development-detail" id="${key}"><div class="container"><div class="section-heading centered"><p class="eyebrow">${text('detailLabel')}</p><h2>${text(key+'Title')}<em>${text(key+'Accent')}</em></h2><p>${text(key+'Text')}</p></div><div class="product"><div class="product-gallery">
<div class="product-view-nav"><span class="eyebrow">FAD / ${code}</span><div class="view-tabs" role="tablist" aria-label="${t(key+'Title')}" data-aria="${key+'Title'}">${[['exterior','homeExterior'],['shell','mockShell'],['interior','mockInterior'],['variations','mockVariations'],['layout','detailLayout'],['spec','detailSpec']].map(([view,label])=>`<button id="${key}-tab-${view}" role="tab" data-sector-tab="${view}" aria-controls="${key}-view-${view}" aria-selected="${view==='exterior'}" tabindex="${view==='exterior'?0:-1}">${text(label)}</button>`).join('')}</div></div>
<div id="${key}-view-exterior" role="tabpanel" aria-labelledby="${key}-tab-exterior" class="sector-view product-image-wrap"><img src="./public/images/${key}-concept.jpg" alt="${t(key+'CoverAlt')}" data-sector-alt="${key}" loading="lazy"><span class="product-caption">${text('detailConcept')}</span></div>
${['shell','interior','variations'].map(mode=>`<div id="${key}-view-${mode}" role="tabpanel" aria-labelledby="${key}-tab-${mode}" class="sector-view mockup-view" hidden><img src="./public/images/${key}-${mode}.webp" alt="${t(key+'Title')} — ${t('mock'+mode+'Alt')}" data-mockup-sector="${key}" data-mockup-mode="${mode}" loading="lazy"><div class="mockup-view-caption"><strong>${text(key+'Mock'+mode+'Title')}</strong><p>${text(key+'Mock'+mode+'Text')}</p></div></div>`).join('')}
<div id="${key}-view-layout" role="tabpanel" aria-labelledby="${key}-tab-layout" class="sector-view sector-layout" hidden><svg viewBox="0 0 620 440" role="img" aria-labelledby="${key}-plan-title"><title id="${key}-plan-title" data-i18n="detailLayout">${t('detailLayout')}</title><path d="M55 55h510v290H55z" fill="#e1ebe3" stroke="#193a32" stroke-width="4"/>${[0,1,2].map(n=>`<rect x="${67+n*167}" y="67" width="155" height="166" rx="3" fill="#f5f4ed" stroke="#398780" stroke-width="2"/><text x="${144+n*167}" y="151" text-anchor="middle" data-i18n="${key+'Zone'+(n+1)}">${t(key+'Zone'+(n+1))}</text><path d="M${129+n*167} 233h30" stroke="#a1e5cf" stroke-width="5"/>`).join('')}<rect x="67" y="251" width="486" height="82" rx="3" fill="#a1e5cf"/><text x="310" y="296" text-anchor="middle" data-i18n="${key+'Shared'}">${t(key+'Shared')}</text><path d="M285 347v35h50v-35" stroke="#398780" stroke-width="2" fill="none"/><text x="310" y="415" text-anchor="middle" data-i18n="detailLayout">${t('detailLayout')}</text></svg><p class="fine-print">${text('detailPlanNote')}</p></div>
<div id="${key}-view-spec" role="tabpanel" aria-labelledby="${key}-tab-spec" class="sector-view specification-view" hidden><p class="eyebrow">${text('detailSpec')}</p><h3>${text(key+'Title')}</h3><table class="spec-table"><tbody>${[['detailConfig',key+'Config'],['detailBuild','detailBuildText'],['detailServices',key+'Services'],['detailAccess',key+'Access'],['detailScope',key+'Scope'],['detailScale','detailScaleText']].map(([a,b])=>`<tr><th scope="row">${text(a)}</th><td>${text(b)}</td></tr>`).join('')}</tbody></table></div></div>
<div class="product-info"><div class="product-name"><p class="eyebrow">${text('detailOverview')}</p><h3>FAD <span>${code}</span></h3><span class="product-stamp">${icon(key==='hospital'?'hospital':key==='school'?'building':'grid')}</span></div><div class="product-specs">${[['detailConfigured','detailCapacity'],['detailRepeat','detailSystem'],['detailPhased','detailDelivery']].map(([a,b])=>`<div><strong>${text(a)}</strong><span>${text(b)}</span></div>`).join('')}</div><div class="price"><p class="eyebrow">${text('detailProposal')}</p><p>${text('detailPrice')}</p></div><a class="button" href="#contact" data-project="${sector}" data-application="${key}">${text('detailCta')}${icon('diagonal')}</a></div></div></div></section>`;

const app = document.querySelector('#app');
app.innerHTML = `
<a class="skip-link" href="#main">${text('skip')}</a>
<header class="header"><div class="nav-wrap">
 <a href="#" class="brand" aria-label="Fjäll Affordable Development home">${logo}<span class="brand-name"><img class="fad-wordmark" src="./public/brand/fad-wordmark-reverse.svg" alt="FAD"><span class="brand-sub">${text('brandSub')}</span></span></a>
 <nav class="desktop-nav" aria-label="Main navigation"><a href="../index.html">Fjäll Group</a><a href="#applications">${text('navSolution')}</a><a href="#government">${text('navTech')}</a><a href="#applications">${text('navProjects')}</a></nav>
 <div class="nav-actions"><div class="language-switch" role="group" aria-label="Language"><button data-lang="en" aria-label="English" aria-pressed="${lang === 'en'}">EN</button><span>/</span><button data-lang="id" aria-label="Bahasa Indonesia" aria-pressed="${lang === 'id'}">ID</button></div><a class="button nav-cta" href="#contact">${text('navContact')}${icon('diagonal')}</a><button class="menu-toggle icon-button" aria-expanded="false" aria-controls="mobile-nav" data-aria="menu" aria-label="${t('menu')}">${icon('menu')}</button></div>
</div><nav id="mobile-nav" class="mobile-nav" hidden><a href="../index.html">Fjäll Group</a><a href="#applications">${text('navSolution')}</a><a href="#government">${text('navTech')}</a><a href="#applications">${text('navProjects')}</a><a href="#contact">${text('navContact')}${arrow}</a></nav></header>
<main id="main">
<section class="hero container">
 <div class="hero-copy"><p class="eyebrow"><span class="status-dot"></span>${text('heroEyebrow')}</p><h1>${text('heroTitle')}<em>${text('heroAccent')}</em></h1><p class="hero-description">${text('heroDescription')}</p><div class="hero-buttons"><a class="button" href="#contact">${text('heroCta')}${icon('diagonal')}</a><a class="text-link" href="#applications">${text('heroSecondary')}${arrow}</a></div><div class="hero-end">${groupLogo}<span class="mini-emblem">${icon('home')}</span><span>${text('heroTag')}</span><span class="hero-line"></span></div></div>
 <div class="hero-visual"><img class="hero-image is-active" src="./public/images/campus.jpg" alt="" aria-hidden="true" fetchpriority="high"><img class="hero-image" src="./public/images/campus.jpg" alt="" aria-hidden="true" loading="lazy"><span class="hero-concept">${text('heroCaption')}</span></div><button type="button" class="hero-motion-toggle" aria-pressed="false">${text('heroMotionPause')}</button>
</section>
<section class="metrics container" aria-label="Development solutions">${['home','building','grid','layers'].map((i,n)=>`<div class="metric"><span class="metric-icon">${icon(i)}</span><strong>${text('capability'+(n+1))}</strong><p>${text('capability'+(n+1)+'Text')}</p></div>`).join('')}</section>
<section class="applications section container" id="applications"><div class="section-intro"><div><p class="eyebrow">${text('appLabel')}</p><h2>${text('appTitle')}<em>${text('appAccent')}</em></h2></div><p class="application-intro">${text('appText')}</p></div><div class="application-grid">${['residential/fad-r-36-render.webp','school-concept.jpg','workers-concept.jpg','hospital-concept.jpg'].map((img,n)=>`<article class="application-card"><div class="application-image"><img src="./public/images/${img}" alt="${t('app'+(n+1))} — ${t('concept')}" data-app-alt="${n+1}" loading="lazy"><span>0${n+1}</span></div><div class="application-content"><p class="eyebrow">${text('app'+(n+1)+'Tag')}</p><h3>${text('app'+(n+1))}</h3><p>${text('app'+(n+1)+'Text')}</p><a class="text-link" href="#contact" data-project="${['sectorDev','sectorEdu','sectorCorp','sectorHealth'][n]}">${text('appCta')}${icon('diagonal')}</a><a class="application-explore" href="#${['solution','school','workers','hospital'][n]}">${text('app'+(n+1)+'Jump')}${arrow}</a></div></article>`).join('')}</div><p class="fine-print">${text('appNote')}</p></section>
<section class="offerings section container"><div class="section-intro"><div><p class="eyebrow">${text('offerLabel')}</p><h2>${text('offerTitle')}<em>${text('offerAccent')}</em></h2></div><p class="section-description">${text('offerText')}</p></div><div class="offer-grid">${[1,2,3].map(n=>`<article><span>0${n}</span><h3>${text('offer'+n)}</h3><p>${text('offer'+n+'Text')}</p></article>`).join('')}</div></section>
<section class="brand-film section container" id="fad-motion"><div><p class="eyebrow">${text('filmLabel')}</p><h2>${text('filmTitle')}</h2><p>${text('filmText')}</p></div><div class="motion-player"><div class="motion-viewport"><canvas hidden role="img" aria-label="${t('filmTitle')}" data-aria="filmTitle"></canvas><video controls playsinline preload="none" poster="./public/video/fad-opening-poster.jpg" aria-label="${t('filmTitle')}" data-aria="filmTitle"><source src="./public/video/fad-opening.mp4" type="video/mp4"></video><div class="motion-caption"><span class="motion-status">${t('motionLoading')}</span><strong class="motion-phase">${t('motionHome')}</strong></div></div><div class="motion-stages">${['motionHome','motionRepeat','motionCommunity','motionFacilities'].map((key,n)=>`<button type="button" data-motion-stage="${n}" aria-pressed="${n===0}" disabled>${text(key)}</button>`).join('')}</div><div class="motion-controls"><button class="motion-play" type="button">${t('motionPlay')}</button><button class="motion-replay" type="button">${text('motionReplay')}</button><button class="motion-left" type="button" data-aria="motionLeft" aria-label="${t('motionLeft')}">←</button><button class="motion-right" type="button" data-aria="motionRight" aria-label="${t('motionRight')}">→</button><label class="motion-timeline">${text('motionProgress')}<input type="range" min="0" max="100" value="0" disabled></label></div><p class="fine-print">${text('motionNote')}</p></div></section>
<section class="intro section container"><div class="section-intro"><div><p class="eyebrow">${text('introLabel')}</p><h2>${text('introTitle')}<em>${text('introAccent')}</em></h2></div><div class="intro-description"><p>${text('introText')}</p><a class="text-link" href="#government">${text('introLink')}${arrow}</a></div></div><div class="benefits">${['speed','layers','grid'].map((i,n)=>`<article class="benefit"><div class="benefit-top"><span class="benefit-icon">${icon(i)}</span><span class="number">0${n+1}</span></div><h3>${text('benefit'+(n+1))}</h3><p>${text('benefit'+(n+1)+'Text')}</p></article>`).join('')}</div></section>
<section class="government government-programme" id="government"><div class="container"><div class="gov-heading"><p class="eyebrow">${text('governmentLabel')}</p><h2>${text('governmentTitle')}<em>${text('governmentAccent')}</em></h2><p>${text('governmentText')}</p></div><div class="gov-grid"><div class="gov-programme-copy"><p class="eyebrow">${text('govIntro')}</p><div class="gov-use-cases">${[['home','govHousing'],['building','govEducation'],['grid','govAccommodation'],['hospital','govHealthcare']].map(([i,key])=>`<button type="button" data-government-use="${key}">${icon(i)}<span>${text(key)}</span>${icon('diagonal')}</button>`).join('')}</div><div class="gov-process"><h3>${text('govPathTitle')}</h3><p>${text('govPathText')}</p><ol>${[1,2,3,4].map(n=>`<li><span class="gov-step-number">0${n}</span><div><h4>${text('govStep'+n)}</h4><p>${text('govStep'+n+'Text')}</p></div></li>`).join('')}</ol></div><aside class="gov-documents"><h3>${text('govDocumentsTitle')}</h3><p>${text('govDocumentsText')}</p></aside><a href="#government-enquiry" class="button government-cta" data-project="sectorGov">${text('governmentCta')}${icon('diagonal')}</a><p class="gov-review-note">${text('govReviewNote')}</p></div><form id="government-enquiry" class="lead-form government-form"><h3>${text('govFormTitle')}</h3><p class="form-subtitle">${text('govFormText')}</p><fieldset class="gov-fieldset"><legend><span>01</span>${text('govContactGroup')}</legend><div class="form-grid">${field('govName','text',null,'autocomplete="name" maxlength="100"')}${field('govAgency','text','govAgencyPlaceholder','autocomplete="organization" maxlength="150"')}${field('govEmail','email',null,'autocomplete="email" maxlength="150"')}${field('govPhone','tel',null,'autocomplete="tel" maxlength="30" minlength="7" placeholder="+62 …"')}</div></fieldset><fieldset class="gov-fieldset"><legend><span>02</span>${text('govProgrammeGroup')}</legend><div class="form-grid">${field('govLocation','text','govLocationPlaceholder','maxlength="150"')}${select('govProgramme',['govHousing','govEducation','govAccommodation','govHealthcare','govOther'])}${field('govScale','text','govScalePlaceholder','maxlength="150"')}${select('govStage',['govPlanning','govScope','govTender','govActive'])}${select('govTimeline',['timeline1','timeline2','timeline3','timeline4','timeline5'])}<label class="field">${text('govLand')} <span class="optional">(${text('optional')})</span><select name="govLand"><option value="" data-i18n="select">${t('select')}</option>${['govSiteReady','govSiteReview','govSitePending'].map(k=>`<option value="${k}" data-i18n="${k}">${t(k)}</option>`).join('')}</select></label><label class="field">${text('govYear')} <span class="optional">(${text('optional')})</span><input type="number" name="govYear" min="${new Date().getFullYear()}" max="2100" step="1" placeholder="${new Date().getFullYear()+1}"></label><label class="field">${text('govFunding')} <span class="optional">(${text('optional')})</span><input type="text" name="govFunding" maxlength="150" placeholder="${t('govFundingPlaceholder')}" data-placeholder="govFundingPlaceholder"></label></div></fieldset><fieldset class="gov-fieldset"><legend><span>03</span>${text('govSpecGroup')}</legend><p class="gov-spec-hint">${text('govSpecHint')}</p><div class="form-grid">${['govCapacity','govArea'].map(k=>`<label class="field">${text(k)} <span class="optional">(${text('optional')})</span><input type="text" name="${k}" maxlength="200" placeholder="${t(k+'Placeholder')}" data-placeholder="${k+'Placeholder'}"></label>`).join('')}${['govUtilities','govRequirements'].map(k=>`<label class="field field-full">${text(k)} <span class="optional">(${text('optional')})</span><textarea name="${k}" maxlength="600" rows="2" placeholder="${t(k+'Placeholder')}" data-placeholder="${k+'Placeholder'}"></textarea></label>`).join('')}<label class="field field-full">${text('govNote')} <span class="optional">(${text('optional')})</span><textarea name="govNote" maxlength="1500" rows="3" placeholder="${t('govNotePlaceholder')}" data-placeholder="govNotePlaceholder"></textarea></label></div></fieldset><label class="consent"><input type="checkbox" name="govConsent" required><span>${text('govConsent')}</span></label><button type="submit" class="button government-submit">${text('govSubmit')}${arrow}</button><p class="form-note">${icon('whatsapp')}${text('formNote')}</p></form></div></div></section>
<section class="journey section container" id="process"><div class="section-intro"><div><p class="eyebrow">${text('journeyLabel')}</p><h2>${text('journeyTitle')}<em>${text('journeyAccent')}</em></h2></div><p class="section-description">${text('journeyDescription')}</p></div><div class="journey-grid">${[1,2,3,4].map(n=>`<article><span class="journey-number">0${n}</span><h3>${text('journey'+n)}</h3><p>${text('journey'+n+'Text')}</p></article>`).join('')}</div><a href="#contact" class="button">${text('journeyCta')}${icon('diagonal')}</a></section>
<section class="solution section" id="solution"><div class="container"><div class="section-heading centered"><p class="eyebrow">${text('solutionLabel')}</p><h2>${text('solutionTitle')} <em>${text('solutionAccent')}</em></h2><p>${text('solutionText')}</p></div><div class="residential-options" role="group" aria-label="${t('rOptions')}" data-aria="rOptions">${[18,36,72].map(size=>`<button class="residential-option" type="button" data-residential="${size}" aria-pressed="${size===36}"><img src="./public/images/residential/fad-r-${size}-render.webp" alt="" loading="lazy"><span class="residential-option-top"><strong>FAD R ${size}</strong><span>${size} m²</span></span><span class="residential-option-name">${text('r'+size+'Name')}</span><span class="residential-option-copy">${text('r'+size+'Text')}</span></button>`).join('')}</div><div class="product"><div class="product-gallery">
 <div class="product-view-nav"><span class="eyebrow residential-code">FAD R / 36</span><div class="view-tabs" role="tablist" aria-label="FAD R design views">${[['exterior','homeExterior'],['shell','mockShell'],['interior','mockInterior'],['variations','mockVariations'],['plan','homePlan'],['specification','homeSpec']].map(([view,key])=>`<button id="tab-${view}" role="tab" data-view="${view}" aria-controls="view-${view}" aria-selected="${view==='exterior'}" tabindex="${view==='exterior'?0:-1}">${text(key)}</button>`).join('')}</div></div>
 <div id="view-exterior" role="tabpanel" aria-labelledby="tab-exterior" class="product-view product-image-wrap"><img id="product-image" src="./public/images/residential/fad-r-36-render.webp" alt="${t('imageAlt')} — ${t('olive')}" loading="lazy"><span class="product-tag">${text('type')}</span><span class="product-caption">${text('homeVisualNote')}</span></div>
 ${['shell','interior','variations'].map(mode=>`<div id="view-${mode}" role="tabpanel" aria-labelledby="tab-${mode}" class="product-view mockup-view" hidden><img src="./public/images/residential/fad-r-36-${mode}.webp" alt="FAD R 36 — ${t('mock'+mode+'Alt')}" data-mockup-home="${mode}" loading="lazy"><div class="mockup-view-caption"><strong>${text('mock'+mode+'Title')}</strong><p>${text('mock'+mode+'Text')}</p></div></div>`).join('')}
 <div id="view-plan" role="tabpanel" aria-labelledby="tab-plan" class="product-view plan-view" hidden></div>
 <div id="view-specification" role="tabpanel" aria-labelledby="tab-specification" class="product-view specification-view" hidden><p class="eyebrow">${text('specEyebrow')}</p><h3>${text('specTitle')}</h3><p>${text('specDescription')}</p><table class="spec-table"><thead><tr><th scope="col">${text('specItem')}</th><th scope="col">${text('specValue')}</th></tr></thead><tbody>${[1,2,3,4,5,6].map(n=>`<tr><th scope="row">${text('spec'+n)}</th><td>${text('spec'+n+'Value')}</td></tr>`).join('')}</tbody></table></div>
 <div class="product-colors" id="finish-controls"><div class="finish-heading"><span class="eyebrow">${text('colorLabel')}</span><span id="finish-name">${t(finish)}</span></div><div class="swatches" role="group" aria-label="Exterior finish">${['olive','brown','yellow','purple'].map(color=>`<button class="swatch ${color===finish?'selected':''}" data-finish="${color}" aria-pressed="${color===finish}" aria-label="${t(color)}"><span class="swatch-check">${color===finish?icon('check'):''}</span><img src="./public/images/home-${color}.jpg" alt="" loading="lazy"><strong>${text(color)}</strong></button>`).join('')}</div><span class="finish-note">${text('finishNote')}</span></div>
 </div><div class="product-info"><div class="product-name"><p class="eyebrow">${text('homeOverview')}</p><h3>FAD <span>R</span><small class="residential-current">36</small></h3><span class="product-stamp">${icon('home')}</span></div><div class="product-specs"><div><strong data-residential-area>36 m²</strong><span>${text('area')}</span></div><div><strong data-residential-layout data-i18n="r36Layout">02</strong><span>${text('rooms')}</span></div><div><strong data-residential-footprint>6 × 6 m</strong><span>${text('rFootprint')}</span></div></div><div class="price"><p class="eyebrow">${text('priceLabel')}</p><p>${text('priceNote')}</p></div><a class="button residential-enquiry" href="#contact" data-project="sectorDev">${text('specLink')}${icon('diagonal')}</a></div></div></div></section>
${sectorPresentation('workers','W','sectorCorp')}${sectorPresentation('school','E','sectorEdu')}${sectorPresentation('hospital','H','sectorHealth')}
<section class="scope container" aria-label="Commercial scope"><div><span class="scope-icon">${icon('check')}</span><div><h3>${text('scopeIncluded')}</h3><p>${text('scopeIncludedText')}</p></div></div><div><span class="scope-icon">${icon('arrow')}</span><div><h3>${text('scopeDeveloper')}</h3><p>${text('scopeDeveloperText')}</p></div></div></section>

<section class="faq section container"><div><p class="eyebrow">${text('faqLabel')}</p><h2>${text('faqTitle')}</h2></div><div class="faq-items">${[1,2,3,4].map(n=>`<details><summary>${text('faq'+n)}${icon('plus')}</summary><p>${text('faq'+n+'Text')}</p></details>`).join('')}</div></section>
<section class="contact section" id="contact"><div class="container contact-grid"><div class="contact-copy"><p class="eyebrow">${text('contactLabel')}</p><h2>${text('contactTitle')}<em>${text('contactAccent')}</em></h2><p>${text('contactText')}</p><figure class="contact-illustration"><div class="campus-caption"><span class="eyebrow">${text('contactIllustrationLabel')}</span><span class="campus-live" aria-hidden="true"></span></div><svg viewBox="0 0 540 350" fill="none" aria-hidden="true"><defs><pattern id="campus-grid" width="36" height="20" patternUnits="userSpaceOnUse"><path d="M0 20 36 0M0 0l36 20" stroke="#a1e5cf" stroke-opacity=".08"/></pattern></defs><rect width="540" height="350" fill="url(#campus-grid)"/><ellipse cx="270" cy="201" rx="225" ry="128" stroke="#a1e5cf" stroke-opacity=".2"/><path d="m58 209 209-120 218 125-209 122Z" fill="#284c40" stroke="#648c78"/><path class="campus-route" d="m78 227 198-113 186 107M174 280l195-114" stroke="#a1e5cf" stroke-width="10" stroke-linejoin="round"/><path d="m78 227 198-113 186 107M174 280l195-114" stroke="#193a32" stroke-width="2" stroke-dasharray="5 8"/><g transform="translate(170 139)"><g class="campus-building" style="--phase:0.0s"><path d="M-35 0 0-20 35 0v38L0 58-35 38Z" fill="#d7e8dc"/><path d="M0 18 35 0v38L0 58Z" fill="#95beac"/><path d="m-40 0 40-25 40 25-40 23Z" fill="#398780"/><path d="M-23 16v16l13 8V24Z" fill="#193a32"/><path d="M10 21v17l14-8V13Z" fill="#193a32"/></g></g><g transform="translate(265 86)"><g class="campus-building" style="--phase:0.45s"><path d="M-35 0 0-20 35 0v38L0 58-35 38Z" fill="#d7e8dc"/><path d="M0 18 35 0v38L0 58Z" fill="#95beac"/><path d="m-40 0 40-25 40 25-40 23Z" fill="#398780"/><path d="M-23 16v16l13 8V24Z" fill="#193a32"/><path d="M10 21v17l14-8V13Z" fill="#193a32"/></g></g><g transform="translate(361 140)"><g class="campus-building" style="--phase:0.9s"><path d="M-35 0 0-20 35 0v38L0 58-35 38Z" fill="#d7e8dc"/><path d="M0 18 35 0v38L0 58Z" fill="#95beac"/><path d="m-40 0 40-25 40 25-40 23Z" fill="#398780"/><path d="M-23 16v16l13 8V24Z" fill="#193a32"/><path d="M10 21v17l14-8V13Z" fill="#193a32"/></g></g><g transform="translate(123 202)"><g class="campus-building" style="--phase:1.35s"><path d="M-35 0 0-20 35 0v38L0 58-35 38Z" fill="#d7e8dc"/><path d="M0 18 35 0v38L0 58Z" fill="#95beac"/><path d="m-40 0 40-25 40 25-40 23Z" fill="#398780"/><path d="M-23 16v16l13 8V24Z" fill="#193a32"/><path d="M10 21v17l14-8V13Z" fill="#193a32"/></g></g><g transform="translate(224 206)"><g class="campus-building" style="--phase:1.8s"><path d="M-35 0 0-20 35 0v38L0 58-35 38Z" fill="#d7e8dc"/><path d="M0 18 35 0v38L0 58Z" fill="#95beac"/><path d="m-40 0 40-25 40 25-40 23Z" fill="#398780"/><path d="M-23 16v16l13 8V24Z" fill="#193a32"/><path d="M10 21v17l14-8V13Z" fill="#193a32"/></g></g><g transform="translate(323 254)"><g class="campus-building" style="--phase:2.25s"><path d="M-35 0 0-20 35 0v38L0 58-35 38Z" fill="#d7e8dc"/><path d="M0 18 35 0v38L0 58Z" fill="#95beac"/><path d="m-40 0 40-25 40 25-40 23Z" fill="#398780"/><path d="M-23 16v16l13 8V24Z" fill="#193a32"/><path d="M10 21v17l14-8V13Z" fill="#193a32"/></g></g><g transform="translate(414 215)"><g class="campus-building campus-facility" style="--phase:2.7s"><path d="m-52-8 47-27 63 36-47 27Z" fill="#a1e5cf"/><path d="M-52-8 11 28v42l-63-36Z" fill="#e6ede3"/><path d="m11 28 47-27v42L11 70Z" fill="#95beac"/><path d="M-41 9 0 33v13l-41-24Z" fill="#398780"/><path d="m23 28 23-13v14L23 42Z" fill="#193a32"/><path d="M-23 43v-15l12 7v15" stroke="#398780" stroke-width="3"/></g></g><g class="campus-trees" fill="#a1e5cf"><circle cx="71" cy="192" r="10"/><circle cx="192" cy="295" r="10"/><circle cx="388" cy="113" r="10"/><circle cx="459" cy="261" r="10"/></g><circle class="campus-flow" cx="276" cy="114" r="5" fill="#fff"/></svg><figcaption>${text('contactIllustrationCaption')}</figcaption><button class="campus-toggle" type="button" aria-pressed="false">${text('animationPause')}</button></figure><div class="direct-contact"><p>${text('contactDirect')}</p><a href="https://wa.me/6287786010290" target="_blank" rel="noopener noreferrer">${icon('whatsapp')}${text('contactWhatsApp')}${icon('diagonal')}</a><span>+62 877 8601 0290</span></div></div><form id="lead-form" class="lead-form"><h3>${text('formTitle')}</h3><p class="form-subtitle">${text('formSubtitle')}</p>${projectSelectionMarkup({t,text})}<div class="form-grid"><p class="field-full form-section-title">${text('singleContact')}</p>${field('name','text','namePlaceholder','autocomplete="name" maxlength="100"')}${field('org','text','orgPlaceholder','autocomplete="organization" maxlength="150"')}${field('email','email',null,'autocomplete="email" maxlength="150" placeholder="you@organisation.com"')}${field('phone','tel',null,'autocomplete="tel" maxlength="30" minlength="7" placeholder="+62 …"')}<p class="field-full form-section-title">${text('singleProject')}</p>${field('location','text','locationPlaceholder','maxlength="150"')}${select('sector',['sectorGov','sectorDev','sectorEdu','sectorCorp','sectorHealth','sectorOther'])}${field('units','number',null,'min="1" max="100000" step="1" placeholder="100"')}${select('timeline',['timeline1','timeline2','timeline3','timeline4','timeline5'])}<div class="field-full enquiry-area" aria-live="polite" hidden></div><label class="field field-full">${text('message')} <span class="optional">(${text('optional')})</span><textarea name="message" rows="3" maxlength="1500" data-placeholder="messagePlaceholder" placeholder="${t('messagePlaceholder')}"></textarea></label></div><label class="consent"><input type="checkbox" name="consent" required><span>${text('consent')}</span></label><button type="submit" class="button form-submit">${text('submit')}${arrow}</button><p class="form-note">${icon('whatsapp')}${text('formNote')}</p></form></div></section>
</main>
<footer class="footer"><div class="container"><div class="footer-top"><div><a href="#" class="brand">${logo}<span class="brand-name"><img class="fad-wordmark" src="./public/brand/fad-wordmark-reverse.svg" alt="FAD"><span class="brand-sub">${text('brandSub')}</span></span></a><p class="footer-statement">${text('footerText')}</p><p class="footer-about">${text('footerAbout')}</p></div><div class="footer-column"><p class="eyebrow">${text('footerLinks')}</p><a href="#applications">${text('navSolution')}</a><a href="#government">${text('navTech')}</a><a href="#applications">${text('navProjects')}</a></div><div class="footer-column"><p class="eyebrow">${text('footerContact')}</p><a href="#contact">${text('navContact')}${icon('diagonal')}</a><button class="privacy-trigger">${text('footerPrivacy')}</button></div><div class="footer-group">${groupLogo}<p>${text('group')}</p></div></div><div class="footer-bottom"><span data-copyright></span><span>${text('footerMission')}${icon('globe')}</span></div></div></footer>
<dialog id="review-dialog"><div class="dialog-top"><span class="dialog-emblem">${icon('check')}</span><button class="icon-button dialog-close" data-aria="close" aria-label="${t('close')}">${icon('close')}</button></div><h2>${text('reviewTitle')}</h2><p>${text('reviewText')}</p><pre id="project-brief"></pre><a id="send-whatsapp" class="button" target="_blank" rel="noopener noreferrer">${icon('whatsapp')}${text('reviewSend')}${icon('diagonal')}</a><p class="fine-print">${text('reviewNote')}</p><div class="dialog-secondary"><button id="copy-brief">${text('reviewCopy')}</button><button class="dialog-close">${text('reviewEdit')}</button></div><span id="copy-status" role="status"></span></dialog>
<dialog id="privacy-dialog"><div class="dialog-top"><span class="dialog-emblem">${icon('home')}</span><button class="icon-button dialog-close" data-aria="close" aria-label="${t('close')}">${icon('close')}</button></div><h2>${text('privacyTitle')}</h2><p>${text('privacyText')}</p><button class="button dialog-close">${text('privacyClose')}${icon('check')}</button></dialog>
`;

function updateLanguage() {
 document.documentElement.lang = lang;
 document.title = lang === 'en' ? 'Fjäll Affordable Development — Modular development at scale' : 'Fjäll Affordable Development — Pengembangan modular skala besar';
 document.querySelector('meta[name="description"]').content = lang === 'en' ? 'Repeatable building solutions by Fjäll Group for housing, education, and accommodation projects across Indonesia.' : 'Solusi bangunan yang dapat direplikasi dari Fjäll Group untuk proyek perumahan, pendidikan, dan akomodasi di seluruh Indonesia.';
 document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
 document.querySelectorAll('[data-placeholder]').forEach(el => el.placeholder = t(el.dataset.placeholder));
 document.querySelectorAll('[data-alt]').forEach(el => el.alt = t(el.dataset.alt));
 document.querySelectorAll('[data-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.aria)));
 document.querySelectorAll('[data-mockup-sector]').forEach(el=>el.alt=t(el.dataset.mockupSector+'Title')+' — '+t('mock'+el.dataset.mockupMode+'Alt'));
 document.querySelectorAll('[data-sector-alt]').forEach(el => el.alt = t(el.dataset.sectorAlt+'CoverAlt'));
 document.querySelectorAll('[data-app-alt]').forEach(el => el.alt = t(['r36CoverAlt','schoolCoverAlt','workersCoverAlt','hospitalCoverAlt'][Number(el.dataset.appAlt)-1]));
 document.querySelectorAll('[data-lang]').forEach(el => el.setAttribute('aria-pressed', el.dataset.lang === lang));
 document.querySelector('[data-copyright]').textContent = t('footerCopyright').replace('{year}', new Date().getFullYear());
 document.querySelector('.desktop-nav').setAttribute('aria-label', lang === 'en' ? 'Main navigation' : 'Navigasi utama');
 document.querySelector('.swatches').setAttribute('aria-label', lang === 'en' ? 'Exterior finish' : 'Warna eksterior');
 updateFinish(); validatePhone();
 document.dispatchEvent(new Event('fad-language-change'));
}
function updateFinish() {
 document.querySelector('#product-image').src = housingSize === 36 && housingFinishChosen ? `./public/images/home-${finish}.jpg` : `./public/images/residential/fad-r-${housingSize}-render.webp`;
 document.querySelector('#product-image').alt = housingSize === 36 && housingFinishChosen ? `${t('imageAlt')} — ${t(finish)}` : t('r'+housingSize+'CoverAlt');
 document.querySelector('#finish-name').textContent = t(finish);
 document.querySelectorAll('[data-finish]').forEach(el => {
  const selected = el.dataset.finish === finish;
  el.classList.toggle('selected', selected); el.setAttribute('aria-pressed', selected); el.setAttribute('aria-label', t(el.dataset.finish));
  el.firstElementChild.innerHTML = selected ? icon('check') : '';
 });
}
function closeMenu() { document.querySelector('#mobile-nav').hidden = true; document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false'); }
document.querySelectorAll('[data-lang]').forEach(el => el.addEventListener('click', () => {
 lang = el.dataset.lang; try { localStorage.setItem('fjall-language', lang); } catch {} updateLanguage();
}));
function setView(view) {
 document.querySelectorAll('[data-view]').forEach(tab => { const selected = tab.dataset.view === view; tab.setAttribute('aria-selected', selected); tab.tabIndex = selected ? 0 : -1; });
 document.querySelectorAll('.product-view').forEach(panel => { panel.hidden = panel.id !== 'view-' + view; });
 document.querySelector('#finish-controls').hidden = view !== 'exterior';
}
document.querySelectorAll('[data-view]').forEach(tab => {
 tab.addEventListener('click', () => setView(tab.dataset.view));
 tab.addEventListener('keydown', e => {
  const tabs = [...document.querySelectorAll('[data-view]')]; let next = tabs.indexOf(tab);
  if (e.key === 'ArrowRight') next = (next + 1) % tabs.length;
  else if (e.key === 'ArrowLeft') next = (next + tabs.length - 1) % tabs.length;
  else if (e.key === 'Home') next = 0;
  else if (e.key === 'End') next = tabs.length - 1;
  else return;
  e.preventDefault(); setView(tabs[next].dataset.view); tabs[next].focus();
 });
});
document.querySelectorAll('[data-finish]').forEach(el => el.addEventListener('click', () => { finish = el.dataset.finish; housingFinishChosen = true; updateFinish(); }));
document.querySelector('.menu-toggle').addEventListener('click', () => {
 const nav = document.querySelector('#mobile-nav'); nav.hidden = !nav.hidden; document.querySelector('.menu-toggle').setAttribute('aria-expanded', String(!nav.hidden));
});
document.querySelectorAll('#mobile-nav a').forEach(el => el.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
document.querySelectorAll('[data-project]').forEach(el => el.addEventListener('click', () => { const sector=document.querySelector('[name=sector]');if(!sector.value||el.dataset.project==='sectorGov')sector.value=el.dataset.project; }));

function openDialog(id) { lastFocus = document.activeElement; document.querySelector(id).showModal(); document.body.classList.add('dialog-open'); }
document.querySelectorAll('.dialog-close').forEach(el => el.addEventListener('click', () => el.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(el => {
 el.addEventListener('close', () => { document.body.classList.remove('dialog-open'); lastFocus?.focus(); });
 el.addEventListener('click', e => { if (e.target === el) { const r = el.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) el.close(); } });
});
document.querySelector('.privacy-trigger').addEventListener('click', () => openDialog('#privacy-dialog'));
function validatePhone() {
 const phone = document.querySelector('[name=phone]');
 phone.setCustomValidity(phone.value && (!/^[+0-9() .-]+$/.test(phone.value) || phone.value.replace(/\D/g, '').length < 7) ? (lang === 'en' ? 'Please enter a phone number with at least 7 digits.' : 'Masukkan nomor telepon dengan minimal 7 digit.') : '');
}
document.querySelector('[name=phone]').addEventListener('input', validatePhone);
document.querySelector('#lead-form').addEventListener('submit', e => {
 e.preventDefault();
 const form = e.currentTarget;
 for (const input of form.querySelectorAll('input[type="text"]')) { input.value = input.value.trim(); }
 if (!form.reportValidity()) return;
 validatePhone();
 if (!form.reportValidity()) return;
 const data = new FormData(form);
 const keys = ['name','org','email','phone','location','sector','fadType','units','timeline','message'];
 brief = t('briefHeading') + '\n\n' + keys.filter(k => String(data.get(k) || '').trim()).map(k => `${t(k)}: ${k==='sector' || k==='timeline' ? t(data.get(k)) : data.get(k)}`).join('\n') + '\n\n' + t('preferredLang');
 document.querySelector('#project-brief').textContent = brief;
 document.querySelector('#send-whatsapp').href = 'https://wa.me/6287786010290?text=' + encodeURIComponent(brief);
 document.querySelector('#copy-status').textContent = '';
 openDialog('#review-dialog');
});
document.querySelector('#copy-brief').addEventListener('click', async () => {
 try { await navigator.clipboard.writeText(brief); document.querySelector('#copy-status').textContent = t('copied'); }
 catch { document.querySelector('#copy-status').textContent = t('copyError'); }
});
mountResidential({t,text,onChange:size=>{housingSize=size;housingFinishChosen=false;updateFinish();}});
updateLanguage();
mountWebGLIcons();
mountFadMotion(document.querySelector('.motion-player'),t);
// Each application presentation owns its tab state and keyboard navigation.
document.querySelectorAll('.development-detail').forEach(section=>{
 const tabs=[...section.querySelectorAll('[data-sector-tab]')];
 const activate=tab=>{tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',active);t.tabIndex=active?0:-1;});section.querySelectorAll('.sector-view').forEach(panel=>panel.hidden=panel.id!==tab.getAttribute('aria-controls'));};
 tabs.forEach(tab=>{tab.addEventListener('click',()=>activate(tab));tab.addEventListener('keydown',e=>{let n=tabs.indexOf(tab);if(e.key==='ArrowRight')n=(n+1)%tabs.length;else if(e.key==='ArrowLeft')n=(n+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();activate(tabs[n]);tabs[n].focus();});});
});

// Full-screen imagery replays on every load. Accessibility and playback failures bypass it.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && !navigator.connection?.saveData) {
 const portrait = matchMedia('(max-width: 760px)').matches;
 const stem = portrait ? 'fad-opening-portrait' : 'fad-opening';
 const intro = document.createElement('div');
 intro.className = 'video-intro'; intro.setAttribute('role','dialog'); intro.setAttribute('aria-modal','true'); intro.setAttribute('aria-label', 'FAD introduction');
 intro.innerHTML = `<video muted playsinline preload="auto" poster="./public/video/${stem}-poster.jpg" aria-hidden="true"><source src="./public/video/${stem}.mp4" type="video/mp4"></video><div class="intro-shade"></div><div class="intro-brand">${logo}<strong><img class="fad-wordmark" src="./public/brand/fad-wordmark-reverse.svg" alt="FAD"></strong><p>${t('brandSub')}</p></div><div class="intro-group"><span>${t('preloaderBy')}</span>${groupLogo}</div><div class="intro-endmark" aria-hidden="true"><img src="./public/brand/fad-wordmark-reverse.svg" alt=""><span>${t('brandSub')}</span></div><div class="intro-story"><p class="eyebrow">${t('preloaderLabel')}</p><h2>${t('preloaderTitle')}</h2><p>${t('preloaderText')}</p><span>${t('preloaderNote')}</span></div><button class="intro-skip">${t('preloaderSkip')}${icon('arrow')}</button><span class="intro-chapter" aria-hidden="true">01 / 03</span><div class="intro-progress" role="progressbar" aria-label="${t('preloaderLabel')}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>`;
 document.body.append(intro); app.inert = true; document.body.classList.add('intro-open');
 const video = intro.querySelector('video'); const skip = intro.querySelector('button');
 const chapterTitle = intro.querySelector('.intro-story h2');
 const progress = intro.querySelector('.intro-progress');
 const chapterNumber = intro.querySelector('.intro-chapter');
 const chapters = ['preloaderTitle', 'preloaderCommunity', 'preloaderScale'];
 let chapter = 0;
 video.addEventListener('timeupdate', () => {
  const next = Math.min(2, Math.floor(video.currentTime / 6));
  const percent = Math.min(100, video.currentTime / (video.duration || 18) * 100);
  progress.style.transform = `scaleX(${percent / 100})`;
  progress.setAttribute('aria-valuenow', String(Math.round(percent)));
  intro.classList.toggle('is-finale', video.currentTime >= 15.5);
  if (next !== chapter) {
   chapter = next; chapterTitle.textContent = t(chapters[next]);
   chapterNumber.textContent = `0${next + 1} / 03`;
   chapterTitle.animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:1000,easing:'cubic-bezier(.2,.7,.2,1)'});
  }
 });
 let closed = false;
 const dismiss = () => { if (closed) return; closed = true; clearTimeout(timer); video.pause(); intro.classList.add('is-leaving'); document.removeEventListener('keydown', onKey); setTimeout(() => { intro.remove(); app.inert = false; document.body.classList.remove('intro-open'); document.querySelector('.brand').focus({preventScroll:true}); }, 600); };
 const onKey = e => { if (e.key === 'Escape') dismiss(); if (e.key === 'Tab') { e.preventDefault(); skip.focus(); } };
 const timer = setTimeout(dismiss, 19000);
 skip.addEventListener('click', dismiss); document.addEventListener('keydown',onKey); video.addEventListener('ended',dismiss); video.addEventListener('error',dismiss); video.querySelector('source').addEventListener('error',dismiss);
 video.play().catch(dismiss); skip.focus({preventScroll:true});
}

document.querySelectorAll('[data-government-use]').forEach(button=>button.addEventListener('click',()=>{document.querySelector('[name=govProgramme]').value=button.dataset.governmentUse;document.querySelector('#government-enquiry').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});document.querySelector('[name=govName]').focus({preventScroll:true});}));
function validateGovernmentPhone(){const phone=document.querySelector('[name=govPhone]');phone.setCustomValidity(phone.value&&(!/^[+0-9() .-]+$/.test(phone.value)||phone.value.replace(/\D/g,'').length<7)?(lang==='en'?'Please enter a phone number with at least 7 digits.':'Masukkan nomor telepon dengan minimal 7 digit.'):'');}
document.querySelector('[name=govPhone]').addEventListener('input',validateGovernmentPhone);
document.querySelector('#government-enquiry').addEventListener('submit',e=>{
 e.preventDefault();const form=e.currentTarget;for(const input of form.querySelectorAll('input[type=text]'))input.value=input.value.trim();validateGovernmentPhone();if(!form.reportValidity())return;
 const data=new FormData(form),keys=['govName','govAgency','govEmail','govPhone','govLocation','govProgramme','govScale','govStage','govTimeline','govLand','govYear','govFunding','govCapacity','govArea','govUtilities','govRequirements','govNote'],translated=['govProgramme','govStage','govTimeline','govLand'];
 brief=t('govBriefHeading')+'\n\n'+keys.filter(k=>String(data.get(k)||'').trim()).map(k=>`${t(k)}: ${translated.includes(k)?t(data.get(k)):data.get(k)}`).join('\n')+'\n\n'+t('preferredLang');
 document.querySelector('#project-brief').textContent=brief;document.querySelector('#send-whatsapp').href='https://wa.me/6287786010290?text='+encodeURIComponent(brief);document.querySelector('#copy-status').textContent='';openDialog('#review-dialog');
});

// The campus is decorative; explicit pause and reduced motion keep it comfortable.
const campus = document.querySelector('.contact-illustration');
const campusToggle = campus.querySelector('.campus-toggle');
let campusPaused = matchMedia('(prefers-reduced-motion: reduce)').matches;
function setCampusMotion() {
 campus.classList.toggle('is-paused', campusPaused);
 campusToggle.setAttribute('aria-pressed', String(campusPaused));
 const label = campusToggle.querySelector('[data-i18n]');
 label.dataset.i18n = campusPaused ? 'animationPlay' : 'animationPause';
 label.textContent = t(label.dataset.i18n);
}
campusToggle.addEventListener('click', () => { campusPaused = !campusPaused; setCampusMotion(); });
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => { campusPaused = e.matches; setCampusMotion(); });
new IntersectionObserver(entries => { campus.classList.toggle('is-offscreen', !entries[0].isIntersecting); }).observe(campus);
setCampusMotion();

mountHeroMotion(t);

mountProjectSelection(t);
