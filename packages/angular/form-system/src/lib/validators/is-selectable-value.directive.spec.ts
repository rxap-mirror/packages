import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseDataSource } from '@rxap/data-source';
import {
  FormType,
  RxapForm,
  RxapFormBuilder,
  RxapFormControl,
  UseFormControl,
} from '@rxap/forms';
import { ControlOptions } from '@rxap/utilities';
import { BehaviorSubject } from 'rxjs';
import { InputSelectOptionsDirective } from '../directives/input-select-options.directive';
import { UseOptionsDataSource } from '../mixins/extract-options-data-source.mixin';
import { IsSelectableValueDirective } from './is-selectable-value.directive';

class OptionsSource extends BaseDataSource<ControlOptions | Record<string, string> | null> {
  readonly options$ = new BehaviorSubject<ControlOptions | Record<string, string> | null>(null);

  constructor() {
    super({ id: 'selectable-options-source' });
  }

  protected override _connect() {
    return this.options$.asObservable();
  }
}

const source = new OptionsSource();

@RxapForm('is-selectable-value-test')
class TestForm implements FormType<{ selectable: string; plain: string }> {
  @UseOptionsDataSource(source)
  @UseFormControl()
  selectable!: RxapFormControl<string>;

  @UseFormControl()
  plain!: RxapFormControl<string>;
}

@Component({
  imports: [ReactiveFormsModule, IsSelectableValueDirective, InputSelectOptionsDirective],
  template: `
    <select [formControl]="form.selectable" rxapIsSelectableValue>
      <option *rxapInputSelectOptions="let o" [value]="o.value">{{ o.display }}</option>
    </select>`,
})
class HostComponent {
  readonly form: any = new RxapFormBuilder<{ selectable: string; plain: string }>(TestForm).build();
}

@Component({
  imports: [ReactiveFormsModule, IsSelectableValueDirective],
  template: `<input [formControl]="form.plain" rxapIsSelectableValue />`,
})
class WithoutOptionsHostComponent {
  readonly form: any = new RxapFormBuilder<{ selectable: string; plain: string }>(TestForm).build();
}

describe('IsSelectableValueDirective', () => {

  beforeEach(() => {
    vi.useFakeTimers();
    source.options$.next(null);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function create() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('is valid for an empty control value without loading the options', () => {
    const fixture = create();
    expect(fixture.componentInstance.form.selectable.errors).toBeNull();
  });

  it('is valid when the value is part of the array options', () => {
    const fixture = create();
    source.options$.next([
      { value: 'a', display: 'Alpha' },
      { value: 'b', display: 'Beta' },
    ]);
    const control: RxapFormControl<string> = fixture.componentInstance.form.selectable;
    control.setValue('b');
    expect(control.errors).toBeNull();
  });

  it('reports a value that is not part of the array options', () => {
    const fixture = create();
    source.options$.next([
      { value: 'a', display: 'Alpha' },
      { value: 'b', display: 'Beta' },
    ]);
    const control: RxapFormControl<string> = fixture.componentInstance.form.selectable;
    control.setValue('x');
    expect(control.errors).toEqual({
      isSelectableValue: { expected: 'Value should be from the list of provided options' },
    });
  });

  it('validates against the keys of record options', () => {
    const fixture = create();
    source.options$.next({ a: 'Alpha', b: 'Beta' });
    const control: RxapFormControl<string> = fixture.componentInstance.form.selectable;
    control.setValue('a');
    expect(control.errors).toBeNull();
    control.setValue('c');
    expect(control.errors).toHaveProperty('isSelectableValue');
  });

  it('is valid and warns in dev mode while no options have been loaded yet', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = create();
    const control: RxapFormControl<string> = fixture.componentInstance.form.selectable;
    control.setValue('a');
    expect(control.errors).toBeNull();
    expect(warn).toHaveBeenCalledWith(
      'The last value from the OptionsDataSource is empty',
      expect.any(IsSelectableValueDirective),
    );
  });

  it('provides a default viewer id', () => {
    const fixture = create();
    const directive = fixture.debugElement.children[0].injector.get(IsSelectableValueDirective);
    expect(directive.viewer()).toEqual({ id: '[rxapIsSelectableValue]' });
  });

  it('fails when the control has no options data source', () => {
    const fixture = TestBed.createComponent(WithoutOptionsHostComponent);
    fixture.detectChanges();
    const control: RxapFormControl<string> = fixture.componentInstance.form.plain;
    expect(() => control.setValue('a')).toThrow(/A use data source definition does not exists/);
  });

});
