import { TestBed } from '@angular/core/testing';
import { Injector, inject, InjectionToken } from '@angular/core';
import { ToMethodWithInjectionContext, ToMethodWithInjectionContextFactory } from './to-method';

const TEST_TOKEN = new InjectionToken<string>('TEST_TOKEN');

describe('to-method', () => {
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TEST_TOKEN, useValue: 'test-value' }
      ]
    });
    injector = TestBed.inject(Injector);
  });

  describe('ToMethodWithInjectionContext', () => {
    it('should run inside the injection context and inject tokens correctly', async () => {
      const fn = () => {
        const value = inject(TEST_TOKEN);
        return value;
      };

      const method = ToMethodWithInjectionContext(fn, injector);
      const result = await method.call();

      expect(result).toBe('test-value');
    });

    it('should work with asynchronous functions returning a Promise', async () => {
      const fn = async () => {
        const value = inject(TEST_TOKEN);
        return Promise.resolve(value);
      };

      const method = ToMethodWithInjectionContext(fn, injector);
      const result = await method.call();

      expect(result).toBe('test-value');
    });

    it('should reject the promise when a synchronous error is thrown', async () => {
      const fn = () => {
        throw new Error('sync error');
      };

      const method = ToMethodWithInjectionContext(fn, injector);

      await expect(method.call()).rejects.toThrow('sync error');
    });

    it('should reject the promise when an asynchronous error is thrown', async () => {
      const fn = async () => {
        throw new Error('async error');
      };

      const method = ToMethodWithInjectionContext(fn, injector);

      await expect(method.call()).rejects.toThrow('async error');
    });

    it('should reject the promise if injector is not provided', async () => {
      const fn = () => 'test';
      const method = ToMethodWithInjectionContext(fn, null as any);

      await expect(method.call()).rejects.toThrow('The injector is not defined. Can not run the method in the injection context.');
    });

    it('should preserve custom metadata', () => {
      const fn = () => 'test';
      const customMetadata = { id: 'custom-id', custom: true };
      const method = ToMethodWithInjectionContext(fn, injector, customMetadata);

      expect(method.metadata).toEqual(customMetadata);
    });
  });

  describe('ToMethodWithInjectionContextFactory', () => {
    it('should throw an error synchronously if injector is falsey', () => {
      const fn = () => 'test';
      const factory = ToMethodWithInjectionContextFactory(fn);

      expect(() => factory(null as any)).toThrow('The injector is not defined. Ensure the factory is used in conjunction with deps: [ INJECTOR ]');
    });

    it('should return a working method when provided a valid injector', async () => {
      const fn = () => {
        return inject(TEST_TOKEN);
      };
      const factory = ToMethodWithInjectionContextFactory(fn);
      const method = factory(injector);

      const result = await method.call();
      expect(result).toBe('test-value');
    });
  });
});
