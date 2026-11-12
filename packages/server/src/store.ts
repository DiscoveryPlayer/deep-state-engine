/**
 * Magazyn kampanii: jeden plik JSON na kampanię w folderze campaigns/ (lokalnie, poza Gitem).
 * Przed każdym zamknięciem kwartału serwer odkłada kopię stanu do campaigns/kopie/.
 */
import { mkdir, readFile, readdir, rename, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { deserializeState, quarterCode, serializeState, type GameState } from '@dse/core';

export const CAMPAIGN_ID = /^[a-z0-9][a-z0-9-]{0,39}$/;

export class CampaignStore {
  readonly dir: string;

  constructor(dir: string) {
    this.dir = dir;
  }

  private file(id: string): string {
    if (!CAMPAIGN_ID.test(id)) throw new Error(`Nieprawidłowy identyfikator kampanii: "${id}".`);
    return join(this.dir, `${id}.json`);
  }

  async list(): Promise<{ id: string; state: GameState; savedAt: Date }[]> {
    let names: string[];
    try {
      names = await readdir(this.dir);
    } catch {
      return [];
    }
    const out: { id: string; state: GameState; savedAt: Date }[] = [];
    for (const name of names.filter((n) => n.endsWith('.json')).sort()) {
      const id = name.slice(0, -'.json'.length);
      if (!CAMPAIGN_ID.test(id)) continue;
      try {
        const path = join(this.dir, name);
        out.push({ id, state: deserializeState(await readFile(path, 'utf8')), savedAt: (await stat(path)).mtime });
      } catch {
        // Uszkodzony plik pomijamy na liście; błąd pokaże się przy próbie otwarcia kampanii.
      }
    }
    return out;
  }

  async exists(id: string): Promise<boolean> {
    try {
      await stat(this.file(id));
      return true;
    } catch {
      return false;
    }
  }

  async load(id: string): Promise<GameState> {
    return deserializeState(await readFile(this.file(id), 'utf8'));
  }

  /** Zapis atomowy: najpierw plik tymczasowy, potem zamiana — przerwany zapis nie psuje kampanii. */
  async save(id: string, state: GameState): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    const target = this.file(id);
    const temp = `${target}.tmp`;
    await writeFile(temp, serializeState(state), 'utf8');
    await rename(temp, target);
  }

  /** Kopia stanu sprzed zamknięcia kwartału, np. campaigns/kopie/pace-1951.1951-Q1.json. */
  async backup(id: string, state: GameState): Promise<void> {
    const dir = join(this.dir, 'kopie');
    await mkdir(dir, { recursive: true });
    this.file(id);
    await writeFile(join(dir, `${id}.${quarterCode(state.quarter)}.json`), serializeState(state), 'utf8');
  }
}
