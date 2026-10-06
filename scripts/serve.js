import { createServer } from 'node:http';
import { stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)), process.argv.includes('--dist') ? 'dist' : '.');
// Reproduce repository-path hosting (such as GitHub Pages) during validation.
const basePath = process.argv.find(arg => arg.startsWith('--base-path='))?.slice('--base-path='.length) || '/';
if (!basePath.startsWith('/') || !basePath.endsWith('/')) throw new Error('Base path must start and end with /');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.mp4': 'video/mp4', '.txt': 'text/plain; charset=utf-8' };
const server = createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
  try {
    const requestedPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (basePath !== '/' && requestedPath === basePath.slice(0, -1)) {
      res.writeHead(308, { Location: basePath }).end(); return;
    }
    if (!requestedPath.startsWith(basePath)) { res.writeHead(404).end('Not found'); return; }
    const pathname = '/' + requestedPath.slice(basePath.length);
    const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(root + sep) || !types[extname(file)]) { res.writeHead(404).end('Not found'); return; }
    const info = await stat(file);
    if (!info.isFile()) { res.writeHead(404).end('Not found'); return; }
    const headers = { 'Content-Type': types[extname(file)], 'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff' };
    let start = 0;
    let end = info.size - 1;
    let status = 200;
    if (req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!match || (!match[1] && !match[2])) { res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end(); return; }
      start = match[1] ? Number(match[1]) : Math.max(0, info.size - Number(match[2]));
      end = match[1] && match[2] ? Math.min(Number(match[2]), end) : end;
      if (start > end || start >= info.size) { res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end(); return; }
      status = 206;
      headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
    }
    headers['Content-Length'] = end - start + 1;
    res.writeHead(status, headers);
    if (req.method === 'HEAD') res.end();
    else createReadStream(file, { start, end }).on('error', () => res.destroy()).pipe(res);
  } catch { res.writeHead(404).end('Not found'); }
});
server.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log(`Fjäll Group development server on port ${server.address().port}`));
