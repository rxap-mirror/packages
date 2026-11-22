import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { Method } from '@rxap/pattern';
import { SelectRowService } from '../select-row/select-row.service';
import { RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS } from '../select-row/tokens';
import { TableDataSourceDirective } from '../table-data-source.directive';
import { TableActionMethod } from './decorators';
import { RowActionCheckPipe } from './row-action-check.pipe';
import { TableRowActionExecutingDirective } from './table-row-action-executing.directive';
import {
  GetTableRowActionCheckFunction,
  GetTableRowActionMetadata,
  HasTableRowActionCheckFunction,
  HasTableRowActionMetadata,
  IsTableRowActionTypeMethod,
  IsTableRowActionTypeSwitchMethod,
} from './table-row-action.method';
import { TableRowActionDirective } from './table-row-action.directive';
import { TableRowHeaderActionDirective } from './table-row-header-action.directive';
import { RXAP_TABLE_ROW_ACTION_METHOD } from './tokens';

const calls: any[] = [];

@TableActionMethod({
  type: 'edit',
  refresh: true,
  tooltip: 'Edit it',
  color: 'primary',
  successMessage: 'saved',
  errorMessage: 'failed',
  checkFunction: (row: any) => row.editable,
})
class EditMethod implements Method {
  async call(row: any) {
    calls.push(['edit', row]);
    if (row.fail) {
      throw new Error('fail');
    }
  }
}

@TableActionMethod({ type: 'delete', confirm: true })
class DeleteMethod implements Method {
  async call(row: any) {
    calls.push(['delete', row]);
  }
}

@TableActionMethod({ priority: 1 })
class SwitchMethod implements Method {
  async call(param: any) {
    calls.push(['switch', param]);
  }
}

class PlainMethod implements Method {
  call() {
    return null;
  }
}

describe('row action metadata helpers', () => {
  it('detects type and switch methods', () => {
    const edit = new EditMethod();
    expect(IsTableRowActionTypeMethod('edit')(edit)).toBe(true);
    expect(IsTableRowActionTypeMethod('other')(edit)).toBe(false);
    expect(IsTableRowActionTypeSwitchMethod(edit)).toBe(false);
    expect(IsTableRowActionTypeSwitchMethod(new SwitchMethod())).toBe(true);
  });

  it('reads check function and metadata', () => {
    const edit = new EditMethod();
    expect(HasTableRowActionCheckFunction(edit)).toBe(true);
    expect(HasTableRowActionCheckFunction(new DeleteMethod())).toBe(false);
    expect(GetTableRowActionCheckFunction(edit)({ editable: true } as any, 0, [])).toBe(true);
    expect(() => GetTableRowActionCheckFunction(new DeleteMethod())).toThrow();
    expect(HasTableRowActionMetadata(edit)).toBe(true);
    expect(HasTableRowActionMetadata(new PlainMethod() as any)).toBe(false);
    expect(GetTableRowActionMetadata(edit).type).toBe('edit');
    expect(() => GetTableRowActionMetadata(new PlainMethod() as any)).toThrow();
  });

  it('supports the string signature of the decorator', () => {
    @TableActionMethod('x', () => true)
    class M implements Method {
      call() {
        return null;
      }
    }
    expect(GetTableRowActionMetadata(new M()).type).toBe('x');
  });
});

describe('RowActionCheckPipe', () => {
  function pipe(methods: any) {
    TestBed.configureTestingModule({
      providers: [RowActionCheckPipe, { provide: RXAP_TABLE_ROW_ACTION_METHOD, useValue: methods }],
    });
    return TestBed.inject(RowActionCheckPipe);
  }

  it('applies the check function to all rows', () => {
    const p = pipe([new EditMethod(), new DeleteMethod()]);
    expect(p.transform({ editable: true }, 'edit')).toBe(true);
    expect(p.transform([{ editable: true }, { editable: false }], 'edit')).toBe(false);
    expect(p.transform([], 'edit')).toBe(false);
    expect(p.transform({}, 'delete')).toBe(true);
  });

  it('throws for empty, unknown and duplicate types', () => {
    const p = pipe([new EditMethod(), new EditMethod()]);
    expect(() => p.transform({}, '')).toThrow('empty');
    expect(() => p.transform({}, 'unknown')).toThrow('Could not find');
    expect(() => p.transform({}, 'edit')).toThrow('Multiple');
  });
});

@Component({
  standalone: true,
  imports: [
    TableRowActionDirective,
    TableRowHeaderActionDirective,
    TableRowActionExecutingDirective,
    MatButtonModule,
    MatTooltipModule,
  ],
  template: `
    <button mat-icon-button rxapTableRowAction="edit" [element]="row" matTooltip="x" id="edit">
      <ng-template rxapTableRowActionExecuting><span class="spinner"></span></ng-template>
    </button>
    <button mat-button rxapTableRowAction="delete" [element]="row" id="delete"></button>
    <button mat-button rxapTableRowAction="editOther" [element]="row" rxapConfirm [color]="'warn'" id="confirm"></button>
    <button mat-button rxapTableRowHeaderAction="edit" id="header"></button>
  `,
})
class HostComponent {
  row: any = { editable: true };
}

describe('TableRowActionDirective / TableRowHeaderActionDirective', () => {
  const dataSource = { refresh: jest.fn() };
  const snackBar = { open: jest.fn() };

  function setup(methods: any[] = [new EditMethod(), new DeleteMethod(), new SwitchMethod()]) {
    calls.length = 0;
    dataSource.refresh.mockClear();
    snackBar.open.mockClear();
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        SelectRowService,
        { provide: RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS, useValue: { multiple: true } },
        { provide: RXAP_TABLE_ROW_ACTION_METHOD, useValue: methods },
        { provide: TableDataSourceDirective, useValue: dataSource },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const get = (id: string) => fixture.debugElement.query(By.css('#' + id));
    return { fixture, get, service: TestBed.inject(SelectRowService) };
  }

  it('adds css classes and metadata derived configuration', () => {
    const { get } = setup();
    expect(get('edit').nativeElement.classList).toContain('rxap-table-row-action');
    expect(get('edit').nativeElement.classList).toContain('rxap-action-edit');
    expect(get('header').nativeElement.classList).toContain('rxap-table-row-header-action');
  });

  it('executes typed and switch methods, refreshes and notifies on success', async () => {
    const { get, fixture } = setup();
    const directive = get('edit').injector.get(TableRowActionDirective);
    const promise = directive.onClick(new Event('click'));
    await promise;
    expect(calls).toEqual([
      ['switch', { element: fixture.componentInstance.row, type: 'edit' }],
      ['edit', fixture.componentInstance.row],
    ]);
    expect(dataSource.refresh).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('saved', 'ok', { duration: 2560 });
  });

  it('shows an error message when the method fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const { get, fixture } = setup();
    fixture.componentInstance.row.fail = true;
    await get('edit').injector.get(TableRowActionDirective).execute();
    expect(snackBar.open).toHaveBeenCalledWith('failed', 'ok', { duration: 5120 });
    expect(dataSource.refresh).not.toHaveBeenCalled();
  });

  it('does not execute twice in parallel', async () => {
    const { get } = setup();
    const directive = get('edit').injector.get(TableRowActionDirective);
    await Promise.all([directive.execute(), directive.execute()]);
    expect(calls.filter((c) => c[0] === 'edit')).toHaveLength(1);
  });

  it('skips the click while waiting for a confirmation', async () => {
    jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    const { get } = setup([new EditMethod(), new DeleteMethod()]);
    const directive = get('confirm').injector.get(TableRowActionDirective);
    expect(directive.hasConfirmDirective()).toBe(true);
    await directive.onClick();
    expect(calls).toEqual([]);
    await directive.onConfirmed();
  });

  it('opens the confirm overlay for actions that require confirmation', async () => {
    const { get } = setup();
    const directive = get('delete').injector.get(TableRowActionDirective);
    const open = jest.spyOn(directive as any, 'openConfirmOverly').mockImplementation();
    await directive.onClick();
    expect(open).toHaveBeenCalled();
    expect(calls).toEqual([]);
  });

  it('header action operates on the selected rows and is disabled without selection', async () => {
    const { get, service } = setup();
    const directive = get('header').injector.get(TableRowHeaderActionDirective);
    await directive.execute();
    expect(calls).toEqual([]);
    service.selectionModel.select({ id: 1 }, { id: 2 });
    TestBed.tick();
    await directive.execute();
    expect(calls.filter((c) => c[0] === 'edit')).toHaveLength(2);
    service.selectionModel.clear();
    TestBed.tick();
    calls.length = 0;
    await directive.execute();
    expect(calls).toEqual([]);
  });
});
