import { Injectable, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { RxapDataSource } from './base.data-source';
import { DataSourceLoader } from './data-source-loader';
import { DataSourceRefreshToMethodAdapterFactory } from './data-source-refresh-to-method-adapter-factory';
import { ObservableDataSource, observableDataSource, RxapObservableDataSource } from './observable.data-source';
import { staticDataSource } from './static.data-source';

describe('ObservableDataSource', () => {
  it('uses the injected observable, falling back to the metadata data', () => {
    const values: unknown[] = [];
    new ObservableDataSource(of(1), { id: 'a' }).connect({ id: 'v' }).subscribe((v) => values.push(v));
    new ObservableDataSource(null, { id: 'b', data: of(2) }).connect({ id: 'v' }).subscribe((v) => values.push(v));
    expect(values).toEqual([1, 2]);
  });

  it('observableDataSource creates a source with a default id', () => {
    const ds = observableDataSource(new BehaviorSubject(5));
    expect(ds.id).toBe('static');
  });

  it('RxapObservableDataSource registers metadata', () => {
    @RxapObservableDataSource({ id: 'decorated', data: of(9) })
    @Injectable()
    class Decorated extends ObservableDataSource<number> {}
    TestBed.configureTestingModule({ providers: [{ provide: Decorated, useFactory: () => new Decorated(null) }] });
    expect(TestBed.inject(Decorated).id).toBe('decorated');
    expect(RxapDataSource).toBeDefined();
  });
});

describe('DataSourceLoader', () => {
  it('connects to an instance', () => {
    const values: unknown[] = [];
    TestBed.inject(DataSourceLoader)
      .connect(staticDataSource([1], { id: 's' }), { id: 'v' })
      .subscribe((v) => values.push(v));
    expect(values).toEqual([[1]]);
    expect(Injector).toBeDefined();
  });
});

describe('DataSourceRefreshToMethodAdapterFactory', () => {
  it('creates a method that refreshes the data source', async () => {
    const ds = staticDataSource([1], { id: 's' });
    const refresh = jest.spyOn(ds, 'refresh');
    const method = DataSourceRefreshToMethodAdapterFactory(ds);
    await method.call();
    expect(refresh).toHaveBeenCalled();
  });
});
