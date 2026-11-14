/**
 * Pobieranie zdjęć z Wikimedia Commons według manifestu (decyzja 0019).
 *
 * Skrypt działa na komputerze gracza: `npm run zdjecia`. Dla każdego wpisu manifestu pyta
 * Commons o kolejne tytuły, bierze pierwszy plik, który istnieje i ma licencję domeny publicznej
 * albo CC0, i zapisuje go w data/images/pliki/. Autora, licencję i adres strony pliku zapisuje
 * do zrodla.json, skąd gra bierze podpis pod zdjęciem. Plików o innej licencji nie pobiera.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { IMAGE_CREDITS_FILE, IMAGE_FILES_DIR, type ImageEntry } from '@dse/core';

const API = 'https://commons.wikimedia.org/w/api.php';
/** Szerokość pobieranej miniatury w pikselach: dość na kartę wydarzenia, mało na dysku. */
const IMAGE_WIDTH = 1280;
/** Wikimedia prosi, żeby skrypty przedstawiały się i wskazywały, gdzie szukać autora. */
const USER_AGENT = 'DeepStateEngine/0.3 (https://github.com/DiscoveryPlayer/deep-state-engine; prywatna gra)';
/** Przerwa między zapytaniami, żeby nie obciążać serwerów Commons. */
const PAUSE_MS = 400;

export interface CommonsFile {
  title: string;
  /** Adres miniatury o szerokości IMAGE_WIDTH. */
  thumbUrl: string;
  /** Strona pliku w Commons: źródło i pełny opis licencji. */
  pageUrl: string;
  license: string;
  artist: string;
  mime: string;
}

export interface ImageCredit {
  title: string;
  artist: string;
  license: string;
  source: string;
}

/** Usuwa znaczniki HTML z pól opisu Commons („<a href=…>NASA</a>” → „NASA”). */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Czy krótka nazwa licencji z Commons oznacza domenę publiczną albo CC0. Reszta odpada. */
export function isPublicDomain(license: string): boolean {
  return /^(public domain|pd\b|pd-|cc0|cc-zero|no restrictions)/i.test(license.trim());
}

/**
 * Czyta odpowiedź API Commons (formatversion=2). Zwraca pliki według tytułu, o który pytaliśmy;
 * tytułów, których w Commons nie ma, w wyniku brakuje.
 */
export function parseCommonsResponse(json: unknown): Map<string, CommonsFile> {
  const out = new Map<string, CommonsFile>();
  const query = (json as { query?: { normalized?: { from: string; to: string }[]; pages?: unknown[] } }).query;
  if (!query?.pages) return out;
  const asked = new Map((query.normalized ?? []).map((n) => [n.to, n.from]));
  for (const raw of query.pages) {
    const page = raw as {
      title: string;
      missing?: boolean;
      imageinfo?: {
        thumburl?: string;
        url?: string;
        descriptionurl?: string;
        thumbmime?: string;
        mime?: string;
        extmetadata?: Record<string, { value?: string }>;
      }[];
    };
    const info = page.imageinfo?.[0];
    if (page.missing || !info) continue;
    const thumbUrl = info.thumburl ?? info.url;
    if (!thumbUrl || !info.descriptionurl) continue;
    out.set(asked.get(page.title) ?? page.title, {
      title: page.title,
      thumbUrl,
      pageUrl: info.descriptionurl,
      license: stripHtml(info.extmetadata?.LicenseShortName?.value ?? ''),
      artist: stripHtml(info.extmetadata?.Artist?.value ?? info.extmetadata?.Credit?.value ?? ''),
      mime: info.thumbmime ?? info.mime ?? '',
    });
  }
  return out;
}

/** Wybiera pierwszy tytuł z listy, który istnieje, jest w domenie publicznej i ma pasujący format. */
export function pickCandidate(
  entry: ImageEntry,
  files: Map<string, CommonsFile>,
): { file: CommonsFile } | { reasons: string[] } {
  const wanted = entry.file.endsWith('.png') ? 'image/png' : 'image/jpeg';
  const reasons: string[] = [];
  for (const title of entry.commons) {
    const file = files.get(title);
    if (!file) reasons.push(`${title}: nie ma takiego pliku w Commons`);
    else if (!isPublicDomain(file.license))
      reasons.push(`${title}: licencja „${file.license || 'nieznana'}” to nie domena publiczna`);
    else if (file.mime !== wanted)
      reasons.push(`${title}: format ${file.mime || 'nieznany'}, a manifest chce ${wanted}`);
    else return { file };
  }
  return { reasons };
}

export function commonsQueryUrl(titles: readonly string[]): string {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|mime',
    iiurlwidth: String(IMAGE_WIDTH),
    titles: titles.join('|'),
  });
  return `${API}?${params.toString()}`;
}

const pause = (ms: number) => new Promise((done) => setTimeout(done, ms));

export interface DownloadOptions {
  /** Pobierz także pliki, które już są na dysku. */
  force?: boolean;
  fetch?: typeof fetch;
  log?: (line: string) => void;
  pauseMs?: number;
}

/** Pobiera brakujące zdjęcia. Zwraca liczby do podsumowania; niczego nie rzuca przy pojedynczej porażce. */
export async function downloadImages(
  dataDir: string,
  images: readonly ImageEntry[],
  options: DownloadOptions = {},
): Promise<{ saved: number; present: number; skipped: number }> {
  const get = options.fetch ?? fetch;
  const log = options.log ?? console.log;
  const dir = join(dataDir, IMAGE_FILES_DIR);
  const creditsPath = join(dataDir, IMAGE_CREDITS_FILE);
  await mkdir(dir, { recursive: true });
  let credits: Record<string, ImageCredit> = {};
  try {
    credits = JSON.parse(await readFile(creditsPath, 'utf8')) as Record<string, ImageCredit>;
  } catch {
    // Pierwsze uruchomienie: pliku źródeł jeszcze nie ma.
  }
  const headers = { 'User-Agent': USER_AGENT, Accept: 'application/json' };
  const tally = { saved: 0, present: 0, skipped: 0 };

  for (const entry of images) {
    if (!options.force && existsSync(join(dir, entry.file)) && credits[entry.file]) {
      tally.present += 1;
      continue;
    }
    try {
      const response = await get(commonsQueryUrl(entry.commons), { headers });
      if (!response.ok) throw new Error(`Commons odpowiada kodem ${response.status}`);
      const picked = pickCandidate(entry, parseCommonsResponse(await response.json()));
      if ('reasons' in picked) {
        tally.skipped += 1;
        log(`  pominięte  ${entry.file}`);
        for (const reason of picked.reasons) log(`             ${reason}`);
      } else {
        const image = await get(picked.file.thumbUrl, { headers: { 'User-Agent': USER_AGENT } });
        if (!image.ok) throw new Error(`plik odpowiada kodem ${image.status}`);
        await writeFile(join(dir, entry.file), Buffer.from(await image.arrayBuffer()));
        credits[entry.file] = {
          title: picked.file.title,
          artist: picked.file.artist,
          license: picked.file.license,
          source: picked.file.pageUrl,
        };
        await writeFile(creditsPath, `${JSON.stringify(credits, null, 2)}\n`, 'utf8');
        tally.saved += 1;
        log(`  pobrane    ${entry.file}  (${picked.file.license}; ${picked.file.artist || 'autor nieznany'})`);
      }
    } catch (e) {
      tally.skipped += 1;
      log(`  błąd       ${entry.file}: ${e instanceof Error ? e.message : String(e)}`);
    }
    await pause(options.pauseMs ?? PAUSE_MS);
  }
  return tally;
}
