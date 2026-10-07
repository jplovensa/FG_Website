const stages = ["Discover", "Design", "Manufacture", "Assemble", "Handover"];
const journeys = {
  home: [
    [
      "You + GreenShift",
      "Begin with your ambition.",
      "Share how you want to live, where you want to build, and what matters most. Together, we turn the idea into a clear brief.",
      "A project brief, site priorities and the right questions to answer.",
    ],
    [
      "GreenShift + Your design team",
      "Make room for your life.",
      "Explore layouts, the landscape and the building envelope. Architecture and engineering shape the proposal together, including the approvals your site needs.",
      "A coordinated design direction, engineering requirements and an agreed scope.",
    ],
    [
      "Fjäll production team",
      "Precision before the site.",
      "Once the design and approvals are agreed, the specified panels and structural components move into controlled production. Your team plans delivery and site preparation.",
      "A manufacturing plan, specified components and a coordinated delivery sequence.",
    ],
    [
      "Your delivery team",
      "Bring the pieces together.",
      "Prepared components are delivered and assembled on a ready site. The team coordinates structure, services and finishes against the agreed design.",
      "An assembled building with installation and quality checks.",
    ],
    [
      "You + Your project team",
      "A place to call your own.",
      "Walk through the finished spaces with your team. Review the agreed completion checks, documentation and any outstanding items before handover.",
      "Handover documentation, a maintenance brief and your next chapter.",
    ],
  ],
  hospitality: [
    [
      "You + GreenShift",
      "Define the guest experience.",
      "Start with the people, place and purpose behind the project. Explore the site, operational needs and the experience you want each guest to have.",
      "A hospitality brief and a clear set of site and operational priorities.",
    ],
    [
      "GreenShift + Your design team",
      "Design the whole experience.",
      "Align guest spaces, service flows and architectural character. Coordinate engineering, site constraints and required approvals before committing to the build.",
      "A coordinated concept, operational requirements and a defined project scope.",
    ],
    [
      "Fjäll production team",
      "Make consistency possible.",
      "Specified components move into precision production. Repeated room types and shared building systems are coordinated with your delivery team.",
      "A component schedule and a phased manufacturing and delivery plan.",
    ],
    [
      "Your delivery team",
      "Assemble with a shared plan.",
      "Structure, services and finishes come together on site. The team coordinates the delivery sequence with access, landscaping and operational preparations.",
      "Installed spaces and coordinated checks across the agreed scope.",
    ],
    [
      "You + Your operations team",
      "Prepare for the first arrival.",
      "Review completion with your project and operations teams. Confirm the required checks, documentation and next steps before welcoming guests.",
      "A documented handover and a plan for operating the new spaces.",
    ],
  ],
  retrofit: [
    [
      "You + GreenShift",
      "See what could come next.",
      "Start with the existing building and your ambition for it. Discuss current use, constraints and the surveys needed to understand what can be retained.",
      "A retrofit brief and an initial survey and assessment plan.",
    ],
    [
      "Your design + Engineering team",
      "Respect what already exists.",
      "Assess the existing structure and coordinate the proposed changes. Material choices, services, permissions and phasing are planned around the building’s actual condition.",
      "An assessed design scope, engineering requirements and a phasing strategy.",
    ],
    [
      "Fjäll production team + Your team",
      "Prepare the right interventions.",
      "Where specified by the approved design, components are prepared off site. Coordinate dimensions and interfaces with the existing fabric before delivery.",
      "Specified components and an interface and installation plan.",
    ],
    [
      "Your delivery team",
      "Transform with care.",
      "Agreed interventions are installed in a coordinated sequence. Retained areas, services and finishes are managed alongside project-specific site checks.",
      "Completed interventions and inspections against the agreed retrofit scope.",
    ],
    [
      "You + Your project team",
      "Open a new chapter.",
      "Walk through the transformed spaces. Review documentation, commissioning requirements and outstanding items before returning the building to its intended use.",
      "A handover record and a plan for the building’s next life.",
    ],
  ],
  modular: [
    [
      "You + GreenShift",
      "Start with a scalable idea.",
      "Define the intended use, locations and level of repetition. Discuss the site, users and local requirements before selecting a modular direction.",
      "A development brief and the site and deployment requirements.",
    ],
    [
      "GreenShift + Your design team",
      "Resolve the repeatable system.",
      "Coordinate module layouts, connections and services. Site-specific engineering and approvals inform the proposed system and its configuration.",
      "A coordinated module concept and site-specific design requirements.",
    ],
    [
      "Fjäll production team",
      "Build the repeatable pieces.",
      "Specified envelopes and structural elements move into production. Your team plans quality checks, packaging and the delivery sequence.",
      "A component and manufacturing plan for the agreed deployment.",
    ],
    [
      "Your delivery team",
      "Connect the system on site.",
      "Modules and components arrive at a prepared site. Assembly, service connections and finishes follow the coordinated installation plan.",
      "Installed modules and completion checks for the chosen site.",
    ],
    [
      "You + Your project team",
      "Put the spaces to work.",
      "Review the installed development against the agreed brief. Handover includes documentation and maintenance considerations for the chosen system.",
      "A documented handover and a foundation for future deployment decisions.",
    ],
  ],
};
const labels = {
  home: "A home",
  hospitality: "A hospitality space",
  retrofit: "An existing building",
  modular: "A modular development",
};

journeys.housing = [
  [
    "You + Fjäll Affordable Development",
    "Start with the community.",
    "Define who the homes are for, the site and the scale of the programme. We align the housing brief with land, infrastructure and local requirements.",
    "A housing brief, site priorities and a programme assessment plan.",
  ],
  [
    "Fjäll Affordable Development + Your design team",
    "Plan a connected neighbourhood.",
    "Coordinate repeatable home types with access, shared spaces, services and site-specific engineering. Masterplanning and approvals shape the development before production.",
    "A coordinated masterplan, housing types and engineering requirements.",
  ],
  [
    "Fjäll production + Delivery teams",
    "Prepare for delivery at scale.",
    "Specified components move into controlled production. The team coordinates repeatable systems, quality checks and delivery batches with site readiness.",
    "A manufacturing schedule and a phased delivery plan for the agreed scope.",
  ],
  [
    "Your construction + Delivery team",
    "Build the programme in phases.",
    "Homes and supporting infrastructure are delivered through a coordinated site sequence. Assembly, services and completion checks follow the approved plans.",
    "Installed housing phases and quality checks against the agreed scope.",
  ],
  [
    "You + Fjäll Affordable Development",
    "A community, ready for its next chapter.",
    "Review each agreed phase with your project team. Handover includes completion documentation, outstanding items and maintenance considerations.",
    "Documented handovers and a clear plan for occupation and maintenance.",
  ],
];
journeys.workers = [
  [
    "You + Fjäll Affordable Development",
    "Put the workforce first.",
    "Discuss workforce needs, the location and how the accommodation will operate. Define occupancy, shared amenities, access and the surveys needed for the site.",
    "An accommodation brief and a site and operational requirements list.",
  ],
  [
    "Fjäll Affordable Development + Your design team",
    "Design for everyday dignity.",
    "Coordinate sleeping spaces, sanitation, dining and shared facilities. Comfort, services, local requirements and site-specific engineering inform the design.",
    "A coordinated accommodation layout, amenity plan and design requirements.",
  ],
  [
    "Fjäll production + Delivery teams",
    "Make repetition work well.",
    "Specified building components are manufactured in coordinated batches. Repeated room types and service interfaces are planned with your delivery team.",
    "Specified systems and a phased manufacturing and delivery plan.",
  ],
  [
    "Your construction + Delivery team",
    "Bring the accommodation together.",
    "Accommodation blocks, services and shared facilities are assembled on a prepared site. The sequence is coordinated with operational access and the agreed inspections.",
    "Installed accommodation and coordinated checks across the agreed scope.",
  ],
  [
    "You + Your operations team",
    "Prepare for people to move in.",
    "Review completion, documentation and outstanding items with the project and operations teams. Agree the maintenance and operational handover before occupation.",
    "A documented handover and an operations and maintenance brief.",
  ],
];
labels.housing = "Mass-scale housing";
labels.workers = "Workers’ accommodation";

export function initJourney({ reducedMotion }) {
  let type = "home";
  let step = 0;
  let timer;
  let scene;
  let sceneLoading = false;
  const play = document.querySelector("#journey-play");
  const previous = document.querySelector("#journey-previous");
  const next = document.querySelector("#journey-next");
  const typeButtons = [...document.querySelectorAll("[data-journey-type]")];
  const stepButtons = [...document.querySelectorAll("[data-journey-step]")];
  function stop() {
    clearInterval(timer);
    timer = undefined;
    play.innerHTML = 'Play the journey <span aria-hidden="true">▷</span>';
  }
  function render() {
    const [owner, title, description, deliverable] = journeys[type][step];
    document.querySelector("#journey-owner").textContent = owner;
    document.querySelector("#journey-stage-title").textContent = title;
    document.querySelector("#journey-description").textContent = description;
    document.querySelector("#journey-deliverable").textContent = deliverable;
    document.querySelector("#journey-count").textContent = `0${step + 1} / 05`;
    document.querySelector("#model-stage-label").textContent =
      `0${step + 1} / ${stages[step]}`;
    scene?.setType(type);
    scene?.setStage(step);
    const model = document.querySelector("#build-model");
    model.dataset.stage = String(step);
    model.setAttribute(
      "aria-label",
      `Illustrative ${labels[type].toLowerCase()} model: ${stages[step]}`,
    );
    document.querySelector("#journey-status").textContent =
      `${labels[type]}: stage ${step + 1} of 5, ${stages[step]}. ${title}`;
    stepButtons.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(Number(button.dataset.journeyStep) === step),
      ),
    );
    typeButtons.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.journeyType === type),
      ),
    );
    previous.disabled = step === 0;
    next.disabled = step === 4;
    if (step === 4) stop();
  }
  function selectType(value) {
    stop();
    type = value;
    step = 0;
    render();
  }
  typeButtons.forEach((button) =>
    button.addEventListener("click", () =>
      selectType(button.dataset.journeyType),
    ),
  );
  stepButtons.forEach((button) =>
    button.addEventListener("click", () => {
      stop();
      step = Number(button.dataset.journeyStep);
      render();
    }),
  );
  previous.addEventListener("click", () => {
    stop();
    step = Math.max(0, step - 1);
    render();
  });
  next.addEventListener("click", () => {
    stop();
    step = Math.min(4, step + 1);
    render();
  });
  play.addEventListener("click", () => {
    if (timer) {
      stop();
      return;
    }
    if (step === 4) {
      step = 0;
      render();
    }
    play.innerHTML = 'Pause the journey <span aria-hidden="true">II</span>';
    timer = window.setInterval(() => {
      step = Math.min(4, step + 1);
      render();
    }, 4500);
  });
  document.querySelector("#download-brief").addEventListener("click", () => {
    const text = [
      `FJÄLL GROUP — STARTER BRIEF`,
      `Project type: ${labels[type]}`,
      "",
      "Before the first conversation:",
      "• Where is your site or existing building?",
      "• What will the space be used for?",
      "• What matters most: experience, scale, site constraints or budget?",
      "• What surveys, designs or approvals already exist?",
      "",
      ...journeys[type].flatMap((stage, index) => [
        `${index + 1}. ${stages[index]} — ${stage[1]}`,
        stage[2],
        `Take forward: ${stage[3]}`,
        "",
      ]),
      "Illustrative journey only. Scope, engineering and programme are agreed with your project team.",
      "",
      "Contact the commercial team on WhatsApp: +62 877 860 10290",
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `fjall-${type}-starter-brief.txt`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
  });
  new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) stop();
    },
    { threshold: 0.05 },
  ).observe(document.querySelector("#journey"));

  const model = document.querySelector("#build-model");
  const canvas = document.querySelector("#construction-canvas");
  const sceneControls = document.querySelector(".scene-controls");
  const sceneMotion = document.querySelector("#scene-motion");
  let scenePaused = false;
  function unavailable() {
    canvas.hidden = true;
    model.classList.remove("has-webgl");
    sceneControls.hidden = true;
    document.querySelector(".scene-environments").hidden = true;
    document.querySelector("#scene-help").textContent =
      "Illustrated journey · 3D is unavailable on this device";
  }
  const lazyScene = new IntersectionObserver(
    async (entries) => {
      if (!entries[0].isIntersecting || sceneLoading) return;
      sceneLoading = true;
      lazyScene.disconnect();
      try {
        const { createConstructionScene } =
          await import("./construction-scene.js?v=material-light-2");
        scene = createConstructionScene(canvas, {
          reducedMotion,
          onUnavailable: unavailable,
        });
        if (!scene) return;
        model.classList.add("has-webgl");
        canvas.tabIndex = 0;
        sceneControls.hidden = false;
        document.querySelector(".scene-environments").hidden = false;
        document.querySelector("#scene-tour").disabled = reducedMotion.matches;
        scene.setType(type);
        scene.setStage(step);
        sceneMotion.disabled = reducedMotion.matches;
        sceneMotion.textContent = reducedMotion.matches
          ? "Motion reduced"
          : "Pause scene";
      } catch {
        unavailable();
      }
    },
    { rootMargin: "100px" },
  );
  lazyScene.observe(model);
  document
    .querySelector("#scene-left")
    .addEventListener("click", () => scene?.rotate(-0.35));
  document
    .querySelector("#scene-right")
    .addEventListener("click", () => scene?.rotate(0.35));
  document
    .querySelector("#scene-reset")
    .addEventListener("click", () => scene?.reset());
  sceneMotion.addEventListener("click", () => {
    scenePaused = !scenePaused;
    scene?.pause(scenePaused);
    sceneMotion.setAttribute("aria-pressed", String(scenePaused));
    sceneMotion.textContent = scenePaused ? "Resume scene" : "Pause scene";
  });
  const environmentButtons = [
    ...document.querySelectorAll("button[data-environment]"),
  ];
  environmentButtons.forEach((button) =>
    button.addEventListener("click", () => {
      scene?.setEnvironment(button.dataset.environment);
      environmentButtons.forEach((other) =>
        other.setAttribute("aria-pressed", String(other === button)),
      );
      canvas.setAttribute(
        "aria-label",
        `Interactive 3D ${button.textContent.toLowerCase()} construction site with a Fjäll guide`,
      );
    }),
  );
  const tour = document.querySelector("#scene-tour");
  tour.addEventListener("click", () => {
    const playing = tour.getAttribute("aria-pressed") !== "true";
    tour.setAttribute("aria-pressed", String(playing));
    tour.textContent = playing ? "Stop orbit" : "Camera orbit";
    scene?.tour(playing);
  });
  reducedMotion.addEventListener("change", () => {
    tour.disabled = reducedMotion.matches;
    if (reducedMotion.matches) {
      scene?.tour(false);
      tour.setAttribute("aria-pressed", "false");
      tour.textContent = "Camera orbit";
    }
  });
  canvas.addEventListener("keydown", (event) => {
    if (["ArrowLeft", "ArrowRight", "Home"].includes(event.key)) {
      event.preventDefault();
      if (event.key === "Home") scene?.reset();
      else scene?.rotate(event.key === "ArrowLeft" ? -0.2 : 0.2);
    }
  });
  reducedMotion.addEventListener("change", () => {
    sceneMotion.disabled = reducedMotion.matches;
    sceneMotion.textContent = reducedMotion.matches
      ? "Motion reduced"
      : scenePaused
        ? "Resume scene"
        : "Pause scene";
  });

  reducedMotion.addEventListener("change", stop);
}

export function initWorld({ reducedMotion }) {
  const map = document.querySelector("#world-map");
  const svg = map.querySelector("svg");
  const toggle = document.querySelector("#map-motion");
  const buttons = [
    ...document.querySelectorAll(".world-regions [data-region]"),
  ];
  const stories = {
    all: "Indonesia is our production foundation: a base for precision manufacturing and the delivery of modular building systems.",
    europe:
      "Swedish engineering is part of the origin of our building technology, developed by engineer Anders Ahman in Bali.",
    japan:
      "Japanese precision informs our approach to manufacturing. Our Japan office connects with modular deployments spanning Indonesia and Japan.",
    australasia:
      "Asia and Australasia are regional priorities for Fjäll Group’s development and deployment ambitions.",
  };
  let paused = reducedMotion.matches;
  let visible = false;
  function sync() {
    const stopped =
      paused || !visible || document.hidden || reducedMotion.matches;
    map.classList.toggle("is-visible", visible);
    map.classList.toggle("motion-paused", stopped);
    if (stopped) svg.pauseAnimations?.();
    else svg.unpauseAnimations?.();
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.disabled = reducedMotion.matches;
    toggle.innerHTML = reducedMotion.matches
      ? "Motion reduced"
      : paused
        ? 'Resume map motion <span aria-hidden="true">▷</span>'
        : 'Pause map motion <span aria-hidden="true">II</span>';
  }
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      map.dataset.region = button.dataset.region;
      buttons.forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
      document.querySelector("#world-story").textContent =
        stories[button.dataset.region];
    }),
  );
  toggle.addEventListener("click", () => {
    paused = !paused;
    sync();
  });
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      sync();
    },
    { threshold: 0.1 },
  ).observe(map);
  document.addEventListener("visibilitychange", sync);
  reducedMotion.addEventListener("change", () => {
    paused = reducedMotion.matches;
    sync();
  });
  sync();
}
