// Session log: the page instruments itself, locally.
// Events live in memory for this tab only. Nothing is stored, nothing is sent.
// Components read it through useSyncExternalStore; anything can call track().

export type LogParams = Record<string, string | number>;
export type LogEvent = { id: number; t: number; name: string; params: LogParams };

const MAX_EVENTS = 200;
const EMPTY: LogEvent[] = [];

let events: LogEvent[] = EMPTY;
let sequence = 0;
const listeners = new Set<() => void>();

/** Seconds since the page started loading. */
export function elapsed(): number {
  return typeof performance === 'undefined' ? 0 : performance.now() / 1000;
}

export function track(name: string, params: LogParams = {}): void {
  if (typeof window === 'undefined') return;
  const event = { id: ++sequence, t: elapsed(), name, params };
  events = [...events, event].slice(-MAX_EVENTS);
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getSnapshot = () => events;
export const getServerSnapshot = () => EMPTY;

/** Attribution: utm parameters first, then the referrer, otherwise direct. */
export function attributionSource(): string {
  const query = new URLSearchParams(window.location.search);
  const utm = query.get('utm_source');
  if (utm) {
    const medium = query.get('utm_medium');
    return medium ? `${utm} / ${medium}` : utm;
  }
  if (document.referrer) {
    try {
      const host = new URL(document.referrer).hostname.replace(/^www\./, '');
      if (host && host !== window.location.hostname) return host;
    } catch {
      // A malformed referrer counts as direct.
    }
  }
  return 'direct';
}

/** mm:ss */
export function clock(seconds: number): string {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function formatParams(params: LogParams): string {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('  ');
}
