/**
 * Previsualizacion local de lo que servira Vercel.
 *
 * Replica la cadena real: middleware de autenticacion -> archivo estatico ->
 * fallback a index.html (SPA). Sirve para validar el build y las credenciales
 * antes de desplegar.
 *
 *   DEMO_USER=demo DEMO_PASSWORD=secreto node vercel-demo/serve-local.mjs
 *   -> http://localhost:3000
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import middleware from '../middleware.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, 'public');
const port = Number(process.env.PORT || 3000);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8'
};

if (!existsSync(root)) {
  console.error('Falta vercel-demo/public. Ejecuta primero: npm run build:vercel');
  process.exit(1);
}
if (!process.env.DEMO_USER || !process.env.DEMO_PASSWORD) {
  console.warn('Aviso: sin DEMO_USER / DEMO_PASSWORD el middleware devuelve la pagina de configuracion.');
}

/** Convierte la peticion de Node en el Request estandar que espera el middleware. */
async function toRequest(req) {
  const url = 'http://' + (req.headers.host || 'localhost') + req.url;
  const init = { method: req.method, headers: req.headers };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    init.body = Buffer.concat(chunks);
  }
  return new Request(url, init);
}

function serveStatic(pathname, res) {
  const relative = normalize(decodeURIComponent(pathname)).replace(/^([/\\.])+/, '');
  let file = join(root, relative);

  if (!file.startsWith(root)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  // Fallback SPA: cualquier ruta sin archivo se resuelve con index.html.
  if (!existsSync(file) || statSync(file).isDirectory()) {
    file = join(root, 'index.html');
  }

  const ext = file.slice(file.lastIndexOf('.'));
  res.writeHead(200, {
    'content-type': MIME[ext] || 'application/octet-stream',
    'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable'
  });
  createReadStream(file).pipe(res);
}

createServer(async (req, res) => {
  try {
    const request = await toRequest(req);
    const result = await middleware(request);

    // `x-middleware-next` = el middleware deja pasar la peticion.
    if (result && !result.headers.get('x-middleware-next')) {
      const headers = {};
      // getSetCookie mantiene varias cookies separadas; el resto se aplana.
      for (const [key, value] of result.headers) {
        if (key.toLowerCase() !== 'x-middleware-next') headers[key] = value;
      }
      res.writeHead(result.status, headers);
      res.end(result.body ? Buffer.from(await result.arrayBuffer()) : undefined);
      return;
    }

    serveStatic(new URL(request.url).pathname, res);
  } catch (error) {
    console.error(error);
    res.writeHead(500).end('Internal error');
  }
}).listen(port, () => {
  console.log('');
  console.log('  Previsualizacion Vercel  ->  http://localhost:' + port);
  console.log('  usuario: ' + (process.env.DEMO_USER || '(sin definir)'));
  console.log('');
});
