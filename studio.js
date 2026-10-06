// Lightweight, user-controlled illustrations and the WhatsApp inquiry handoff.
const whatsappNumber = "6287786010290";
const materials = {
  eps: {
    title: "EPS · GX-100 Panel",
    kicker: "01 / Insulated envelope",
    index: "01 — EPS",
    description:
      "An insulated EPS panel system for the building envelope. Explore the relationship between the panel core, its surfaces and the finished space.",
    explore: "Core, panel surfaces and finish.",
    discuss: "Your envelope specification, openings and assembly interfaces.",
    label: "Envelope / Three-part study",
    graphic: "EPS panel concept",
    graphicDescription:
      "A layered illustration of the panel envelope, insulated core and finish.",
  },
  bemmel: {
    title: "Bemmel",
    kicker: "02 / Basalt composite system",
    index: "02 — Bemmel",
    description:
      "Volcanic basalt fibre and advanced composites form the basis of lightweight structural elements. Explore how members connect within a coordinated building system.",
    explore: "Structural members, connections and the building interface.",
    discuss:
      "Project loads, spans, connection details and the engineered specification.",
    label: "Structure / Connection study",
    graphic: "Bemmel structural concept",
    graphicDescription:
      "Composite structural members crossing over a foundation plane.",
  },
  ror: {
    title: "RoR roof",
    kicker: "03 / Roof assembly study",
    index: "03 — RoR",
    description:
      "Begin with the roof as a complete assembly. Explore its geometry and layers, then coordinate the roof with the structure and the building envelope.",
    explore: "Roof geometry, layers and the supporting structure.",
    discuss:
      "The RoR system specification, drainage, roof interfaces and finishes for your site.",
    label: "Roof / Assembly concept",
    graphic: "RoR roof concept",
    graphicDescription:
      "A roof form above a layer and supporting frame; a concept study rather than a product detail.",
  },
  scale: {
    title: "Materials at scale",
    kicker: "04 / Coordinated material supply",
    index: "04 — Scale",
    description:
      "A building system becomes a delivery programme. Bring material selection, quantities, production and site logistics into one coordinated plan for repeatable development.",
    explore:
      "Repeated component packs, coordinated quantities and staged delivery.",
    discuss:
      "Your programme, material schedule, production capacity and delivery sequence.",
    label: "Supply / Repeatable component packs",
    graphic: "Material supply at scale",
    graphicDescription:
      "Component packs arranged in a repeated grid to illustrate coordinated material supply.",
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

function createScaleStudy() {
  const svgNS = "http://www.w3.org/2000/svg";
  const group = document.querySelector("#material-scale-packs");
  for (let i = 0; i < 9; i++) {
    const pack = document.createElementNS(svgNS, "g");
    const x = 294 + (i % 3) * 70 - Math.floor(i / 3) * 75;
    const y = 177 + (i % 3) * 40 + Math.floor(i / 3) * 42;
    pack.setAttribute("transform", `translate(${x} ${y})`);
    for (let layer = 0; layer < 3; layer++) {
      const surface = document.createElementNS(svgNS, "path");
      surface.setAttribute("d", "m0 0 48-28 54 31-48 28Z");
      surface.setAttribute("fill", ["#72907b", "#a6b99c", "#e1e6d6"][layer]);
      surface.setAttribute("stroke", "#5f7b62");
      surface.setAttribute("stroke-width", ".8");
      surface.setAttribute("transform", `translate(0 ${-layer * 8})`);
      pack.append(surface);
    }
    group.append(pack);
  }
}

export function initStudio() {
  initBusinessStudies();
  initMaterialLibrary();
  initInquiry();
}

function initBusinessStudies() {
  const dialog = document.querySelector("#business-dialog");
  const simulation = document.querySelector("#business-simulation");
  const stageButtons = [
    ...dialog.querySelectorAll("button[data-design-stage]"),
  ];
  const count = document.querySelector("#housing-count");
  const inquiry = document.querySelector("#inquiry-interest");
  let business = "greenshift";
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
          ? "Explore how a clear brief becomes a coordinated architectural concept."
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
  createScaleStudy();
  const view = document.querySelector("#material-view");
  const toggle = document.querySelector("#material-assembly");
  const buttons = [...document.querySelectorAll("[data-material]")].filter(
    (element) => element.tagName === "BUTTON",
  );
  let selected = "eps";
  let assembled = false;
  function render() {
    const material = materials[selected];
    view.dataset.material = selected;
    view.dataset.exploded = String(!assembled);
    view
      .querySelectorAll("[data-material-art]")
      .forEach((art) =>
        art.toggleAttribute("hidden", art.dataset.materialArt !== selected),
      );
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
    }))
      document.getElementById(id).textContent = value;
    toggle.hidden = selected === "scale";
    toggle.setAttribute("aria-pressed", String(assembled));
    toggle.textContent = assembled
      ? "Separate the layers"
      : "Bring layers together";
    document.querySelector("#material-status").textContent =
      `${material.title}: ${selected === "scale" ? "component supply study" : assembled ? "assembled concept" : "separated concept"}.`;
  }
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      selected = button.dataset.material;
      assembled = false;
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

export function buildInquiryLink(fields) {
  const value = (key) => String(fields.get(key) || "").trim();
  const message = [
    "Hello Fjäll Group, I’d like to discuss a project.",
    "",
    `Name: ${value("name")}`,
    `Email: ${value("email")}`,
    ...(value("company") ? [`Company: ${value("company")}`] : []),
    `Interest: ${value("interest")}`,
    ...(value("location") ? [`Project location: ${value("location")}`] : []),
    "",
    value("text"),
  ].join("\n");
  const url = new URL(`https://wa.me/${whatsappNumber}`);
  url.searchParams.set("text", message);
  return url.href;
}

function initInquiry() {
  const form = document.querySelector("#inquiry-form");
  const status = document.querySelector("#inquiry-status");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    // Browser required validation does not reject whitespace-only text.
    for (const id of ["inquiry-name", "inquiry-message"]) {
      const input = document.getElementById(id);
      if (!input.value.trim()) {
        input.setCustomValidity(
          "Please enter a few details before continuing.",
        );
        input.reportValidity();
        return;
      }
    }
    const url = buildInquiryLink(fields);
    status.textContent =
      "Opening your WhatsApp draft. Review it and press Send in WhatsApp.";
    window.open(url, "_blank", "noopener,noreferrer");
  });
  for (const id of ["inquiry-name", "inquiry-message"]) {
    document.getElementById(id).addEventListener("input", (event) => {
      event.target.setCustomValidity("");
      status.textContent = "";
    });
  }
}
