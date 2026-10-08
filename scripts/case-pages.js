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
      "bamboo-lab-clean": [1000, 716],
      pods: [1000, 667],
      "retrofit-interior": [1280, 720],
    }[p.image];
    const image = p.image
      ? `<img src="../assets/${p.image}.webp" alt="${esc(p.title)} — ${p.slug === "housing" ? "FAD exterior design study" : "architectural view"}" width="${imageSize[0]}" height="${imageSize[1]}" fetchpriority="high"/>`
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
        ? "Garuda Spark Innovation Hub / Malang Creative Center"
        : `${p.title} / ${p.sector}`);
    const cover = `<figure class="case-cover">${image}<figcaption>${esc(sourceCaption)}</figcaption></figure>`;
    const reference =
      p.slug === "housing"
        ? `<section class="case-housing-gallery" aria-labelledby="housing-design-title"><div class="section-label"><span class="eyebrow">FAD / The home and its details</span><span class="eyebrow">Exterior · Layout · Foundation</span></div><h2 id="housing-design-title">A home, repeated.<br/>A place, made personal.</h2><p>A 36 m² base-unit concept pairs coordinated openings with a choice of exterior expressions. Explore the design studies, floor plan and foundation detail behind a repeatable home.</p><div class="housing-design-grid">${[
            ["housing-olive", "Olive / Exterior expression", 942, 530],
            ["housing-earth", "Earth / Exterior expression", 389, 271],
            ["housing-yellow", "Golden / Exterior expression", 894, 530],
            ["housing-purple", "Purple / Exterior expression", 762, 452],
            ["housing-layout", "36 m² / Layout study", 770, 955],
            ["housing-foundation", "Foundation / Detail study", 1592, 672],
          ]
            .map(
              ([file, label, w, h]) =>
                `<figure><img src="../assets/${file}.webp" alt="${label} — FAD design study" width="${w}" height="${h}" loading="lazy"/><figcaption>${label}</figcaption></figure>`,
            )
            .join("")}</div></section>`
        : "";
    const system = !["retrofit", "sport", "housing"].includes(p.slug)
      ? `<figure class="case-system"><img src="../assets/gx100-layers.webp" alt="GX-100 nine-layer panel build-up" width="1200" height="675" loading="lazy"/><figcaption>GX-100 / Material layer study. <a href="${home}#materials">Explore the material studio ↗</a></figcaption></figure>`
      : "";
    const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" content="#163c35"/><title>${esc(p.title)} — Fjäll Group</title><meta name="description" content="${esc(p.description)}"/><meta property="og:title" content="${esc(p.title)} — Fjäll Group"/><meta property="og:description" content="${esc(p.headline)}"/><meta property="og:type" content="article"/><meta property="og:url" content="${site}/projects/${p.slug}.html"/><meta property="og:image" content="${site}/assets/${p.image || "fjall-logo"}.${p.image ? "webp" : "png"}"/><link rel="canonical" href="${site}/projects/${p.slug}.html"/><link rel="icon" href="../favicon.svg"/><link rel="stylesheet" href="../styles.css"/><link rel="stylesheet" href="../responsive.css"/><link rel="stylesheet" href="../monograph.css?v=selected-sketch-2"/><script src="../case-page.js?v=selected-sketch-2" type="module"></script></head><body class="case-page" data-case="${p.slug}"><a class="skip-link" href="#main">Skip to content</a><header class="case-header"><a class="brand" href="${home}" aria-label="Fjäll Group home"><img src="../assets/fjall-logo.png" alt="Fjäll Group" width="2048" height="716"/></a><a class="case-back" href="${home}#projects">← Project index</a><a class="case-header-cta" href="${inquiry}">Discuss your project ↗</a></header><main id="main"><section class="case-intro"><p class="eyebrow">Fjäll Group / ${esc(p.sector)} / ${String(i + 1).padStart(2, "0")}</p><h1>${esc(p.title)}</h1><p class="case-deck">${esc(p.headline)}</p><div class="case-location"><span>${esc(p.location)}</span><span>${esc(p.record)}</span></div></section>${cover}<section class="case-evidence"><dl class="case-facts">${p.facts.map(([key, value]) => `<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl><div class="case-role"><p class="eyebrow">Fjäll’s role</p><p>${esc(p.role)}</p>${p.credit ? `<p class="case-credit">${esc(p.credit)}</p>` : ""}</div></section><section class="case-narrative"><article><span class="eyebrow">01 / The brief</span><h2>${esc(p.challenge)}</h2></article><article><span class="eyebrow">02 / The approach</span><p>${esc(p.approach)}</p><p class="case-materials">${esc(p.materials)}</p></article></section>${reference}${film}${commission}${system}<section class="case-takeaway"><span class="eyebrow">03 / Your next project</span><h2>${esc(p.takeaway)}</h2><a class="button button-dark" href="${inquiry}">Discuss a similar project ↗</a><p>No finished brief needed. Start with a place, a question or an ambition.</p></section><a class="case-next" href="./${next.slug}.html"><span class="eyebrow">Next in the collection</span><span>${esc(next.title)} ↗</span></a></main><footer class="case-footer"><span>Fjäll Group / Design. Systems. Delivery.</span><a href="${home}#contact">Commercial Office / IDX Tower 1, 3rd floor, Jakarta ↗</a><a href="https://wa.me/6287786010290" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></footer><nav class="case-mobile-actions" aria-label="Project actions"><a href="${home}#projects">← Project index</a><a href="${inquiry}">Discuss your project ↗</a></nav></body></html>`;
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
