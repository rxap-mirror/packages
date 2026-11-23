import { Component, InjectionToken, signal } from '@angular/core';
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
import { BehaviorSubject } from 'rxjs';
import { UseOptionsDataSource } from '../mixins/extract-options-data-source.mixin';
import { InputSelectOptionsDirective } from './input-select-options.directive';

class OptionsSource extends BaseDataSource<any> {
  readonly options$ = new BehaviorSubject<any>([]);
  constructor() {
    super({ id: 'options-source' });
  }
  protected override _connect() {
    return this.options$.asObservable();
  }
}

const source = new OptionsSource();
const filteredSource = new OptionsSource();
const loadOnceSource = new OptionsSource();
const ignoreSource = new OptionsSource();
const MISSING = new InjectionToken('missing-data-source');

interface IForm {
  plain: string;
  filtered: string;
  once: string;
  ignore: string;
  missing: string;
  none: string;
}

@RxapForm('input-select-options-test')
class TestForm implements FormType<IForm> {
  @UseOptionsDataSource(source)
  @UseFormControl()
  plain!: RxapFormControl<string>;

  @UseOptionsDataSource(filteredSource, { filteredOptions: true })
  @UseFormControl()
  filtered!: RxapFormControl<string>;

  @UseOptionsDataSource(loadOnceSource, { loadOnce: true })
  @UseFormControl()
  once!: RxapFormControl<string>;

  @UseOptionsDataSource(ignoreSource, { ignoreSelectedValue: true })
  @UseFormControl()
  ignore!: RxapFormControl<string>;

  @UseOptionsDataSource(MISSING as any)
  @UseFormControl()
  missing!: RxapFormControl<string>;

  @UseFormControl()
  none!: RxapFormControl<string>;
}

describe('InputSelectOptionsDirective', () => {
  function host(controlName: keyof IForm) {
    @Component({
      imports: [ReactiveFormsModule, InputSelectOptionsDirective],
      template: `<select [formControl]="form[control]"><option *rxapInputSelectOptions="let o" [value]="o.value">{{ o.display }}</option></select>`,
    })
    class Host {
      form: any = new RxapFormBuilder<IForm>(TestForm).build();
      control = controlName;
    }
    return Host;
  }

  const labels = (f: any) =>
    Array.from(f.nativeElement.querySelectorAll('option')).map((o: any) => o.textContent.trim());

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    for (const s of [source, filteredSource, loadOnceSource, ignoreSource]) {
      s.options$.next([]);
    }
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders array options', async () => {
    const f = TestBed.createComponent(host('plain'));
    f.detectChanges();
    source.options$.next([
      { value: 'a', display: 'Alpha' },
      { value: 'b', display: 'Beta' },
    ]);
    expect(labels(f)).toEqual(['Alpha', 'Beta']);
  });

  it('renders record options', () => {
    const f = TestBed.createComponent(host('plain'));
    f.detectChanges();
    source.options$.next({ a: 'Alpha', b: 'Beta' });
    expect(labels(f)).toEqual(['Alpha', 'Beta']);
  });

  it('warns for empty options', () => {
    const f = TestBed.createComponent(host('plain'));
    f.detectChanges();
    source.options$.next(null);
    expect(console.warn).toHaveBeenCalled();
    expect(labels(f)).toEqual([]);
  });

  it('filters options by the control value when filteredOptions is set', async () => {
    const f = TestBed.createComponent(host('filtered'));
    f.detectChanges();
    filteredSource.options$.next([
      { value: 'a', display: 'Alpha' },
      { value: 'b', display: 'Beta' },
    ]);
    expect(labels(f)).toEqual(['Alpha', 'Beta']);
    f.componentInstance.form.filtered.setValue('alp');
    expect(labels(f)).toEqual(['Alpha']);
    filteredSource.options$.next({ a: 'Alpha', b: 'Beta', c: 5 });
    f.componentInstance.form.filtered.setValue('bet');
    expect(labels(f)).toEqual(['Beta']);
  });

  it('keeps the viewer id bound to the control', () => {
    const f = TestBed.createComponent(host('plain'));
    f.detectChanges();
    const spy = vi.spyOn(source, 'connect');
    TestBed.createComponent(host('plain')).detectChanges();
    expect((spy.mock.calls[0][0] as any).id).toBe('[rxapInputSelectOptions]plain');
  });

  it('does not refresh with loadOnce', () => {
    const f = TestBed.createComponent(host('once'));
    f.detectChanges();
    loadOnceSource.options$.next([{ value: 'a', display: 'Alpha' }]);
    expect(labels(f)).toEqual(['Alpha']);
  });

  it('maps the selected value to an empty object with ignoreSelectedValue', () => {
    const f = TestBed.createComponent(host('ignore'));
    f.detectChanges();
    ignoreSource.options$.next([{ value: 'a', display: 'Alpha' }]);
    f.componentInstance.form.ignore.setValue('a');
    vi.advanceTimersByTime(1500);
    expect(labels(f)).toEqual(['Alpha']);
  });

  it('throws a readable error if the data source can not be injected', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const f = TestBed.createComponent(host('missing'));
    expect(() => f.detectChanges()).toThrow(/Cloud not inject the options data source:/);
  });

  it('throws if no options data source is defined for the control', () => {
    const f = TestBed.createComponent(host('none'));
    expect(() => f.detectChanges()).toThrow();
  });

  it('unsubscribes on destroy', () => {
    const f = TestBed.createComponent(host('plain'));
    f.detectChanges();
    f.destroy();
    expect(() => source.options$.next([{ value: 'a', display: 'A' }])).not.toThrow();
  });

  describe('with mat-autocomplete', () => {
    it('links displayWith and enables filtered options', () => {
      const displayWith = signal<any>(undefined);
      @Component({
        imports: [ReactiveFormsModule, InputSelectOptionsDirective],
        template: `<select [formControl]="form.plain"><option *rxapInputSelectOptions="let o; matAutocomplete: ac" [value]="o.value">{{ o.display }}</option></select>`,
      })
      class Host {
        form: any = new RxapFormBuilder<IForm>(TestForm).build();
        ac: any = {
          set displayWith(fn: any) {
            displayWith.set(fn);
          },
        };
      }
      const f = TestBed.createComponent(Host);
      f.detectChanges();
      source.options$.next([{ value: 'a', display: 'Alpha' }]);
      const toDisplay = displayWith();
      expect(typeof toDisplay).toBe('function');
      expect(toDisplay('')).toBe('');
      expect(toDisplay('a')).toBe('Alpha');
      expect(toDisplay('zzz')).toBe('to display error');
    });
  });
});
