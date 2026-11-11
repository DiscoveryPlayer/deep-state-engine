/**
 * Uruchamia grę: `npm start`. Wczytuje treść, buduje interfejs, startuje serwer na 127.0.0.1
 * i otwiera przeglądarkę.
 */
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { ContentLoadError, loadContent } from '@dse/content';
import { createApp } from './app.ts';
import { buildAssets } from './bundle.ts';
import { CampaignStore } from './store.ts';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const DEFAULT_PORT = 4780;

function openBrowser(url: string): void {
  const command =
    process.platform === 'win32'
      ? { cmd: 'cmd', args: ['/c', 'start', '', url] }
      : process.platform === 'darwin'
        ? { cmd: 'open', args: [url] }
        : { cmd: 'xdg-open', args: [url] };
  try {
    spawn(command.cmd, command.args, { stdio: 'ignore', detached: true })
      .on('error', () => {})
      .unref();
  } catch {
    // Brak przeglądarki do otwarcia — adres i tak jest wypisany w terminalu.
  }
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      port: { type: 'string' },
      dane: { type: 'string' },
      kampanie: { type: 'string' },
      'bez-przegladarki': { type: 'boolean', default: false },
    },
  });
  const port = values.port ? Number.parseInt(values.port, 10) : DEFAULT_PORT;
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('--port wymaga liczby 1–65535');

  const content = await loadContent(values.dane ?? resolve(REPO_ROOT, 'data'));
  const assets = await buildAssets(resolve(REPO_ROOT, 'packages/ui'));
  const store = new CampaignStore(values.kampanie ?? resolve(REPO_ROOT, 'campaigns'));
  const server = createApp({ content, store, assets });

  server.on('error', (e: NodeJS.ErrnoException) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`Port ${port} jest zajęty. Być może gra już działa — otwórz http://127.0.0.1:${port}/`);
      console.error('Możesz też wybrać inny port: npm start -- --port 4781');
    } else {
      console.error(e.message);
    }
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () => {
    const url = `http://127.0.0.1:${port}/`;
    console.log('The Deep State Engine działa.');
    console.log(`Otwórz w przeglądarce: ${url}`);
    console.log('Żeby zakończyć, zamknij to okno albo naciśnij Ctrl+C.');
    if (!values['bez-przegladarki']) openBrowser(url);
  });
}

main().catch((e: unknown) => {
  if (e instanceof ContentLoadError) console.error(e.message);
  else console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
