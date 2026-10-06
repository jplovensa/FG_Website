const intro = document.querySelector('#intro');
const introVideo = document.querySelector('#intro-video');
const heroVideo = document.querySelector('#hero-video');
const videoToggle = document.querySelector('#video-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const saveData = navigator.connection?.saveData === true;
let introClosed = false;
let introTimer;
let heroWanted = !reducedMotion.matches && !saveData;
let heroVisible = true;

function updateVideoButton() {
  const playing = !heroVideo.paused;
  videoToggle.innerHTML = playing ? 'Pause film <span aria-hidden="true">Ⅱ</span>' : 'Play film <span aria-hidden="true">▷</span>';
  videoToggle.setAttribute('aria-label', playing ? 'Pause background video' : 'Play background video');
}

function startHero() {
  if (!heroVideo.hasAttribute('src')) heroVideo.src = '/assets/hero.mp4';
  return heroVideo.play().catch(() => { heroWanted = false; updateVideoButton(); });
}

function syncHero() {
  if (introClosed && heroWanted && heroVisible && !document.hidden) startHero();
  else heroVideo.pause();
}

function closeIntro() {
  if (introClosed) return;
  introClosed = true;
  clearTimeout(introTimer);
  introVideo.pause();
  const hadFocus = intro.contains(document.activeElement);
  document.querySelector('main').inert = false;
  document.querySelector('header').inert = false;
  document.querySelector('footer').inert = false;
  document.body.classList.remove('intro-active');
  intro.classList.add('is-closing');
  if (hadFocus) document.querySelector('.brand').focus({ preventScroll: true });
  window.setTimeout(() => { intro.hidden = true; introVideo.removeAttribute('src'); introVideo.load(); }, reducedMotion.matches ? 0 : 420);
  syncHero();
}

// Never persist a "seen" flag: the opening film plays on every page load/refresh.
// Respect reduced motion and data saving; failures never lock visitors out.
if (reducedMotion.matches || saveData) {
  closeIntro();
} else {
  intro.hidden = false;
  document.body.classList.add('intro-active');
  document.querySelector('main').inert = true;
  document.querySelector('header').inert = true;
  document.querySelector('footer').inert = true;
  const skip = document.querySelector('#intro-skip');
  skip.focus({ preventScroll: true });
  skip.addEventListener('click', closeIntro);
  introVideo.addEventListener('ended', closeIntro, { once: true });
  introVideo.addEventListener('error', closeIntro, { once: true });
  introVideo.addEventListener('timeupdate', () => {
    if (Number.isFinite(introVideo.duration)) document.querySelector('#intro-progress').style.width = `${introVideo.currentTime / introVideo.duration * 100}%`;
  });
  intro.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeIntro();
    if (event.key === 'Tab') { event.preventDefault(); skip.focus(); }
  });
  introTimer = window.setTimeout(closeIntro, 8500);
  introVideo.src = '/assets/intro.mp4';
  introVideo.play().catch(closeIntro);
}

videoToggle.addEventListener('click', () => {
  heroWanted = heroVideo.paused;
  syncHero();
});
heroVideo.addEventListener('play', updateVideoButton);
heroVideo.addEventListener('pause', updateVideoButton);
heroVideo.addEventListener('error', () => { heroWanted = false; updateVideoButton(); });
document.addEventListener('visibilitychange', syncHero);
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) { heroWanted = false; closeIntro(); syncHero(); }
});
new IntersectionObserver(entries => {
  heroVisible = entries[0].isIntersecting;
  syncHero();
}, { threshold: 0.05 }).observe(document.querySelector('#home'));

const menuToggle = document.querySelector('#menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
  document.querySelector('#header').classList.remove('menu-open');
}
menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(expanded));
  navigation.classList.toggle('is-open', expanded);
  document.querySelector('#header').classList.toggle('menu-open', expanded);
});
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') { closeMenu(); menuToggle.focus(); }
});
window.matchMedia('(min-width: 701px)').addEventListener('change', closeMenu);

const cards = [...document.querySelectorAll('.project-card')];
const filters = [...document.querySelectorAll('[data-filter]')];
for (const filter of filters) filter.addEventListener('click', () => {
  filters.forEach(button => button.setAttribute('aria-pressed', String(button === filter)));
  let visibleCount = 0;
  cards.forEach(card => {
    card.hidden = filter.dataset.filter !== 'all' && card.dataset.category !== filter.dataset.filter;
    if (!card.hidden) visibleCount++;
  });
  document.querySelector('#project-status').textContent = `Showing ${visibleCount} ${visibleCount === 1 ? 'project' : 'projects'}`;
});

const projects = {
  nuanu: { title: 'Nuanu Creative City', location: 'Bali, Indonesia · Hospitality & culture', description: 'Fjäll’s work at Nuanu explores complex geometries, including a 360-degree IMAX dome and subterranean cave networks. It brings together parametric design and prefabricated construction systems.', materials: 'GX 100 EPS panels · BEMMELS structural reinforcement' },
  ulaman: { title: 'Ulaman Eco Resort', location: 'Bali, Indonesia · Eco hospitality', description: 'Working with Inspiral’s organic architecture, Fjäll’s systems provide an insulated structural backbone beneath sweeping bamboo forms. A meeting of natural materials and modern construction technology.', materials: 'GX 100 panels · Bamboo integration · BEMMELS anchors' },
  lombok: { title: 'Kuta Lombok Estates', location: 'Lombok, Indonesia · Residential', description: 'A development of seven coastal villas designed by architect Yasu Fukuda. The project combines a BEMMELS frame with a GX 100 building envelope to support efficient assembly in a coastal setting.', materials: 'BEMMELS frame · GX 100 building envelope' },
  pods: { title: 'The Drop Pod Network', location: 'Indonesia & Japan · Modular living', description: 'Adaptable modular spaces designed for different settings, from the tropical coasts of Bali and Lombok to Japan’s alpine resorts. Prefabricated envelopes and structural chassis support repeatable deployment.', materials: 'Insulated EPS envelope · BEMMELS structural chassis' }
};
const dialog = document.querySelector('#project-dialog');
for (const card of cards) card.addEventListener('click', () => {
  const project = projects[card.dataset.project];
  document.querySelector('#dialog-title').textContent = project.title;
  document.querySelector('#dialog-location').textContent = project.location;
  document.querySelector('#dialog-description').textContent = project.description;
  document.querySelector('#dialog-materials').textContent = project.materials;
  const image = document.querySelector('#dialog-image');
  image.src = card.querySelector('img').src;
  image.alt = card.querySelector('img').alt;
  dialog.showModal();
  dialog.scrollTop = 0;
});
document.querySelector('#dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
document.querySelector('#dialog-contact').addEventListener('click', () => dialog.close());
document.querySelector('#year').textContent = new Date().getFullYear();
