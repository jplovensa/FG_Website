// Local planning only: no estimates, submitted leads or visitor storage.
export const planningStages = [
  {
    question: "What should lead your brief?",
    options: [
      ["Design freedom", "Bring references and a site plan. GreenShift can explore the form before the building system is specified."],
      ["Repeatable spaces", "Bring your target number of homes or rooms. We can explore repeatable layouts and phased delivery."],
      ["An existing building", "Bring existing drawings and photographs. The first conversation should establish what can be retained and what needs assessment."],
    ],
    fjall: "Define the experience, site constraints and delivery approach together. Assess where EPS panels and modular systems fit your brief.",
    conventional: "Define the brief with the architect and engineers, then develop a structure and construction approach suited to the site.",
  },
  {
    question: "Where is your design today?",
    options: [
      ["An idea or references", "Start with a concept and site constraints. You do not need a finished design to begin the conversation."],
      ["A layout to develop", "Share your layout. We can review it against panel dimensions, services and the intended construction sequence."],
      ["Coordinated drawings", "Share the drawing set for a system and interface review before any production scope is agreed."],
    ],
    fjall: "Coordinate architecture, engineering, panel or module interfaces and services before releasing components for production.",
    conventional: "Coordinate architecture, engineering and services for site construction. Masonry and concrete work follow the agreed drawings and specifications.",
  },
  {
    question: "How ready is the site?",
    options: [
      ["Still assessing a site", "Check access, surveys and local approvals first. Production planning needs confirmed site information."],
      ["Access and surveys known", "Share survey information and delivery access. These help define component sizes, logistics and the site preparation sequence."],
      ["Foundations being planned", "Coordinate foundation tolerances, services and delivery dates with the site team before component production is released."],
    ],
    fjall: "Prepare specified components off site while the project team coordinates site readiness, foundations, delivery access and approvals.",
    conventional: "Plan material procurement, storage and site labour. Formwork, reinforcement, concrete and masonry are prepared or installed through the site sequence.",
  },
  {
    question: "How should the build be organised?",
    options: [
      ["One complete build", "Align the component delivery sequence with site readiness, installation teams and finishing trades."],
      ["A phased programme", "Define the first phase and repeatable unit types. Agree infrastructure and handover boundaries for each phase."],
      ["An occupied building", "Map working hours, access and occupied zones. A retrofit needs an agreed plan to manage disruption and protect retained spaces."],
    ],
    fjall: "Assemble prepared components on a ready site, then complete connections, services and finishes with the agreed quality checks.",
    conventional: "Construct the structure and envelope through site trades, allowing for the specified curing and inspection sequence before services and finishes.",
  },
  {
    question: "Who will use the finished space?",
    options: [
      ["An owner or family", "Agree the walk-through, outstanding items and maintenance information before taking possession."],
      ["Residents or workers", "Plan phased occupation, shared facilities and maintenance responsibilities with the operating team."],
      ["Guests or an operating team", "Agree commissioning, staff orientation and the handover information needed to operate the space."],
    ],
    fjall: "Complete inspections and commissioning, record outstanding items and hand over the agreed building and maintenance information.",
    conventional: "Complete inspections and commissioning, record outstanding items and hand over the agreed building and maintenance information.",
  },
];
export const projectLabels = {
  home: "A home", hospitality: "A hospitality space", retrofit: "An existing building",
  modular: "A modular development", housing: "Mass-scale housing", workers: "Workers’ accommodation",
};
export function createPlan() {
  return { type: "home", location: "", scale: "", timing: "", choices: Array(5).fill(null) };
}
export function planBrief(plan) {
  const lines = [`My project: ${projectLabels[plan.type] || projectLabels.home}.`];
  for (const [key, label] of [["location", "Location"], ["scale", "Scale"], ["timing", "Preferred timing"]]) {
    if (plan[key]?.trim()) lines.push(`${label}: ${plan[key].trim()}`);
  }
  planningStages.forEach((stage, index) => {
    const option = stage.options[plan.choices[index]];
    if (option) lines.push(`${stage.question} ${option[0]}.`);
  });
  lines.push("I’d like to discuss the suitability of EPS and modular construction, the design scope and next steps for my site.");
  return lines.join("\n");
}
export function planInterest(type) {
  return type === "retrofit" ? "Retrofit project" : ["housing", "workers"].includes(type)
    ? "FAD housing & workers’ accommodation" : "GreenShift design & development";
}
// Replace only a previously generated brief; retain any visitor-written notes.
export function mergePlanNotes(current, previous, incoming, limit = 2400) {
  const ownNotes = previous && current.includes(previous) ? current.replace(previous, "").trim() : current.trim();
  if (ownNotes === incoming.trim()) return ownNotes;
  return [ownNotes, incoming].filter(Boolean).join("\n\n").slice(0, limit);
}
