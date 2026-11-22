import { MatTableModule } from '@angular/material/table';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatSort } from '@angular/material/sort';
import { RXAP_TABLE_METHOD } from '@rxap/data-source/table';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { TableFilterService } from './table-filter/table-filter.service';
import {
  RXAP_TABLE_FILTER,
  TABLE_DATA_SOURCE,
  TABLE_REMOTE_METHOD,
  TABLE_REMOTE_METHOD_ADAPTER_FACTORY,
  TableDataSourceDirective,
} from './table-data-source.directive';

function createDataSource(rows: any[] = [{ uuid: 'a' }]) {
  return {
    loading$: new BehaviorSubject<boolean>(false),
    hasError$: new BehaviorSubject<boolean>(false),
    error$: new Subject<unknown>(),
    metadata: { id: 'mock' },
    lastRefreshed: new Date(0),
    refresh: jest.fn(),
    retry: jest.fn(),
    reset: jest.fn(),
    connect: () => of(rows),
    disconnect: jest.fn(),
    paginator: undefined as any,
    sort: undefined as any,
    filter: undefined as any,
    parameters: undefined as any,
  };
}

@Component({
  standalone: true,
  imports: [MatTableModule, TableDataSourceDirective, MatSort],
  providers: [TableFilterService],
  template: `
    <table mat-table matSort rxapTableDataSource id="t1" [dataSource]="ds" [parameters]="parameters">
      <ng-container matColumnDef="uuid">
        <th mat-header-cell *matHeaderCellDef>uuid</th>
        <td mat-cell *matCellDef="let row">{{ row.uuid }}</td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="['uuid']"></tr>
      <tr mat-row *matRowDef="let row; columns: ['uuid']"></tr>
    </table>
  `,
})
class HostComponent {
  ds: any = undefined;
  parameters: any = undefined;
}

describe('TableDataSourceDirective', () => {
  function setup(providers: any[] = [], ds?: any, rows?: any[]) {
    TestBed.configureTestingModule({ imports: [HostComponent], providers });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.ds = ds;
    return { fixture, rows };
  }

  const directive = (fixture: any) =>
    fixture.debugElement.query(By.directive(TableDataSourceDirective)).injector.get(TableDataSourceDirective);

  it('throws without data source and method', () => {
    const { fixture } = setup();
    expect(() => fixture.detectChanges()).toThrow('TABLE_DATA_SOURCE');
  });

  it('uses the data source input', () => {
    const ds = createDataSource([{ uuid: 'x' }, { uuid: 'y', __metadata__: { loading$: {} } }]);
    const { fixture } = setup([], ds);
    fixture.detectChanges();
    const d = directive(fixture);
    expect(d.dataSource()).toBe(ds);
    expect(ds.filter).toBeInstanceOf(TableFilterService);
    expect(ds.sort).toBeDefined();
    expect(fixture.nativeElement.textContent).toContain('x');
    expect(d.lastRefreshed).toEqual(new Date(0));
    expect(d.remoteMethod).toBeUndefined();
    expect(d.sourceRemoteMethod).toBeNull();
  });

  it('uses the TABLE_DATA_SOURCE token', () => {
    const ds = createDataSource();
    const { fixture } = setup([{ provide: TABLE_DATA_SOURCE, useValue: ds }]);
    fixture.detectChanges();
    expect(directive(fixture).dataSource()).toBe(ds);
  });

  it('prefers the RXAP_TABLE_FILTER token over the TableFilterService', () => {
    const ds = createDataSource();
    const filter = { change: new Subject(), current: {} };
    const { fixture } = setup([{ provide: TABLE_DATA_SOURCE, useValue: ds }, { provide: RXAP_TABLE_FILTER, useValue: filter }]);
    fixture.detectChanges();
    expect(ds.filter).toBe(filter);
  });

  it('creates a dynamic data source from the table method', () => {
    const method: any = { call: jest.fn().mockResolvedValue([]), metadata: { id: 'meta' } };
    const { fixture } = setup([{ provide: RXAP_TABLE_METHOD, useValue: method }]);
    fixture.detectChanges();
    const d = directive(fixture);
    expect(d.method).toBe(method);
    expect(d.sourceRemoteMethod).toBe(method);
    expect(d.remoteMethod).toBe(method);
    expect(d.dataSource()).toBeDefined();
    expect(TABLE_REMOTE_METHOD).toBe(RXAP_TABLE_METHOD);
  });

  it('uses the adapter factory for the table method', () => {
    const method: any = { call: jest.fn().mockResolvedValue([]) };
    const adapted: any = { call: jest.fn().mockResolvedValue([]) };
    const factory = jest.fn().mockReturnValue(adapted);
    const { fixture } = setup([
      { provide: RXAP_TABLE_METHOD, useValue: method },
      { provide: TABLE_REMOTE_METHOD_ADAPTER_FACTORY, useValue: factory },
    ]);
    fixture.detectChanges();
    expect(factory).toHaveBeenCalled();
    expect(directive(fixture).method).toBe(adapted);
  });

  it('forwards loading and error state', () => {
    const ds = createDataSource();
    const { fixture } = setup([], ds);
    fixture.detectChanges();
    const d = directive(fixture);
    const errors: unknown[] = [];
    d.error$.subscribe((e: unknown) => errors.push(e));
    ds.loading$.next(true);
    ds.hasError$.next(true);
    ds.error$.next('err');
    expect(d.loading$.value).toBe(true);
    expect(d.hasError$.value).toBe(true);
    expect(errors).toEqual(['err']);
  });

  it('delegates refresh, retry and reset', () => {
    const ds = createDataSource();
    const { fixture } = setup([], ds);
    fixture.detectChanges();
    const d = directive(fixture);
    const filter = fixture.debugElement.injector.get(TableFilterService);
    d.refresh();
    d.retry();
    expect(ds.refresh).toHaveBeenCalled();
    expect(ds.retry).toHaveBeenCalled();
    const spy = jest.spyOn(filter, 'reset');
    d.reset();
    expect(spy).toHaveBeenCalled();
    expect(ds.reset).not.toHaveBeenCalled();
  });

  it('tracks rows by uuid and unsubscribes on destroy', () => {
    const ds = createDataSource();
    const { fixture } = setup([], ds);
    fixture.detectChanges();
    const d = directive(fixture);
    const table = fixture.debugElement.query(By.css('table')).componentInstance;
    expect(table.trackBy(0, { uuid: 'u' })).toBe('u');
    expect(table.trackBy(3, {})).toBe(3);
    fixture.destroy();
    ds.loading$.next(true);
    expect(d.loading$.value).toBe(false);
  });
});

describe('TableDataSourceDirective without TableFilterService', () => {
  it('resets the data source', () => {
    @Component({
      standalone: true,
      imports: [MatTableModule, TableDataSourceDirective],
      template: `
        <table mat-table rxapTableDataSource id="t2" [dataSource]="ds">
          <ng-container matColumnDef="uuid">
            <th mat-header-cell *matHeaderCellDef>uuid</th>
            <td mat-cell *matCellDef="let row">{{ row.uuid }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="['uuid']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['uuid']"></tr>
        </table>
      `,
    })
    class Plain {
      ds = createDataSource();
    }
    TestBed.configureTestingModule({ imports: [Plain] });
    const fixture = TestBed.createComponent(Plain);
    fixture.detectChanges();
    directive(fixture).reset();
    expect(fixture.componentInstance.ds.reset).toHaveBeenCalled();
    function directive(f: any) {
      return f.debugElement.query(By.directive(TableDataSourceDirective)).injector.get(TableDataSourceDirective);
    }
  });
});
