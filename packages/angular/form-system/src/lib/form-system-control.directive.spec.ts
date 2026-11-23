import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ControlValueAccessor, FormControl, ReactiveFormsModule } from '@angular/forms';
import { BaseDataSource } from '@rxap/data-source';
import {
  FormType,
  RxapForm,
  RxapFormBuilder,
  RxapFormControl,
  UseFormControl,
} from '@rxap/forms';
import { of } from 'rxjs';
import { ControlWithDataSource } from './control-with-data-source';
import { UseComponent } from './decorators/use-component';
import { UseDataSource } from './decorators/use-data-source';
import { FormSystemControlDirective } from './form-system-control.directive';

@Component({ selector: 'rxap-test-cva', template: '<span class="cva">cva</span>' })
class CvaComponent implements ControlValueAccessor, ControlWithDataSource {
  written: any[] = [];
  disabledStates: boolean[] = [];
  onChange: any;
  onTouched: any;
  sources = new Map<string, any>();
  label?: string;
  writeValue(value: any) {
    this.written.push(value);
  }
  registerOnChange(fn: any) {
    this.onChange = fn;
  }
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }
  setDisabledState(d: boolean) {
    this.disabledStates.push(d);
  }
  setDataSource(name: string, dataSource: any, settings?: any) {
    this.sources.set(name, { dataSource, settings });
  }
}

@Component({ selector: 'rxap-test-cva2', template: '' })
class PlainCva implements ControlValueAccessor {
  writeValue() {}
  registerOnChange() {}
  registerOnTouched() {}
}

class Source extends BaseDataSource<string[]> {
  constructor() {
    super({ id: 'src' });
  }
  protected override _connect() {
    return of(['a']);
  }
}

const source = new Source();

interface IForm {
  withSource: string;
  plain: string;
  noComponent: string;
}

@RxapForm('form-system-control-test')
class TestForm implements FormType<IForm> {
  @UseDataSource(source, 'items', { transformer: (v: string[]) => v.length })
  @UseComponent(CvaComponent, { label: 'Hello' })
  @UseFormControl()
  withSource!: RxapFormControl<string>;

  @UseComponent(PlainCva)
  @UseFormControl()
  plain!: RxapFormControl<string>;

  @UseFormControl()
  noComponent!: RxapFormControl<string>;
}

describe('FormSystemControlDirective', () => {
  @Component({
    imports: [ReactiveFormsModule, FormSystemControlDirective],
    template: `
      <form [formGroup]="form.rxapFormGroup">
        <div class="host" rxapFormSystemControl [controlId]="id"></div>
      </form>
    `,
  })
  class Host {
    form: any = new RxapFormBuilder<IForm>(TestForm).build({ withSource: 'init' });
    id = 'withSource';
  }

  function create(id: string) {
    TestBed.overrideComponent(Host, {
      set: {
        template: `<form [formGroup]="form.rxapFormGroup"><div class="host" rxapFormSystemControl controlId="${id}"></div></form>`,
      },
    });
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    return f;
  }

  it('creates the configured component and applies properties and data sources', () => {
    const f = create('withSource');
    const dir = f.debugElement.query((d) => d.nativeElement.classList?.contains('host')).injector.get(FormSystemControlDirective);
    const cva = (dir as any).componentRef.instance as CvaComponent;
    expect(cva.label).toBe('Hello');
    expect(cva.sources.get('items')?.dataSource).toBeDefined();
    expect(cva.sources.get('items')?.settings?.transformer).toBeDefined();
    expect(f.nativeElement.querySelector('.cva')).toBeTruthy();
  });

  it('delegates the ControlValueAccessor calls to the created component', () => {
    const f = create('withSource');
    const dir = f.debugElement.query((d) => d.nativeElement.classList?.contains('host')).injector.get(FormSystemControlDirective);
    const cva = (dir as any).componentRef.instance as CvaComponent;
    const change = vi.fn();
    const touched = vi.fn();
    dir.registerOnChange(change);
    dir.registerOnTouched(touched);
    expect(cva.onChange).toBe(change);
    expect(cva.onTouched).toBe(touched);
    dir.writeValue('v');
    expect(cva.written).toContain('v');
    dir.setDisabledState(true);
    expect(cva.disabledStates).toEqual([true]);
  });

  it('throws when the component does not implement ControlWithDataSource', () => {
    expect(() => create('plain')).toThrow('ControlWithDataSource interface is not implemented');
  });

  it('throws when no component is registered for the control', () => {
    expect(() => create('noComponent')).toThrow('use component definition does not exists');
  });

  it('throws when the control does not exist', () => {
    expect(() => create('missing')).toThrow('Could not find the control instance');
  });

  it('throws when the control is not a RxapFormControl', () => {
    TestBed.overrideComponent(Host, {
      set: {
        template: `<form [formGroup]="form.rxapFormGroup"><div rxapFormSystemControl controlId="nested"></div></form>`,
      },
    });
    const f = TestBed.createComponent(Host);
    f.componentInstance.form.rxapFormGroup.addControl('nested', new FormControl(''));
    expect(() => f.detectChanges()).toThrow('not a RxapFormControl');
  });
});
