import { initLeadForm } from "./lead-form.js";
export { buildInquiryLink } from "./inquiry-model.js";
// Lightweight, user-controlled illustrations and the WhatsApp inquiry handoff.
export const materials = {
  eps: {
    title: "EPS · GX-100 Panel",
    kicker: "01 / Wall + envelope",
    index: "01 — GX-100",
    description:
      "One EPS core, with four protective layers on each face: PU glue, fibreglass mesh, Kalci board and a custom finish. A prepared wall and envelope system for exterior or interior use.",
    explore:
      "Finish → Kalci board → Fibreglass → PU glue → EPS → PU glue → Fibreglass → Kalci board → Finish.",
    discuss:
      "Project geometry, openings, checked dimensions and the finish sample—before sequenced installation.",
    label: "GX-100 / Studio concept",
    graphic: "Documented GX-100 panel build-up",
    graphicDescription:
      "Nine layers: one EPS core, with PU glue, fibreglass mesh, Kalci board and custom finish on each face.",
    source: "Product Knowledge · Exact GX-100 build-up, pp. 3–5",
    views: [
      {
        label: "Material",
        image: "library-eps-material",
        concept: true,
        alt: "Illustrative design concept — GX-100 composite panel with a central EPS core and protective layers mirrored on both faces",
        note: "Read the build-up: EPS core, PU glue, fibreglass mesh, Kalci board and finish. The illustration communicates the material layers; approve the exact panel and finish specification with Fjäll.",
      },
      {
        label: "Usage",
        image: "library-eps-usage",
        concept: true,
        alt: "Illustrative design concept — Design concept of a tropical courtyard pavilion using smooth composite wall panels",
        note: "An insulated wall and envelope system for exterior and interior spaces. Openings, finish, interfaces and support conditions are resolved for the building.",
      },
      {
        label: "Preparation",
        image: "library-eps-preparation",
        concept: true,
        alt: "Illustrative design concept — Workshop concept showing a technician checking a prepared composite EPS panel",
        note: "Coordinate dimensions and openings, review the finish sample, and check prepared panels against the approved sequence before dispatch and installation.",
      },
    ],
    detailTitle: "Specify the surface.",
    details: [
      "Exterior: smooth mineral render, fine sand texture, fluted or ribbed profiles.",
      "Interior: microcement, linear relief and sculpted bespoke profiles.",
      "Colour, texture and depth are specified for your project.",
    ],
  },
  bemmel: {
    title: "Bemmel",
    kicker: "02 / BEMMELS · Braided basalt composite",
    index: "02 — BEMMELS",
    description:
      "Continuous basalt fibres are braided, consolidated into a rigid composite and shaped for project needs. BEMMELS replaces steel in selected engineered roles—Fjäll’s green steel.",
    explore:
      "Braid → Consolidate → Engineer. Continuous fibres follow the structural profile; a braid matrix locks the form into a rigid shape.",
    discuss:
      "The profile, connection and intended use are verified for your project. Final geometry and performance are engineered.",
    label: "BEMMELS / Illustrative structural profile",
    graphic: "BEMMELS braided basalt profile",
    graphicDescription:
      "Supplied illustrative composite I-profile and a close view of the basalt braid.",
    source: "Product Knowledge · BEMMELS, p. 6",
    views: [
      {
        label: "Material",
        image: "library-bemmel-material",
        concept: true,
        alt: "Illustrative design concept — Studio concept of a continuous braided-basalt composite I-profile",
        note: "Continuous basalt fibres, consolidated into a shaped composite profile. This I-section is an illustrative form, rather than a stock product or approved structural detail.",
      },
      {
        label: "Usage",
        image: "library-bemmel-usage",
        concept: true,
        alt: "Illustrative design concept — Pavilion concept illustrating braided-basalt composite framing",
        note: "Selected structural roles are evaluated through project engineering. Resolve the loads, geometry, connections and interfaces before choosing a profile.",
      },
      {
        label: "Preparation",
        image: "library-bemmel-preparation",
        concept: true,
        alt: "Illustrative design concept — Workshop concept of braided basalt fibres on a shaped mandrel",
        note: "Braid, consolidate and shape the profile for its intended role. Production details, quality checks and connections follow the engineered specification.",
      },
    ],
    detailTitle: "Preparation, with purpose.",
    details: [
      "Lightweight, non-corrosive braided composite.",
      "Consolidated and shaped for the project’s structural needs.",
      "Connections and use are resolved through project engineering.",
    ],
  },
  ror: {
    title: "RoR roof",
    kicker: "03 / ROR membranes + shingles",
    index: "03 — Roofing",
    description:
      "Two material expressions: a liquid-applied rubber membrane with woven fibreglass reinforcement, or a layered surface of overlapping shingles. Choose a continuous finish or a repeating roof texture.",
    explore:
      "ROR: rubber membrane + woven fibreglass. Shingles: overlapping courses on a project-approved roof assembly.",
    discuss:
      "Coordinate roof geometry, substrate, drainage, thickness, edge details and performance with the approved system specification.",
    label: "RoR / Studio concept",
    graphic: "Reinforced ROR membrane build-up",
    graphicDescription:
      "Rubber membrane, integrated woven fibreglass and a project-specific roof substrate; separated for clarity, not to scale.",
    source: "RoR Catalogue · Membranes, shingles and application, pp. 3–11",
    views: [
      {
        label: "Material",
        image: "library-ror-material",
        concept: true,
        alt: "Illustrative design concept — Studio samples illustrating overlapping shingles and a fibreglass-reinforced rubber membrane",
        note: "Choose between overlapping shingle texture and a continuous reinforced rubber membrane. Colour, thickness and build-up are confirmed through samples and the approved specification.",
      },
      {
        label: "Usage",
        image: "library-ror-usage",
        concept: true,
        alt: "Illustrative design concept — Design concept of a curved tropical pavilion roof with overlapping brown shingles",
        note: "A roof surface that follows architectural form. Coordinate the geometry, drainage, edges and interfaces as one complete roofing assembly.",
      },
      {
        label: "Preparation",
        image: "library-ror-preparation",
        concept: true,
        alt: "Illustrative design concept — Workshop concept of roof substrate checks and fibreglass reinforcement preparation",
        note: "Check the substrate and roof details before work starts. Use the approved preparation, reinforcement and application method; confirm compatibility and required performance.",
      },
    ],
    detailTitle: "Surface, form and specification.",
    details: [
      "Shingles: nominal 0.50 m × 4.00 m rolls. Effective coverage depends on overlap, geometry and detailing.",
      "Shingle palette: black, brown and white. Confirm availability and approve a physical sample.",
      "Translucent membrane options introduce filtered daylight; light transmission and performance are confirmed per project.",
      "Confirm substrate compatibility, membrane build-up, fixing or application method, and required waterproofing, UV, fire and wind performance.",
    ],
  },
  scale: {
    title: "Materials at scale",
    kicker: "04 / Prepare earlier · Deliver in sequence",
    index: "04 — Scale",
    description:
      "Digital coordination, controlled semi-manual preparation, checked delivery and sequenced assembly bring more work forward. Panel preparation can progress alongside site work.",
    explore: "Model + engineer → Prepare in parallel → Deliver → Assemble.",
    discuss:
      "Lock dimensions, finishes and system scope earlier. Agree the programme around approvals, logistics and site conditions.",
    label: "GX-100 / Application concepts",
    graphic: "Fjäll system application concepts",
    graphicDescription:
      "Supplied application concepts for a private villa, resort pavilion, commercial space and hybrid mid-rise.",
    source: "Product Knowledge · Preparation and application concepts, pp. 7–9",
    views: [
      {
        label: "Material",
        image: "library-scale-material",
        concept: true,
        alt: "Illustrative design concept — Production concept of pre-cut composite panels supported on organised racks",
        note: "Repeatable panel types, coordinated openings and checked interfaces turn the building specification into a prepared kit of parts.",
      },
      {
        label: "Usage",
        image: "library-scale-usage",
        concept: true,
        alt: "Illustrative design concept — Design concept of a repeatable tropical housing community with shared paths",
        note: "Plan the home and community together: unit types, access, shared space, infrastructure and phasing. This is an application concept, not a completed programme photograph.",
      },
      {
        label: "Preparation",
        image: "library-scale-preparation",
        concept: true,
        alt: "Illustrative design concept — Logistics concept of secured composite-panel racks and sequenced dispatch",
        note: "Agree dimensions and system scope early, protect the prepared components, and coordinate delivery with the site’s installation sequence.",
      },
    ],
    detailTitle: "A clear path to delivery.",
    details: [
      "Fit review → System design → Finish sample → Engineering → Preparation → Delivery.",
      "Agree GX-100, BEMMELS and conventional scopes before design is locked.",
      "Programme impact depends on design, approvals, logistics and site conditions.",
    ],
  },
};
const designStages = [
  [
    "Start with people and place.",
    "The design arm brings your ambition, site priorities and spatial needs into a clear brief before exploring the building.",
  ],
  [
    "Bring the disciplines together.",
    "Architecture and engineering shape one coordinated design, with delivery considered from the start.",
  ],
  [
    "Coordinate the whole building.",
    "Structure, envelope and roof come together as a considered architectural concept, ready for project-specific detailing.",
  ],
];

export function initStudio() {
  initBusinessStudies();
  initBusinessPreviews();
  initMaterialLibrary();
  initLeadForm();
}

function initBusinessStudies() {
  const dialog = document.querySelector("#business-dialog");
  const simulation = document.querySelector("#business-simulation");
  const stageButtons = [
    ...dialog.querySelectorAll("button[data-design-stage]"),
  ];
  const count = document.querySelector("#housing-count");
  const inquiry = document.querySelector("#inquiry-interest");
  let business = "greenshift",
    trailer,
    trailerLoading;
  function loadTrailer() {
    trailerLoading ||= import("./trailer-player.js?v=material-light-2").then(
      ({ createTrailerPlayer }) =>
        createTrailerPlayer(document.querySelector("#business-trailer"), {
          reducedMotion: matchMedia("(prefers-reduced-motion: reduce)"),
        }),
    );
    trailerLoading
      .then((player) => {
        trailer = player;
        if (dialog.open) player.loadBusiness(business);
      })
      .catch(() => {
        const root = document.querySelector("#business-trailer");
        const video = root.querySelector("video");
        video.hidden = false;
        video.controls = true;
        const preview = document.querySelector(
          `[data-business-preview="${business}"]`,
        );
        video.src = preview.dataset.src;
        video.poster = preview.getAttribute("poster");
        root.querySelector("[data-trailer-status]").textContent =
          "Use the video controls to watch the rendered trailer.";
      });
  }
  dialog.addEventListener("close", () => {
    trailer?.stop();
    dialog.querySelector("#trailer-video").pause();
  });
  function setDesignStage(stage) {
    simulation.dataset.designStage = String(stage);
    stageButtons.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(Number(button.dataset.designStage) === stage),
      ),
    );
    document.querySelector("#business-study-title").textContent =
      designStages[stage][0];
    document.querySelector("#business-study-description").textContent =
      designStages[stage][1];
    document.querySelector("#business-study-status").textContent =
      `Design study ${stage + 1} of 3: ${designStages[stage][0]}`;
  }
  function setHousingCount() {
    const amount = Number(count.value);
    dialog.querySelectorAll("[data-housing-unit]").forEach((unit) => {
      // SVG elements use the explicit hidden attribute consistently across browsers.
      unit.toggleAttribute("hidden", Number(unit.dataset.housingUnit) > amount);
    });
    document.querySelector("#housing-count-label").value = String(amount);
    count.setAttribute(
      "aria-valuetext",
      `${amount} illustrative ${amount === 1 ? "home" : "homes"}`,
    );
    document.querySelector("#business-study-title").textContent =
      `${amount} ${amount === 1 ? "home" : "homes"}. One connected system.`;
    document.querySelector("#business-study-description").textContent =
      "Repeatable housing and workers’ accommodation combine coordinated units, shared routes and community space. Change the unit count to explore the concept.";
    document.querySelector("#business-study-status").textContent =
      `Housing concept showing ${amount} ${amount === 1 ? "home" : "homes"}.`;
  }
  stageButtons.forEach((button) =>
    button.addEventListener("click", () =>
      setDesignStage(Number(button.dataset.designStage)),
    ),
  );
  count.addEventListener("input", setHousingCount);
  document.querySelectorAll("[data-business]").forEach((button) =>
    button.addEventListener("click", () => {
      business = button.dataset.business;
      const design = business === "greenshift";
      document.querySelector("#business-dialog-kicker").textContent = design
        ? "GreenShift / Design & development"
        : "FAD / Fjäll Affordable Development";
      document.querySelector("#business-dialog-title").textContent = design
        ? "The design studio."
        : "A community, considered.";
      document.querySelector("#business-dialog-description").textContent =
        design
          ? "Explore how simple box studies become a curved architectural concept."
          : "Explore the building blocks of mass-scale housing and workers’ accommodation.";
      document.querySelector("#design-illustration").hidden = !design;
      document.querySelector("#housing-illustration").hidden = design;
      document.querySelector("#design-controls").hidden = !design;
      document.querySelector("#housing-controls").hidden = design;
      if (design) setDesignStage(1);
      else {
        count.value = "6";
        setHousingCount();
      }
      dialog.showModal();
      dialog.scrollTop = 0;
      loadTrailer();
    }),
  );
  document
    .querySelector("#business-dialog-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom)
    )
      dialog.close();
  });
  document.querySelector("#business-inquiry").addEventListener("click", () => {
    inquiry.value =
      business === "greenshift"
        ? "GreenShift design & development"
        : "FAD housing & workers’ accommodation";
    dialog.close();
  });
}

function initMaterialLibrary() {
  const view = document.querySelector("#material-view");
  const toggle = document.querySelector("#material-assembly");
  const image = document.querySelector("#material-image");
  const tabs = document.querySelector("#material-view-tabs");
  const buttons = [...document.querySelectorAll("button[data-material]")];
  let selected = "eps",
    assembled = false,
    selectedView = 0;
  function render() {
    const material = materials[selected];
    view.dataset.material = selected;
    view.dataset.exploded = selected === "ror" ? "true" : String(!assembled);
    buttons.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.material === selected),
      ),
    );
    for (const [id, value] of Object.entries({
      "material-title": material.title,
      "material-kicker": material.kicker,
      "material-view-index": material.index,
      "material-description": material.description,
      "material-explore": material.explore,
      "material-discuss": material.discuss,
      "material-view-label": material.label,
      "material-graphic-title": material.graphic,
      "material-graphic-description": material.graphicDescription,
      "material-source": material.source,
      "material-detail-title": material.detailTitle,
    }))
      document.getElementById(id).textContent = value;
    image.hidden = assembled;
    if (material.views.length) {
      const picture = material.views[selectedView];
      image.src = `./assets/${picture.image}.webp`;
      image.alt = picture.alt;
    }
    document
      .querySelector("#panel-stack")
      .toggleAttribute("hidden", selected !== "eps" || !assembled);
    document
      .querySelector("#roof-study")
      .toggleAttribute("hidden", selected !== "ror" || !assembled);
    toggle.hidden =
      !["eps", "ror"].includes(selected) ||
      (selected === "eps" && selectedView !== 0);
    toggle.setAttribute("aria-pressed", String(assembled));
    toggle.textContent =
      selected === "eps"
        ? assembled
          ? "View exploded build-up"
          : "See assembled stack"
        : assembled
          ? "View roof photography"
          : "Inspect membrane build-up";
    tabs.replaceChildren();
    material.views.forEach((picture, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = picture.label;
      button.setAttribute("aria-pressed", String(index === selectedView));
      button.addEventListener("click", () => {
        selectedView = index;
        assembled = false;
        render();
      });
      tabs.append(button);
    });
    tabs.hidden = !material.views.length;
    const picture = material.views[selectedView];
    view.dataset.origin = picture.concept ? "studio" : "catalogue";
    image.style.maxWidth = "100%";
    document.querySelector("#material-view-description").textContent = assembled
      ? "Illustrative build-up, not to scale. Confirm the actual assembly and project details with Fjäll."
      : picture.note;
    document.querySelector("#material-view-label").textContent = assembled
      ? "Build-up study / Not to scale"
      : `${picture.label} / AI-assisted design illustration`;
    const list = document.querySelector("#material-details");
    list.replaceChildren();
    material.details.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      list.append(li);
    });
    document.querySelector("#material-status").textContent =
      `${material.title}: ${assembled ? "assembled study" : material.views[selectedView]?.label || "concept study"}.`;
  }
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      selected = button.dataset.material;
      assembled = false;
      selectedView = 0;
      render();
    }),
  );
  toggle.addEventListener("click", () => {
    assembled = !assembled;
    render();
  });
  document.querySelector("#material-inquiry").addEventListener("click", () => {
    document.querySelector("#inquiry-interest").value =
      materials[selected].title;
  });
  render();
}

function initBusinessPreviews() {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const saving = navigator.connection?.saveData;
  const films = [...document.querySelectorAll("[data-business-preview]")];
  const pausedByUser = new Set();
  const visible = new Set();
  function sync() {
    const dialogOpen = document.querySelector("#business-dialog").open;
    films.forEach((video) => {
      const allowed =
        visible.has(video) &&
        !document.hidden &&
        !dialogOpen &&
        !pausedByUser.has(video) &&
        !reduced.matches &&
        !saving;
      if (allowed) {
        if (!video.hasAttribute("src")) video.src = video.dataset.src;
        video.play().catch(() => {});
      } else video.pause();
    });
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) =>
        isIntersecting ? visible.add(target) : visible.delete(target),
      );
      sync();
    },
    { threshold: 0.35 },
  );
  films.forEach((video) => observer.observe(video));
  films.forEach((video) => {
    const toggle = document.querySelector(
      `[data-preview-toggle="${video.dataset.businessPreview}"]`,
    );
    video.addEventListener("play", () => {
      video.closest(".business-preview").classList.add("is-playing");
      toggle.textContent = "Pause preview";
      toggle.setAttribute("aria-pressed", "true");
    });
    video.addEventListener("pause", () => {
      video.closest(".business-preview").classList.remove("is-playing");
      toggle.textContent = "Play preview";
      toggle.setAttribute("aria-pressed", "false");
    });
    toggle.addEventListener("click", () => {
      if (!video.paused) {
        pausedByUser.add(video);
        video.pause();
      } else {
        pausedByUser.delete(video);
        if (!video.hasAttribute("src")) video.src = video.dataset.src;
        video.play().catch(() => {});
      }
    });
  });
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);
  const dialog = document.querySelector("#business-dialog");
  new MutationObserver(sync).observe(dialog, {
    attributes: true,
    attributeFilter: ["open"],
  });
}
