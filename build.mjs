// build.mjs — Compilación del frontend para producción
//
//   npm install
//   npm run build        → genera dist/
//
// En desarrollo, index.html funciona tal cual (React de desarrollo y JSX
// compilado en el navegador). Para producción, este script:
//   · compila y minifica todos los .jsx en un solo archivo, sin Babel en el navegador
//   · incluye React y ReactDOM en versión de producción en ese mismo archivo
//   · minifica los scripts y estilos propios
//   · pone una huella (hash) en el nombre de cada archivo, para que el navegador
//     los guarde en caché sin quedarse con versiones viejas
// El orden de los archivos se toma de index.html, que sigue siendo la referencia.

import { build, transform } from 'esbuild';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'dist';
const html = readFileSync('index.html', 'utf8');

const huella = contenido => createHash('sha256').update(contenido).digest('hex').slice(0, 10);
const kb = n => (n / 1024).toFixed(0) + ' KB';

function escribir(nombreBase, ext, contenido) {
  const nombre = `${nombreBase}.${huella(contenido)}.${ext}`;
  writeFileSync(join(OUT, nombre), contenido);
  console.log(`  ${nombre.padEnd(34)} ${kb(Buffer.byteLength(contenido))}`);
  return nombre;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
console.log('Compilando Guajiragua → dist/');

// 1. React y ReactDOM de producción, expuestos como globales (la app los usa así)
const vendor = await build({
  stdin: {
    contents: `
      import React from 'react';
      import * as ReactDOM from 'react-dom';
      import * as ReactDOMClient from 'react-dom/client';
      window.React = React;
      window.ReactDOM = Object.assign({}, ReactDOM, ReactDOMClient);`,
    resolveDir: '.',
    loader: 'js',
  },
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2018',
  define: { 'process.env.NODE_ENV': '"production"' },
  write: false,
  legalComments: 'none',
});

// 2. Componentes .jsx en el orden de index.html, compilados y unidos en un solo
//    ámbito (en desarrollo comparten el ámbito global de la página)
const jsxFiles = [...html.matchAll(/<script type="text\/babel" src="([^"?]+)[^"]*"><\/script>/g)].map(m => m[1]);
if (!jsxFiles.length) throw new Error('No se encontraron scripts .jsx en index.html');
const fuente = jsxFiles.map(f => `// ${f}\n${readFileSync(f, 'utf8')}`).join('\n;\n');
const app = await transform(`(function () {\n${fuente}\n})();`, {
  loader: 'jsx',
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  minify: true,
  target: 'es2018',
  legalComments: 'none',
});
const appJs = escribir('app', 'js', vendor.outputFiles[0].text + '\n' + app.code);

// 3. Scripts propios que se cargan antes de la app (configuración, cliente del API
//    con el esqueleto de carga, y la copia de datos)
const plano = {};
for (const f of ['config.js', 'api-client.js', 'real-data.js']) {
  const r = await transform(readFileSync(f, 'utf8'), { loader: 'js', minify: true, target: 'es2018', legalComments: 'none' });
  plano[f] = escribir(f.replace(/\.js$/, ''), 'js', r.code);
}

// 4. Estilos
const css = await transform(readFileSync('styles.css', 'utf8'), { loader: 'css', minify: true });
const cssFile = escribir('styles', 'css', css.code);

// 5. index.html de producción
let out = html;
out = out.replace(/\s*<script src="https:\/\/unpkg\.com\/react@[^"]*"[^>]*><\/script>/, '');
out = out.replace(/\s*<script src="https:\/\/unpkg\.com\/react-dom@[^"]*"[^>]*><\/script>/, '');
out = out.replace(/\s*<script src="https:\/\/unpkg\.com\/@babel\/standalone@[^"]*"[^>]*><\/script>/, '');
out = out.replace(/<link rel="stylesheet" href="styles\.css[^"]*" \/>/, `<link rel="stylesheet" href="${cssFile}" />`);
for (const [f, nombre] of Object.entries(plano)) {
  out = out.replace(new RegExp(`<script src="${f.replace('.', '\\.')}[^"]*"></script>`), `<script src="${nombre}"></script>`);
}
let primera = true;
out = out.replace(/<script type="text\/babel" src="[^"]+"><\/script>\n?/g, () => {
  if (!primera) return '';
  primera = false;
  return `<script src="${appJs}"></script>\n`;
});
for (const patron of ['text/babel', 'react.development', 'babel.min', 'styles.css?', 'api-client.js?']) {
  if (out.includes(patron)) throw new Error(`index.html de producción aún contiene "${patron}"`);
}
writeFileSync(join(OUT, 'index.html'), out);
console.log(`  ${'index.html'.padEnd(34)} ${kb(Buffer.byteLength(out))}`);
console.log('Listo.');
