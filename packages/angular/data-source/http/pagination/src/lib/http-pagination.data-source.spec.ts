import { PaginatorFake } from '@rxap/data-source/testing';
import { BehaviorSubject, EMPTY, of, Subject } from 'rxjs';
import { HttpPaginationDataSource } from './http-pagination.data-source';
import { ToHttpPaginationPipe } from './to-http-pagination.pipe';

function fakeSource(pages: BehaviorSubject<any>) {
  const connect = jest.fn((viewer: any) => {
    // consume the view change like the real http data source does
    viewer.viewChange.subscribe((o: any) => viewerOptions.push(o));
    return pages.asObservable();
  });
  const viewerOptions: any[] = [];
  return { source: { connect, disconnect: jest.fn(), metadata: { id: 'http' } } as any, viewerOptions, connect };
}

describe('HttpPaginationDataSource', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation();
  });
  afterEach(() => jest.restoreAllMocks());

  function setup(response: any, paginator: any = new PaginatorFake(2, 0, 0)) {
    const pages = new BehaviorSubject<any>(response);
    const { source, viewerOptions } = fakeSource(pages);
    const ds = new HttpPaginationDataSource<number>(source, paginator, (e: any) => ({ queryParams: { p: e.pageIndex } }) as any);
    ds.pageEventToHttpOptions = (e) => ({ queryParams: { p: e.pageIndex, s: e.pageSize } }) as any;
    const results: any[] = [];
    const errors: any[] = [];
    const viewer: any = { id: 'v', viewChange: EMPTY };
    ds.connect(viewer).subscribe({ next: (r) => results.push(r), error: (e) => errors.push(e) });
    return { ds, pages, source, viewerOptions, results, errors, paginator };
  }

  it('emits the page data, updates the total length and converts page events to options', () => {
    const { results, paginator, viewerOptions, ds } = setup({ data: [1, 2], total: 10, size: 2, page: 0 });
    expect(results).toEqual([[1, 2]]);
    expect(paginator.length).toBe(10);
    expect(ds.totalLength).toBe(10);
    expect(viewerOptions).toEqual([{ queryParams: { p: 0, s: 2 } }]);
    paginator.next();
    expect(viewerOptions.at(-1)).toEqual({ queryParams: { p: 1, s: 2 } });
  });

  it('warns on mismatching size and page', () => {
    setup({ data: [1], total: 1, size: 5, page: 3 });
    expect(console.warn).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['a non object', 'x', /Value is not an object/],
    ['a missing total', { data: [] }, /property total/],
    ['missing data', { total: 1 }, /property data/],
  ])('errors for %s', (_, response, message) => {
    const { errors } = setup(response);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(message);
  });

  it('warns when the viewChange property is already set and ignores page events without size', () => {
    const pages = new BehaviorSubject<any>({ data: [], total: 0 });
    const { source } = fakeSource(pages);
    const paginator = new PaginatorFake(2, 0, 0);
    const ds = new HttpPaginationDataSource<number>(source, paginator);
    ds.pageEventToHttpOptions = () => ({}) as any;
    ds.connect({ id: 'v', viewChange: of(1) } as any).subscribe();
    expect(console.warn).toHaveBeenCalledWith('The viewChange property is readonly');
  });

  it('throws when the paginator has no page property', () => {
    const { source } = fakeSource(new BehaviorSubject<any>({ data: [], total: 0 }));
    const ds = new HttpPaginationDataSource<number>(source, { pageSize: 1, pageIndex: 0, length: 0 });
    expect(() => ds.connect({ id: 'v' } as any).subscribe()).toThrow(/has not a page property/);
  });

  it('throws without a configured pageEventToHttpOptions function', () => {
    const { source } = fakeSource(new BehaviorSubject<any>({ data: [], total: 0 }));
    const ds = new HttpPaginationDataSource<number>(source, new PaginatorFake(1, 0, 0));
    expect(() => ds.pageEventToHttpOptions({ pageIndex: 0, pageSize: 1 })).toThrow(/not defined/);
  });

  it('disconnects the underlying source', () => {
    const { ds, source } = setup({ data: [], total: 0 });
    ds.disconnect({ id: 'v' });
    expect(source.disconnect).toHaveBeenCalled();
  });

  it('ToHttpPaginationPipe builds the data source', () => {
    const { source } = fakeSource(new BehaviorSubject<any>({ data: [], total: 0 }));
    expect(new ToHttpPaginationPipe().transform(source, new PaginatorFake(1, 0, 0), () => ({}) as any)).toBeInstanceOf(
      HttpPaginationDataSource,
    );
    expect(new Subject()).toBeTruthy();
  });
});
