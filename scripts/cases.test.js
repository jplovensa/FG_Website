import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { caseStudies } from "../case-studies.js";
test("all nine case studies ship with shareable metadata, local media and contextual inquiries", async () => {
  assert.equal(caseStudies.length, 9);
  for (const project of caseStudies) {
    const html = await readFile(`dist/projects/${project.slug}.html`, "utf8");
    assert.ok(html.includes('property="og:title"'));
    assert.ok(html.includes('rel="canonical"'));
    const link = html
      .match(/href="(\.\.\/index\.html\?[^" ]+)"/)[1]
      .replaceAll("&amp;", "&");
    const url = new URL(
      link,
      "https://example.test/FG_Website/projects/nuanu.html",
    );
    assert.equal(url.searchParams.get("project"), project.title);
    assert.equal(url.searchParams.get("interest"), project.interest);
    assert.equal(url.hash, "#contact");
    assert.ok(!html.includes("undefined"));
    assert.ok(!html.includes("null"));
    for (const match of html.matchAll(/(?:src|href|poster)="(\.\.\/[^"?#]+)"/g))
      assert.ok(
        (
          await stat(new URL(`../dist/projects/${match[1]}`, import.meta.url))
        ).isFile(),
      );
  }
  const html = await readFile("dist/index.html", "utf8");
  assert.ok(html.indexOf('id="selected-work"') < html.indexOf('id="about"'));
  const sitemap = await readFile("dist/sitemap.xml", "utf8");
  for (const p of caseStudies)
    assert.ok(sitemap.includes(`/projects/${p.slug}.html`));
});
