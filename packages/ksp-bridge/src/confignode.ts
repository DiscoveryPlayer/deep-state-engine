/**
 * Parser formatu ConfigNode, w którym KSP zapisuje pliki .sfs i .craft.
 *
 * Format: węzeł to nazwa, potem „{”, w środku pary „klucz = wartość” i węzły zagnieżdżone, na końcu „}”.
 * Ten sam klucz i ta sama nazwa węzła mogą wystąpić wiele razy, więc trzymamy je na listach.
 * Parser niczego nie interpretuje: liczby i daty czyta dopiero warstwa wyżej (career.ts).
 */
export interface ConfigNode {
  name: string;
  /** Pary klucz–wartość w kolejności z pliku. */
  values: [key: string, value: string][];
  nodes: ConfigNode[];
}

export class ConfigNodeParseError extends Error {
  readonly line: number;

  constructor(message: string, line: number) {
    super(`${message} (wiersz ${line})`);
    this.name = 'ConfigNodeParseError';
    this.line = line;
  }
}

/** Parsuje tekst pliku. Zwraca węzeł-korzeń o pustej nazwie, którego dzieci to węzły najwyższego poziomu. */
export function parseConfigNode(text: string): ConfigNode {
  const root: ConfigNode = { name: '', values: [], nodes: [] };
  const stack: ConfigNode[] = [root];
  let pendingName: string | null = null;
  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]!;
    const comment = line.indexOf('//');
    // Komentarz „//” kończy wiersz, ale tylko poza wartością (adresy URL w wartościach zostają).
    if (comment !== -1 && !line.slice(0, comment).includes('=')) line = line.slice(0, comment);
    line = line.trim();
    if (line === '') continue;

    if (line === '{') {
      if (pendingName === null) throw new ConfigNodeParseError('Nawias „{” bez nazwy węzła', i + 1);
      const node: ConfigNode = { name: pendingName, values: [], nodes: [] };
      stack[stack.length - 1]!.nodes.push(node);
      stack.push(node);
      pendingName = null;
      continue;
    }
    if (pendingName !== null) throw new ConfigNodeParseError(`Po nazwie węzła „${pendingName}” brakuje „{”`, i + 1);
    if (line === '}') {
      if (stack.length === 1) throw new ConfigNodeParseError('Nawias „}” bez otwartego węzła', i + 1);
      stack.pop();
      continue;
    }
    const eq = line.indexOf('=');
    if (eq === -1) {
      pendingName = line;
      continue;
    }
    stack[stack.length - 1]!.values.push([line.slice(0, eq).trim(), line.slice(eq + 1).trim()]);
  }
  if (pendingName !== null)
    throw new ConfigNodeParseError(`Plik kończy się nazwą węzła „${pendingName}”`, lines.length);
  if (stack.length !== 1) {
    throw new ConfigNodeParseError(
      `Plik kończy się w środku węzła „${stack.at(-1)!.name}” (ucięty zapis?)`,
      lines.length,
    );
  }
  return root;
}

/** Pierwsza wartość klucza albo undefined. */
export function value(node: ConfigNode | undefined, key: string): string | undefined {
  return node?.values.find(([k]) => k === key)?.[1];
}

/** Wartość liczbowa klucza albo `fallback`, gdy klucza nie ma lub nie jest liczbą. */
export function num(node: ConfigNode | undefined, key: string, fallback = 0): number {
  const raw = value(node, key);
  if (raw === undefined) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

/** Pierwszy węzeł-dziecko o danej nazwie. */
export function child(node: ConfigNode | undefined, name: string): ConfigNode | undefined {
  return node?.nodes.find((n) => n.name === name);
}

/** Wszystkie węzły-dzieci o danej nazwie. */
export function children(node: ConfigNode | undefined, name: string): ConfigNode[] {
  return node?.nodes.filter((n) => n.name === name) ?? [];
}

/** Węzeł po ścieżce nazw, np. path(game, 'FLIGHTSTATE'). */
export function path(node: ConfigNode | undefined, ...names: string[]): ConfigNode | undefined {
  let current = node;
  for (const name of names) current = child(current, name);
  return current;
}

/** Zapisuje węzły z powrotem do formatu KSP (tabulatory, jak w oryginale). */
export function serializeConfigNode(root: ConfigNode): string {
  const out: string[] = [];
  const write = (node: ConfigNode, depth: number) => {
    const pad = '\t'.repeat(depth);
    out.push(`${pad}${node.name}`, `${pad}{`);
    for (const [k, v] of node.values) out.push(`${pad}\t${k} = ${v}`);
    for (const n of node.nodes) write(n, depth + 1);
    out.push(`${pad}}`);
  };
  for (const n of root.nodes) write(n, 0);
  return out.join('\n') + '\n';
}
