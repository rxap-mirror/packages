import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  BaseDataSource,
  staticDataSource,
} from '@rxap/data-source';
import {
  AbstractTableDataSource,
  DynamicTableDataSource,
} from '@rxap/data-source/table';
import {
  RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS,
  RXAP_TABLE_FILTER,
  RXAP_TABLE_FILTER_FORM_DEFINITION,
  TABLE_DATA_SOURCE,
} from '@rxap/material-table-system';
import { ToMethod } from '@rxap/pattern';
import { WindowService } from '@rxap/window-system';
import { Subject } from 'rxjs';
import { OpenTableSelectWindowMethod } from './open-table-select-window.method';
import { TableSelectWindowComponent } from './table-select-window/table-select-window.component';

describe('OpenTableSelectWindowMethod', () => {
  let windowRef: Subject<any>;
  const open = jest.fn();
  let method: OpenTableSelectWindowMethod;

  beforeEach(() => {
    windowRef = new Subject();
    open.mockReset().mockReturnValue(windowRef);
    TestBed.configureTestingModule({
      providers: [OpenTableSelectWindowMethod, { provide: WindowService, useValue: { open } }],
    });
    method = TestBed.inject(OpenTableSelectWindowMethod);
  });

  const params = (extra: object = {}) => ({
    columns: new Map<string, any>([['name', { label: 'Name', filter: true }]]),
    data: [{ name: 'a' }],
    title: 'Title',
    id: 'id',
    ...extra,
  });

  const injectorOf = () => open.mock.calls[0][0].injector as Injector;

  it('opens the table select window component with the parameters', async () => {
    const p = params();
    const result = method.call(p);
    expect(open).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Title', data: p, component: TableSelectWindowComponent,
    }));
    windowRef.next([{ name: 'a' }]);
    await expect(result).resolves.toEqual([{ name: 'a' }]);
  });

  it('provides select row options and filter form', () => {
    void method.call(params({ multiple: true, selected: [{ name: 'x' }], compareWith: () => true }));
    const injector = injectorOf();
    expect(injector.get(RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS)).toEqual({
      multiple: true, selected: [{ name: 'x' }], compareWith: expect.any(Function),
    });
    expect(injector.get(RXAP_TABLE_FILTER)).toBeNull();
    expect((injector.get(RXAP_TABLE_FILTER_FORM_DEFINITION) as any).name).toBeDefined();
  });

  it('defaults row options', () => {
    void method.call(params());
    expect(injectorOf().get(RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS)).toEqual({
      multiple: false, selected: [], compareWith: undefined,
    });
  });

  it('wraps array data into a table data source', () => {
    void method.call(params());
    expect(injectorOf().get(TABLE_DATA_SOURCE)).toBeInstanceOf(AbstractTableDataSource);
  });

  it('uses abstract table data sources as is', () => {
    const ds = new DynamicTableDataSource(ToMethod(jest.fn()));
    void method.call(params({ data: ds }));
    expect(injectorOf().get(TABLE_DATA_SOURCE)).toBe(ds);
  });

  it('wraps base data sources', () => {
    const ds: BaseDataSource<any[]> = staticDataSource([{ a: 1 }]);
    void method.call(params({ data: ds }));
    expect(injectorOf().get(TABLE_DATA_SOURCE)).toBeInstanceOf(AbstractTableDataSource);
  });

  it('uses the parent injector when given', () => {
    const parent = Injector.create({ providers: [{ provide: 'P', useValue: 1 }] });
    void method.call(params({ injector: parent }));
    expect(injectorOf().get('P' as any)).toBe(1);
  });

  it('resolves an empty list on completion and null values', async () => {
    const result = method.call(params());
    windowRef.complete();
    await expect(result).resolves.toEqual([]);
    open.mockReturnValue((windowRef = new Subject()));
    const second = method.call(params());
    windowRef.next(null);
    await expect(second).resolves.toEqual([]);
  });

  it('rejects on window errors', async () => {
    const result = method.call(params());
    windowRef.error(new Error('fail'));
    await expect(result).rejects.toThrow('fail');
  });
});
