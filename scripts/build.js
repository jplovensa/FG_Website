import { buildCasePages } from "./case-pages.js";
import { mkdir, rm, copyFile, cp } from "node:fs/promises";
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
]) {
  await copyFile(`${root}${file}`, `${root}dist/${file}`);
}
await cp(`${root}assets`, `${root}dist/assets`, { recursive: true });
// Also keep the source-root Pages publishing path and local dev links working.
await buildCasePages(root.replace(/\/$/, ""));
await buildCasePages(`${root}dist`);
console.log("Built static site in dist/ — no runtime dependencies.");
