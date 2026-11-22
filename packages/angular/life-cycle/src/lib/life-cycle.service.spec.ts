import { TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { EMPTY, of, Subject } from 'rxjs';
import { LifeCycleService } from './life-cycle.service';

// Flushes all pending microtasks (promise chains) without relying on zone.js
const flushPromises = () => new Promise<void>((resolve) => setTimeout(resolve));

describe('LifeCycle', () => {
  describe('LifeCycleService', () => {
    const isStable = new Subject();
    let lifeCycle: LifeCycleService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: ApplicationRef,
            useValue: { isStable, afterTick: EMPTY },
          },
        ],
      });

      lifeCycle = TestBed.inject(LifeCycleService);
    });

    it('should resolve when app is ready', async () => {
      const observable$ = lifeCycle.whenReady(of('ready'));
      const promise$ = lifeCycle.whenReady(Promise.resolve('ready'));
      const observableFunction$ = lifeCycle.whenReady(() => of('ready'));
      const promiseFunction$ = lifeCycle.whenReady(() =>
        Promise.resolve('ready'),
      );
      const function$ = lifeCycle.whenReady(() => 'ready');

      const observableSpy = jest.fn();
      const promiseSpy = jest.fn();
      const observableFunctionSpy = jest.fn();
      const promiseFunctionSpy = jest.fn();
      const functionSpy = jest.fn();

      observable$.subscribe(observableSpy);
      promise$.subscribe(promiseSpy);
      observableFunction$.subscribe(observableFunctionSpy);
      promiseFunction$.subscribe(promiseFunctionSpy);
      function$.subscribe(functionSpy);

      expect(observableSpy).not.toHaveBeenCalled();
      expect(promiseSpy).not.toHaveBeenCalled();
      expect(observableFunctionSpy).not.toHaveBeenCalled();
      expect(promiseFunctionSpy).not.toHaveBeenCalled();
      expect(functionSpy).not.toHaveBeenCalled();

      isStable.next(false);
      await flushPromises();

      expect(observableSpy).not.toHaveBeenCalled();
      expect(promiseSpy).not.toHaveBeenCalled();
      expect(observableFunctionSpy).not.toHaveBeenCalled();
      expect(promiseFunctionSpy).not.toHaveBeenCalled();
      expect(functionSpy).not.toHaveBeenCalled();

      isStable.next(false);
      await flushPromises();

      expect(observableSpy).not.toHaveBeenCalled();
      expect(promiseSpy).not.toHaveBeenCalled();
      expect(observableFunctionSpy).not.toHaveBeenCalled();
      expect(promiseFunctionSpy).not.toHaveBeenCalled();
      expect(functionSpy).not.toHaveBeenCalled();

      isStable.next(true);
      await flushPromises();

      expect(observableSpy).toHaveBeenCalled();
      expect(promiseSpy).toHaveBeenCalled();
      expect(observableFunctionSpy).toHaveBeenCalled();
      expect(promiseFunctionSpy).toHaveBeenCalled();
      expect(functionSpy).toHaveBeenCalled();

      isStable.next(true);
      await flushPromises();

      expect(observableSpy).toHaveBeenCalledTimes(1);
      expect(promiseSpy).toHaveBeenCalledTimes(1);
      expect(observableFunctionSpy).toHaveBeenCalledTimes(1);
      expect(promiseFunctionSpy).toHaveBeenCalledTimes(1);
      expect(functionSpy).toHaveBeenCalledTimes(1);
    });
  });
});
