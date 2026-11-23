import { Component, Injectable, signal, ChangeDetectionStrategy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { staticDataSource } from '@rxap/data-source';
import { PaginatorFake } from '@rxap/data-source/testing';
import { DynamicTableDataSource, TableDataSource } from '@rxap/data-source/table';
import { of, Subject } from 'rxjs';
import { TableDataSourceDirective } from './table-data-source.directive';

@Component({
  imports: [TableDataSourceDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <ng-template
      rxapTableDataSource
      let-row
      [rxapTableDataSourceFrom]="source()"
      [rxapTableDataSourcePaginator]="paginator"
      [rxapTableDataSourceSort]="sort"
      [rxapTableDataSourceFilter]="filter"
      [rxapTableDataSourceParameters]="parameters"
      [rxapTableDataSourceViewer]="viewer()"
    >
      <li class="row">{{ row.id }}</li>
    </ng-template>
  `,
})
class HostComponent {
  paginator = new PaginatorFake(2, 0, 0);
  sort: any = { active: '', direction: '', start: 'asc', sortChange: new Subject() };
  filter: any = { change: new Subject(), current: {} };
  parameters = of({});
  source = signal<any>(null);
  viewer = signal<any>({ id: 'table-viewer' });
}

describe('TableDataSourceDirective', () => {
  const rows = [{ id: 1 }, { id: 2 }, { id: 3 }];

  async function render(host: (h: HostComponent) => void) {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const f = TestBed.createComponent(HostComponent);
    host(f.componentInstance);
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    return f;
  }

  afterEach(() => vi.restoreAllMocks());

  it('assigns paginator, sort, filter and parameters to a table data source for an anonymous viewer', async () => {
    const ds = new TableDataSource<any>(staticDataSource(rows, { id: 'rows' }) as any);
    const f = await render((h) => {
      h.viewer.set({ id: '' });
      h.source.set(ds);
    });
    expect(ds.paginator).toBe(f.componentInstance.paginator);
    expect(ds.sort).toBe(f.componentInstance.sort);
    expect(ds.filter).toBe(f.componentInstance.filter);
    expect(ds.parameters).toBe(f.componentInstance.parameters);
    expect(f.nativeElement.querySelectorAll('.row')).toHaveLength(2);
  });

  it('registers the inputs per viewer on a dynamic table data source', async () => {
    @Injectable()
    class Dyn extends DynamicTableDataSource<any> {}
    const method = { call: vi.fn().mockResolvedValue(rows), metadata: { id: 'm' } };
    const ds = new Dyn(method as any);
    const f = await render((h) => h.source.set(ds));
    expect(ds.paginatorMap.get('table-viewer')).toBe(f.componentInstance.paginator);
    expect(ds.sortMap.get('table-viewer')).toBe(f.componentInstance.sort);
    expect(ds.filterMap.get('table-viewer')).toBe(f.componentInstance.filter);
    expect(ds.parametersMap.get('table-viewer')).toBe(f.componentInstance.parameters);
  });

  it('rejects data sources that are no table data sources', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.source.set(staticDataSource(rows, { id: 'rows' }));
    expect(() => {
      f.detectChanges();
      TestBed.tick();
    }).toThrow(/not a AbstractTableDataSource/);
  });
});
