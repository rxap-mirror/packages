import {
  ApplicationRef,
  INJECTOR,
  runInInjectionContext,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Method } from '@rxap/pattern';
import { Subject } from 'rxjs';
import { RxapDataSource } from './base.data-source';
import { MethodDataSource } from './method.data-source';
import { StaticDataSource } from './static.data-source';

/**
 * In zoneless mode `ApplicationRef.whenStable()` only waits for work that is registered as an
 * Angular pending task. These specs prove that the data sources register their in-flight loads.
 */
describe('data source pending tasks', () => {

  interface Deferred<T> {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (error: unknown) => void;
  }

  function deferred<T>(): Deferred<T> {
    let resolve!: (value: T) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }

  const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  /**
   * true if the application becomes stable within a short time, false if Angular still waits for a task
   */
  function isStable(): Promise<boolean> {
    return Promise.race([
      TestBed.inject(ApplicationRef).whenStable().then(() => true),
      sleep(30).then(() => false),
    ]);
  }

  let load: Deferred<string>;
  let callCount: number;

  class TestMethod implements Method<string, { id: string } | undefined> {
    call(): Promise<string> {
      callCount++;
      return load.promise;
    }
  }

  @RxapDataSource('pending-without-parameters')
  class WithoutParametersDataSource extends MethodDataSource<string> {
    constructor() {
      super(new TestMethod(), true);
    }
  }

  @RxapDataSource('pending-with-parameters')
  class WithParametersDataSource extends MethodDataSource<string> {
    constructor() {
      super(new TestMethod());
    }
  }

  function create<T>(factory: () => T): T {
    return runInInjectionContext(TestBed.inject(INJECTOR), factory);
  }

  beforeEach(() => {
    load = deferred<string>();
    callCount = 0;
    TestBed.configureTestingModule({});
  });

  describe('MethodDataSource', () => {

    it('whenStable waits for a slow load', async () => {
      const dataSource = create(() => new WithParametersDataSource());
      const next = vi.fn();
      dataSource.connect({ id: 'viewer' }).subscribe(next);

      expect(callCount).toBe(1);
      expect(await isStable()).toBe(false);
      expect(next).not.toHaveBeenCalled();

      // the real timer makes the load finish while whenStable is already waiting
      setTimeout(() => load.resolve('slow data'), 20);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(next).toHaveBeenCalledWith('slow data');
      expect(await isStable()).toBe(true);
    });

    it('whenStable waits for a slow load triggered by a view change', async () => {
      const dataSource = create(() => new WithParametersDataSource());
      const next = vi.fn();
      const viewChange = new Subject<{ id: string }>();
      dataSource.connect({ id: 'viewer', viewChange }).subscribe(next);

      // no load before the first view change
      expect(await isStable()).toBe(true);

      viewChange.next({ id: 'a' });
      expect(await isStable()).toBe(false);

      load.resolve('data');
      await TestBed.inject(ApplicationRef).whenStable();
      expect(next).toHaveBeenCalledWith('data');
    });

    it('whenStable waits for a load without parameters', async () => {
      const dataSource = create(() => new WithoutParametersDataSource());
      const next = vi.fn();
      dataSource.connect({ id: 'viewer' }).subscribe(next);
      dataSource.init();

      expect(await isStable()).toBe(false);

      load.resolve('data');
      await TestBed.inject(ApplicationRef).whenStable();
      expect(next).toHaveBeenCalledWith('data');
    });

    it('releases the pending task if the load fails', async () => {
      const dataSource = create(() => new WithParametersDataSource());
      const error = vi.fn();
      const errors: unknown[] = [];
      dataSource.error$.subscribe((e) => errors.push(e));
      dataSource.connect({ id: 'viewer' }).subscribe({ error });

      expect(await isStable()).toBe(false);

      const failure = new Error('load failed');
      load.reject(failure);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(error).toHaveBeenCalledWith(failure);
      expect(errors).toEqual([ failure ]);
      expect(dataSource.hasError$.value).toBe(true);
      expect(await isStable()).toBe(true);
    });

    it('releases the pending task if the load without parameters fails', async () => {
      const dataSource = create(() => new WithoutParametersDataSource());
      const errors: unknown[] = [];
      dataSource.error$.subscribe((e) => errors.push(e));
      // the failing refresh rejects the returned promise, which is not handled by the data source
      const refresh = (dataSource as any).executeWithoutParameters().catch((e: unknown) => e);

      expect(await isStable()).toBe(false);

      const failure = new Error('load failed');
      load.reject(failure);
      expect(await refresh).toBe(failure);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(errors).toEqual([ failure ]);
      expect(await isStable()).toBe(true);
    });

    it('releases the pending task if the viewer unsubscribes', async () => {
      const dataSource = create(() => new WithParametersDataSource());
      const subscription = dataSource.connect({ id: 'viewer' }).subscribe();

      expect(await isStable()).toBe(false);

      subscription.unsubscribe();

      expect(await isStable()).toBe(true);
    });

    it('releases the pending task if the viewer disconnects', async () => {
      const dataSource = create(() => new WithParametersDataSource());
      dataSource.connect({ id: 'viewer' }).subscribe();

      expect(await isStable()).toBe(false);

      dataSource.disconnect('viewer');

      expect(await isStable()).toBe(true);
    });

    it('releases the pending task if the data source is destroyed', async () => {
      const dataSource = create(() => new WithoutParametersDataSource());
      (dataSource as any).executeWithoutParameters().catch(() => undefined);

      expect(await isStable()).toBe(false);

      dataSource.ngOnDestroy();

      expect(await isStable()).toBe(true);
    });

    it('releases only the replaced load if the view changes while loading', async () => {
      const first = load;
      const dataSource = create(() => new WithParametersDataSource());
      const viewChange = new Subject<{ id: string }>();
      const next = vi.fn();
      dataSource.connect({ id: 'viewer', viewChange }).subscribe(next);

      viewChange.next({ id: 'a' });
      load = deferred<string>();
      viewChange.next({ id: 'b' });
      expect(callCount).toBe(2);

      // the first load is replaced by switchMap, the second is still in flight
      first.resolve('first');
      expect(await isStable()).toBe(false);
      expect(next).not.toHaveBeenCalled();

      load.resolve('second');
      await TestBed.inject(ApplicationRef).whenStable();
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith('second');
    });

    it('works if created outside of an injection context', async () => {
      const dataSource = new WithParametersDataSource();
      const next = vi.fn();
      dataSource.connect({ id: 'viewer' }).subscribe(next);

      // not tracked by angular, but must not fail
      expect(await isStable()).toBe(true);

      load.resolve('data');
      await sleep(5);
      expect(next).toHaveBeenCalledWith('data');
    });

  });

  describe('StaticDataSource with a promise', () => {

    it('whenStable waits until the promise is resolved', async () => {
      const dataSource = create(() => new StaticDataSource<string>(load.promise, { id: 'static' }));
      const next = vi.fn();
      dataSource.connect({ id: 'viewer' }).subscribe(next);

      expect(await isStable()).toBe(false);
      expect(next).not.toHaveBeenCalled();

      load.resolve('static data');
      await TestBed.inject(ApplicationRef).whenStable();

      expect(next).toHaveBeenCalledWith('static data');
    });

    it('releases the pending task if the promise is rejected', async () => {
      const dataSource = create(() => new StaticDataSource<string>(load.promise, { id: 'static' }));
      const errors: unknown[] = [];
      dataSource.error$.subscribe((e) => errors.push(e));

      expect(await isStable()).toBe(false);

      const failure = new Error('failed');
      load.reject(failure);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(errors).toEqual([ failure ]);
      expect(await isStable()).toBe(true);
    });

    it('releases the pending task if the data source is destroyed while loading', async () => {
      const dataSource = create(() => new StaticDataSource<string>(load.promise, { id: 'static' }));

      expect(await isStable()).toBe(false);

      dataSource.ngOnDestroy();

      expect(await isStable()).toBe(true);
    });

  });

});
