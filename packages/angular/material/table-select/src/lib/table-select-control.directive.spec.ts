import { Component, signal } from '@angular/core';
import {
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import {
  DataSourceLoader,
  staticDataSource,
} from '@rxap/data-source';
import {
  RxapFormControl,
  RxapFormGroup,
} from '@rxap/forms';
import { WindowService } from '@rxap/window-system';
import {
  UseTableSelectColumns,
  UseTableSelectDataSource,
  UseTableSelectToDisplay,
  UseTableSelectToValue,
} from './decorators';
import { OpenTableSelectWindowDirective } from './open-table-select-window.directive';
import { OpenTableSelectWindowMethod } from './open-table-select-window.method';
import { TableSelectControlDirective } from './table-select-control.directive';
import { TableSelectInputComponent } from './table-select-input/table-select-input.component';

const columns = { name: { label: 'Name' } };
const rows = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }];

@Component({
  imports: [MatFormField, MatSuffix, TableSelectInputComponent, ReactiveFormsModule, OpenTableSelectWindowDirective, TableSelectControlDirective],
  template: `
    <mat-form-field rxapTableSelectControl
                    [openMethod]="openMethod"
                    [data]="data()"
                    [columns]="columns()"
                    [toDisplay]="toDisplay"
                    [toValue]="toValue">
      <rxap-table-select-input [formControl]="control"></rxap-table-select-input>
      <button rxapOpenTableSelectWindow matSuffix [toValue]="toValue">Open</button>
    </mat-form-field>`,
})
class HostComponent {
  openMethod: any = { call: jest.fn() };
  data = signal<any>(rows);
  columns = signal<any>(columns);
  toDisplay = (v: any) => `display:${ v.name }`;
  toValue = (v: any) => v.id;
  control = new FormControl<any>(null);
}

@Component({
  imports: [MatFormField, MatSuffix, TableSelectInputComponent, OpenTableSelectWindowDirective, TableSelectControlDirective],
  template: `
    <mat-form-field rxapTableSelectControl [openMethod]="openMethod">
      <rxap-table-select-input></rxap-table-select-input>
      <button rxapOpenTableSelectWindow matSuffix [data]="[]" [columns]="{}" [toValue]="toValue">Open</button>
    </mat-form-field>`,
})
class StandaloneHostComponent {
  toValue = (v: any) => v;
  openMethod: any = { call: jest.fn() };
}

class Definition {}
UseTableSelectColumns(columns)(Definition.prototype, 'item');
UseTableSelectToValue((v: any) => v.id)(Definition.prototype, 'item');
UseTableSelectToDisplay((v: any) => `def:${ v.name }`)(Definition.prototype, 'item');
UseTableSelectDataSource({ id: 'rows' } as any)(Definition.prototype, 'item');

@Component({
  imports: [MatFormField, MatSuffix, TableSelectInputComponent, ReactiveFormsModule, OpenTableSelectWindowDirective, TableSelectControlDirective],
  template: `
    <mat-form-field rxapTableSelectControl [openMethod]="openMethod">
      <rxap-table-select-input [formControl]="control"></rxap-table-select-input>
      <button rxapOpenTableSelectWindow matSuffix>Open</button>
    </mat-form-field>`,
})
class DefinitionHostComponent {
  openMethod: any = { call: jest.fn() };
  control = new RxapFormControl<any>(null, { controlId: 'item' });
  group = (() => {
    const group = new RxapFormGroup({ item: this.control }, { controlId: 'form' });
    Reflect.set(group, '_rxapFormDefinition', new Definition());
    return group;
  })();
}

describe('TableSelectControlDirective', () => {
  const call = jest.fn();
  const loaded = staticDataSource(rows);
  const load = jest.fn(() => loaded);

  beforeEach(() => {
    call.mockReset().mockResolvedValue([rows[1]]);
    load.mockClear();
    jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
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

  function create<T>(component: new () => T) {
    const fixture = TestBed.createComponent(component);
    fixture.detectChanges();
    const field = fixture.debugElement.children[0];
    return {
      fixture,
      directive: field.injector.get(TableSelectControlDirective) as TableSelectControlDirective<any>,
      window: field.query(el => el.name === 'button').injector.get(OpenTableSelectWindowDirective) as OpenTableSelectWindowDirective<any, any>,
      input: field.query(el => el.name === 'rxap-table-select-input').componentInstance as TableSelectInputComponent,
    };
  }

  it('exposes the inputs through the *Input aliases', () => {
    const { fixture, directive } = create(HostComponent);
    const host = fixture.componentInstance;
    expect(directive.openMethod()).toBe(host.openMethod);
    expect(directive.dataInput()).toBe(rows);
    expect(directive.columnsInput()).toBe(columns);
    expect(directive.toDisplayInput()).toBe(host.toDisplay);
    expect(directive.toValueInput()).toBe(host.toValue);
    expect(directive.multiple()).toBeUndefined();
  });

  it('linked signals follow the inputs but can be overridden', () => {
    const { fixture, directive } = create(HostComponent);
    directive.data.set([]);
    expect(directive.data()).toEqual([]);
    fixture.componentInstance.data.set([rows[0]]);
    fixture.detectChanges();
    expect(directive.data()).toEqual([rows[0]]);
  });

  it('pushes data, columns and compareWith into the projected window directive', () => {
    const { window } = create(HostComponent);
    expect(window.data()).toBe(rows);
    expect(window.columns()).toBe(columns);
    expect(window.compareWith()!(rows[0], { ...rows[0] })).toBe(true);
    expect(window.compareWith()!(rows[0], rows[1])).toBe(false);
  });

  it('updates the window directive when the inputs change', () => {
    const { fixture, window } = create(HostComponent);
    const next = [rows[0]];
    fixture.componentInstance.data.set(next);
    fixture.detectChanges();
    expect(window.data()).toBe(next);
  });

  it('wires the display function into the input', async () => {
    const { input } = create(HostComponent);
    expect(await input.toDisplay(rows[0])).toBe('display:a');
  });

  it('handles the selection of a row', async () => {
    const { fixture, directive, window, input } = create(HostComponent);
    expect(directive.selected).toEqual([]);
    await window.onClick(new MouseEvent('click'));
    await fixture.whenStable();
    expect(directive.value).toBe(rows[1]);
    expect(directive.selected).toEqual([rows[1]]);
    expect(input.display).toBe('display:b');
    expect(input.value).toBe(rows[1]);
  });

  it('clears the value on an empty selection', async () => {
    const { fixture, directive, window } = create(HostComponent);
    await window.onClick(new MouseEvent('click'));
    await fixture.whenStable();
    // the window directive disables the control in a timeout while the window is open
    await new Promise((resolve) => setTimeout(resolve));
    fixture.componentInstance.control.enable();
    call.mockResolvedValue([]);
    await window.onClick(new MouseEvent('click'));
    await fixture.whenStable();
    expect(directive.value).toBeNull();
    expect(directive.selected).toEqual([]);
  });

  it('reads the select label', () => {
    const { directive } = create(HostComponent);
    expect(directive.matLabel()).toBeUndefined();
  });

  it('logs standalone mode without ngControl', () => {
    const { directive, window } = create(StandaloneHostComponent);
    expect(directive.ngControl).toBeNull();
    expect(console.log).toHaveBeenCalledWith('standalone mode');
    expect(window.disabled()).toBe(false);
  });

  it('does not extract anything for plain form controls', () => {
    const { directive } = create(HostComponent);
    expect(directive.ngControl).toBeInstanceOf(Object);
    expect(directive.control).toBeUndefined();
    expect(load).not.toHaveBeenCalled();
  });

  describe('with a form definition', () => {
    it('preselects the control value in the window directive', () => {
      const fixture = TestBed.createComponent(DefinitionHostComponent);
      fixture.componentInstance.control.setValue(rows[0]);
      fixture.detectChanges();
      fixture.detectChanges();
      const window = fixture.debugElement.query(el => el.name === 'button').injector.get(OpenTableSelectWindowDirective);
      expect(window.selected()).toEqual([rows[0]]);
    });

    it('extracts data, display, value and columns', async () => {
      const { fixture, directive, window, input } = create(DefinitionHostComponent);
      fixture.detectChanges();
      expect(directive.control).toBe(fixture.componentInstance.control);
      expect(directive.data()).toBe(loaded);
      expect(directive.columns()).toBe(columns);
      expect(directive.toValue()!(rows[1])).toBe(2);
      expect(await directive.toDisplay()(rows[0])).toBe('def:a');
      expect(window.data()).toBe(loaded);
      expect(window.columns()).toBe(columns);
      expect(await input.toDisplay(rows[1])).toBe('def:b');
    });

    it('propagates the disabled state of the control', fakeAsync(() => {
      const { fixture, window } = create(DefinitionHostComponent);
      fixture.detectChanges();
      expect(window.disabled()).toBe(false);
      fixture.componentInstance.control.disable();
      tick(200);
      fixture.detectChanges();
      expect(window.disabled()).toBe(true);
      fixture.componentInstance.control.enable();
      tick(200);
      fixture.detectChanges();
      expect(window.disabled()).toBe(false);
      fixture.destroy();
    }));
  });
});
