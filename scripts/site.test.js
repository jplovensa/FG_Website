import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

let server;
let origin;
before(async () => {
  server = spawn(process.execPath, ['scripts/serve.js', '--dist'], { cwd: new URL('../', import.meta.url), env: { ...process.env, PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
  const [output] = await once(server.stdout, 'data');
  origin = `http://127.0.0.1:${/port (\d+)/.exec(output.toString())[1]}`;
});
after(() => server?.kill());

test('production page and every referenced local asset are served', async () => {
  const page = await fetch(origin);
  assert.equal(page.status, 200);
  const html = await page.text();
  const assets = [...html.matchAll(/(?:src|href)="(\/[^"#]+)"/g)].map(match => match[1]);
  for (const asset of new Set(assets)) {
    const response = await fetch(origin + asset);
    assert.equal(response.status, 200, asset);
    assert.ok(Number(response.headers.get('content-length')) > 0, asset);
  }
});

test('videos support range requests and invalid ranges are rejected', async () => {
  for (const file of ['intro', 'hero']) {
    const response = await fetch(`${origin}/assets/${file}.mp4`, { headers: { Range: 'bytes=0-1023' } });
    assert.equal(response.status, 206);
    assert.equal(response.headers.get('content-type'), 'video/mp4');
    assert.equal((await response.arrayBuffer()).byteLength, 1024);
    assert.match(response.headers.get('content-range'), /^bytes 0-1023\/\d+$/);
  }
  const badRange = await fetch(`${origin}/assets/hero.mp4`, { headers: { Range: 'bytes=99999999-' } });
  assert.equal(badRange.status, 416);
});

test('server does not expose source configuration or missing assets', async () => {
  for (const path of ['/package.json', '/scripts/serve.js', '/missing.webp']) {
    const response = await fetch(origin + path);
    // JavaScript helpers are available in dev but never copied to production.
    assert.equal(response.status, 404, path);
  }
});
