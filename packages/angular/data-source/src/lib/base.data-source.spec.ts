import {
  Injectable,
  InjectionToken,
  INJECTOR,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import {
  BaseDataSource,
  BaseDataSourceViewer,
  RxapDataSource,
} from './base.data-source';
import { StaticDataSource } from './static.data-source';

describe('@rxap/data-source', () => {
  describe('BaseDataSource', () => {
    it('connect and disconnect', () => {
      TestBed.configureTestingModule({});
      const injector = TestBed.inject(INJECTOR);

      runInInjectionContext(injector, () => {
        const dataSource = new BaseDataSource<any>({
          id: 'test',
        });

        const viewer: BaseDataSourceViewer = { id: 'test' };

        const connection = dataSource.connect(viewer);

        expect(dataSource.isConnected(viewer)).toBeTruthy();

        dataSource.disconnect(viewer);

        expect(dataSource.isConnected(viewer)).toBeFalsy();
      });
    });

    describe('restore data from local storage', () => {
      @RxapDataSource({
        id: 'test',
        restore: true,
      })
      @Injectable()
      class TestDataSource extends BaseDataSource {
        protected override _data$ = new Subject();

        push(data: any) {
          this._data$.next(data);
        }
      }

      let dataSource: TestDataSource;
      let dataSourceB: TestDataSource;

      beforeEach(() => {
        const token = new InjectionToken<TestDataSource>('dataSourceB');
        TestBed.configureTestingModule({
          providers: [
            TestDataSource,
            {
              provide: token,
              useClass: TestDataSource,
            },
          ],
        });
        dataSource = TestBed.inject(TestDataSource);
        dataSourceB = TestBed.inject(token);
        localStorage.getItem('rxap_data-source_test');
      });

      afterEach(() => {
        localStorage.clear();
      });

      it('should save data to local storage', () => {
        dataSource.connect({ id: 'test' }).subscribe();
        const data = 'test';
        dataSource.push(data);
        expect(
          localStorage.getItem('rxap_data-source_TestDataSource_test'),
        ).toBe(JSON.stringify(data));
      });

      it('should restore data from local storage', () => {
        const data = 'test';
        localStorage.setItem(
          'rxap_data-source_TestDataSource_test',
          JSON.stringify(data),
        );

        const spy = jest.fn();
        dataSource.connect({ id: 'test' }).subscribe(spy);
        expect(spy).toHaveBeenCalledWith(data);

        dataSource.push('new data');
        expect(spy).toHaveBeenCalledTimes(2);
      });

      it('should not restore data from local storage if restore is false', () => {
        const data = 'test';
        localStorage.setItem(
          'rxap_data-source_TestDataSource_test',
          JSON.stringify(data),
        );

        const spy = jest.fn();
        dataSource.connect({ id: 'test', restore: false }).subscribe(spy);
        expect(spy).not.toHaveBeenCalled();

        dataSource.push('new data');
        expect(spy).toHaveBeenCalledWith('new data');
        expect(spy).toHaveBeenCalledTimes(1);
      });

      it('should store and restore complex data', () => {
        const data = { test: 'test' };
        const spyA = jest.fn();
        dataSource.connect({ id: 'test' }).subscribe(spyA);
        dataSource.push(data);
        expect(spyA).toHaveBeenCalledWith(data);
        expect(
          localStorage.getItem('rxap_data-source_TestDataSource_test'),
        ).toBe(JSON.stringify(data));

        const spyB = jest.fn();
        dataSourceB.connect({ id: 'test' }).subscribe(spyB);
        expect(spyB).toHaveBeenCalledWith(data);
      });

      it('should handle complex data with circular references', () => {
        const data: any = { test: 'test' };
        data.data = data;
        const spyA = jest.fn();
        dataSource.connect({ id: 'test' }).subscribe(spyA);
        dataSource.push(data);
        expect(spyA).toHaveBeenCalledWith(data);
        expect(
          localStorage.getItem('rxap_data-source_TestDataSource_test'),
        ).toBeNull();

        const spyB = jest.fn();
        dataSourceB.connect({ id: 'test' }).subscribe(spyB);
        expect(spyB).not.toHaveBeenCalled();
      });
    });
  });

  describe('StaticDataSource', () => {
    const staticData = 'data';
    let dataSource: StaticDataSource<string>;

    beforeEach(() => {
      TestBed.configureTestingModule({});
      runInInjectionContext(TestBed.inject(INJECTOR), () => {
        dataSource = new StaticDataSource<string>(staticData, {
          id: 'test',
          deps: [],
        });
      });
    });

    it('should emit static data on subscribe', () => {
      const connection = dataSource.connect({ id: 'test' });

      const nextSpy = jest.fn();
      const errorSpy = jest.fn();
      const completeSpy = jest.fn();

      connection.subscribe(nextSpy, errorSpy, completeSpy);

      expect(nextSpy).toHaveBeenCalledTimes(1);
      expect(nextSpy).toHaveBeenCalledWith(staticData);
      expect(errorSpy).not.toHaveBeenCalled();
      expect(completeSpy).not.toHaveBeenCalled();

      dataSource.disconnect({ id: 'test' });
    });

    it('should emit data if changed', () => {
      const connection = dataSource.connect({ id: 'test' });

      const nextSpy = jest.fn();
      const errorSpy = jest.fn();
      const completeSpy = jest.fn();

      connection.subscribe(nextSpy, errorSpy, completeSpy);

      expect(nextSpy).toHaveBeenCalledTimes(1);
      expect(nextSpy).toHaveBeenCalledWith(staticData);
      expect(dataSource.data).toBe(staticData);
      expect(errorSpy).not.toHaveBeenCalled();
      expect(completeSpy).not.toHaveBeenCalled();

      const newStaticData = 'new data';

      dataSource.data = newStaticData;

      expect(nextSpy).toHaveBeenCalledTimes(2);
      expect(nextSpy).toHaveBeenNthCalledWith(1, staticData);
      expect(nextSpy).toHaveBeenNthCalledWith(2, newStaticData);
      expect(dataSource.data).toBe(newStaticData);
      expect(errorSpy).not.toHaveBeenCalled();
      expect(completeSpy).not.toHaveBeenCalled();

      dataSource.disconnect({ id: 'test' });
    });
  });

  describe('@RxapDataSource', () => {
    const metadata = {
      id: 'test',
      deps: [],
    };

    @RxapDataSource(metadata)
    @Injectable()
    class DataSource extends BaseDataSource<any> {}

    let injector: Injector;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [DataSource],
      });
      injector = TestBed.inject(INJECTOR);
    });

    it('should add meta data to base data source', () => {
      runInInjectionContext(injector, () => {
        expect(new DataSource().metadata).toEqual(metadata);
      });
    });

    it('should overwrite data source metadata with constructor metadata', () => {
      const customMetadata = {
        id: 'custom',
        deps: [],
      };
      runInInjectionContext(injector, () => {
        expect(new DataSource(customMetadata).metadata).toEqual(customMetadata);
      });
    });
  });
});
