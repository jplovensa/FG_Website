// Native, user-controlled playback; pause films when the page is hidden.
for (const film of document.querySelectorAll('video')) {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) film.pause();
  });
  new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) film.pause();
  }).observe(film);
}
