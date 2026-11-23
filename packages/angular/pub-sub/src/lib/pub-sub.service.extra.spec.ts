import { TestBed } from '@angular/core/testing';
import { ProvidePubSub, withDisableCache, withDisableGarbageCollector, withGarbageCollectorInterval, withMaxCacheSize } from './provide';
import { PubSubService } from './pub-sub.service';

describe('PubSubService (extra)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function create(...providers: any[]) {
    TestBed.configureTestingModule({ providers: [ProvidePubSub(...providers)] });
    return TestBed.inject(PubSubService);
  }

  describe('topicMatch', () => {
    const s = () => create();
    it.each([
      ['a.b', 'a.b', true],
      ['a.b', 'a.c', false],
      ['a.b', 'a.*', true],
      ['a.b', '*.b', true],
      ['a.b.c', 'a.*', false],
      ['a', 'a.b', false],
      ['a.b', 'a', false],
      ['a.b.c', 'a.**', true],
      ['a.b.c.d', '**', true],
    ])('%s vs %s -> %s', (topic, wildcard, expected) => {
      expect(s().topicMatch(topic, wildcard)).toBe(expected);
    });
  });

  it('delivers matching messages to subscribers', () => {
    const service = create();
    const received: any[] = [];
    service.subscribe<number>('x.*').subscribe((m) => received.push([m.topic, m.data]));
    service.publish('x.a', 1);
    service.publish('y.a', 2);
    service.publish('x.b', 3);
    expect(received).toEqual([['x.a', 1], ['x.b', 3]]);
  });

  it('replays cached messages', () => {
    const service = create();
    service.publish('t', 1);
    service.publish('t', 2);
    service.publish('t', 3);
    const received: any[] = [];
    service.subscribe<number>('t', 2).subscribe((m) => received.push(m.data));
    expect(received).toEqual([3, 2]);
    service.publish('t', 4);
    expect(received).toEqual([3, 2, 4]);
  });

  it('rejects empty topics', () => {
    const service = create();
    expect(() => service.publish('  ')).toThrow('topic parameter');
    expect(() => service.subscribe('')).toThrow('topic parameter');
  });

  it('limits getFromCache and returns newest first', () => {
    const service = create();
    for (let i = 0; i < 5; i++) service.publish('t', i);
    expect(service.getFromCache<number>('t').map((m) => m.data)).toEqual([4, 3, 2, 1, 0]);
    expect(service.getFromCache<number>('t', 2).map((m) => m.data)).toEqual([4, 3]);
    expect(service.getFromCache('other')).toEqual([]);
  });

  it('evicts the oldest message when the cache is full', () => {
    const service = create(withMaxCacheSize(2));
    service.publish('t', 1);
    service.publish('t', 2);
    service.publish('t', 3);
    expect(service.cacheSize).toBe(2);
    expect(service.getFromCache<number>('t').map((m) => m.data)).toEqual([3, 2]);
    service.setMaxCacheSize(1);
    service.publish('t', 4);
    expect(service.cacheSize).toBe(2);
  });

  it('does not cache with retention 0 or if the cache is disabled', () => {
    const service = create();
    service.publish('t', 1, 0);
    expect(service.cacheSize).toBe(0);

    TestBed.resetTestingModule();
    const noCache = create(withDisableCache());
    noCache.publish('t', 1);
    expect(noCache.cacheSize).toBe(0);
  });

  it('garbage collects expired messages periodically', () => {
    vi.useFakeTimers().setSystemTime(0);
    const service = create(withGarbageCollectorInterval(100));
    service.publish('short', 1, 50);
    service.publish('forever', 2);
    vi.advanceTimersByTime(101);
    expect(service.getFromCache('short')).toEqual([]);
    expect(service.getFromCache('forever')).toHaveLength(1);
    service.stopGarbageCollector();
    service.publish('short', 3, 10);
    vi.advanceTimersByTime(1000);
    expect(service.getFromCache('short')).toHaveLength(1);
  });

  it('warns on duplicate and disabled garbage collector start', () => {
    const service = create();
    service.startGarbageCollector();
    expect(console.warn).toHaveBeenCalledWith('Garbage collector is already initialized');

    TestBed.resetTestingModule();
    const disabled = create(withDisableGarbageCollector());
    expect(console.warn).toHaveBeenCalledWith('Garbage collector is disabled');
    expect(disabled['garbageCollectorSubscription']).toBeNull();
  });

  it('stops the garbage collector on destroy', () => {
    const service = create();
    const spy = vi.spyOn(service, 'stopGarbageCollector');
    TestBed.resetTestingModule();
    expect(spy).toHaveBeenCalled();
  });
});
