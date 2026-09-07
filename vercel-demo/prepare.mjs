/**
 * Post-build: prepara `vercel-demo/public` a partir de `dist/vercel-demo`.
 *
 * 1. Copia el build a vercel-demo/public/
 * 2. Elimina los formatos legacy de Font Awesome (.eot/.ttf/.svg) y sus
 *    referencias en el CSS. Ningun navegador actual los pide: el @font-face
 *    lista woff2 primero entre los formatos soportados. Solo se tocan las
 *    familias `fa-*`, que sí tienen woff2; Mulish, Open Sans, Nunito Sans,
 *    Salesforce Sans y los iconos de Kendo solo existen en .ttf y se conservan.
 * 3. Imprime un informe de tamano.
 *
 * Se ejecuta desde `npm run build:vercel`.
 */
import { existsSync } from 'node:fs';
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(here, '..');
const source = join(projectRoot, 'dist', 'vercel-demo');
const target = join(here, 'public');

/** Formatos legacy que solo se eliminan para las familias Font Awesome. */
const LEGACY = /^fa-[a-z]+-\d+\.[0-9a-f]+\.(eot|ttf|svg)$/;

async function directorySize(dir) {
  let total = 0;
  let files = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await directorySize(full);
      total += nested.total;
      files += nested.files;
    } else {
      total += (await stat(full)).size;
      files += 1;
    }
  }
  return { total, files };
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1) + ' MB';

if (!existsSync(source)) {
  console.error('No existe ' + relative(projectRoot, source) + '. Ejecuta primero: ng build --configuration=vercel');
  process.exit(1);
}

const before = await directorySize(source);

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });

// 1. Borrar los ficheros legacy de Font Awesome.
const removed = [];
for (const entry of await readdir(target, { withFileTypes: true })) {
  if (entry.isFile() && LEGACY.test(entry.name)) {
    await rm(join(target, entry.name));
    removed.push(entry.name);
  }
}

// 2. Quitar sus referencias del CSS para no dejar 404 latentes.
let rewritten = 0;
for (const entry of await readdir(target, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.css')) continue;

  const file = join(target, entry.name);
  const original = await readFile(file, 'utf8');

  // Elimina cada `url(fa-….eot|ttf|svg) format('…'),` del listado src.
  let updated = original.replace(
    /url\(["']?fa-[a-z]+-\d+\.[0-9a-f]+\.(?:eot|ttf|svg)(?:[^"')]*)?["']?\)(\s*format\((?:"[^"]*"|'[^']*')\))?\s*,?/g,
    ''
  );
  // Limpia lo que deja la sustitucion: `src:;` vacios y comas colgantes.
  // Una coma antes de `;` o `}` invalida TODA la declaracion `src` (el navegador
  // descarta la regla entera y la fuente no cargaria), asi que hay que quitarla.
  updated = updated
    .replace(/src\s*:\s*;/g, '')
    .replace(/,\s*;/g, ';')
    .replace(/,\s*\}/g, '}');

  if (updated !== original) {
    await writeFile(file, updated, 'utf8');
    rewritten += 1;
  }
}

const after = await directorySize(target);

console.log('');
console.log('  Build listo para Vercel  ->  ' + relative(projectRoot, target));
console.log('  ------------------------------------------------------');
console.log('  antes            ' + mb(before.total).padStart(9) + '   ' + before.files + ' archivos');
console.log('  despues          ' + mb(after.total).padStart(9) + '   ' + after.files + ' archivos');
console.log('  ahorro           ' + mb(before.total - after.total).padStart(9) +
  '   (' + removed.length + ' fuentes legacy, ' + rewritten + ' css reescritos)');
console.log('');
