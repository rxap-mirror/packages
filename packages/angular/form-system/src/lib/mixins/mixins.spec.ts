import { Injector, Injectable, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormType, RxapForm, RxapFormBuilder, RxapFormControl, UseFormControl, UseFormGroup } from '@rxap/forms';
import { Mixin } from '@rxap/mixin';
import { ControlContainer, FormControl, NgControl } from '@angular/forms';
import { ExtractFormDefinitionMixin } from './extract-form-definition.mixin';
import { ExtractControlFromParentMixin } from './extract-control-from-parent.mixin';
import { ExtractControlMixin } from './extract-control.mixin';
import { ExtractDataSourcesMixin } from './extract-data-sources.mixin';
import { ApplyUseFunctionAdapters } from './apply-use-function.adapters';
import { ExtractFunctionsMixin, UseFunction } from './extract-functions.mixin';
import { ExtractFunctionMixin } from './extract-function.mixin';
import { ExtractToDisplayFunctionMixin, UseToDisplayFunction } from './extract-to-display-function.mixin';
import { ExtractIsValueFunctionMixin, UseIsValueFunction } from './extract-is-value-function.mixin';
import { ExtractMethodsMixin, UseMethod } from './extract-methods.mixin';
import { ExtractMethodMixin } from './extract-method.mixin';
import { ExtractResolveMethodMixin, UseResolveMethod } from './extract-resolve-method.mixin';
import { ResolveByUuidParameter, ResolveByUuidResultFactory } from './adapters';
import { ComposeOptionsTransformers, UseOptionsDataSource } from './extract-options-data-source.mixin';
import { UseDataSource } from '../decorators/use-data-source';
import { UseFormComponent } from '../decorators/use-form-component';
import { controlDataSource, ControlDataSource, RXAP_FORM_CONTROL_SOURCE } from '../control-data-source';
import { FormContextFromActivatedRouteFactory } from '../form-context-from-activated-route.factory';
import { SubmitContextFormAdapter, SubmitContextFormAdapterFactory } from '../submit-context-form-adapter.factory';
import { FormSystemMetadataKeys } from '../decorators/metadata-keys';
import { getMetadata } from '@rxap/reflect-metadata';
import { RXAP_DATA_SOURCE_METADATA } from '@rxap/data-source';
import { RxapFormSystemError } from '../error';

@Injectable()
class ResolveMethod {
  call(value: any) {
    return { value, display: 'x' };
  }
}

@RxapForm('mixins-test')
class TestForm implements FormType<{ name: string; empty: string }> {
  @UseFunction((a: number) => a * 2, 'double')
  @UseFunction((a: number) => a + 1, 'inc', {
    adapter: { args: ([a]: any[]) => [a * 10], result: (r: number) => r * 2 },
  })
  @UseToDisplayFunction((v: any) => 'D:' + v)
  @UseIsValueFunction((v: any) => !!v)
  @UseMethod(ResolveMethod as any, 'custom')
  @UseResolveMethod(ResolveMethod as any)
  @UseOptionsDataSource({ connect: () => null } as any)
  @UseFormControl()
  name!: RxapFormControl<string>;

  @UseFormControl()
  empty!: RxapFormControl<string>;
}

@UseFormComponent(class Comp {})
class FormWithComponent {}

describe('form-system mixins', () => {
  let form: any;
  let injector: Injector;

  @Mixin(
    ExtractFormDefinitionMixin,
    ExtractControlFromParentMixin,
    ExtractControlMixin,
    ExtractDataSourcesMixin,
    ExtractFunctionsMixin,
    ExtractFunctionMixin,
    ExtractToDisplayFunctionMixin,
    ExtractIsValueFunctionMixin,
    ExtractMethodsMixin,
    ExtractMethodMixin,
    ExtractResolveMethodMixin,
  )
  class Probe {
    ngControl: any = null;
    injector!: Injector;
    [key: string]: any;
  }
  interface Probe
    extends ExtractFormDefinitionMixin,
      ExtractControlFromParentMixin,
      ExtractControlMixin,
      ExtractDataSourcesMixin,
      ExtractFunctionsMixin,
      ExtractFunctionMixin,
      ExtractToDisplayFunctionMixin,
      ExtractIsValueFunctionMixin,
      ExtractMethodsMixin,
      ExtractMethodMixin,
      ExtractResolveMethodMixin {}

  let probe: Probe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ResolveMethod] });
    injector = TestBed.inject(Injector);
    form = new RxapFormBuilder<{ name: string; empty: string }>(TestForm).build();
    probe = new Probe();
    probe.injector = injector;
    probe.ngControl = { control: form.name };
  });

  it('ExtractControlMixin returns the RxapFormControl', () => {
    expect(probe['extractControl']()).toBe(form.name);
  });

  it('ExtractControlMixin throws without or with a foreign control', () => {
    probe.ngControl = null;
    expect(() => probe['extractControl']()).toThrow('ngControl is not defined');
    expect(() => probe['extractControl']({ control: new FormControl('') } as any)).toThrow('not a RxapFormControl');
  });

  it('ExtractControlMixin uses the control of the mat form field', () => {
    probe.ngControl = null;
    probe['matFormField'] = { _control: { ngControl: { control: form.name } } } as any;
    expect(probe['extractControl']()).toBe(form.name);
  });

  it('ExtractFormDefinitionMixin returns the definition or throws', () => {
    expect(probe['extractFormDefinition'](form.name)).toBe(form);
    expect(() => probe['extractFormDefinition']({} as any)).toThrow(RxapFormSystemError);
  });

  it('ExtractControlFromParentMixin resolves controls and validates input', () => {
    const parent = { control: form.rxapFormGroup } as ControlContainer;
    expect(probe['extractControlFromParent'](parent, 'name')).toBe(form.name);
    expect(() => probe['extractControlFromParent'](parent, '')).toThrow('control path is empty');
    expect(() => probe['extractControlFromParent']({ control: null } as any, 'name')).toThrow('not defined');
    expect(() => probe['extractControlFromParent'](parent, 'missing')).toThrow('Could not find');
    expect(() =>
      probe['extractControlFromParent']({ control: { get: () => ({}) } } as any, 'x'),
    ).toThrow('not a RxapFormControl');
  });

  it('ExtractDataSourcesMixin returns the data source map', () => {
    const map = probe['extractDataSources'](form, 'name');
    expect(map.has('options')).toBe(true);
    expect(() => probe['extractDataSources'](form, 'empty')).toThrow('does not exists');
    expect(() => probe['extractDataSources']({} as any, 'x')).toThrow('Could not extract');
  });

  describe('functions', () => {
    it('extracts and applies adapters', async () => {
      const double = probe['extractFunction'](null, form, 'name', 'double');
      expect(double(4)).toBe(8);
      const inc = probe['extractFunction'](null, form, 'name', 'inc');
      await expect(inc(1)).resolves.toBe(22);
    });

    it('falls back to defaults or throws for missing functions', () => {
      const dflt = () => 1;
      expect(probe['extractFunction'](dflt, form, 'name', 'unknown')).toBe(dflt);
      expect(() => probe['extractFunction'](null, form, 'name', 'unknown')).toThrow('not attached');
      expect(probe['extractFunction'](dflt, form, 'empty', 'x')).toBe(dflt);
      expect(() => probe['extractFunction'](null, form, 'empty', 'x')).toThrow('not attached');
      expect(() => probe['extractFunctions'](null, {} as any, 'x')).toThrow('Could not extract');
      expect(probe['extractFunctions'](new Map(), {} as any, 'x')).toBeInstanceOf(Map);
    });

    it('extracts the to display and is value functions', () => {
      expect(probe['extractToDisplayFunction']()('v')).toBe('D:v');
      expect(probe['extractIsValueFunction']()('')).toBe(false);
      expect(probe['extractIsValueFunction']()('a')).toBe(true);
    });

    it('ApplyUseFunctionAdapters handles promises, errors and plain functions', async () => {
      const plain = () => 1;
      expect(ApplyUseFunctionAdapters(injector, plain)).toBe(plain);
      const asyncFn = ApplyUseFunctionAdapters(injector, async (a: number) => a + 1, {
        adapter: { result: (r: any) => r * 3 },
      });
      await expect(asyncFn(1)).resolves.toBe(6);
      const failing = ApplyUseFunctionAdapters(injector, () => 1, {
        adapter: {
          result: () => {
            throw new Error('fail');
          },
        },
      });
      await expect(failing()).rejects.toThrow('fail');
      const rejecting = ApplyUseFunctionAdapters(injector, () => Promise.reject(new Error('rej')), {
        adapter: { result: (r: any) => r },
      });
      await expect(rejecting()).rejects.toThrow('rej');
    });
  });

  describe('methods', () => {
    it('extracts methods from the injector', () => {
      expect(probe['extractMethods'](form, 'name').has('custom')).toBe(true);
      expect(probe['extractMethod'](form, 'name', 'custom')).toBeInstanceOf(ResolveMethod);
      expect(probe['extractResolveMethod']()).toBeInstanceOf(ResolveMethod);
    });

    it('throws for unknown methods and controls', () => {
      expect(() => probe['extractMethod'](form, 'name', 'nope')).toThrow('not attached');
      expect(() => probe['extractMethods'](form, 'empty')).toThrow('does not exists');
      vi.spyOn(console, 'log').mockImplementation(() => undefined);
      expect(() => probe['extractMethods']({} as any, 'name')).toThrow('Could not extract');
    });
  });

  it('adapters helpers', () => {
    expect(ResolveByUuidParameter({ value: 'u' })).toEqual({ parameters: { uuid: 'u' } });
    expect(ResolveByUuidResultFactory((e: any) => ({ value: e, display: e }))('x')).toEqual({ value: 'x', display: 'x' });
  });

  it('ComposeOptionsTransformers chains functions', () => {
    expect(ComposeOptionsTransformers((a: number) => a + 1, (a: number) => a * 2)(1)).toBe(4);
  });

  it('UseFormComponent stores the component', () => {
    expect(getMetadata(FormSystemMetadataKeys.FORM_COMPONENT, FormWithComponent)).toBeDefined();
  });

  it('UseDataSource stores the settings', () => {
    class T {
      @UseDataSource('x', 'n', { transformer: (v: any) => v })
      prop!: string;
    }
    const map = getMetadata<Map<string, Map<string, any>>>(FormSystemMetadataKeys.DATA_SOURCES, T.prototype);
    expect(map?.get('prop')?.get('n').dataSource).toBe('x');
  });
});

describe('control data source and factories', () => {
  it('emits distinct control values', () => {
    const control = new RxapFormControl('a', { controlId: 'c' });
    const ds = controlDataSource(control);
    const seen: any[] = [];
    ds.connect({ id: 'v' }).subscribe((v) => seen.push(v));
    control.setValue('b');
    control.setValue('b');
    expect(seen).toEqual(['a', 'b']);
    expect(ds.id).toBe('c');
  });

  it('is injectable with the control token', () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const control = new RxapFormControl('a', { controlId: 'c' });
    TestBed.configureTestingModule({
      providers: [
        ControlDataSource,
        { provide: RXAP_FORM_CONTROL_SOURCE, useValue: control },
        { provide: RXAP_DATA_SOURCE_METADATA, useValue: { id: 'c' } },
      ],
    });
    const ds = TestBed.inject(ControlDataSource);
    ds.init();
    ds.init();
    expect(ds).toBeInstanceOf(ControlDataSource);
  });

  it('FormContextFromActivatedRouteFactory returns the snapshot params', () => {
    expect(FormContextFromActivatedRouteFactory({ snapshot: { params: { id: '1' } } } as any)).toEqual({ id: '1' });
  });

  it('SubmitContextFormAdapter maps context and body', () => {
    const withContext = Object.assign(Object.create(SubmitContextFormAdapter.prototype), { context: { id: '1' } });
    expect(withContext.transformParameters({ a: 1 })).toEqual({ parameters: { id: '1' }, requestBody: { a: 1 } });
    const withoutContext = Object.assign(Object.create(SubmitContextFormAdapter.prototype), { context: null });
    expect(withoutContext.transformParameters({}).parameters).toEqual({});
    expect(typeof SubmitContextFormAdapterFactory).toBe('function');
  });
});
