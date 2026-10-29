import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { resolve, dirname } from 'node:path';

const source = await readFile(new URL('../analytics.js', import.meta.url), 'utf8');
function launch(href, {embedded = false} = {}) {
  const scripts = [];
  const window = {};
  window.self = window;
  window.top = embedded ? {} : window;
  const context = {
    window, location: new URL(href), URL,
    document: {
      referrer: 'https://fjallgroup.com/GreenShift/?brief=private#details',
      createElement: () => ({}), head: {appendChild: tag => scripts.push(tag)},
    },
  };
  runInNewContext(source, context);
  return {window, scripts, context};
}

test('GA4 uses the supplied ID once and excludes brief data from page URLs', () => {
  const {window, scripts, context} = launch('https://fjallgroup.com/FAD/?name=Private&brief=Secret#contact');
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-MQ5LQD2C15');
  const commands = window.dataLayer.map(args => Array.from(args));
  const config = commands.find(([command]) => command === 'config');
  assert.equal(config[1], 'G-MQ5LQD2C15');
  assert.equal(config[2].page_location, 'https://fjallgroup.com/FAD/');
  assert.equal(config[2].page_referrer, 'https://fjallgroup.com/GreenShift/');
  assert.equal(config[2].allow_google_signals, false);
  runInNewContext(source, context);
  assert.equal(scripts.length, 1);
});

test('local development, unrelated Pages sites and embedded tools do not send analytics', () => {
  for (const href of ['http://localhost:3000/', 'http://127.0.0.1:3000/FAD/', 'https://jplovensa.github.io/Other/']) {
    assert.equal(launch(href).scripts.length, 0);
  }
  assert.equal(launch('https://fjallgroup.com/GreenShift/assets/facade-studio.html', {embedded: true}).scripts.length, 0);
  assert.equal(launch('https://jplovensa.github.io/FG_Website/GreenShift/').scripts.length, 1);
});

test('all public content pages ship one working shared analytics bootstrap', async () => {
  const root = resolve('dist');
  const pages = ['index.html'];
  for (const directory of ['projects', 'GreenShift', 'FAD']) {
    async function collect(path) {
      for (const file of await readdir(path, {withFileTypes:true})) {
        const full = `${path}/${file.name}`;
        if (file.isDirectory()) await collect(full);
        else if (file.name.endsWith('.html')) pages.push(full.slice(root.length + 1));
      }
    }
    await collect(`${root}/${directory}`);
  }
  for (const page of pages) {
    const html = await readFile(`${root}/${page}`, 'utf8');
    if (/http-equiv="refresh"/i.test(html)) continue;
    const tags = [...html.matchAll(/<script defer src="([^"]+)" data-fjall-analytics><\/script>/g)];
    assert.equal(tags.length, 1, page);
    assert.equal(resolve(dirname(`${root}/${page}`), tags[0][1]), `${root}/analytics.js`, page);
  }
});
