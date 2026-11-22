import { getExpired, MockStorage, StorageHas, StorageKey, StorageRemove, StorageSet, StorageGet } from './storage-utility';

describe('storage-utility (extra)', () => {
  it('handles a null storage in all helpers', () => {
    expect(StorageHas(null, 'a')).toBe(false);
    expect(StorageKey(null, 0)).toBeNull();
    expect(() => StorageRemove(null, 'a')).not.toThrow();
    expect(() => StorageSet(null, 'a', 1)).not.toThrow();
  });

  it('returns keys by index', () => {
    const s = new MockStorage();
    s.setItem('a', '1');
    expect(StorageKey(s, 0)).toBe('a');
    expect(StorageKey(s, 1)).toBeNull();
  });

  it('returns raw non-JSON values as null (no _value)', () => {
    const s = new MockStorage();
    s.setItem('raw', 'not json');
    expect(StorageGet(s, 'raw')).toBeNull();
  });

  it('calculates expiry for every unit', () => {
    jest.useFakeTimers().setSystemTime(1000);
    expect(getExpired(0, 's')).toBe(0);
    expect(getExpired(-1, 's')).toBe(0);
    expect(getExpired(2, 's')).toBe(1000 + 2000);
    expect(getExpired(1, 'm')).toBe(1000 + 60000);
    expect(getExpired(1, 'h')).toBe(1000 + 3600000);
    expect(getExpired(1, 'd')).toBe(1000 + 86400000);
    expect(getExpired(1, 'w')).toBe(1000 + 7 * 86400000);
    expect(getExpired(1, 'y')).toBe(1000 + 365 * 86400000);
    expect(getExpired(5, 't')).toBe(1005);
    expect(() => getExpired(1, 'x' as any)).toThrow('Invalid expired unit');
    jest.useRealTimers();
  });

  it('MockStorage removeItem ignores unknown keys', () => {
    const s = new MockStorage();
    expect(() => s.removeItem('nope')).not.toThrow();
  });
});
