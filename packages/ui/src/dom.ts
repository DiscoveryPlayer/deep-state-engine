/** Mały pomocnik do budowania drzewa DOM bez bibliotek. Tekst zawsze trafia jako tekst, nigdy jako HTML. */
export type Child = Node | string | number | null | undefined | false;

type Props = Record<string, string | number | boolean | null | undefined | ((event: Event) => void)>;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props | null,
  ...children: (Child | Child[])[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, val] of Object.entries(props ?? {})) {
    // Stany ARIA to napisy "true" i "false", a nie atrybuty logiczne HTML.
    if (key.startsWith('aria-') && typeof val === 'boolean') {
      el.setAttribute(key, String(val));
      continue;
    }
    if (val === null || val === undefined || val === false) continue;
    if (typeof val === 'function') el.addEventListener(key.replace(/^on/, '').toLowerCase(), val);
    else if (key === 'class') el.className = String(val);
    // Styl przez CSSOM, nie przez atrybut: polityka CSP strony blokuje style wpisane w HTML.
    else if (key === 'style') el.style.cssText = String(val);
    else if (val === true) el.setAttribute(key, '');
    else el.setAttribute(key, String(val));
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : String(child));
  }
  return el;
}

const ROMAN = ['I', 'II', 'III', 'IV'];

/** "1951-Q2" → "II kw. 1951". */
export function quarterName(code: string): string {
  const m = /^(\d{4})-Q([1-4])$/.exec(code);
  return m ? `${ROMAN[Number(m[2]) - 1]} kw. ${m[1]}` : code;
}

/** Liczba ze znakiem i przecinkiem dziesiętnym: 1.5 → "+1,5". */
export function signed(n: number, digits = 0): string {
  const text = Math.abs(n).toFixed(digits).replace('.', ',');
  return n > 0 ? `+${text}` : n < 0 ? `−${text}` : text;
}

export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (n === 1) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
