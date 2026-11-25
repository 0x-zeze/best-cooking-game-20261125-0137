import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';

const PORT = 8080;
const GAME_DIR = resolve(import.meta.dirname, 'game');
const GAME_PREFIX = GAME_DIR.endsWith(sep) ? GAME_DIR : GAME_DIR + sep;

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8',
};

const server = createServer((req, res) => {
  const rawPath = (req.url ?? '/').split('?')[0] ?? '/';
  let pathname: string;
  try {
    pathname = decodeURIComponent(rawPath);
  } catch {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  if (pathname.includes('\0')) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  const rel = pathname === '/' || pathname === '' ? 'index.html' : pathname.replace(/^\//, '');
  const target = resolve(GAME_DIR, rel);
  if (target !== GAME_DIR && !target.startsWith(GAME_PREFIX)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  try {
    const st = statSync(target);
    if (!st.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }
    const contentType = MIME[extname(target).toLowerCase()] ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(readFileSync(target));
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  }
});

// ponytail: sync readFileSync fits small static assets (<1 MiB); switch to createReadStream if large media is added.
server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/`);
});
