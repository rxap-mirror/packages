import { Component, signal } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import {
  DataSourceLoader,
  staticDataSource,
} from '@rxap/data-source';
import {
  RxapFormControl,
  RxapFormGroup,
} from '@rxap/forms';
import { WindowService } from '@rxap/window-system';
import { Observable, of } from 'rxjs';
import {
  UseTableSelectColumns,
  UseTableSelectDataSource,
  UseTableSelectToValue,
} from './decorators';
import { OpenTableSelectWindowDirective } from './open-table-select-window.directive';
import { OpenTableSelectWindowMethod } from './open-table-select-window.method';
import { TableSelectInputComponent } from './table-select-input/table-select-input.component';

const columns = { name: { label: 'Name' } };
const rows = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }];

@Component({
  imports: [OpenTableSelectWindowDirective, MatButton],
  template: `
    <button mat-button rxapOpenTableSelectWindow
            [data]="data()"
            [columns]="columns()"
            [selected]="selected()"
            [label]="label()"
            [compareWith]="compareWith"
            [toValue]="toValue()"
            [parameters]="parameters"
            [multiple]="multiple()"
            [id]="id()"
            (selectedChange)="changed.push($event)">Open
    </button>`,
})
class HostComponent {
  data = signal<any>(rows);
  columns = signal<any>(columns);
  selected = signal<any[]>([]);
  label = signal<string | undefined>('My label');
  compareWith = (a: any, b: any) => a.id === b.id;
  toValue = signal<any>((v: any) => v.id);
  parameters: Observable<Record<string, unknown>> = of({ p: 1 });
  multiple = signal(true);
  id = signal<string | undefined>('sel-id');
  changed: any[][] = [];
}

describe('OpenTableSelectWindowDirective', () => {
  const call = jest.fn();
  const windowService = { has: jest.fn(() => false), close: jest.fn(), open: jest.fn() };

  beforeEach(() => {
    call.mockReset().mockResolvedValue([rows[1]]);
    windowService.has.mockReset().mockReturnValue(false);
    windowService.close.mockReset();
    jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    TestBed.configureTestingModule({ providers: [{ provide: WindowService, useValue: windowService }] });
    TestBed.overrideDirective(OpenTableSelectWindowDirective, {
      set: { providers: [{ provide: OpenTableSelectWindowMethod, useValue: { call } }] },
    });
  });
  afterEach(() => jest.restoreAllMocks());

  function create() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const debug = fixture.debugElement.children[0];
    const directive: OpenTableSelectWindowDirective<any, any> = debug.injector.get(OpenTableSelectWindowDirective);
    return { fixture, directive, button: debug.nativeElement as HTMLButtonElement };
  }

  it('resolves inputs through the *Input aliases', () => {
    const { directive } = create();
    expect(directive.dataInput()).toBe(rows);
    expect(directive.data()).toBe(rows);
    expect(directive.columnsInput()).toBe(columns);
    expect(directive.columns()).toBe(columns);
    expect(directive.labelInput()).toBe('My label');
    expect(directive.label()).toBe('My label');
    expect(directive.selectedInput()).toEqual([]);
    expect(directive.compareWithInput()).toBeDefined();
    expect(directive.toValueInput()).toBeDefined();
    expect(directive.multiple()).toBe(true);
    expect(directive.id()).toBe('sel-id');
  });

  it('linked signals can be overridden and reset on input change', () => {
    const { fixture, directive } = create();
    directive.label.set('override');
    expect(directive.label()).toBe('override');
    fixture.componentInstance.label.set('next');
    fixture.detectChanges();
    expect(directive.label()).toBe('next');
    directive.data.set([]);
    expect(directive.data()).toEqual([]);
  });

  it('is a type=button and enabled with valid inputs', () => {
    const { button, directive } = create();
    expect(button.getAttribute('type')).toBe('button');
    expect(button.disabled).toBe(false);
    expect(directive.disabled()).toBe(false);
  });

  it('is disabled without data or columns', () => {
    const { fixture, button, directive } = create();
    fixture.componentInstance.data.set(undefined);
    fixture.detectChanges();
    expect(directive.disabled()).toBe(true);
    expect(button.disabled).toBe(true);
    expect(console.warn).toHaveBeenCalledWith('columns or data is not defined');
    fixture.componentInstance.data.set(rows);
    fixture.componentInstance.columns.set(undefined);
    fixture.detectChanges();
    expect(directive.disabled()).toBe(true);
  });

  it('setDisabled disables the button', () => {
    const { fixture, button, directive } = create();
    directive.setDisabled(true);
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
    directive.setDisabled(false);
    fixture.detectChanges();
    expect(button.disabled).toBe(false);
  });

  it('opens the window on click and emits the selection', async () => {
    const { fixture, button, directive } = create();
    const selectedChange = jest.fn();
    directive.selectedChange.subscribe(selectedChange);
    const stop = jest.spyOn(Event.prototype, 'stopPropagation');
    await directive.onClick(new MouseEvent('click'));
    expect(stop).toHaveBeenCalled();
    expect(call).toHaveBeenCalledWith(expect.objectContaining({
      windowConfig: { id: directive._internalId },
      data: rows,
      columns: new Map(Object.entries(columns)),
      selected: [],
      title: 'My label',
      id: 'sel-id',
      multiple: true,
      compareWith: expect.any(Function),
      parameters: expect.anything(),
    }));
    expect(directive.selected()).toEqual([rows[1]]);
    expect(selectedChange).toHaveBeenCalledWith([rows[1]]);
    expect(fixture.componentInstance.changed).toEqual([[rows[1]]]);
    button.click();
    await fixture.whenStable();
    expect(call).toHaveBeenCalledTimes(2);
  });

  it('passes Map columns, default title and generated id', async () => {
    const { fixture, directive } = create();
    const map = new Map([['name', { label: 'Name' }]]);
    fixture.componentInstance.columns.set(map);
    fixture.componentInstance.label.set(undefined);
    fixture.componentInstance.id.set(undefined);
    fixture.detectChanges();
    await directive.onClick(new MouseEvent('click'));
    const args = call.mock.calls[0][0] as any;
    expect(args.columns).toBe(map);
    expect(args.title).toBe('Select value');
    expect(args.id).toHaveLength(10);
  });

  it('does nothing while disabled', async () => {
    const { directive } = create();
    directive.setDisabled(true);
    await directive.onClick(new MouseEvent('click'));
    expect(call).not.toHaveBeenCalled();
  });

  it('does nothing while a window is open', async () => {
    const { directive } = create();
    (directive as any)._hasOpenWindow = true;
    await directive.onClick(new MouseEvent('click'));
    expect(call).not.toHaveBeenCalled();
  });

  it('throws if data or columns are missing', async () => {
    const { directive } = create();
    directive.data.set(undefined);
    // the disabled guard short circuits first, so bypass it
    (directive as any).disabled = () => false;
    await expect(directive.onClick(new MouseEvent('click'))).rejects.toThrow('FATAL');
  });

  it('throws when a selection exists but no toValue method', async () => {
    const { fixture, directive } = create();
    fixture.componentInstance.toValue.set(undefined);
    fixture.detectChanges();
    await expect(directive.onClick(new MouseEvent('click'))).rejects.toThrow('The toValue method is not defined');
  });

  it('handles empty and undefined selections', async () => {
    const { directive } = create();
    call.mockResolvedValueOnce([]);
    await directive.onClick(new MouseEvent('click'));
    expect(directive.selected()).toEqual([]);
    call.mockResolvedValueOnce(undefined);
    await directive.onClick(new MouseEvent('click'));
    expect(directive.selected()).toEqual([]);
  });

  it('validates inputs', () => {
    const { directive } = create();
    const check = (data: any, cols: any) => (directive as any).checkInputs(data, cols, false);
    expect(() => check([], 'x')).toThrow('Ensure that the input columns has a valid value');
    expect(() => check({}, {})).toThrow('Ensure that the input data has a valid value');
    expect(() => check([], {})).not.toThrow();
    expect(() => check(staticDataSource([]), {})).not.toThrow();
  });

  it('closes an open window on destroy', () => {
    const { fixture, directive } = create();
    windowService.has.mockReturnValue(true);
    fixture.destroy();
    expect(windowService.close).toHaveBeenCalledWith(directive._internalId);
  });

  it('does not close a missing window on destroy', () => {
    const { fixture } = create();
    fixture.destroy();
    expect(windowService.close).not.toHaveBeenCalled();
  });
});

@Component({
  imports: [MatFormField, TableSelectInputComponent, ReactiveFormsModule, OpenTableSelectWindowDirective],
  template: `
    <mat-form-field>
      <rxap-table-select-input [formControl]="control"></rxap-table-select-input>
      <button rxapOpenTableSelectWindow [data]="data" [columns]="columns" [toValue]="toValue">Open</button>
    </mat-form-field>`,
})
class FormFieldHostComponent {
  control: FormControl<any> = new FormControl<any>(null);
  data = rows;
  columns = columns;
  toValue: any = (v: any) => v.id;
}

class Definition {}
UseTableSelectColumns(columns)(Definition.prototype, 'item');
UseTableSelectToValue((v: any) => v.id)(Definition.prototype, 'item');
UseTableSelectDataSource({ id: 'rows' } as any)(Definition.prototype, 'item');

@Component({
  imports: [MatFormField, TableSelectInputComponent, ReactiveFormsModule, OpenTableSelectWindowDirective],
  template: `
    <mat-form-field>
      <rxap-table-select-input [formControl]="control"></rxap-table-select-input>
      <button rxapOpenTableSelectWindow>Open</button>
    </mat-form-field>`,
})
class DefinitionHostComponent {
  control = new RxapFormControl<any>(null, { controlId: 'item' });
  group = (() => {
    const group = new RxapFormGroup({ item: this.control }, { controlId: 'form' });
    Reflect.set(group, '_rxapFormDefinition', new Definition());
    return group;
  })();
}

describe('OpenTableSelectWindowDirective inside a mat-form-field', () => {
  const call = jest.fn();
  const loaded = staticDataSource(rows);
  const load = jest.fn(() => loaded);

  beforeEach(() => {
    call.mockReset().mockResolvedValue([rows[0]]);
    load.mockClear();
    jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [
        { provide: WindowService, useValue: { has: () => false, close: jest.fn() } },
        { provide: DataSourceLoader, useValue: { load } },
      ],
    });
    TestBed.overrideDirective(OpenTableSelectWindowDirective, {
      set: { providers: [{ provide: OpenTableSelectWindowMethod, useValue: { call } }] },
    });
  });
  afterEach(() => jest.restoreAllMocks());

  function create<T>(component: new () => T): { fixture: ComponentFixture<T>, directive: OpenTableSelectWindowDirective<any, any> } {
    const fixture = TestBed.createComponent(component);
    fixture.detectChanges();
    const directive = fixture.debugElement.query(el => el.name === 'button').injector.get(OpenTableSelectWindowDirective);
    return { fixture, directive };
  }

  it('sets the control value using the toValue input', async () => {
    const { fixture, directive } = create(FormFieldHostComponent);
    expect(directive.control).toBe(fixture.componentInstance.control);
    await directive.onClick(new MouseEvent('click'));
    expect(fixture.componentInstance.control.value).toBe(1);
  });

  it('resets the control for an empty selection', async () => {
    const { fixture, directive } = create(FormFieldHostComponent);
    fixture.componentInstance.control.setValue(2);
    call.mockResolvedValue([]);
    await directive.onClick(new MouseEvent('click'));
    expect(fixture.componentInstance.control.value).toBeNull();
  });

  it('syncs the disabled state of the control', () => {
    const { fixture, directive } = create(FormFieldHostComponent);
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(directive.disabled()).toBe(true);
    fixture.componentInstance.control.enable();
    fixture.detectChanges();
    expect(directive.disabled()).toBe(false);
  });

  it('extracts columns, toValue and data from the form definition', async () => {
    const { fixture, directive } = create(DefinitionHostComponent);
    expect(directive.columns()).toBe(columns);
    expect(directive.toValue()!(rows[1])).toBe(2);
    expect(directive.data()).toBe(loaded);
    expect(load).toHaveBeenCalledWith({ id: 'rows' }, undefined, expect.anything());
    expect(fixture.componentInstance.control).toBeDefined();
  });
});
