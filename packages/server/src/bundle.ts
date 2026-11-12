/**
 * Buduje pliki interfejsu przy starcie serwera: TypeScript z packages/ui składa esbuild
 * w jeden plik w pamięci. Nie ma osobnego kroku budowania ani folderu dist/.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { build } from 'esbuild';

export async function buildAssets(uiDir: string): Promise<Map<string, { body: string | Buffer; type: string }>> {
  const result = await build({
    entryPoints: [join(uiDir, 'src/main.ts')],
    bundle: true,
    format: 'esm',
    target: 'es2022',
    write: false,
    minify: false,
    sourcemap: 'inline',
    logLevel: 'silent',
  });
  const js = result.outputFiles[0]?.text;
  if (js === undefined) throw new Error('Nie udało się zbudować interfejsu.');
  return new Map([
    [
      '/index.html',
      { body: await readFile(join(uiDir, 'static/index.html'), 'utf8'), type: 'text/html; charset=utf-8' },
    ],
    ['/app.css', { body: await readFile(join(uiDir, 'static/app.css'), 'utf8'), type: 'text/css; charset=utf-8' }],
    ['/app.js', { body: js, type: 'text/javascript; charset=utf-8' }],
  ]);
}
