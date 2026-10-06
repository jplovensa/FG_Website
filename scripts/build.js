import { mkdir, rm, copyFile, cp } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
const root = fileURLToPath(new URL("../", import.meta.url));
// Fail before replacing the previous build if a browser module cannot parse.
for (const file of [
  "app.js",
  "experience.js",
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
  "app.js",
  "experience.js",
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
console.log("Built static site in dist/ — no runtime dependencies.");
