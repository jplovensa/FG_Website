import { buildCasePages } from "./case-pages.js";
import { buildBusinessPages } from "./business-pages.js";
import { mkdir, rm, copyFile, cp, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
const root = fileURLToPath(new URL("../", import.meta.url));
// Fail before replacing the previous build if a browser module cannot parse.
for (const file of [
  "app.js",
  "lead-form.js",
  "inquiry-model.js",
  "case-page.js",
  "project-sketch.js",
  "experience.js",
  "journey-planner.js",
  "studio.js",
  "trailer-player.js",
  "construction-scene.js",
]) {
  execFileSync(process.execPath, ["--check", `${root}${file}`], {
    stdio: "inherit",
  });
}
await rm(`${root}dist`, { recursive: true, force: true });
await mkdir(`${root}dist`, { recursive: true });
for (const file of [
  "index.html",
  "styles.css",
  "responsive.css",
  "monograph.css",
  "app.js",
  "lead-form.js",
  "inquiry-model.js",
  "case-page.js",
  "project-sketch.js",
  "experience.js",
  "journey-planner.js",
  "studio.js",
  "trailer-player.js",
  "construction-scene.js",
  "favicon.svg",
  "robots.txt",
  ".nojekyll",
  "CNAME",
]) {
  await copyFile(`${root}${file}`, `${root}dist/${file}`);
}
await cp(`${root}assets`, `${root}dist/assets`, { recursive: true });
for (const directory of ['GreenShift', 'FAD']) {
  await cp(`${root}${directory}`, `${root}dist/${directory}`, { recursive: true });
}
const site = (process.env.SITE_URL || 'https://fjallgroup.com').replace(/\/$/, '');
for (const entry of ['GreenShift/index.html', 'GreenShift/cinematic.html', 'FAD/index.html']) {
  const file = `${root}dist/${entry}`;
  const html = await readFile(file, 'utf8');
  await writeFile(file, html.replaceAll('https://fjallgroup.com/', `${site}/`));
}
// Also keep the source-root Pages publishing path and local dev links working.
await buildCasePages(root.replace(/\/$/, ""));
await buildCasePages(`${root}dist`);
await buildBusinessPages(root.replace(/\/$/, ""));
await buildBusinessPages(`${root}dist`);
console.log("Built static site in dist/ — no runtime dependencies.");
