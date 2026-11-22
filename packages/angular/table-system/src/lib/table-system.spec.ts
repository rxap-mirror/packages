import { CdkTable } from '@angular/cdk/table';
import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RXAP_TABLE_FILTER } from '@rxap/material-table-system';
import { ExpandControlsCellComponent } from './expand-row/expand-controls-cell/expand-controls-cell.component';
import { ExpandRowContainerComponent } from './expand-row/expand-row-container/expand-row-container.component';
import { ExpandRowContentDirective } from './expand-row/expand-row-container/expand-row-content.directive';
import { ExpandRowDirective } from './expand-row/expand-row.directive';
import { ExpandRowService } from './expand-row/expand-row.service';
import { TableFilterInputDirective } from './full-text-search/table-filter-input.directive';
import { TableFullTextSearchService } from './full-text-search/table-full-text-search.service';
import { AllRowsSelectedDirective } from './select-row/all-rows-selected.directive';
import { CheckboxCellComponent } from './select-row/checkbox-cell/checkbox-cell.component';
import { CheckboxHeaderCellComponent } from './select-row/checkbox-header-cell/checkbox-header-cell.component';
import { SelectRowService } from './select-row/select-row.service';

interface Row {
  id: number;
}

describe('ExpandRowService', () => {
  it('toggles rows', () => {
    const s = new ExpandRowService<Row>();
    const a = { id: 1 };
    const b = { id: 2 };
    const emitted: boolean[] = [];
    s.isExpanded$(a).subscribe((v) => emitted.push(v));
    expect(s.isExpanded(a)).toBe(false);
    s.toggleRow(a);
    expect(s.isExpanded(a)).toBe(true);
    s.toggleRow(b);
    expect(s.isExpanded(a)).toBe(false);
    expect(s.isExpanded(b)).toBe(true);
    s.toggleRow(b);
    expect(s.expandedRow.value).toBeNull();
    expect(emitted).toEqual([false, true, false, false]);
  });
});

describe('SelectRowService', () => {
  it('tracks the selection', () => {
    const s = new SelectRowService<Row>();
    const emitted: Row[][] = [];
    s.selectedRows$.subscribe((v) => emitted.push(v));
    s.selectionModel.select({ id: 1 });
    expect(s.selectedRows).toEqual([{ id: 1 }]);
    expect(emitted.length).toBe(1);
  });
});

describe('TableFullTextSearchService', () => {
  it('exposes the current value', () => {
    const s = new TableFullTextSearchService();
    expect(s.current).toBe('');
    s.change.next('abc');
    expect(s.current).toBe('abc');
  });
});

describe('TableFilterInputDirective', () => {
  @Component({
    template: `<input rxapTableFilterInput [(ngModel)]="value" />`,
    imports: [FormsModule, TableFilterInputDirective],
  })
  class HostComponent {
    value = '';
  }

  const service = new TableFullTextSearchService();

  beforeEach(() => {
    service.change.next('');
    TestBed.configureTestingModule({
      providers: [{ provide: RXAP_TABLE_FILTER, useValue: service }],
    });
  });

  it('debounces the value and ignores short inputs', fakeAsync(() => {
    const f = TestBed.createComponent(HostComponent);
    f.detectChanges();
    tick();
    const input: HTMLInputElement = f.nativeElement.querySelector('input');
    const type = (v: string) => {
      input.value = v;
      input.dispatchEvent(new Event('input'));
      f.detectChanges();
      tick(200);
    };
    type('abcd');
    expect(service.current).toBe('abcd');
    type('ab');
    expect(service.current).toBeNull();
  }));
});

describe('select and expand row in a table', () => {
  @Component({
    template: `
      <table mat-table [dataSource]="rows">
        <ng-container matColumnDef="select">
          <th mat-header-cell *matHeaderCellDef rxap-checkbox-header-cell></th>
          <td mat-cell *matCellDef="let row" rxap-checkbox-cell [element]="row"></td>
        </ng-container>
        <ng-container matColumnDef="expand">
          <th mat-header-cell *matHeaderCellDef>
            <ng-template rxapAllRowsSelected let-selected><span class="all-selected">{{ selected.length }}</span></ng-template>
          </th>
          <td mat-cell *matCellDef="let row" [rxap-expand-controls-cell]="row"></td>
        </ng-container>
        <ng-container matColumnDef="detail">
          <td mat-cell *matCellDef="let row" colspan="3" [rxap-expand-row]="row">
            <ng-template rxapExpandRowContent let-r><span class="detail">detail {{ r.id }}</span></ng-template>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="['select', 'expand']"></tr>
        <tr mat-row *matRowDef="let row; columns: ['select', 'expand']" [rxapExpandRow]="row"></tr>
      </table>
    `,
    imports: [
      MatTableModule,
      CheckboxHeaderCellComponent,
      CheckboxCellComponent,
      AllRowsSelectedDirective,
      ExpandControlsCellComponent,
      ExpandRowContainerComponent,
      ExpandRowContentDirective,
      ExpandRowDirective,
    ],
    providers: [SelectRowService, ExpandRowService],
  })
  class HostComponent {
    rows: Row[] = [{ id: 1 }, { id: 2 }];
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [NoopAnimationsModule] });
  });

  async function setup() {
    const f = TestBed.createComponent(HostComponent);
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    return {
      f,
      el: f.nativeElement as HTMLElement,
      select: f.debugElement.injector.get(SelectRowService<Row>),
      expand: f.debugElement.injector.get(ExpandRowService<Row>),
    };
  }

  it('selects single rows and shows indeterminate state', async () => {
    const { f, el, select } = await setup();
    const boxes = () => Array.from(el.querySelectorAll('mat-checkbox input')) as HTMLInputElement[];
    expect(boxes().length).toBe(3);
    boxes()[1].click();
    f.detectChanges();
    expect(select.selectedRows).toEqual([f.componentInstance.rows[0]]);
    const header = f.debugElement.query((d) => d.name === 'th' && !!d.componentInstance && d.componentInstance instanceof CheckboxHeaderCellComponent)
      .componentInstance as CheckboxHeaderCellComponent<Row>;
    expect(header.indeterminate()).toBe(true);
    expect(header.checked()).toBe(false);
    expect(el.querySelector('.all-selected')).toBeNull();
  });

  it('selects and clears all rows with the header checkbox', async () => {
    const { f, el, select } = await setup();
    const boxes = () => Array.from(el.querySelectorAll('mat-checkbox input')) as HTMLInputElement[];
    boxes()[0].click();
    f.detectChanges();
    expect(select.selectedRows.length).toBe(2);
    expect(el.querySelector('.all-selected')?.textContent).toBe('2');
    const header = f.debugElement.query((d) => d.componentInstance instanceof CheckboxHeaderCellComponent)
      .componentInstance as CheckboxHeaderCellComponent<Row>;
    expect(header.checked()).toBe(true);
    boxes()[0].click();
    f.detectChanges();
    expect(select.selectedRows.length).toBe(0);
    expect(el.querySelector('.all-selected')).toBeNull();
  });

  it('toggles the expanded row on click', async () => {
    const { f, el, expand } = await setup();
    const row = el.querySelector('tr.mat-mdc-row, tr[mat-row]') as HTMLElement;
    row.click();
    f.detectChanges();
    expect(expand.expandedRow.value).toBe(f.componentInstance.rows[0]);
    expect(row.classList.contains('expanded-row')).toBe(true);
    const cell = f.debugElement.query((d) => d.componentInstance instanceof ExpandControlsCellComponent)
      .componentInstance as ExpandControlsCellComponent<Row>;
    f.detectChanges();
    expect(cell.expanded()).toBe(true);
    row.click();
    f.detectChanges();
    expect(expand.expandedRow.value).toBeNull();
  });
});

describe('ExpandRowContainerComponent', () => {
  @Component({
    template: `
      <table><tr>
        <td [rxap-expand-row]="row">
          <ng-template rxapExpandRowContent let-r><span class="detail">detail {{ r.id }}</span></ng-template>
        </td>
      </tr></table>
    `,
    imports: [ExpandRowContainerComponent, ExpandRowContentDirective],
    providers: [ExpandRowService],
  })
  class HostComponent {
    row = { id: 7 };
  }

  it('renders the content only after the row is expanded', async () => {
    TestBed.configureTestingModule({ imports: [NoopAnimationsModule] });
    const f = TestBed.createComponent(HostComponent);
    f.detectChanges();
    const service = f.debugElement.injector.get(ExpandRowService);
    expect(f.nativeElement.querySelector('.detail')).toBeNull();
    service.toggleRow(f.componentInstance.row);
    await f.whenStable();
    f.detectChanges();
    f.detectChanges();
    expect(f.nativeElement.querySelector('.detail')?.textContent).toBe('detail 7');
  });
});
