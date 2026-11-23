import { MockStorage } from './storage-utility';
import { StorageService } from './storage.service';

class TestStorageService extends StorageService {
  constructor(storage: Storage | null) {
    super(storage);
  }
}

describe('StorageService', () => {
  let storage: MockStorage;
  let service: TestStorageService;

  beforeEach(() => {
    storage = new MockStorage();
    service = new TestStorageService(storage);
  });

  it('sets, gets and checks values', () => {
    expect(service.has('a')).toBe(false);
    service.set('a', { x: 1 });
    expect(service.has('a')).toBe(true);
    expect(service.get('a')).toEqual({ x: 1 });
  });

  it('expires values using the configured unit', () => {
    vi.useFakeTimers().setSystemTime(0);
    service.set('a', 1, 1, 's');
    expect(service.get('a')).toBe(1);
    vi.setSystemTime(1500);
    expect(service.get('a')).toBeNull();
    expect(service.has('a')).toBe(false);
    vi.useRealTimers();
  });

  it('removes by key', () => {
    service.set('a', 1);
    service.set('b', 2);
    service.remove('a');
    expect(service.has('a')).toBe(false);
    expect(service.has('b')).toBe(true);
  });

  it('removes by regular expression', () => {
    service.set('BMap_1', 1);
    service.set('BMap_2', 2);
    service.set('other', 3);
    service.remove(/^BMap_\w+/);
    expect(service.has('BMap_1')).toBe(false);
    expect(service.has('BMap_2')).toBe(false);
    expect(service.has('other')).toBe(true);
  });

  it('clears everything', () => {
    service.set('a', 1);
    service.clear();
    expect(storage.length).toBe(0);
  });

  it('is a no-op without storage', () => {
    const none = new TestStorageService(null);
    none.set('a', 1);
    expect(none.has('a')).toBe(false);
    expect(none.get('a')).toBeNull();
    expect(() => none.remove('a')).not.toThrow();
    expect(() => none.remove(/a/)).not.toThrow();
    expect(() => none.clear()).not.toThrow();
  });
});
