import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { staticDataSource } from '@rxap/data-source';
import { TableDataSource } from '@rxap/data-source/table';
import {
  RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS,
  SelectRowService,
  TABLE_DATA_SOURCE,
} from '@rxap/material-table-system';
import {
  RXAP_WINDOW_DATA,
  RXAP_WINDOW_REF,
} from '@rxap/window-system';
import { CreateFilterFormProvider } from '../create-filter-form-provider';
import { TableSelectWindowComponent } from './table-select-window.component';
import { MockWindowRef } from './window-test-wrapper';

const rows = [
  { id: 1, name: 'a', active: true, created: new Date(2020, 1, 1) },
  { id: 2, name: 'b', active: false, created: new Date(2021, 1, 1) },
];

describe('TableSelectWindowComponent logic', () => {
  const columns = new Map<string, any>([
    ['name', { label: 'Name', filter: true }],
    ['active', { label: 'Active', type: 'boolean', filter: true }],
    ['created', { label: 'Created', type: 'date', format: 'yyyy', filter: true }],
    ['id', { label: 'Id' }],
  ]);
  let windowRef: MockWindowRef;

  function create(data: Record<string, unknown> = {}) {
    windowRef = new MockWindowRef();
    TestBed.configureTestingModule({
      imports: [TableSelectWindowComponent, NoopAnimationsModule],
      providers: [
        { provide: RXAP_WINDOW_DATA, useValue: { columns, id: 'tbl', ...data } },
        { provide: RXAP_WINDOW_REF, useValue: windowRef },
        { provide: TABLE_DATA_SOURCE, useValue: new TableDataSource(staticDataSource(rows)) },
        { provide: RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS, useValue: { multiple: !!data['multiple'] } },
        CreateFilterFormProvider(columns) as any,
      ],
    });
    const fixture = TestBed.createComponent(TableSelectWindowComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('derives the display columns', () => {
    const { componentInstance: c } = create();
    expect(c.id).toBe('tbl');
    expect(c.displayColumns).toEqual(['name', 'active', 'created', 'id']);
    expect(c.filterDisplayColumns).toEqual(['filter__name', 'filter__active', 'filter__created', 'filter__id']);
    expect(c.hasSomeFilterColumn).toBe(true);
  });

  it('adds a select column for multiple selection', () => {
    const { componentInstance: c } = create({ multiple: true });
    expect(c.displayColumns[0]).toBe('select');
    expect(c.filterDisplayColumns[0]).toBe('filter__select');
  });

  it('detects missing filter columns', () => {
    const fixture = create({ columns: new Map([['name', { label: 'Name' }]]) });
    expect(fixture.componentInstance.hasSomeFilterColumn).toBe(false);
  });

  it('renders the rows', async () => {
    const fixture = create();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tr[mat-row]').length).toBeGreaterThanOrEqual(0);
  });

  it('single selection sends the row and closes the window', () => {
    const fixture = create();
    const next = vi.fn();
    const complete = vi.fn();
    windowRef.subscribe({ next, complete });
    fixture.componentInstance.selectRow(rows[1]);
    expect(next).toHaveBeenCalledWith([rows[1]]);
    expect(complete).toHaveBeenCalled();
  });

  it('multiple selection keeps the window open until select', () => {
    const fixture = create({ multiple: true, selected: [rows[0]] });
    const c = fixture.componentInstance;
    const next = vi.fn();
    windowRef.subscribe({ next });
    const states: boolean[] = [];
    c.hasNotSelected$.subscribe((v) => states.push(v));
    c.selectRow(rows[1]);
    expect(states).toEqual([false]);
    expect(next).not.toHaveBeenCalled();
    c.select();
    expect(next.mock.calls[0][0]).toHaveLength(2);
  });

  it('reports an empty selection', () => {
    const fixture = create({ multiple: true });
    const states: boolean[] = [];
    fixture.componentInstance.hasNotSelected$.subscribe((v) => states.push(v));
    const service = fixture.debugElement.injector.get(SelectRowService);
    service.selectionModel.select(rows[0]);
    service.clear();
    expect(states).toEqual([false, true]);
  });

  it('close completes the window', () => {
    const fixture = create();
    const complete = vi.fn();
    windowRef.subscribe({ complete });
    fixture.componentInstance.close();
    expect(complete).toHaveBeenCalled();
  });
});
