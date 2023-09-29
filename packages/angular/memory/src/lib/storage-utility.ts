/**
 * Expiration time unit
 * s: seconds
 * m: minute
 * h: hour
 * d: day
 * w: week
 * y: year
 * t: Custom (millisecond)
 */
export type ExpiredUnit = 's' | 'm' | 'h' | 'd' | 'w' | 'y' | 't';

/**
 * Determining if an Angular application is rendered in the browser
 * The Angular `PLATFORM_ID` identifier cannot be used directly by the `decorator`.
 * The advantage of this is that it also works well when the server populates the Document itself.
 */
export const isBrowser = typeof document === 'object' && !!document;

export function StorageGet(storage: Storage | null, key: string): unknown {
  if (storage === null) {
    return null;
  }
  const value = parse(storage.getItem(key) ?? 'null') ?? null;
  if (value === null) {
    return null;
  }
  if (typeof value === 'object' && typeof value._expired !== 'undefined' && value._expired !== 0 && +new Date() >
      value._expired) {
    StorageRemove(storage, key);
    return null;
  }

  return value._value ?? null;
}

export function StorageHas(storage: Storage | null, key: string): boolean {
  if (storage === null) {
    return false;
  }
  return storage.getItem(key) !== null;
}

export function StorageSet(
  storage: Storage | null, key: string, value: any, expiredAt = 0, expiredUnit: ExpiredUnit = 't'): void {
  if (storage === null) {
    return;
  }
  storage.setItem(
    key,
    stringify({
      _expired: getExpired(expiredAt, expiredUnit),
      _value: value,
    }),
  );
}

export function StorageRemove(storage: Storage | null, key: string): void {
  if (storage === null) {
    return;
  }
  storage.removeItem(key);
}

export function StorageKey(storage: Storage | null, index: number): string | null {
  if (storage === null) {
    return null;
  }
  return storage.key(index);
}

export function getExpired(val: number, unit: ExpiredUnit): number {
  if (val <= 0) {
    return 0;
  }
  const now = +new Date();
  switch (unit) {
    case 's': // second
      return now + 1000 * val;
    case 'm': // minute
      return now + 1000 * 60 * val;
    case 'h': // hour
      return now + 1000 * 60 * 60 * val;
    case 'd': // day
      return now + 1000 * 60 * 60 * 24 * val;
    case 'w': // week
      return now + 1000 * 60 * 60 * 24 * 7 * val;
    case 'y': // year
      return now + 1000 * 60 * 60 * 24 * 365 * val;
    case 't': // customisation
      return now + val;
    default:
      throw new Error('Invalid expired unit');
  }
  return 0;
}

export function stringify(value: any): string {
  return JSON.stringify(value);
}

function parse(text: string): any {
  try {
    return JSON.parse(text) ?? null;
  } catch (e) {
    return text;
  }
}

export class MockStorage implements Storage {

  cache: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.cache).length;
  }

  getItem(key: string): string | null {
    return this.cache[key] ?? null;
  }

  key(index: number): string | null {
    return Object.keys(this.cache)[index] ?? null;
  }

  removeItem(key: string): void {
    if (this.cache[key] !== undefined) {
      delete this.cache[key];
    }
  }

  setItem(key: string, value: string): void {
    this.cache[key] = value;
  }

  clear(): void {
    this.cache = {};
  }

}
