import type { Mock } from 'vitest';
import { PaginatorFake } from '@rxap/data-source/testing';
import { of, Subject } from 'rxjs';
import { DynamicTableDataSource } from './dynamic-table.data-source';

describe('DynamicTableDataSource', () => {
  let method: { call: Mock; metadata: { id: string } };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    method = { call: vi.fn(async (e: any) => [`row-${e.start}`]), metadata: { id: 'dyn' } };
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const create = (paginator: any = null, sort: any = null, filter: any = null, parameters: any = null) =>
    new DynamicTableDataSource<any>(method as any, paginator, sort, filter, parameters);

  async function tick(ms = 100) {
    vi.advanceTimersByTime(ms);
    await Promise.resolve();
    await Promise.resolve();
  }

  it('loads pages for the default paginator after init', async () => {
    const paginator = new PaginatorFake(5, 0, 0);
    const ds = create(paginator);
    ds.ngOnInit();
    const results: any[] = [];
    ds.connect({ id: 'v' }).subscribe((r) => results.push(r));
    await tick();
    expect(method.call).toHaveBeenCalledTimes(1);
    expect(method.call.mock.calls[0][0]).toMatchObject({ start: 0, end: 5, page: { pageIndex: 0, pageSize: 5 } });
    expect(typeof method.call.mock.calls[0][0].setTotalLength).toBe('function');
    expect(results).toEqual([['row-0']]);
    paginator.next();
    await tick();
    expect(method.call.mock.calls[1][0]).toMatchObject({ start: 5, end: 10 });
  });

  it('includes sort, filter (resetting the page) and parameters', async () => {
    const sortChange = new Subject<any>();
    const filterChange = new Subject<any>();
    const params = new Subject<any>();
    const paginator = new PaginatorFake(5, 0, 0) as any;
    paginator.firstPage = vi.fn();
    const ds = create(
      paginator,
      { active: 'a', direction: 'asc', start: 'asc', sortChange },
      { change: filterChange, current: {} },
      params,
    );
    ds.ngOnInit();
    ds.connect({ id: 'v' }).subscribe();
    filterChange.next({ q: 1 });
    params.next({ p: 1 });
    await tick();
    expect(paginator.firstPage).toHaveBeenCalled();
    expect(method.call.mock.calls.at(-1)![0]).toMatchObject({
      sort: { active: 'a', direction: 'asc' },
      filter: { q: 1 },
      parameters: { p: 1 },
    });
    sortChange.next({ active: 'b', direction: 'desc' });
    await tick();
    expect(method.call.mock.calls.at(-1)![0].sort).toEqual({ active: 'b', direction: 'desc' });
  });

  it('loads everything without a paginator and refreshes on demand', async () => {
    const ds = create();
    ds.ngOnInit();
    ds.connect({ id: 'v' }).subscribe();
    await tick();
    expect(method.call.mock.calls[0][0]).toMatchObject({ start: 0, end: Number.MAX_SAFE_INTEGER });
    vi.setSystemTime(Date.now() + 1000);
    ds.refresh();
    await tick();
    expect(method.call).toHaveBeenCalledTimes(2);
  });

  it('flags errors and returns an empty page', async () => {
    method.call.mockRejectedValue(new Error('nope'));
    const ds = create(new PaginatorFake(5, 0, 0));
    ds.ngOnInit();
    const results: any[] = [];
    ds.connect({ id: 'v' }).subscribe((r) => results.push(r));
    let hasError = false;
    ds.hasError$.subscribe((v: boolean) => (hasError = v));
    const errors: unknown[] = [];
    ds.error$.subscribe((e: unknown) => errors.push(e));
    await tick();
    expect(results).toEqual([[]]);
    expect(hasError).toBe(true);
    expect(errors).toHaveLength(1);
  });

  describe('per viewer inputs', () => {
    it('uses the registered paginator of a viewer and clears them on disconnect', async () => {
      const ds = create();
      const paginator = new PaginatorFake(3, 0, 0);
      const sort = { active: '', direction: '' as const, start: 'asc' as const };
      const filter = { change: of({}), current: {} };
      const params = of({});
      ds.setPaginator(paginator, 'a');
      ds.setSort(sort, 'a');
      ds.setFilter(filter as any, 'a');
      ds.setParameters(params, 'a');
      ds.setPaginator(undefined, 'a');
      expect(ds.paginatorMap.get('a')).toBe(paginator);
      ds.ngOnInit();
      ds.connect({ id: 'a' }).subscribe();
      await tick();
      expect(method.call.mock.calls.at(-1)![0]).toMatchObject({ start: 0, end: 3 });
      ds.disconnect({ id: 'a' });
      expect(ds.paginatorMap.has('a')).toBe(false);
      expect(ds.sortMap.has('a')).toBe(false);
      expect(ds.filterMap.has('a')).toBe(false);
      expect(ds.parametersMap.has('a')).toBe(false);
    });

    it('stores default inputs when no id is given', () => {
      const ds = create();
      const paginator = new PaginatorFake(1, 0, 0);
      const sort = { active: 'x', direction: '' as const, start: 'asc' as const };
      const filter = { change: new Subject<any>(), current: {} } as any;
      const params = new Subject<any>();
      ds.setPaginator(paginator);
      ds.setSort(sort);
      ds.setSort(null);
      ds.setFilter(filter);
      ds.setParameters(params);
      expect(ds.paginator).toBe(paginator);
      expect(ds.sort).toBe(sort);
      expect(ds.filter).toBe(filter);
      expect(ds.parameters).toBe(params);
    });

    it('setTotalLength updates the matching paginator', () => {
      const ds = create();
      const a = new PaginatorFake(1, 0, 0);
      const b = new PaginatorFake(1, 0, 0);
      ds.setPaginator(a);
      ds.setPaginator(b, 'b');
      ds.setTotalLength(5);
      ds.setTotalLength(7, 'b');
      ds.setTotalLength(9, 'unknown');
      expect([a.length, b.length]).toEqual([5, 7]);
      ds.setTotalLengthFactory('b')(11);
      ds.setTotalLengthFactory()(12);
      expect([a.length, b.length]).toEqual([12, 11]);
      expect(() => create().setTotalLength(1)).not.toThrow();
    });
  });
});
