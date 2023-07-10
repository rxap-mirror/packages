import {
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import {
  of,
  Subject,
} from 'rxjs';
import { LifeCycleService } from './life-cycle.service';

describe('LifeCycle', () => {

  describe('LifeCycleService', () => {

    const isStable = new Subject();
    let lifeCycle: LifeCycleService;

    beforeEach(() => {

      TestBed.configureTestingModule({
        providers: [
          {
            provide: ApplicationRef,
            useValue: { isStable },
          },
        ],
      });

      lifeCycle = TestBed.inject(LifeCycleService);

    });

    it('should resolve when app is ready', fakeAsync(() => {

      const observable$ = lifeCycle.whenReady(of('ready'));
      const promise$ = lifeCycle.whenReady(Promise.resolve('ready'));
      const observableFunction$ = lifeCycle.whenReady(() => of('ready'));
      const promiseFunction$ = lifeCycle.whenReady(() => Promise.resolve('ready'));
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

      expect(observableSpy).not.toBeCalled();
      expect(promiseSpy).not.toBeCalled();
      expect(observableFunctionSpy).not.toBeCalled();
      expect(promiseFunctionSpy).not.toBeCalled();
      expect(functionSpy).not.toBeCalled();

      isStable.next(false);
      tick();

      expect(observableSpy).not.toBeCalled();
      expect(promiseSpy).not.toBeCalled();
      expect(observableFunctionSpy).not.toBeCalled();
      expect(promiseFunctionSpy).not.toBeCalled();
      expect(functionSpy).not.toBeCalled();

      isStable.next(false);
      tick();

      expect(observableSpy).not.toBeCalled();
      expect(promiseSpy).not.toBeCalled();
      expect(observableFunctionSpy).not.toBeCalled();
      expect(promiseFunctionSpy).not.toBeCalled();
      expect(functionSpy).not.toBeCalled();

      isStable.next(true);
      tick();

      expect(observableSpy).toBeCalled();
      expect(promiseSpy).toBeCalled();
      expect(observableFunctionSpy).toBeCalled();
      expect(promiseFunctionSpy).toBeCalled();
      expect(functionSpy).toBeCalled();

      isStable.next(true);
      tick();

      expect(observableSpy).toBeCalledTimes(1);
      expect(promiseSpy).toBeCalledTimes(1);
      expect(observableFunctionSpy).toBeCalledTimes(1);
      expect(promiseFunctionSpy).toBeCalledTimes(1);
      expect(functionSpy).toBeCalledTimes(1);

    }));

  });

});
