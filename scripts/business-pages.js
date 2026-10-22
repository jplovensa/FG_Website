import { writeFile } from 'node:fs/promises';

export const businesses = [
  {
    slug: 'greenshift', name: 'GreenShift', category: 'Design & development',
    title: 'A clear vision.\nA connected path.',
    description: 'Architecture, project management and capital coordination, connected from the first idea to turnkey delivery.',
    interest: 'GreenShift design & development',
    intro: 'Start with possibility.\nDesign for the whole build.',
    copy: 'GreenShift is the design and development arm of Fjäll Group. We bring your ambition, the needs of the site and the realities of construction into one coordinated brief. Architecture and building systems develop together, with delivery considered from the start.',
    services: [
      ['Architecture & concept', 'Explore the site, spatial needs and architectural direction. Develop a considered concept around the people who will use it.'],
      ['Project coordination', 'Connect design decisions, engineering interfaces and project management so the building is considered as a whole.'],
      ['Development planning', 'Bring programme, project scope and capital coordination into the conversation early. Define the next steps around the specific brief.'],
    ],
    steps: [['Brief', 'Start with people, place and purpose. Share your site, priorities and first questions.'], ['Design', 'Explore the architectural direction and coordinate the structure, envelope and material systems.'], ['Coordinate', 'Resolve interfaces, approvals, programme and delivery scope with the project team.'], ['Deliver', 'Connect the agreed design with preparation, construction and project-specific delivery planning.']],
    image: 'nuanu.webp', imageAlt: 'Architectural forms at Nuanu Creative City in Bali',
    project: 'nuanu', projectTitle: 'Nuanu Creative City', projectCopy: 'Explore Fjäll’s building-system contribution to complex architectural geometries in Bali.',
    cta: 'What would you like to create?', ctaCopy: 'A place, an ambition or a first question is enough to start a conversation.',
  },
  {
    slug: 'fad', name: 'Fjäll Affordable Development', category: 'Housing & workers’ accommodation',
    title: 'Considered homes.\nConnected communities.',
    description: 'Mass-scale housing and workers’ accommodation through repeatable building systems, considered masterplanning and coordinated delivery.',
    interest: 'FAD housing & workers’ accommodation',
    intro: 'Think beyond the unit.\nPlan for the community.',
    copy: 'FAD brings individual homes into a wider development ambition. We consider unit types, shared routes, infrastructure and community space together, connecting repeatable building systems with the needs of each site and programme.',
    services: [
      ['Mass-scale housing', 'Coordinate repeatable homes, layouts and building systems around the site, programme and needs of future residents.'],
      ['Workers’ accommodation', 'Plan accommodation around everyday living, shared amenities, access and the needs of the workforce.'],
      ['Community masterplanning', 'Consider unit types alongside shared spaces, circulation, infrastructure and phased delivery.'],
    ],
    steps: [['Define', 'Understand the site, residents, scale, infrastructure and programme priorities.'], ['Plan', 'Coordinate unit types, community space, access and the building-system approach.'], ['Prepare', 'Agree dimensions, finishes and interfaces before sequenced component preparation and logistics.'], ['Assemble', 'Coordinate delivery and site assembly around the approved design, phasing and site conditions.']],
    image: 'housing-layout.webp', imageAlt: 'Housing layout study from the supplied Lombok housing programme profile',
    project: 'housing', projectTitle: 'Lombok Housing Initiative', projectCopy: 'A regional-government programme of more than 250 homes brings repeatable systems into a wider community ambition.',
    cta: 'Let’s plan your housing programme.', ctaCopy: 'Share your location, intended scale and who you are building for. We’ll start with the needs of the project.',
  },
];
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lines = text => esc(text).replaceAll('\n', '<br>');

export async function buildBusinessPages(target) {
  const site = (process.env.SITE_URL || 'https://jplovensa.github.io/FG_Website').replace(/\/$/, '');
  for (const b of businesses) {
    const other = businesses.find(item => item !== b);
    const inquiry = `./index.html?${new URLSearchParams({interest: b.interest, source: `business:${b.slug}`})}#contact`;
    const film = `${b.slug === 'fad' ? 'fad' : 'greenshift'}-trailer`;
    await writeFile(`${target}/${b.slug}.html`, `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(b.name)} | Fjäll Group</title><meta name="description" content="${esc(b.description)}"><link rel="canonical" href="${esc(site)}/${b.slug}.html"><meta property="og:type" content="website"><meta property="og:title" content="${esc(b.name)} | Fjäll Group"><meta property="og:description" content="${esc(b.description)}"><meta property="og:url" content="${esc(site)}/${b.slug}.html"><meta property="og:image" content="${esc(site)}/assets/${film}-poster.webp"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="./favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="./business-pages.css"><script type="module" src="./business-page.js"></script></head>
<body><a class="skip-link" href="#main">Skip to content</a>
<header class="site-header"><a class="brand" href="./index.html" aria-label="Fjäll Group home"><img src="./assets/fjall-logo.png" alt="Fjäll Group" width="2048" height="716"></a><nav aria-label="Main navigation"><a href="./greenshift.html"${b.slug === 'greenshift' ? ' aria-current="page"' : ''}>GreenShift</a><a href="./fad.html"${b.slug === 'fad' ? ' aria-current="page"' : ''}>FAD</a><a class="nav-inquiry" href="${esc(inquiry)}">Discuss your project <span aria-hidden="true">↗</span></a></nav></header>
<main id="main"><section class="business-hero" aria-labelledby="page-title"><p class="eyebrow">Fjäll Group / ${esc(b.category)}</p><div class="hero-grid"><h1 id="page-title">${lines(b.title)}</h1><div class="hero-copy"><p class="business-name">${esc(b.name)}</p><p>${esc(b.description)}</p><a class="text-link" href="${esc(inquiry)}">Start a conversation <span aria-hidden="true">↗</span></a></div></div>
<figure class="concept-film"><video controls playsinline preload="none" poster="./assets/${film}-poster.webp" width="1280" height="720" aria-label="${esc(b.name)} architectural concept film"><source src="./assets/${film}.mp4?v=material-light-2" type="video/mp4">Your browser does not support video. <a href="./assets/${film}.mp4">Download the concept film</a>.</video><figcaption><span>${esc(b.name)} / Concept film</span><span>Illustrative CGI · 00:18</span></figcaption></figure></section>
<section class="section intro" aria-labelledby="intro-title"><p class="eyebrow">01 / Our focus</p><div class="two-column"><h2 id="intro-title">${lines(b.intro)}</h2><p class="large-copy">${esc(b.copy)}</p></div><div class="service-grid">${b.services.map(([name,copy], i) => `<article><span class="eyebrow">0${i+1}</span><h3>${esc(name)}</h3><p>${esc(copy)}</p></article>`).join('')}</div></section>
<section class="section process" aria-labelledby="process-title"><p class="eyebrow">02 / A connected approach</p><h2 id="process-title">From the first conversation<br>to the next clear step.</h2><ol class="process-grid">${b.steps.map(([name,copy],i) => `<li><span class="eyebrow">0${i+1}</span><h3>${esc(name)}</h3><p>${esc(copy)}</p></li>`).join('')}</ol><p class="process-note">Scope, specifications, approvals and programme are confirmed for each project.</p></section>
<section class="section project-section" aria-labelledby="project-title"><div class="project-image"><img src="./assets/${b.image}" alt="${esc(b.imageAlt)}" loading="lazy"></div><div><p class="eyebrow">03 / From the Fjäll portfolio</p><h2 id="project-title">${esc(b.projectTitle)}</h2><p>${esc(b.projectCopy)}</p><a class="text-link" href="./projects/${b.project}.html">Explore the project <span aria-hidden="true">↗</span></a><a class="secondary-link" href="./index.html#projects">View the full Fjäll portfolio</a></div></section>
<section class="section inquiry" aria-labelledby="inquiry-title"><p class="eyebrow">Your next project</p><h2 id="inquiry-title">${esc(b.cta)}</h2><p>${esc(b.ctaCopy)}</p><a class="button" href="${esc(inquiry)}">Discuss your ${b.slug === 'fad' ? 'housing programme' : 'design brief'} <span aria-hidden="true">↗</span></a></section>
<a class="other-business" href="./${other.slug}.html"><span class="eyebrow">Also within Fjäll Group</span><span>${esc(other.name)} <span aria-hidden="true">↗</span></span></a></main>
<footer><a href="./index.html">Fjäll Group / Design. Systems. Delivery.</a><a href="./index.html#materials">Explore our materials</a><a href="${esc(inquiry)}">Get in touch <span aria-hidden="true">↗</span></a></footer></body></html>`.replaceAll("↗", '<svg class="arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>'));
  }
}
