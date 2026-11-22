import { TableFilterService } from './table-filter.service';
import { ToFilterColumnNamesPipe } from './to-filter-column-names.pipe';

describe('TableFilterService', () => {
  let service: TableFilterService;
  let emitted: Record<string, any>[];

  beforeEach(() => {
    service = new TableFilterService();
    emitted = [];
    service.change.subscribe((v) => emitted.push({ ...v }));
  });

  it('emits the first map even if empty', () => {
    service.setMap({});
    expect(emitted).toEqual([{}]);
  });

  it('removes empty properties and deduplicates equal maps', () => {
    service.setMap({ a: '1', b: undefined });
    service.setMap({ a: '1' });
    expect(emitted).toEqual([{ a: '1' }]);
    expect(service.current).toEqual({ a: '1' });
  });

  it('emits when the map changes', () => {
    service.setMap({ a: '1' });
    service.setMap({ a: '2' });
    expect(emitted).toEqual([{ a: '1' }, { a: '2' }]);
  });

  it('sets and removes single keys', () => {
    service.set('a', 1);
    expect(service.current).toEqual({ a: 1 });
    service.remove('a');
    service.remove('unknown');
    expect(service.current).toEqual({});
    expect(emitted).toHaveLength(3);
  });

  it('emits reset$', () => {
    const spy = jest.fn();
    service.reset$.subscribe(spy);
    service.reset();
    expect(spy).toHaveBeenCalled();
  });

  it('stops listening on destroy', () => {
    service.ngOnDestroy();
    service.change.next({ x: 1 });
    expect(service.current).toEqual({});
  });
});

describe('ToFilterColumnNamesPipe', () => {
  it('prefixes the column names', () => {
    expect(new ToFilterColumnNamesPipe().transform(['a', 'b'])).toEqual(['filter_a', 'filter_b']);
  });
});
