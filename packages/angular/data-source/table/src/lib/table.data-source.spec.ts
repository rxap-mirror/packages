import { StaticDataSource, staticDataSource } from '@rxap/data-source';
import { PaginatorFake } from '@rxap/data-source/testing';
import { BehaviorSubject, Subject } from 'rxjs';
import { TableDataSource } from './table.data-source';
import { ToTableDataSourcePipe } from './to-table-data-source.pipe';

const rows = [
  { id: 1, name: 'Charlie', active: true },
  { id: 2, name: 'alice', active: false },
  { id: 3, name: 'Bob', active: true },
  { id: 4, name: 'dave', active: false },
];

function create(overrides: { sort?: any; filter?: any; paginator?: any } = {}) {
  const source = staticDataSource(rows.slice(), { id: 'rows' }) as StaticDataSource<typeof rows>;
  const paginator = overrides.paginator ?? new PaginatorFake(2, 0, 0);
  const sortChange = new Subject<any>();
  const filterChange = new Subject<any>();
  const sort = overrides.sort === null ? undefined : { active: '', direction: '', start: 'asc', sortChange, ...overrides.sort };
  const filter = overrides.filter === null ? undefined : { change: filterChange, current: {}, ...overrides.filter };
  const ds = new TableDataSource<any>(source, paginator, sort as any, filter as any);
  const results: any[][] = [];
  const errors: unknown[] = [];
  ds.connect({ id: 'v' }).subscribe({ next: (r) => results.push(r), error: (e) => errors.push(e) });
  return { ds, source, paginator, sortChange, filterChange, results, errors };
}

describe('TableDataSource', () => {
  it('pages the data and updates the total length', () => {
    const { results, paginator, ds } = create();
    expect(results.at(-1)!.map((r) => r.id)).toEqual([1, 2]);
    expect(paginator.length).toBe(4);
    expect(ds.totalRowCount).toBe(4);
    expect(ds.totalLength).toBe(4);
    paginator.next();
    expect(results.at(-1)!.map((r) => r.id)).toEqual([3, 4]);
  });

  it('reacts to sort changes', () => {
    const { results, sortChange } = create({ paginator: new PaginatorFake(10, 0, 0) });
    sortChange.next({ active: 'name', direction: 'asc' });
    expect(results.at(-1)!.map((r) => r.name)).toEqual(['alice', 'Bob', 'Charlie', 'dave']);
    sortChange.next({ active: 'name', direction: 'desc' });
    expect(results.at(-1)!.map((r) => r.name)).toEqual(['dave', 'Charlie', 'Bob', 'alice']);
    sortChange.next({ active: 'id', direction: 'desc' });
    expect(results.at(-1)!.map((r) => r.id)).toEqual([4, 3, 2, 1]);
    sortChange.next({ active: 'active', direction: 'asc' });
    expect(results.at(-1)!.map((r) => r.active)).toEqual([false, false, true, true]);
  });

  it('reacts to filter changes', () => {
    const { results, filterChange } = create({ paginator: new PaginatorFake(10, 0, 0) });
    filterChange.next({ name: 'AL' });
    expect(results.at(-1)!.map((r) => r.id)).toEqual([2]);
    filterChange.next({ active: true });
    expect(results.at(-1)!.map((r) => r.id)).toEqual([1, 3]);
    filterChange.next({ id: 4 });
    expect(results.at(-1)!.map((r) => r.id)).toEqual([4]);
    filterChange.next({ id: (v: number) => v > 2 });
    expect(results.at(-1)!.map((r) => r.id)).toEqual([3, 4]);
    filterChange.next({ name: undefined, unknown: 'x', id: null });
    expect(results.at(-1)).toHaveLength(4);
  });

  it('exposes sort and filter state', () => {
    const { ds } = create({ sort: { active: 'name', direction: 'asc' }, filter: { current: { a: 1 } } });
    expect(ds.sortByColumn).toBe('name');
    expect(ds.sortDirection).toBe('asc');
    expect(ds.filterValue).toEqual({ a: 1 });
  });

  it('applyFilterBy ignores string filters and empty filters', () => {
    const { ds } = create();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(ds.applyFilterBy(rows, 'abc')).toHaveLength(4);
    expect(ds.applyFilterBy(rows, '')).toHaveLength(4);
  });

  it('applySortBy without a column keeps the order and ignores non indexable rows', () => {
    const { ds } = create();
    expect(ds.applySortBy(rows, '', 'asc')).toEqual(rows);
    expect(ds.applySortBy([1, 2] as any, 'x', 'asc')).toEqual([1, 2]);
  });

  it('errors without a paginator page', () => {
    const { errors } = create({ paginator: { pageSize: 1, pageIndex: 0, length: 0 } });
    expect(errors).toHaveLength(1);
  });

  it('refresh and disconnect are delegated to the source', () => {
    const { ds, source } = create();
    const refresh = vi.spyOn(source, 'refresh');
    ds.refresh();
    expect(refresh).toHaveBeenCalled();
    const disconnect = vi.spyOn(source, 'disconnect');
    ds.disconnect({ id: 'v' });
    expect(disconnect).toHaveBeenCalled();
  });

  it('works without sort and filter', () => {
    const { results } = create({ sort: null, filter: null });
    expect(results.at(-1)).toHaveLength(2);
  });

  it('ToTableDataSourcePipe creates a table data source', () => {
    const source = staticDataSource(rows.slice(), { id: 'rows' });
    const ds = new ToTableDataSourcePipe().transform(source as any, new PaginatorFake(1, 0, 0));
    expect(ds).toBeInstanceOf(TableDataSource);
    expect(new BehaviorSubject(1).value).toBe(1);
  });
});
