import { writeFile } from 'node:fs/promises';

// Preserve links shared before the full business sites moved under FG.
export async function buildBusinessPages(target) {
  const site = (process.env.SITE_URL || 'https://fjallgroup.com').replace(/\/$/, '');
  for (const [legacy, path, name] of [
    ['greenshift', 'GreenShift', 'GreenShift'],
    ['fad', 'FAD', 'Fjäll Affordable Development'],
  ]) {
    await writeFile(`${target}/${legacy}.html`, `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${name} | Fjäll Group</title><link rel="canonical" href="${site}/${path}/"><meta http-equiv="refresh" content="0;url=./${path}/"></head><body><p>${name} is now part of the Fjäll Group website.</p><a href="./${path}/">Continue to ${name}</a></body></html>\n`);
  }
}
