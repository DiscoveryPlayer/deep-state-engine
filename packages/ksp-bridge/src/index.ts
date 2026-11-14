/**
 * @dse/ksp-bridge — most do KSP RP-1.
 *
 * Faza 1B: odczyt zapisu kariery (.sfs) i wyciąg faktów dla silnika. Pakiet tylko CZYTA pliki
 * wskazane przez gracza. Zapis Korekt do pliku (tryb Zapisu, GDD 19.2) to późniejsza faza.
 */
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import type { KspSnapshot } from '@dse/core';
import { summarizeCareer, type CareerSummary } from './career.ts';
import { parseConfigNode } from './confignode.ts';

export * from './confignode.ts';
export * from './career.ts';

/** Czyta plik .sfs z dysku i zwraca wyciąg faktów z kariery. */
export async function readCareerFile(filePath: string): Promise<CareerSummary> {
  const text = await readFile(filePath, 'utf8');
  return summarizeCareer(parseConfigNode(text), basename(filePath));
}

/**
 * Migawka dla silnika: fakty z kariery i starty, które przybyły od poprzedniej migawki.
 * `knownLaunches` to liczba startów w poprzedniej migawce (0 przy pierwszym wczytaniu).
 */
export function toKspSnapshot(career: CareerSummary, knownLaunches: number): Omit<KspSnapshot, 'quarter'> {
  return {
    file: career.file,
    title: career.title,
    ut: career.ut,
    date: career.date,
    funds: career.funds,
    reputation: career.reputation,
    confidence: career.confidence,
    science: career.science,
    engineers: Math.round(career.engineers),
    researchers: Math.round(career.researchers),
    monthlySalaries: career.monthlySalaries,
    launchSite: career.launchSite,
    launches: career.launches.length,
    failures: career.failures,
    contractsCompleted: career.contractsCompleted,
    programs: career.programs,
    newLaunches: career.launches
      .slice(Math.max(0, knownLaunches))
      .map((l) => ({ vessel: l.vessel, date: l.date, site: l.site, failures: l.failures })),
  };
}
