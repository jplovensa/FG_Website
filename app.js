import { initStudio } from "./studio.js";
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
// Direct inquiry links skip the film so returning readers can start their brief.
// Respect reduced motion and data saving; failures never lock visitors out.
if (reducedMotion.matches || saveData || location.hash === "#contact") {
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

// The reference's transparent hero navigation becomes a white bar on scroll.
new IntersectionObserver(
  ([entry]) => {
    document
      .querySelector("#header")
      .classList.toggle("is-scrolled", entry.intersectionRatio < 0.15);
  },
  { threshold: [0.15] },
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

document.querySelector("#year").textContent = new Date().getFullYear();

initJourney({ reducedMotion });
initWorld({ reducedMotion });
initStudio();

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
