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
