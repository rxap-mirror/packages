import { TestBed } from '@angular/core/testing';
import { tap } from 'rxjs';
import {
  ProvidePubSub,
  withDisableCache,
  withDisableGarbageCollector,
} from './provide';
import { PubSubService } from './pub-sub.service';
import { RXAP_PUB_SUB_CACHE_SIZE } from './tokens';

describe('PubSubService', () => {

  let service: PubSubService;

  it('should be created', () => {
    TestBed.configureTestingModule({
      providers: [
        ProvidePubSub(),
      ],
    });

    service = TestBed.inject(PubSubService);

    expect(service).toBeDefined();
  });

  it('should throw if the garbage collector is not initialized', () => {
    TestBed.configureTestingModule({
      providers: [
        PubSubService,
      ],
    });

    service = TestBed.inject(PubSubService);
    expect(() => service.publish('test')).toThrowError('Garbage collector is not initialized');
    expect(() => service.subscribe('test')).toThrowError('Garbage collector is not initialized');
    expect(() => service.getFromCache('test')).toThrowError('Garbage collector is not initialized');
  });

  it('should not throw if the garbage collector is initialized', () => {
    TestBed.configureTestingModule({
      providers: [
        ProvidePubSub(),
      ],
    });

    service = TestBed.inject(PubSubService);
    expect(() => service.publish('test')).not.toThrowError('Garbage collector is not initialized');
    expect(() => service.subscribe('test')).not.toThrowError('Garbage collector is not initialized');
    expect(() => service.getFromCache('test')).not.toThrowError('Garbage collector is not initialized');
  });

  describe('with disabled cache', () => {

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          ProvidePubSub(withDisableCache()),
        ],
      });

      service = TestBed.inject(PubSubService);
    });

    it('should throw if the topic is empty', () => {
      expect(() => service.publish('')).toThrowError('topic parameter must be a string and must not be empty');
      expect(() => service.publish(' ')).toThrowError('topic parameter must be a string and must not be empty');
      expect(() => service.subscribe('')).toThrowError('topic parameter must be a string and must not be empty');
      expect(() => service.subscribe(' ')).toThrowError('topic parameter must be a string and must not be empty');
    });

    it('should emit if a message with matching topic is published', () => {
      const spy = jest.fn();
      service.subscribe('test').subscribe(spy);
      service.publish('test');
      expect(spy).toBeCalledTimes(1);
    });

    it('should not interfere with other subscribers', () => {
      const spyA = jest.fn();
      const spyB = jest.fn();
      service.subscribe('test').pipe(tap(() => {
        throw new Error('some error');
      })).subscribe(spyA);
      service.subscribe('test').subscribe(spyB);
      service.publish('test');
      expect(spyA).not.toBeCalled();
      expect(spyB).toBeCalledTimes(1);
      service.publish('test');
      expect(spyA).not.toBeCalled();
      expect(spyB).toBeCalledTimes(2);
    });

    it('should publish a message to all subscribers', () => {
      const spy = jest.fn();
      service.subscribe('test').subscribe(spy);
      service.subscribe('test').subscribe(spy);
      service.publish('test');
      expect(spy).toBeCalledTimes(2);
    });

  });

  describe('with cache', () => {

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          ProvidePubSub(),
        ],
      });

      service = TestBed.inject(PubSubService);
    });

    it('should start the garbage collector', () => {
      expect(Reflect.get(service, 'garbageCollectorSubscription')).toBeDefined();
    });

    it.each(Array.from({ length: 10 }, (_, i) => i + 1))('should cache %i messages', count => {
      for (let i = 0; i < count; i++) {
        service.publish('test');
        service.publish('foo');
      }
      expect(service.getFromCache('test')).toHaveLength(count);
      expect(service.cacheSize).toBe(count * 2);
    });

    it('should return messages from the cache', () => {
      const spy = jest.fn();
      service.publish('test');
      service.subscribe('test', 1).subscribe(spy);
      expect(spy).toBeCalledTimes(1);
    });

    it('should return messages from the cache based on the given replayCount', () => {
      const spy = jest.fn();
      for (let i = 0; i < 10; i++) {
        service.publish('test');
      }
      service.subscribe('test', 10).subscribe(spy);
      expect(spy).toBeCalledTimes(10);
    });

    it('should remove messages from the cache based on the given retention', () => {
      const spyA = jest.fn();
      const spyB = jest.fn();
      const now = Date.now();
      service.publish('test', undefined, 1);
      service.subscribe('test', 1).subscribe(spyA);
      expect(spyA).toBeCalledTimes(1);
      const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValueOnce(now + 1000);
      service.runGarbageCollector();
      dateNowSpy.mockRestore();
      service.subscribe('test', 1).subscribe(spyB);
      expect(service.getFromCache('test')).toHaveLength(0);
      expect(spyA).toBeCalledTimes(1);
      expect(spyB).toBeCalledTimes(0);
    });

    it.each(Array.from({ length: 15 }, (_, i) => (
                                                   i + 1
                                                 ) * 10))(
      'should remove messages (%i) from the cache based on the given limit', count => {
        const cacheSize = TestBed.inject(RXAP_PUB_SUB_CACHE_SIZE);
        for (let i = 0; i < count; i++) {
          service.publish('test');
        }
        if (count > cacheSize) {
          expect(service.getFromCache('test', count)).toHaveLength(cacheSize);
        } else {
          expect(service.getFromCache('test', count)).toHaveLength(count);
        }
      });

  });

  describe('with disabled garbage collector', () => {

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          ProvidePubSub(withDisableGarbageCollector()),
        ],
      });

      service = TestBed.inject(PubSubService);
    });

    it('should not start the garbage collector', () => {
      expect(Reflect.get(service, 'garbageCollectorSubscription')).toBeNull();
    });

  });

  describe('topicMatch', () => {

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          ProvidePubSub(withDisableCache()),
        ],
      });

      service = TestBed.inject(PubSubService);
    });

    it('should match simple topics', () => {
      expect(service.topicMatch('test', 'test')).toBeTruthy();
      expect(service.topicMatch('test', 'foo')).toBeFalsy();
    });

    it('should match topics with wildcards', () => {
      expect(service.topicMatch('test.foo', 'test.*')).toBeTruthy();
      expect(service.topicMatch('test.foo', 'bar.*')).toBeFalsy();
      expect(service.topicMatch('test.foo', 'test.**')).toBeTruthy();
      expect(service.topicMatch('test.foo', 'bar.**')).toBeFalsy();
      expect(service.topicMatch('test.foo', 'test.**.foo')).toBeTruthy();
      expect(service.topicMatch('test.foo.bar', 'test.foo.*')).toBeTruthy();
      expect(service.topicMatch('test.foo.bar', 'test.*.bar')).toBeTruthy();
      expect(service.topicMatch('test.foo.sub.sub.bar', 'test.**.bar')).toBeTruthy();
      expect(service.topicMatch('test.foo', 'test.**.bar')).toBeTruthy();
      expect(service.topicMatch('test.foo', '**.bar')).toBeTruthy();
      expect(service.topicMatch('test.foo', '*.foo')).toBeTruthy();
      expect(service.topicMatch('test.foo', 'test.*.bar')).toBeFalsy();
    });

  });

});
