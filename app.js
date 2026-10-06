import { initJourney, initWorld } from "./experience.js";

const intro = document.querySelector("#intro");
const introVideo = document.querySelector("#intro-video");
const heroVideo = document.querySelector("#hero-video");
const videoToggle = document.querySelector("#video-toggle");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const saveData = navigator.connection?.saveData === true;
let introClosed = false;
let introTimer;
let heroWanted = !reducedMotion.matches && !saveData;
let heroVisible = true;

function updateVideoButton() {
  const playing = !heroVideo.paused;
  videoToggle.innerHTML = playing
    ? 'Pause film <span aria-hidden="true">II</span>'
    : 'Play film <span aria-hidden="true">▷</span>';
  videoToggle.setAttribute(
    "aria-label",
    playing ? "Pause background video" : "Play background video",
  );
}

function startHero() {
  if (!heroVideo.hasAttribute("src")) heroVideo.src = "./assets/hero.mp4";
  return heroVideo.play().catch(() => {
    heroWanted = false;
    updateVideoButton();
  });
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
  document.querySelector("main").inert = false;
  document.querySelector("header").inert = false;
  document.querySelector("footer").inert = false;
  document.body.classList.remove("intro-active");
  intro.classList.add("is-closing");
  if (hadFocus) document.querySelector(".brand").focus({ preventScroll: true });
  window.setTimeout(
    () => {
      intro.hidden = true;
      introVideo.removeAttribute("src");
      introVideo.load();
    },
    reducedMotion.matches ? 0 : 420,
  );
  syncHero();
}

// Never persist a "seen" flag: the opening film plays on every page load/refresh.
// Respect reduced motion and data saving; failures never lock visitors out.
if (reducedMotion.matches || saveData) {
  closeIntro();
} else {
  intro.hidden = false;
  document.body.classList.add("intro-active");
  document.querySelector("main").inert = true;
  document.querySelector("header").inert = true;
  document.querySelector("footer").inert = true;
  const skip = document.querySelector("#intro-skip");
  skip.focus({ preventScroll: true });
  skip.addEventListener("click", closeIntro);
  introVideo.addEventListener(
    "ended",
    () => window.setTimeout(closeIntro, 650),
    { once: true },
  );
  introVideo.addEventListener("error", closeIntro, { once: true });
  introVideo.addEventListener("timeupdate", () => {
    if (Number.isFinite(introVideo.duration)) {
      document.querySelector("#intro-progress").style.width =
        `${(introVideo.currentTime / introVideo.duration) * 100}%`;
      if (introVideo.currentTime >= introVideo.duration - 1.25)
        intro.classList.add("is-branded");
    }
  });
  intro.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeIntro();
    if (event.key === "Tab") {
      event.preventDefault();
      skip.focus();
    }
  });
  introTimer = window.setTimeout(closeIntro, 8500);
  introVideo.src = "./assets/intro.mp4";
  introVideo.play().catch(closeIntro);
}

videoToggle.addEventListener("click", () => {
  heroWanted = heroVideo.paused;
  syncHero();
});
heroVideo.addEventListener("play", updateVideoButton);
heroVideo.addEventListener("pause", updateVideoButton);
heroVideo.addEventListener("error", () => {
  heroWanted = false;
  updateVideoButton();
});
document.addEventListener("visibilitychange", syncHero);
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) {
    heroWanted = false;
    closeIntro();
    syncHero();
  }
});
new IntersectionObserver(
  (entries) => {
    heroVisible = entries[0].isIntersecting;
    syncHero();
  },
  { threshold: 0.05 },
).observe(document.querySelector("#home"));

const menuToggle = document.querySelector("#menu-toggle");
const navigation = document.querySelector("#navigation");
function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  navigation.classList.remove("is-open");
  document.querySelector("#header").classList.remove("menu-open");
}
menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(expanded));
  navigation.classList.toggle("is-open", expanded);
  document.querySelector("#header").classList.toggle("menu-open", expanded);
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuToggle.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu();
    menuToggle.focus();
  }
});
window.matchMedia("(min-width: 701px)").addEventListener("change", closeMenu);

const cards = [...document.querySelectorAll(".project-card")];
const portfolioItems = [
  ...document.querySelectorAll("#projects [data-category]"),
];
const filters = [...document.querySelectorAll("[data-filter]")];
for (const filter of filters)
  filter.addEventListener("click", () => {
    filters.forEach((button) =>
      button.setAttribute("aria-pressed", String(button === filter)),
    );
    let visibleCount = 0;
    portfolioItems.forEach((card) => {
      card.hidden =
        filter.dataset.filter !== "all" &&
        card.dataset.category !== filter.dataset.filter;
      if (!card.hidden) visibleCount++;
    });
    document.querySelector("#project-status").textContent =
      `Showing ${visibleCount} ${visibleCount === 1 ? "project" : "projects"}`;
  });

const projects = {
  bamboo: {
    title: "The Bamboo Lab & Underground Club",
    location: "Lombok, Indonesia · Hospitality & culture",
    description:
      "The company profile describes a three-phase programme spanning a lab, resort and underground club. Its hybrid infrastructure brings together bespoke requirements and development at scale.",
    materials: "Hybrid BEMMELS and EPS systems",
  },
  housing: {
    title: "Lombok Housing Initiative",
    location: "Lombok, Indonesia · Mass-scale housing",
    description:
      "The corporate profile lists a regional-government housing programme of over 250 units, developed around rapid, disaster-resilient housing delivery. It demonstrates the scale of a coordinated housing programme.",
    materials: "Mass-scale GX 100 building envelopes",
    summary: "250 homes / Housing at community scale",
  },
  sport: {
    title: "Multi-Sport Facility",
    location: "Bali, Indonesia · Community facilities",
    description:
      "A sports-facility programme in Bali. Speak with the Fjäll team about the project’s scope and how its approach can support your facility.",
    materials: "Project-specific specifications available from the team",
    summary: "Multi-Sport Facility / Bali",
  },
  villas: {
    title: "Private Turnkey Villas",
    location: "Indonesia · Residential programme",
    description:
      "The corporate profile lists more than 100 private turnkey villas across Indonesia, reflecting a residential programme delivered through an integrated design and construction approach.",
    materials: "Project-specific systems and turnkey delivery",
    summary: "100+ villas / Private residential programme",
  },

  nuanu: {
    title: "Nuanu Creative City",
    location: "Bali, Indonesia · Hospitality & culture",
    description:
      "Fjäll’s work at Nuanu explores complex geometries, including a 360-degree IMAX dome and subterranean cave networks. It brings together parametric design and prefabricated construction systems.",
    materials: "GX 100 EPS panels · BEMMELS structural reinforcement",
  },
  ulaman: {
    title: "Ulaman Eco Resort",
    location: "Bali, Indonesia · Eco hospitality",
    description:
      "Working with Inspiral’s organic architecture, Fjäll’s systems provide an insulated structural backbone beneath sweeping bamboo forms. A meeting of natural materials and modern construction technology.",
    materials: "GX 100 panels · Bamboo integration · BEMMELS anchors",
  },
  lombok: {
    title: "Kuta Lombok Estates",
    location: "Lombok, Indonesia · Residential",
    description:
      "A development of seven coastal villas designed by architect Yasu Fukuda. The project combines a BEMMELS frame with a GX 100 building envelope to support efficient assembly in a coastal setting.",
    materials: "BEMMELS frame · GX 100 building envelope",
  },
  pods: {
    title: "The Drop Pod Network",
    location: "Indonesia & Japan · Modular living",
    description:
      "Adaptable modular spaces designed for different settings, from the tropical coasts of Bali and Lombok to Japan’s alpine resorts. Prefabricated envelopes and structural chassis support repeatable deployment.",
    materials: "Insulated EPS envelope · BEMMELS structural chassis",
  },
};
const dialog = document.querySelector("#project-dialog");
for (const card of cards)
  card.addEventListener("click", () => {
    const project = projects[card.dataset.project];
    document.querySelector("#dialog-title").textContent = project.title;
    document.querySelector("#dialog-location").textContent = project.location;
    document.querySelector("#dialog-description").textContent =
      project.description;
    document.querySelector("#dialog-materials").textContent = project.materials;
    const image = document.querySelector("#dialog-image");
    const source = card.querySelector("img");
    const summary = document.querySelector("#dialog-summary");
    image.hidden = !source;
    summary.hidden = Boolean(source);
    if (source) {
      image.src = source.src;
      image.alt = source.alt;
    } else {
      image.removeAttribute("src");
      image.alt = "";
      summary.textContent = project.summary || project.title;
    }
    dialog.showModal();
    dialog.scrollTop = 0;
  });
document
  .querySelector("#dialog-close")
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (
    event.target === dialog &&
    (event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom)
  )
    dialog.close();
});
document
  .querySelector("#dialog-contact")
  .addEventListener("click", () => dialog.close());
document.querySelector("#year").textContent = new Date().getFullYear();

initJourney({ reducedMotion });
initWorld({ reducedMotion });

const retrofitVideo = document.querySelector("#retrofit-video");
const retrofitPlay = document.querySelector("#retrofit-play");
const retrofitStatus = document.querySelector("#retrofit-status");
retrofitPlay.addEventListener("click", async () => {
  retrofitVideo.controls = true;
  if (!retrofitVideo.hasAttribute("src"))
    retrofitVideo.src = retrofitVideo.dataset.src;
  else if (retrofitVideo.error) retrofitVideo.load();
  retrofitPlay.hidden = true;
  retrofitStatus.textContent = "Loading the project film…";
  try {
    await retrofitVideo.play();
    retrofitVideo.parentElement.classList.add("is-playing");
    retrofitStatus.textContent = "";
  } catch {
    retrofitPlay.hidden = false;
    retrofitStatus.textContent =
      "The film could not start. Please try again, or use the video controls.";
  }
});
new IntersectionObserver(
  (entries) => {
    if (!entries[0].isIntersecting) retrofitVideo.pause();
  },
  { threshold: 0.1 },
).observe(retrofitVideo);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) retrofitVideo.pause();
});
