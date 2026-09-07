# Despliegue de la demo en Vercel

Versión estática y ligera de Fiduciary Interface, protegida con usuario y
contraseña. No hay backend, base de datos ni Azure AD: todas las llamadas HTTP
las responde el interceptor de demo en el navegador (ver [`../DEMO.md`](../DEMO.md)).

## Qué se despliega

| | |
| --- | --- |
| Contenido | `public/` — 77 archivos, 15 MB |
| Carga inicial | 6.3 MB → **1.15 MB** con brotli (Vercel comprime solo) |
| Build en Vercel | Ninguno. Se sube ya compilado |
| Acceso | Formulario de login en el edge, antes de servir cualquier archivo |

## 1. Generar el build

Requiere **Node 20** (Angular 16 no soporta Node 22):

```bash
cd "E:\Sitios\BID\Version 1\IF\IF"
nvm use 20.20.2
npm run build:vercel
```

Esto compila con `--configuration=vercel` (modo demo + optimización de
producción) y ejecuta `prepare.mjs`, que copia el resultado a `public/`.

## 2. Probar en local antes de subir

Replica exactamente lo que hará Vercel: middleware, estáticos y fallback SPA.

```bash
cd vercel-demo
DEMO_USER=demo DEMO_PASSWORD=tu-clave node serve-local.mjs
# -> http://localhost:3000
```

En PowerShell:

```powershell
$env:DEMO_USER="demo"; $env:DEMO_PASSWORD="tu-clave"; node serve-local.mjs
```

## 3. Desplegar

```bash
npm i -g vercel
cd vercel-demo
vercel login
vercel link          # crear o enlazar el proyecto

vercel env add DEMO_USER production        # pide el valor por consola
vercel env add DEMO_PASSWORD production
vercel env add AUTH_SECRET production      # opcional, cualquier cadena larga

vercel deploy --prod
```

Alternativa por Git: sube el repo y, en Project Settings, pon **Root Directory =
`vercel-demo`**. Define las mismas variables en Settings → Environment Variables.

> Si faltan `DEMO_USER` o `DEMO_PASSWORD`, el sitio no se abre: el middleware
> devuelve una página de configuración. Falla en seguro, nunca queda abierto.

Para cambiar la contraseña basta con editar la variable y volver a desplegar
(`vercel deploy --prod`). Al cambiarla, las sesiones abiertas se invalidan solas,
porque la contraseña forma parte de la firma de la cookie.

## Cómo funciona el acceso

`middleware.js` se ejecuta en el edge de Vercel **antes** de servir nada, así que
ni el `index.html` ni los bundles salen sin sesión válida.

- Sin sesión, una navegación devuelve el formulario de login.
- Sin sesión, un subrecurso (chunk lazy, i18n, fuente) devuelve `401`, para que
  la app no reciba HTML donde espera JavaScript.
- Al acertar las credenciales se emite una cookie `HttpOnly; Secure; SameSite=Lax`
  firmada con HMAC-SHA256 y válida 8 horas. No se puede falsificar ni alargar sin
  el secreto.
- `/__auth/logout` cierra la sesión.

Las credenciales solo viven en las variables de entorno del servidor: no se
incluyen en el bundle ni viajan al cliente.

## Archivos

| Archivo | Para qué |
| --- | --- |
| `middleware.js` | Gate de acceso en el edge (Vercel lo detecta por el nombre) |
| `vercel.json` | Fallback SPA, cabeceras de caché y `noindex` |
| `prepare.mjs` | Post-build: copia a `public/` y quita fuentes legacy |
| `serve-local.mjs` | Previsualización local idéntica a Vercel |
| `public/` | El sitio compilado. Se regenera, no se edita a mano |

## De dónde sale la reducción de peso

Partiendo de `npm run build:demo` (build de desarrollo con sourcemaps):

1. **Configuración `vercel` en `angular.json`** — modo demo con optimización de
   producción: minificado, tree-shaking, sin sourcemaps, con hash en los nombres.
2. **`assets/styles` fuera** (1.3 MB) — son los 211 SCSS fuente, que ya van
   compilados dentro de `styles.css`. Nunca se servían.
3. **`assets/fonts` fuera** (1.8 MB) — duplicaba las fuentes que el pipeline de
   CSS ya emite en la raíz con hash.
4. **Font Awesome legacy fuera** (12.7 MB) — `prepare.mjs` borra `.eot`, `.ttf` y
   `.svg` y limpia sus referencias en el CSS. El `@font-face` lista `woff2`
   primero entre los formatos que un navegador moderno soporta, así que esos
   archivos nunca se descargaban.

Mulish, Open Sans, Nunito Sans, Salesforce Sans y los iconos de Kendo **sí** se
conservan en `.ttf`: son las únicas versiones que existen de esas familias.
