import { mergePlanNotes } from "./journey-planner.js";
import { buildInquiryLink, validContact } from "./inquiry-model.js";
// Integration events contain categories only, never visitor contact or brief text.
export function track(name, details = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("fjall:metric", { detail: { name, ...details } }),
  );
}
export function initLeadForm() {
  const form = document.querySelector("#inquiry-form");
  if (!form) return;
  const status = document.querySelector("#inquiry-status");
  const submit = document.querySelector("#inquiry-submit");
  const fallback = document.querySelector("#inquiry-fallback");
  const contact = document.querySelector("#inquiry-email");
  const interest = document.querySelector("#inquiry-interest");
  let enabled = false,
    started = false;
  const attribution = Object.fromEntries(
    [...new URLSearchParams(location.search)].filter(([k]) =>
      [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "utm_term",
      ].includes(k),
    ),
  );
  function setContext(topic, project = "", source = "") {
    if ([...interest.options].some((o) => o.value === topic))
      interest.value = topic;
    form.elements.project.value = project;
    form.elements.source.value = source;
    document.querySelector("#contact-project").textContent = project
      ? `Inspired by ${project}? Tell us about your own project.`
      : `Let’s discuss ${interest.value === "General inquiry" ? "your project" : interest.value}. Bring a site, an ambition or a first question.`;
  }
  let previousPlan = "";
  document.addEventListener("fjall:journey-brief", ({ detail }) => {
    setContext(detail.interest, "", detail.source);
    for (const key of ["location", "scale", "timing"]) {
      if (detail[key].trim()) form.elements[key].value = detail[key];
    }
    form.elements.text.value = mergePlanNotes(form.elements.text.value, previousPlan, detail.text);
    previousPlan = detail.text;
    document.querySelector("#contact-project").textContent = "Your project plan is here. Add your contact details and any questions, then continue on WhatsApp.";
  });
  const params = new URLSearchParams(location.search);
  if (params.has("interest"))
    setContext(
      params.get("interest"),
      (params.get("project") || "").slice(0, 180),
      (params.get("source") || "").slice(0, 200),
    );
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    if (link.dataset.interest) setContext(link.dataset.interest, "", "service");
    if (link.id === "material-inquiry")
      setContext(interest.value, "", "material");
    if (link.id === "business-inquiry")
      setContext(interest.value, "", "business-studio");
    if (link.href.includes("wa.me/"))
      track("whatsapp_handoff", { source: "direct" });
  });
  interest.addEventListener("change", () =>
    setContext(
      interest.value,
      form.elements.project.value,
      form.elements.source.value,
    ),
  );
  form.addEventListener("input", (event) => {
    event.target.setCustomValidity?.("");
    status.textContent = "";
    if (!started) {
      started = true;
      track("inquiry_start", {
        source: form.elements.source.value || "homepage",
      });
    }
  });
  async function capability() {
    if (location.hostname.endsWith("github.io")) return;
    try {
      const r = await fetch(form.dataset.api, {
        signal: AbortSignal.timeout(4000),
      });
      if (r.ok) enabled = (await r.json()).enabled === true;
    } catch {
      /* A static host keeps the complete WhatsApp route. */
    }
    if (enabled) {
      submit.textContent = "Send project inquiry";
      document.querySelector(".inquiry-note").textContent =
        "Send your brief to our commercial team. You can also continue the conversation on WhatsApp.";
    }
  }
  const bar = document.querySelector("#mobile-lead-bar");
  if (bar) {
    let heroVisible = true,
      contactVisible = false;
    const update = () => {
      bar.hidden =
        heroVisible ||
        contactVisible ||
        document.body.classList.contains("intro-active");
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target.id === "home") heroVisible = entry.isIntersecting;
        else contactVisible = entry.isIntersecting;
      }
      update();
    });
    observer.observe(document.querySelector("#home"));
    observer.observe(document.querySelector("#contact"));
  }
  const ready = capability();
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    for (const id of ["inquiry-name", "inquiry-message"]) {
      const el = document.getElementById(id);
      el.setCustomValidity(
        el.value.trim() ? "" : "Please enter a few details.",
      );
    }
    contact.setCustomValidity(
      validContact(contact.value.trim())
        ? ""
        : "Enter a valid email address or WhatsApp number.",
    );
    if (!form.reportValidity()) return;
    const fields = new FormData(form),
      url = buildInquiryLink(fields);
    fallback.href = url;
    fallback.hidden = false;
    // Keep WhatsApp navigation in the click stack so browsers permit the new tab.
    if (!enabled) {
      status.textContent =
        "Your WhatsApp draft is ready. Review it and press Send in WhatsApp. If no new tab opens, use the link below.";
      track("whatsapp_handoff", { source: fields.get("source") || "form" });
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    submit.disabled = true;
    form.setAttribute("aria-busy", "true");
    status.textContent = "Sending your project brief…";
    try {
      await ready;
      const response = await fetch(form.dataset.api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(fields), attribution }),
        signal: AbortSignal.timeout(12000),
      });
      const result = await response.json();
      if (!response.ok || result.accepted !== true) throw new Error("delivery");
      status.textContent =
        "Your inquiry has been received by our commercial team. You can continue on WhatsApp using the link below.";
      track("inquiry_received", { source: fields.get("source") || "homepage" });
    } catch {
      status.textContent =
        "We couldn’t confirm delivery. Your brief is still here. Try again or send the prepared WhatsApp draft below.";
      track("inquiry_delivery_failed");
    } finally {
      submit.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });
}
