import { mkdir, writeFile } from "node:fs/promises";
import { caseStudies } from "../case-studies.js";
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export async function buildCasePages(target) {
  await mkdir(`${target}/projects`, { recursive: true });
  const site = (
    process.env.SITE_URL || "https://jplovensa.github.io/FG_Website"
  ).replace(/\/$/, "");
  for (const [i, p] of caseStudies.entries()) {
    const home = "../index.html";
    const inquiry = `${home}?${new URLSearchParams({ interest: p.interest, project: p.title, source: `project:${p.slug}` })}#contact`;
    const next = caseStudies[(i + 1) % caseStudies.length];
    const plate = `<div class="programme-plate"><span class="eyebrow">${esc(p.record)}</span><strong>${esc(p.facts[0][1])}</strong><span>${esc(p.title)}</span><span class="plate-lines" aria-hidden="true"></span></div>`;
    const imageSize = {
      "housing-olive": [942, 530],
      nuanu: [1000, 750],
      ulaman: [1000, 667],
      lombok: [1000, 782],
      "bamboo-lab": [1000, 715],
      pods: [1000, 667],
      "retrofit-interior": [1280, 720],
    }[p.image];
    const image = p.image
      ? `<img src="../assets/${p.image}.webp" alt="${esc(p.title)} — imagery from the supplied ${p.slug === "retrofit" ? "project film" : p.slug === "housing" ? "FAD deck / design reference" : "company profile"}" width="${imageSize[0]}" height="${imageSize[1]}" fetchpriority="high"/>`
      : plate;
    const film =
      p.slug === "retrofit"
        ? `<section class="case-film"><div class="section-label"><span class="eyebrow">The project film</span><span class="eyebrow">00:51 / Sound available</span></div><video controls playsinline preload="none" poster="../assets/retrofit-poster.webp" aria-label="Garuda Spark Innovation Hub project film"><source src="../assets/retrofit.mp4" type="video/mp4"/></video></section>`
        : "";
    const commission = p.commission
      ? `<section class="case-commission" aria-label="Project and commissioning organisation"><span class="case-hub-logo institutional-logo hub-logo"><img src="../assets/institutional-marks.webp" alt="Garuda Spark Innovation Hub by KOMDIGI" width="2172" height="724" loading="lazy"/></span><figure class="commission-logos"><figcaption>Commissioned by</figcaption><span class="institutional-logo ministry-logo"><img src="../assets/institutional-marks.webp" alt="KOMDIGI — Kementerian Komunikasi dan Digital Republik Indonesia" width="2172" height="724" loading="lazy"/></span></figure></section>`
      : "";
    const sourceCaption =
      p.imageSource ||
      (p.slug === "retrofit"
        ? "Still from the supplied flagship retrofit film."
        : p.image
          ? "Imagery from the 2026 company profile; photography/render status is not independently verified."
          : "Programme summary from the 2026 company profile. No project photography is supplied.");
    const controls = `<div class="sketch-controls" hidden><button type="button" data-sketch-play aria-pressed="false">Play camera</button><div><button type="button" data-sketch-rotate="-.2" aria-label="Rotate sketch left">←</button><button type="button" data-sketch-reset>Reset view</button><button type="button" data-sketch-rotate=".2" aria-label="Rotate sketch right">→</button></div></div>`;
    const cover = `<figure class="case-cover"><div class="project-sketch" data-project-sketch="${esc(p.slug)}"><div class="sketch-fallback">${image}</div><canvas hidden tabindex="0" role="img" aria-label="Interactive architectural massing sketch for ${esc(p.title)}. Use the left and right arrow keys or controls to rotate."></canvas><span class="sketch-caption" aria-hidden="true">Fjäll / Form study ${String(i + 1).padStart(2, "0")}</span>${controls}</div><figcaption>Cinematic architectural sketch / Illustrative massing, not a measured model of the project. Drag horizontally or use the camera controls.</figcaption></figure>`;
    const reference =
      p.slug === "housing"
        ? `<section class="case-housing-gallery" aria-labelledby="housing-design-title"><div class="section-label"><span class="eyebrow">FAD / The design references</span><span class="eyebrow">Supplied FAD deck</span></div><h2 id="housing-design-title">A home, repeated.<br/>A place, made personal.</h2><p>A 36 m² base-unit concept, coordinated openings and a choice of exterior expressions. These are supplied design references for the 250+ programme story, rather than photographs of completed programme homes.</p><div class="housing-design-grid">${[
            ["housing-olive", "Olive / Exterior expression", 942, 530],
            ["housing-earth", "Earth / Exterior expression", 389, 271],
            ["housing-yellow", "Golden / Exterior expression", 894, 530],
            ["housing-purple", "Purple / Exterior expression", 762, 452],
            ["housing-layout", "36 m² / Supplied layout study", 770, 955],
            [
              "housing-foundation",
              "Foundation / Supplied detail study",
              1592,
              672,
            ],
          ]
            .map(
              ([file, label, w, h]) =>
                `<figure><img src="../assets/${file}.webp" alt="${label} from the FAD deck — design reference, not completed-programme photography" width="${w}" height="${h}" loading="lazy"/><figcaption>${label}</figcaption></figure>`,
            )
            .join("")}</div></section>`
        : `<figure class="case-reference">${image}<figcaption>${esc(sourceCaption)}</figcaption></figure>`;
    const system = !["retrofit", "sport", "housing"].includes(p.slug)
      ? `<figure class="case-system"><img src="../assets/gx100-layers.webp" alt="GX-100 nine-layer build-up from the product knowledge deck" width="1200" height="675" loading="lazy"/><figcaption>Product Knowledge / GX-100 layer study; not a project-specific construction drawing. <a href="${home}#materials">Explore the material studio ↗</a></figcaption></figure>`
      : "";
    const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" content="#163c35"/><title>${esc(p.title)} — Fjäll Group</title><meta name="description" content="${esc(p.description)}"/><meta property="og:title" content="${esc(p.title)} — Fjäll Group"/><meta property="og:description" content="${esc(p.headline)}"/><meta property="og:type" content="article"/><meta property="og:url" content="${site}/projects/${p.slug}.html"/><meta property="og:image" content="${site}/assets/${p.image || "fjall-logo"}.${p.image ? "webp" : "png"}"/><link rel="canonical" href="${site}/projects/${p.slug}.html"/><link rel="icon" href="../favicon.svg"/><link rel="stylesheet" href="../styles.css"/><link rel="stylesheet" href="../responsive.css"/><link rel="stylesheet" href="../monograph.css?v=sketch-studio-1"/><script src="../case-page.js?v=sketch-studio-1" type="module"></script></head><body class="case-page" data-case="${p.slug}"><a class="skip-link" href="#main">Skip to content</a><header class="case-header"><a class="brand" href="${home}" aria-label="Fjäll Group home"><img src="../assets/fjall-logo.png" alt="Fjäll Group" width="2048" height="716"/></a><a class="case-back" href="${home}#projects">← Project index</a><a class="case-header-cta" href="${inquiry}">Discuss your project ↗</a></header><main id="main"><section class="case-intro"><p class="eyebrow">Fjäll Group / ${esc(p.sector)} / ${String(i + 1).padStart(2, "0")}</p><h1>${esc(p.title)}</h1><p class="case-deck">${esc(p.headline)}</p><div class="case-location"><span>${esc(p.location)}</span><span>${esc(p.record)}</span></div></section>${cover}<section class="case-evidence"><dl class="case-facts">${p.facts.map(([key, value]) => `<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl><div class="case-role"><p class="eyebrow">Fjäll’s documented contribution</p><p>${esc(p.role)}</p>${p.credit ? `<p class="case-credit">${esc(p.credit)}</p>` : ""}<p class="case-credit">Project-specific dates, delivery status and detailed scope are available from the team.</p></div></section><section class="case-narrative"><article><span class="eyebrow">01 / The brief</span><h2>${esc(p.challenge)}</h2></article><article><span class="eyebrow">02 / The approach</span><p>${esc(p.approach)}</p><p class="case-materials">${esc(p.materials)}</p></article></section>${reference}${film}${commission}${system}<section class="case-takeaway"><span class="eyebrow">03 / Thinking for your project</span><h2>${esc(p.takeaway)}</h2><a class="button button-dark" href="${inquiry}">Discuss a similar project ↗</a><p>No finished brief needed. Start with a place, a question or an ambition.</p></section><a class="case-next" href="./${next.slug}.html"><span class="eyebrow">Continue the monograph</span><span>${esc(next.title)} ↗</span></a></main><footer class="case-footer"><span>Fjäll Group / Design. Systems. Delivery.</span><a href="${home}#contact">Commercial Office / IDX Tower 1, 3rd floor, Jakarta ↗</a><a href="https://wa.me/6287786010290" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></footer><nav class="case-mobile-actions" aria-label="Project actions"><a href="${home}#projects">← Project index</a><a href="${inquiry}">Discuss your project ↗</a></nav></body></html>`;
    await writeFile(
      `${target}/projects/${p.slug}.html`,
      html.replaceAll(
        "↗",
        '<svg class="arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>',
      ),
    );
  }
  await writeFile(
    `${target}/sitemap.xml`,
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${site}/</loc></url>${caseStudies.map((p) => `<url><loc>${site}/projects/${p.slug}.html</loc></url>`).join("")}</urlset>`,
  );
}
