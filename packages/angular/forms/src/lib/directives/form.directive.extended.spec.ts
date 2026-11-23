import { ChangeDetectionStrategy, ChangeDetectorRef, Component, INJECTOR, Injector, Provider, SimpleChange, viewChild } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { RxapForm } from '../decorators/form';
import { UseFormArrayControl } from '../decorators/use-form-array';
import { UseFormControl } from '../decorators/use-form-control';
import { RxapFormBuilder } from '../form-builder';
import { RxapFormControl } from '../form-control';
import { RxapFormGroup } from '../form-group';
import { FormDirective } from './form.directive';
import { RXAP_FORM_DEFINITION, RXAP_FORM_DEFINITION_BUILDER, RXAP_FORM_LOAD_METHOD } from './tokens';

@RxapForm('extended-form')
class ExtendedForm {
  public rxapFormGroup!: RxapFormGroup;

  @UseFormControl()
  public username!: RxapFormControl;
}

@RxapForm('hooks-form')
class HooksForm {
  public rxapFormGroup!: RxapFormGroup;
  public readonly ngOnInit = vi.fn();
  public readonly ngOnDestroy = vi.fn();

  @UseFormControl()
  public username!: RxapFormControl;
}

@RxapForm('submit-value-form')
class SubmitValueForm {
  public rxapFormGroup!: RxapFormGroup;

  @UseFormControl()
  public username!: RxapFormControl;

  getSubmitValue() {
    return { custom: this.rxapFormGroup.value.username };
  }
}

@RxapForm('json-form')
class JsonForm {
  public rxapFormGroup!: RxapFormGroup;

  @UseFormControl()
  public username!: RxapFormControl;

  toJSON() {
    return { json: this.rxapFormGroup.value.username };
  }
}

@RxapForm('with-array')
class ArrayForm {
  public rxapFormGroup!: RxapFormGroup;

  @UseFormControl()
  public username!: RxapFormControl;

  @UseFormControl({ validators: [ Validators.required ] })
  public name!: RxapFormControl;

  @UseFormArrayControl({ state: [ 'a', 'b' ] })
  public tags!: any;
}

const build = <T>(definition: new () => T): any => new RxapFormBuilder<any, any>(definition as any).build<any>({ username: 'initial' });

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ FormDirective, ReactiveFormsModule ],
  template: `
    <form [rxapForm]="definition"
          [initial]="initial"
          [context]="context"
          [loadMethod]="loadMethod"
          [loadSuccessfulMethod]="loadSuccessfulMethod"
          [loadFailedMethod]="loadFailedMethod"
          [submitMethod]="submitMethod"
          [submitSuccessfulMethod]="submitSuccessfulMethod"
          [submitFailedMethod]="submitFailedMethod">
      <input formControlName="username" ngDefaultControl />
    </form>`,
})
class InputHost {
  definition: any = build(ExtendedForm);
  initial: any = null;
  context: any = null;
  loadMethod: any = null;
  loadSuccessfulMethod: any = null;
  loadFailedMethod: any = null;
  submitMethod: any = null;
  submitSuccessfulMethod: any = null;
  submitFailedMethod: any = null;
  readonly dir = viewChild.required(FormDirective);
}

describe('FormDirective (extended)', () => {

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'group').mockImplementation(() => undefined);
    vi.spyOn(console, 'groupEnd').mockImplementation(() => undefined);
  });

  afterEach(() => vi.restoreAllMocks());

  describe('with inputs', () => {

    let fixture: ComponentFixture<InputHost>;
    let host: InputHost;

    const create = async (configure: (host: InputHost) => void = () => undefined) => {
      TestBed.configureTestingModule({ imports: [ InputHost ] });
      fixture = TestBed.createComponent(InputHost);
      host = fixture.componentInstance;
      configure(host);
      await fixture.whenStable();
      return host.dir();
    };

    it('uses the form definition passed with the rxapForm input and resolves it for the child controls', async () => {
      const dir = await create();

      expect(dir.formDefinition).toBe(host.definition);
      expect(dir.form).toBe(host.definition.rxapFormGroup);
      expect(dir.loaded()).toBe(true);
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('initial');
      input.value = 'typed';
      input.dispatchEvent(new Event('input'));
      expect(host.definition.username.value).toBe('typed');
    });

    it('patches the initial input value into the form instead of calling the load method', async () => {
      const loadMethod = { call: vi.fn(() => ({ username: 'loaded' })) };

      const dir = await create((h) => {
        h.initial = { username: 'from initial' };
        h.loadMethod = loadMethod;
      });

      expect(dir.value).toEqual({ username: 'from initial' });
      expect(loadMethod.call).not.toHaveBeenCalled();
      expect(host.definition.username.initialState).toBe('from initial');
    });

    it('calls the load successful method with the loaded value', async () => {
      const loadSuccessfulMethod = { call: vi.fn() };

      await create((h) => {
        h.loadMethod = { call: vi.fn(() => ({ username: 'loaded' })) };
        h.loadSuccessfulMethod = loadSuccessfulMethod;
        h.context = 'ctx';
      });

      expect(loadSuccessfulMethod.call).toHaveBeenCalledWith({ username: 'loaded' });
      expect(host.loadMethod.call).toHaveBeenCalledWith({ context: 'ctx', initial: null });
    });

    it('calls the load failed method with the error', async () => {
      const loadFailedMethod = { call: vi.fn() };
      const error = new Error('load failed');

      const dir = await create((h) => {
        h.loadMethod = { call: vi.fn(() => { throw error; }) };
        h.loadFailedMethod = loadFailedMethod;
      });

      expect(loadFailedMethod.call).toHaveBeenCalledWith(error);
      expect(dir.loadingError()).toBe(error);
    });

    it('calls the submit and submit successful methods with the form value, context and initial', async () => {
      const submitSuccessfulMethod = { call: vi.fn() };
      const submitMethod = { call: vi.fn((value: any) => ({ saved: value })) };

      const dir = await create((h) => {
        h.submitMethod = submitMethod;
        h.submitSuccessfulMethod = submitSuccessfulMethod;
        h.context = 'ctx';
        h.initial = { username: 'init' };
      });
      const submitted = vi.fn();
      outputToObservable(dir.rxapSubmit).subscribe(submitted);

      dir.onSubmit(new Event('submit'));

      expect(submitMethod.call).toHaveBeenCalledWith({ username: 'init' }, 'ctx', { username: 'init' });
      expect(submitted).toHaveBeenCalledWith({ saved: { username: 'init' } });
      expect(submitSuccessfulMethod.call).toHaveBeenCalledWith({ saved: { username: 'init' } });
    });

    it('calls the submit failed method with the error', async () => {
      const submitFailedMethod = { call: vi.fn() };
      const error = new Error('submit failed');

      const dir = await create((h) => {
        h.submitMethod = { call: vi.fn(() => { throw error; }) };
        h.submitFailedMethod = submitFailedMethod;
      });

      dir.onSubmit(new Event('submit'));

      expect(submitFailedMethod.call).toHaveBeenCalledWith(error);
      expect(dir.submitError()).toBe(error);
      expect(dir.submitting()).toBe(false);
    });

    it('submits the value of getSubmitValue of the form definition', async () => {
      const submitMethod = { call: vi.fn() };

      const dir = await create((h) => {
        h.definition = build(SubmitValueForm);
        h.submitMethod = submitMethod;
      });
      dir.onSubmit(new Event('submit'));

      expect(submitMethod.call).toHaveBeenCalledWith({ custom: 'initial' }, null, null);
    });

    it('submits the value of toJSON of the form definition', async () => {
      const submitMethod = { call: vi.fn() };

      const dir = await create((h) => {
        h.definition = build(JsonForm);
        h.submitMethod = submitMethod;
      });
      dir.onSubmit(new Event('submit'));

      expect(submitMethod.call).toHaveBeenCalledWith({ json: 'initial' }, null, null);
    });

    it('calls the ngOnInit and ngOnDestroy hooks of the form definition', async () => {
      await create((h) => (h.definition = build(HooksForm)));

      expect(host.definition.ngOnInit).toHaveBeenCalledTimes(1);
      expect(host.definition.ngOnDestroy).not.toHaveBeenCalled();

      fixture.destroy();

      expect(host.definition.ngOnDestroy).toHaveBeenCalledTimes(1);
    });

  });

  describe('invalid submit', () => {

    it('emits the nested errors of groups, controls and arrays', async () => {
      TestBed.configureTestingModule({ imports: [ InputHost ] });
      const fixture = TestBed.createComponent(InputHost);
      fixture.componentInstance.definition = build(ArrayForm);
      await fixture.whenStable();
      const dir = fixture.componentInstance.dir();
      const form: any = fixture.componentInstance.definition;
      // the builder registers the validators without a validation run
      form.name.updateValueAndValidity();
      form.tags.rxapFormArray.at(1).setErrors({ bad: true });
      const invalid = vi.fn();
      outputToObservable(dir.invalidSubmit).subscribe(invalid);

      const result = dir.onSubmit(new Event('submit'));

      expect(result).toBe(false);
      expect(invalid).toHaveBeenCalledWith({
        'with-array': {
          name: { required: true },
          tags: [ {}, { '1': { bad: true } } ],
        },
      });
    });

  });

  describe('created with injector', () => {

    // the directive injects the ChangeDetectorRef, which is not available in a plain injector
    const providers: Provider[] = [
      { provide: ChangeDetectorRef, useValue: { detectChanges: () => undefined } },
      ExtendedForm,
      {
        provide: RXAP_FORM_DEFINITION_BUILDER,
        useFactory: (injector: Injector) => new RxapFormBuilder<any>(ExtendedForm as any, injector),
        deps: [ INJECTOR ],
      },
    ];

    const createDirective = (): FormDirective =>
      Injector.create({ parent: TestBed.inject(Injector), providers: [ FormDirective ] }).get(FormDirective);

    it('builds the form definition with the form definition builder if none is provided', () => {
      TestBed.configureTestingModule({ providers });

      const dir = createDirective();

      expect(dir.formDefinition).toBeInstanceOf(ExtendedForm);
      expect(dir.form).toBe(dir.formDefinition.rxapFormGroup);
    });

    it('throws on init if no form definition is available', () => {
      TestBed.configureTestingModule({ providers: [ { provide: ChangeDetectorRef, useValue: { detectChanges: () => undefined } } ] });

      const dir = createDirective();

      expect(() => dir.ngOnInit()).toThrow('The form definition instance is not defined');
    });

    it('throws on init if the form definition has no form group', () => {
      TestBed.configureTestingModule({
        providers: [
          { provide: ChangeDetectorRef, useValue: { detectChanges: () => undefined } },
          { provide: RXAP_FORM_DEFINITION, useValue: { rxapFormGroup: undefined, rxapMetadata: {} } },
        ],
      });

      const dir = createDirective();

      expect(() => dir.ngOnInit()).toThrow('The form instance is not defined');
    });

    it('reloads the initial state when the form changes after the first change', () => {
      const load = vi.fn(() => ({ username: 'reloaded' }));
      TestBed.configureTestingModule({
        providers: [
          ...providers,
          { provide: RXAP_FORM_DEFINITION, useFactory: (b: RxapFormBuilder) => b.build(), deps: [ RXAP_FORM_DEFINITION_BUILDER ] },
          { provide: RXAP_FORM_LOAD_METHOD, useValue: { call: load } },
        ],
      });
      const dir = createDirective();
      const form = dir.form;

      dir.ngOnChanges({ form: new SimpleChange(undefined, form, true) });
      expect(load).not.toHaveBeenCalled();

      dir.ngOnChanges({ form: new SimpleChange(form, form, false) });

      expect(load).toHaveBeenCalledTimes(1);
      expect(form.value).toEqual({ username: 'reloaded' });
    });

  });

});
