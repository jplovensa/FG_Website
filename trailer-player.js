// Both real-time trailers and the rendered MP4s use these deterministic shots.
export const trailerDuration = 18;
const films = {
  greenshift: [
    {
      start: 0,
      end: 3,
      stage: 0,
      eye: [8.5, 4.3, 11],
      to: [6.5, 3.6, 9],
      target: [0, 0.4, -0.8],
      title: "Start with ambition.",
      caption: "01 / Site + brief",
    },
    {
      start: 3,
      end: 6,
      stage: 1,
      eye: [6, 6, 8],
      to: [4.5, 5.4, 7],
      target: [0, 0.8, -0.5],
      title: "Design as one.",
      caption: "02 / Architecture + engineering",
    },
    {
      start: 6,
      end: 9,
      stage: 2,
      eye: [4.3, 2.8, 6],
      to: [3.4, 2.2, 4.8],
      target: [0, 0.9, -0.5],
      title: "Resolve the structure.",
      caption: "03 / Coordinated preparation",
    },
    {
      start: 9,
      end: 12,
      stage: 3,
      eye: [-4.5, 2.6, 7],
      to: [-3.5, 2.25, 5.8],
      target: [-0.5, 0.7, -0.5],
      title: "Bring the parts together.",
      caption: "04 / Envelope + assembly",
    },
    {
      start: 12,
      end: 16,
      stage: 4,
      eye: [7, 3.7, 9],
      to: [6.2, 3.1, 8],
      target: [0, 1, -0.5],
      title: "Spaces, considered.",
      caption: "05 / An architectural concept",
    },
    {
      start: 16,
      end: 18,
      stage: 4,
      eye: [8.5, 6, 11],
      to: [9.3, 6.4, 12.5],
      target: [0, 0.7, -0.5],
      title: "GreenShift",
      caption: "Design + development, together.",
      endCard: true,
    },
  ],
  fad: [
    {
      start: 0,
      end: 3,
      stage: 0,
      units: 1,
      eye: [8, 4, 10],
      to: [6.8, 3.7, 9],
      target: [0, 0.4, -0.5],
      title: "Begin with people.",
      caption: "01 / A place to live",
    },
    {
      start: 3,
      end: 6,
      stage: 2,
      units: 1,
      eye: [5, 2.4, 6.5],
      to: [4, 2.1, 5.7],
      target: [0, 0.8, 0],
      title: "One coordinated system.",
      caption: "02 / Repeatable components",
    },
    {
      start: 6,
      end: 10,
      stage: 3,
      units: 6,
      eye: [7, 5, 10],
      to: [8, 5.5, 11],
      target: [0, 0.5, -1],
      title: "Repeat with purpose.",
      caption: "03 / Housing + workers’ accommodation",
    },
    {
      start: 10,
      end: 15,
      stage: 4,
      units: 12,
      eye: [12, 9, 15],
      to: [10, 8, 12],
      target: [0, 0.5, -1.6],
      title: "A community, considered.",
      caption: "04 / Connected homes + shared paths",
    },
    {
      start: 15,
      end: 18,
      stage: 4,
      units: 12,
      eye: [-12, 12, 17],
      to: [-14, 14, 19],
      target: [0, 0.3, -2.2],
      title: "Fjäll Affordable Development",
      caption: "Homes and accommodation, at scale.",
      endCard: true,
    },
  ],
};
export function getTrailerShot(kind, seconds) {
  const time = Math.max(0, Math.min(trailerDuration, Number(seconds) || 0));
  const shots = films[kind] || films.greenshift;
  const shot =
    shots.find((s) => time >= s.start && time < s.end) || shots.at(-1);
  const t = Math.min(1, (time - shot.start) / (shot.end - shot.start));
  const ease = t * t * (3 - 2 * t);
  return {
    ...shot,
    time: time * 1000,
    elapsed: (time - shot.start) * 1000,
    eye: shot.eye.map((n, i) => n + (shot.to[i] - n) * ease),
    type: kind === "fad" ? "housing" : "greenshift",
    environment: kind === "fad" ? "forest" : "beach",
    fov: 44,
  };
}

export async function createTrailerPlayer(root, { reducedMotion }) {
  const canvas = root.querySelector("canvas"),
    video = root.querySelector("video");
  const play = root.querySelector("[data-trailer-play]"),
    seek = root.querySelector("[data-trailer-seek]");
  const replay = root.querySelector("[data-trailer-replay]"),
    status = root.querySelector("[data-trailer-status]");
  let kind = "greenshift",
    time = 0,
    playing = false,
    frame,
    last = 0,
    scene,
    fallback = false;
  function paint() {
    const shot = getTrailerShot(kind, time);
    if (!fallback) scene?.renderShot(shot);
    root.querySelector("[data-trailer-title]").textContent = shot.title;
    root.querySelector("[data-trailer-caption]").textContent = shot.caption;
    root.querySelector("[data-trailer-clock]").textContent =
      `00:${String(Math.floor(time)).padStart(2, "0")} / 00:18`;
    root.classList.toggle("is-end-card", !!shot.endCard);
    root.classList.toggle("is-opening", time < 0.6);
    seek.value = String(time);
    seek.setAttribute(
      "aria-valuetext",
      `${Math.round(time)} seconds of 18. ${shot.title}`,
    );
    canvas.setAttribute(
      "aria-label",
      `${kind === "fad" ? "FAD housing" : "GreenShift design"} cinematic construction concept. ${shot.title}`,
    );
    root.dataset.time = String(time);
    play.textContent = playing
      ? "Pause trailer"
      : time >= trailerDuration
        ? "Play again"
        : "Play trailer";
    play.setAttribute("aria-pressed", String(playing));
  }
  function stop() {
    if (playing) status.textContent = "Trailer paused. Press Play to continue.";
    playing = false;
    cancelAnimationFrame(frame);
    video.pause();
    paint();
  }
  function useVideo() {
    fallback = true;
    playing = false;
    cancelAnimationFrame(frame);
    canvas.hidden = true;
    video.hidden = false;
    video.controls = true;
    root.dataset.renderer = "video";
    status.textContent = "Rendered trailer available. Press Play to watch.";
    paint();
  }
  const { createConstructionScene } = await import("./construction-scene.js");
  scene = createConstructionScene(canvas, {
    reducedMotion,
    manual: true,
    guideElement: null,
    onUnavailable: useVideo,
  });
  if (scene) {
    canvas.hidden = false;
    video.hidden = true;
    root.dataset.renderer = "webgl";
  } else useVideo();
  function loadVideo() {
    if (video.getAttribute("src") !== `./assets/${kind}-trailer.mp4`) {
      video.src = `./assets/${kind}-trailer.mp4`;
      video.addEventListener(
        "loadedmetadata",
        () => {
          video.currentTime = Math.min(time, video.duration || trailerDuration);
        },
        { once: true },
      );
    } else video.currentTime = time;
  }
  function tick(now) {
    if (!playing || fallback) return;
    if (now - last >= 1000 / 24) {
      time = Math.min(
        trailerDuration,
        time + Math.min(0.12, (now - last) / 1000),
      );
      last = now;
      paint();
    }
    if (time >= trailerDuration) {
      stop();
      status.textContent =
        "Trailer complete. Replay or explore the study below.";
    } else frame = requestAnimationFrame(tick);
  }
  async function start() {
    if (time >= trailerDuration) time = 0;
    playing = true;
    paint();
    status.textContent = "Playing the cinematic concept trailer.";
    if (fallback) {
      loadVideo();
      try {
        await video.play();
      } catch {
        stop();
        status.textContent =
          "Press Play in the video controls to start the film.";
      }
    } else {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }
  play.addEventListener("click", () => (playing ? stop() : start()));
  replay.addEventListener("click", () => {
    stop();
    time = 0;
    paint();
    start();
  });
  seek.addEventListener("input", () => {
    const position = Number(seek.value);
    stop();
    time = position;
    if (fallback && video.hasAttribute("src")) video.currentTime = time;
    paint();
  });
  video.addEventListener("timeupdate", () => {
    if (fallback) {
      time = Math.min(trailerDuration, video.currentTime);
      paint();
    }
  });
  video.addEventListener("play", () => {
    if (fallback) {
      playing = true;
      paint();
    }
  });
  video.addEventListener("pause", () => {
    if (fallback) {
      playing = false;
      paint();
    }
  });
  video.addEventListener("ended", () => {
    if (fallback) {
      playing = false;
      time = trailerDuration;
      paint();
    }
  });
  video.addEventListener("error", () => {
    stop();
    status.textContent =
      "The rendered film could not load. You can still explore the study below.";
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
  });
  new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) stop();
    },
    { threshold: 0.1 },
  ).observe(root);
  reducedMotion.addEventListener("change", () => {
    stop();
    if (reducedMotion.matches) {
      time = trailerDuration;
      paint();
    }
  });
  paint();
  return {
    loadBusiness(value) {
      stop();
      kind = value;
      time = reducedMotion.matches ? trailerDuration : 0;
      video.removeAttribute("src");
      video.load();
      video.poster = `./assets/${kind}-trailer-poster.webp`;
      root.querySelector("[data-trailer-download]").href =
        `./assets/${kind}-trailer.mp4`;
      status.textContent =
        "Press Play for an 18-second cinematic concept trailer.";
      paint();
    },
    stop,
  };
}
