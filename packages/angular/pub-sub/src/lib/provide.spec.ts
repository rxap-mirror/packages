import { TestBed } from '@angular/core/testing';
import {
  ProvidePubSub,
  withDisableCache,
  withDisableGarbageCollector,
  withGarbageCollectorInterval,
  withMaxCacheSize,
} from './provide';
import { PubSubService } from './pub-sub.service';
import {
  RXAP_PUB_SUB_CACHE_SIZE,
  RXAP_PUB_SUB_DISABLE_CACHE,
  RXAP_PUB_SUB_DISABLE_GARBAGE_COLLECTOR,
  RXAP_PUB_SUB_GARBAGE_COLLECTOR_INTERVAL,
} from './tokens';

describe('pub-sub provide helpers', () => {
  it('create value providers', () => {
    expect(withDisableCache()).toEqual({ provide: RXAP_PUB_SUB_DISABLE_CACHE, useValue: true });
    expect(withDisableGarbageCollector()).toEqual({ provide: RXAP_PUB_SUB_DISABLE_GARBAGE_COLLECTOR, useValue: true });
    expect(withMaxCacheSize(5)).toEqual({ provide: RXAP_PUB_SUB_CACHE_SIZE, useValue: 5 });
    expect(withGarbageCollectorInterval(7)).toEqual({ provide: RXAP_PUB_SUB_GARBAGE_COLLECTOR_INTERVAL, useValue: 7 });
  });

  it('has sensible token defaults', () => {
    TestBed.configureTestingModule({});
    expect(TestBed.inject(RXAP_PUB_SUB_CACHE_SIZE)).toBe(100);
    expect(TestBed.inject(RXAP_PUB_SUB_GARBAGE_COLLECTOR_INTERVAL)).toBe(60000);
    expect(TestBed.inject(RXAP_PUB_SUB_DISABLE_CACHE)).toBe(false);
    expect(TestBed.inject(RXAP_PUB_SUB_DISABLE_GARBAGE_COLLECTOR)).toBe(false);
  });

  it('starts the garbage collector on app init', () => {
    TestBed.configureTestingModule({ providers: [ProvidePubSub()] });
    const service = TestBed.inject(PubSubService);
    const spy = jest.spyOn(service, 'startGarbageCollector');
    TestBed.inject(PubSubService); // already created; initializer ran at module creation
    expect(service['garbageCollectorInitialized']).toBe(true);
    spy.mockRestore();
  });
});
