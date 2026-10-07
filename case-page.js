import { track } from "./lead-form.js";
track("case_study_view", { project: document.body.dataset.case });
document.addEventListener("click", (event) => {
  const a = event.target.closest("a");
  if (a?.hash === "#contact")
    track("inquiry_start", { source: `project:${document.body.dataset.case}` });
});
for (const film of document.querySelectorAll("video")) {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) film.pause();
  });
  new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) film.pause();
  }).observe(film);
}

const sketch = document.querySelector("[data-project-sketch]");
if (sketch) {
  const observer = new IntersectionObserver(
    async (entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      try {
        const { initProjectSketch } =
          await import("./project-sketch.js?v=sketch-studio-1");
        initProjectSketch(sketch);
      } catch {
        /* The source-image cover remains available. */
      }
    },
    { rootMargin: "200px" },
  );
  observer.observe(sketch);
}
