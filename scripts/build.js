import { mkdir, rm, copyFile, cp } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
await rm(`${root}dist`, { recursive: true, force: true });
await mkdir(`${root}dist`, { recursive: true });
for (const file of [
  "index.html",
  "styles.css",
  "app.js",
  "experience.js",
  "favicon.svg",
  "robots.txt",
  ".nojekyll",
]) {
  await copyFile(`${root}${file}`, `${root}dist/${file}`);
}
await cp(`${root}assets`, `${root}dist/assets`, { recursive: true });
console.log("Built static site in dist/ — no runtime dependencies.");
