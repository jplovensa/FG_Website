import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";

const servers = [];
let origin;
let pagesOrigin;
before(async () => {
  async function launch(basePath) {
    const server = spawn(
      process.execPath,
      ["scripts/serve.js", "--dist", `--base-path=${basePath}`],
      {
        cwd: new URL("../", import.meta.url),
        env: { ...process.env, PORT: "0" },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    servers.push(server);
    const [output] = await once(server.stdout, "data");
    return `http://127.0.0.1:${/port (\d+)/.exec(output.toString())[1]}${basePath}`;
  }
  [origin, pagesOrigin] = await Promise.all([
    launch("/"),
    launch("/FG_Website/"),
  ]);
});
after(() => servers.forEach((server) => server.kill()));

for (const basePath of ["/", "/FG_Website/"]) {
  test(`production HTML and JavaScript assets load when hosted at ${basePath}`, async () => {
    const base = basePath === "/" ? origin : pagesOrigin;
    const page = await fetch(base);
    assert.equal(page.status, 200);
    const html = await page.text();
    const assets = [...html.matchAll(/(?:src|href|poster)="(\.?\/?[^"#]+)"/g)]
      .map((match) => match[1])
      .filter((asset) => !/^[a-z]+:/i.test(asset));
    assert.ok(
      assets.length >= 8,
      "Must discover stylesheet, script, poster and portfolio images",
    );
    const js = await (await fetch(new URL("./app.js", base))).text();
    const videos = [...js.matchAll(/['"]([^'"]+\.mp4)['"]/g)].map(
      (match) => match[1],
    );
    assert.equal(videos.length, 2, "Must check both dynamic video sources");
    const imports = [...js.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(
      (match) => match[1],
    );
    const experience = await (
      await fetch(new URL("./experience.js", base))
    ).text();
    const sceneImports = [
      ...experience.matchAll(/import\(['"]([^'"]+)['"]\)/g),
    ].map((match) => match[1]);
    assert.ok(
      sceneImports.includes("./construction-scene.js"),
      "The scene must be available as a lazy module",
    );
    imports.push(...sceneImports);
    const css = await (await fetch(new URL("./styles.css", base))).text();
    const fonts = [...css.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)].map(
      (match) => match[1],
    );
    assert.ok(
      imports.includes("./experience.js"),
      "Interactive experience module must be shipped",
    );
    assert.ok(
      fonts.includes("./assets/fonts/inter-latin.woff2"),
      "Local Inter font must be shipped",
    );
    for (const asset of new Set([...assets, ...videos, ...imports, ...fonts])) {
      assert.ok(
        !asset.startsWith("/"),
        `Asset must work under a repository path: ${asset}`,
      );
      const response = await fetch(new URL(asset, base));
      assert.equal(response.status, 200, asset);
      assert.ok(Number(response.headers.get("content-length")) > 0, asset);
    }
  });
}

test("repository-path server reproduces GitHub Pages routing", async () => {
  const response = await fetch(new URL("/assets/hero.mp4", pagesOrigin));
  assert.equal(
    response.status,
    404,
    "Root asset paths must fail in the regression fixture",
  );
  const noSlash = await fetch(pagesOrigin.slice(0, -1), { redirect: "manual" });
  assert.equal(noSlash.status, 308);
  assert.equal(noSlash.headers.get("location"), "/FG_Website/");
});

test("videos support range requests and invalid ranges are rejected", async () => {
  for (const base of [origin, pagesOrigin])
    for (const file of ["intro", "hero", "retrofit"]) {
      const response = await fetch(new URL(`./assets/${file}.mp4`, base), {
        headers: { Range: "bytes=0-1023" },
      });
      assert.equal(response.status, 206);
      assert.equal(response.headers.get("content-type"), "video/mp4");
      assert.equal((await response.arrayBuffer()).byteLength, 1024);
      assert.match(
        response.headers.get("content-range"),
        /^bytes 0-1023\/\d+$/,
      );
    }
  const badRange = await fetch(new URL("./assets/hero.mp4", origin), {
    headers: { Range: "bytes=99999999-" },
  });
  assert.equal(badRange.status, 416);
});

test("server does not expose source configuration or missing assets", async () => {
  for (const path of ["/package.json", "/scripts/serve.js", "/missing.webp"]) {
    const response = await fetch(new URL(path, origin));
    // JavaScript helpers are available in dev but never copied to production.
    assert.equal(response.status, 404, path);
  }
});
