import { PaginatorFake } from '@rxap/data-source/testing';
import { BehaviorSubject, EMPTY, of, Subject } from 'rxjs';
import { HttpTableDataSource } from './http-table.data-source';
import { ToHttpTableDataSourcePipe } from './to-http-table-data-source.pipe';

describe('HttpTableDataSource', () => {
  beforeEach(() => vi.spyOn(console, 'warn').mockImplementation(() => undefined));
  afterEach(() => vi.restoreAllMocks());

  function setup(
    response: any,
    options: { toOptions?: (e: any) => any; sort?: any; filter?: any; paginator?: any } = {},
  ) {
    const pages = new BehaviorSubject<any>(response);
    const events: any[] = [];
    const source: any = {
      metadata: { id: 'http' },
      disconnect: vi.fn(),
      connect: vi.fn((viewer: any) => {
        viewer.viewChange.subscribe((o: any) => events.push(o));
        return pages.asObservable();
      }),
    };
    const paginator = options.paginator ?? new PaginatorFake(2, 0, 0);
    const toOptions = options.toOptions ?? ((e: any) => ({ start: e.start, end: e.end }));
    const ds = new HttpTableDataSource<any>(source, paginator, toOptions, options.sort ?? null, options.filter ?? null);
    const results: any[] = [];
    const errors: any[] = [];
    ds.connect({ id: 'v', viewChange: EMPTY } as any).subscribe({ next: (r) => results.push(r), error: (e) => errors.push(e) });
    return { ds, source, events, results, errors, paginator, pages };
  }

  it('emits the data and converts table events to http options', () => {
    const { results, events, paginator } = setup({ data: [{ a: 1 }], total: 7, size: 2, page: 0 });
    expect(results).toEqual([[{ a: 1 }]]);
    expect(paginator.length).toBe(7);
    expect(events).toEqual([{ start: 0, end: 2 }]);
    paginator.next();
    expect(events.at(-1)).toEqual({ start: 2, end: 4 });
  });

  it('includes sort and filter changes in the table event', () => {
    const sortChange = new Subject<any>();
    const filterChange = new BehaviorSubject<any>({ q: 1 });
    const toOptions = vi.fn((e: any) => ({ sort: e.sort, filter: e.filter }));
    const { events } = setup(
      { data: [], total: 0 },
      { toOptions, sort: { active: 'a', direction: 'asc', start: 'asc', sortChange }, filter: { change: filterChange, current: {} } },
    );
    expect(events.at(-1)).toEqual({ sort: { active: 'a', direction: 'asc' }, filter: { q: 1 } });
    sortChange.next({ active: 'b', direction: 'desc' });
    expect(events.at(-1).sort).toEqual({ active: 'b', direction: 'desc' });
  });

  it('supports promise and observable option results', async () => {
    const a = setup({ data: [], total: 0 }, { toOptions: () => of({ x: 1 }) });
    expect(a.events).toEqual([{ x: 1 }]);
    const b = setup({ data: [], total: 0 }, { toOptions: () => Promise.resolve({ y: 1 }) });
    await Promise.resolve();
    await Promise.resolve();
    expect(b.events).toEqual([{ y: 1 }]);
  });

  it.each([
    ['a non object', 'x', /Value is not an object/],
    ['a missing total', { data: [] }, /property total/],
    ['missing data', { total: 1 }, /property data/],
  ])('errors for %s', (_, response, message) => {
    const { errors } = setup(response);
    expect(errors[0].message).toMatch(message);
  });

  it('warns on mismatching size and page and on a preset viewChange', () => {
    setup({ data: [], total: 0, size: 9, page: 9 });
    expect(console.warn).toHaveBeenCalledTimes(2);
    const source: any = { metadata: { id: 'h' }, disconnect: vi.fn(), connect: () => of({ data: [], total: 0 }) };
    const ds = new HttpTableDataSource<any>(source, new PaginatorFake(2, 0, 0), () => ({}));
    ds.connect({ id: 'v', viewChange: of(1) } as any).subscribe();
    expect(console.warn).toHaveBeenCalledWith('The viewChange property is readonly');
  });

  it('errors for a paginator without page and without options function', () => {
    const source: any = { metadata: { id: 'h' }, disconnect: vi.fn(), connect: () => of({ data: [], total: 0 }) };
    const ds = new HttpTableDataSource<any>(source, { pageSize: 1, pageIndex: 0, length: 0 });
    expect(() => ds.connect({ id: 'v' } as any).subscribe()).toThrow(/has not a page property/);
    expect(() => ds.tableEventToHttpOptions({} as any)).toThrow(/not defined/);
  });

  it('disconnects the source and the pipe creates the data source', () => {
    const { ds, source } = setup({ data: [], total: 0 });
    ds.disconnect({ id: 'v' });
    expect(source.disconnect).toHaveBeenCalled();
    expect(new ToHttpTableDataSourcePipe().transform(source, new PaginatorFake(1, 0, 0), () => ({}))).toBeInstanceOf(HttpTableDataSource);
  });
});
