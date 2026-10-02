import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const built = process.argv[2] === 'dist';
const entry = fileURLToPath(new URL(built ? '../dist/index.html' : '../index.html', import.meta.url));
const port = Number(process.env.PORT || 4312);

createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end();
    return;
  }
  try {
    const html = await readFile(entry);
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : html);
  } catch {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Could not load the admin UI. Run npm run build before previewing dist.');
  }
}).listen(port, '127.0.0.1', () => console.log(`NELO admin UI: http://localhost:${port}`));
