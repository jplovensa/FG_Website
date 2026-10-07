import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { materials } from "../studio.js";
import { createProjectGeometry } from "../project-sketch.js";
import { caseStudies } from "../case-studies.js";

test("all project sketch buffers contain finite, complete triangle and line geometry", () => {
  for (const p of caseStudies) {
    const { faces, lines, radius } = createProjectGeometry(p.slug);
    assert.ok(faces.length > 0 && faces.length % 18 === 0, p.slug);
    assert.ok(lines.length > 0 && lines.length % 12 === 0, p.slug);
    assert.ok([...faces, ...lines].every(Number.isFinite), p.slug);
    assert.ok(Number.isFinite(radius) && radius > 0);
  }
});

test("each material has three distinct, shipped material, usage and preparation images", async () => {
  const used = new Set();
  for (const material of Object.values(materials)) {
    assert.deepEqual(
      material.views.map((v) => v.label),
      ["Material", "Usage", "Preparation"],
    );
    for (const view of material.views) {
      assert.ok(!used.has(view.image), `Repeated illustration: ${view.image}`);
      used.add(view.image);
      assert.ok(view.concept && view.note && view.alt);
      assert.ok((await stat(`dist/assets/${view.image}.webp`)).size > 0);
    }
  }
});

test("housing study ships deck imagery and sketch fallback without commercial figures", async () => {
  const html = await readFile("dist/projects/housing.html", "utf8");
  assert.match(html, /250\+ homes/);
  assert.match(html, /housing-layout.webp/);
  assert.match(html, /housing-foundation.webp/);
  assert.match(html, /data-project-sketch="housing"/);
  assert.match(html, /sketch-fallback/);
  assert.doesNotMatch(
    html,
    /\b(?:pricing|price|baseline turnkey|commercial proposition)\b|Rp\s*[\d.,]+/i,
  );
});
