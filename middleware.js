/**
 * Edge Middleware — control de acceso de la demo.
 *
 * Se ejecuta en el edge de Vercel ANTES de servir cualquier archivo estático,
 * así que ni el index.html ni los bundles se entregan sin sesión válida.
 *
 * Variables de entorno requeridas (Project Settings -> Environment Variables):
 *   DEMO_USER       usuario
 *   DEMO_PASSWORD   contraseña
 *   AUTH_SECRET     (opcional) secreto para firmar la cookie
 *
 * Si falta usuario o contraseña el sitio queda cerrado: falla en seguro.
 */

const COOKIE = 'if_demo_session';
const SESSION_HOURS = 8;
const LOGIN_PATH = '/__auth/login';
const LOGOUT_PATH = '/__auth/logout';

export default async function middleware(request) {
  const url = new URL(request.url);
  const user = process.env.DEMO_USER;
  const password = process.env.DEMO_PASSWORD;

  if (!user || !password) {
    return htmlResponse(configErrorPage(), 503);
  }

  if (url.pathname === LOGOUT_PATH) {
    const res = redirect('/');
    res.headers.append('set-cookie', COOKIE + '=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax');
    return res;
  }

  if (url.pathname === LOGIN_PATH) {
    if (request.method !== 'POST') return redirect('/');

    const form = await request.formData();
    const sentUser = String(form.get('user') || '');
    const sentPassword = String(form.get('password') || '');

    if (safeEqual(sentUser, user) && safeEqual(sentPassword, password)) {
      const token = await createToken(sentUser, password);
      const res = redirect('/');
      res.headers.append(
        'set-cookie',
        COOKIE + '=' + token + '; Path=/; Max-Age=' + SESSION_HOURS * 3600 + '; HttpOnly; Secure; SameSite=Lax'
      );
      return res;
    }

    return htmlResponse(loginPage(true), 401);
  }

  if (await hasValidSession(request, password)) {
    return next();
  }

  if (request.method === 'GET' && isNavigation(request)) {
    return htmlResponse(loginPage(false), 200);
  }
  // Para subrecursos (chunks lazy, i18n, fuentes) se responde 401 en vez del
  // HTML del login: si la sesion caduca a mitad de uso, la app recibe un error
  // limpio en lugar de intentar ejecutar una pagina HTML como si fuera JS.
  return new Response('Unauthorized', { status: 401 });
}

/** Distingue la navegacion a una pagina de la carga de un subrecurso. */
function isNavigation(request) {
  const dest = request.headers.get('sec-fetch-dest');
  if (dest) return dest === 'document';
  return (request.headers.get('accept') || '').includes('text/html');
}

/* ---------------------------------------------------------------- sesión -- */

function signingSecret(password) {
  return process.env.AUTH_SECRET || password + '::if-demo-v1';
}

async function createToken(user, password) {
  const expiresAt = Date.now() + SESSION_HOURS * 3600 * 1000;
  const payload = base64url(user) + '.' + expiresAt;
  const signature = await hmac(payload, signingSecret(password));
  return payload + '.' + signature;
}

async function hasValidSession(request, password) {
  const token = readCookie(request, COOKIE);
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const encodedUser = parts[0];
  const expiresAt = parts[1];
  const signature = parts[2];

  if (!/^\d+$/.test(expiresAt) || Number(expiresAt) < Date.now()) return false;

  const expected = await hmac(encodedUser + '.' + expiresAt, signingSecret(password));
  return safeEqual(signature, expected);
}

async function hmac(message, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map(function (byte) {
      return byte.toString(16).padStart(2, '0');
    })
    .join('');
}

/** Comparación de tiempo constante: no filtra la contraseña por timing. */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  let diff = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

function base64url(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function readCookie(request, name) {
  const header = request.headers.get('cookie');
  if (!header) return null;
  const parts = header.split(';');
  for (let i = 0; i < parts.length; i++) {
    const index = parts[i].indexOf('=');
    if (index === -1) continue;
    if (parts[i].slice(0, index).trim() === name) return parts[i].slice(index + 1).trim();
  }
  return null;
}

/* -------------------------------------------------------------- respuestas -- */

/** Equivalente a next() de @vercel/edge, sin arrastrar la dependencia. */
function next() {
  return new Response(null, { headers: { 'x-middleware-next': '1' } });
}

function redirect(location) {
  return new Response(null, { status: 303, headers: { location: location } });
}

function htmlResponse(body, status) {
  return new Response(body, {
    status: status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow'
    }
  });
}

/* ------------------------------------------------------------------ vistas -- */

function shell(title, body) {
  return [
    '<!doctype html>',
    '<html lang="es">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="robots" content="noindex, nofollow">',
    '<title>' + title + '</title>',
    '<style>',
    ':root{color-scheme:light dark;--bg:#eef1f6;--card:#fff;--fg:#10233d;--muted:#5b6b83;',
    '--border:#d3dae6;--field:#fff;--accent:#0b5ed7;--accent-fg:#fff;',
    '--danger-bg:#fdeaea;--danger-fg:#a1231d;--danger-border:#f0bab6}',
    '@media (prefers-color-scheme:dark){:root{--bg:#0e1622;--card:#16202e;--fg:#e8eef7;',
    '--muted:#9aabc1;--border:#2a394c;--field:#0f1926;--accent:#4d94ff;--accent-fg:#06121f;',
    '--danger-bg:#3a1a19;--danger-fg:#ffb4ae;--danger-border:#5e2b28}}',
    '*{box-sizing:border-box}',
    'body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;',
    'padding:24px;background:var(--bg);color:var(--fg);',
    'font-family:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}',
    '.card{width:100%;max-width:380px;background:var(--card);border:1px solid var(--border);',
    'border-radius:14px;padding:32px;box-shadow:0 10px 30px rgba(10,25,50,.10)}',
    'h1{margin:0 0 4px;font-size:19px;letter-spacing:-.01em}',
    '.sub{margin:0 0 24px;font-size:13px;color:var(--muted);line-height:1.5}',
    'label{display:block;font-size:13px;font-weight:600;margin-bottom:6px}',
    'input{width:100%;padding:11px 12px;margin-bottom:16px;font-size:15px;font-family:inherit;',
    'color:var(--fg);background:var(--field);border:1px solid var(--border);border-radius:8px}',
    'input:focus-visible{outline:2px solid var(--accent);outline-offset:1px;border-color:var(--accent)}',
    'button{width:100%;padding:12px;font-size:15px;font-weight:600;font-family:inherit;',
    'color:var(--accent-fg);background:var(--accent);border:0;border-radius:8px;cursor:pointer}',
    'button:hover{filter:brightness(1.08)}',
    'button:focus-visible{outline:2px solid var(--fg);outline-offset:2px}',
    '.error{margin:0 0 18px;padding:10px 12px;font-size:13px;border-radius:8px;',
    'background:var(--danger-bg);color:var(--danger-fg);border:1px solid var(--danger-border)}',
    '.foot{margin:22px 0 0;font-size:12px;color:var(--muted);text-align:center;line-height:1.5}',
    '</style>',
    '</head>',
    '<body>' + body + '</body>',
    '</html>'
  ].join('\n');
}

function loginPage(failed) {
  const error = failed
    ? '<p class="error" role="alert">Usuario o contraseña incorrectos.</p>'
    : '';
  return shell(
    'Acceso — Fiduciary Interface (demo)',
    [
      '<main class="card">',
      '<h1>Fiduciary Interface</h1>',
      '<p class="sub">Entorno de demostración. Introduce las credenciales para continuar.</p>',
      error,
      '<form method="POST" action="' + LOGIN_PATH + '">',
      '<label for="user">Usuario</label>',
      '<input id="user" name="user" type="text" autocomplete="username" required autofocus>',
      '<label for="password">Contraseña</label>',
      '<input id="password" name="password" type="password" autocomplete="current-password" required>',
      '<button type="submit">Entrar</button>',
      '</form>',
      '<p class="foot">Datos ficticios. Sin conexión a sistemas del BID.</p>',
      '</main>'
    ].join('\n')
  );
}

function configErrorPage() {
  return shell(
    'Configuración incompleta',
    [
      '<main class="card">',
      '<h1>Configuración incompleta</h1>',
      '<p class="sub">Faltan las variables de entorno <code>DEMO_USER</code> y ',
      '<code>DEMO_PASSWORD</code>. Defínelas en Vercel (Project Settings &rarr; ',
      'Environment Variables) y vuelve a desplegar.</p>',
      '</main>'
    ].join('\n')
  );
}
