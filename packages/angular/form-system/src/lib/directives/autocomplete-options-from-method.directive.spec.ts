import type { Mock, MockInstance } from 'vitest';
import { UseResolveMethod } from '../mixins/extract-resolve-method.mixin';
import {
  AutocompleteOptionsFromMethodDirective,
  UseAutocompleteOptionsMethod,
} from './autocomplete-options-from-method.directive';
import {
  ChangeDetectorRef,
  Injectable,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Method } from '@rxap/pattern';
import { ControlOption, ControlOptions } from '@rxap/utilities';
import {
  FormType,
  RxapForm,
  RxapFormBuilder,
  RxapFormControl,
  UseFormControl,
} from '@rxap/forms';
import { ApplicationRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { TestNgControl } from './test-ng-control';

describe(AutocompleteOptionsFromMethodDirective.name, () => {
  @Injectable()
  class TestAutocompleteOptionsMethod implements Method<ControlOptions> {
    call({ search }: { search?: string | null }): ControlOptions {
      const list = !search
        ? []
        : [
            {
              value: '92765e0a-08fb-421c-b65e-0a08fbb21c58',
              display: 'display',
            },
          ].filter((option) =>
            option.display.toLowerCase().includes(search.toLowerCase()),
          );
      return list;
    }
  }

  @Injectable()
  class TestResolveMethod implements Method<ControlOption, { value: string }> {
    call({ value }: { value: string }): ControlOption {
      return { value, display: 'resolved display' };
    }
  }

  interface ITestFormDefinition {
    name: string;
  }

  @RxapForm('test')
  class TestFormDefinition implements FormType<ITestFormDefinition> {
    @UseAutocompleteOptionsMethod(TestAutocompleteOptionsMethod)
    @UseResolveMethod(TestResolveMethod)
    @UseFormControl()
    name!: RxapFormControl;
  }

  let directive: AutocompleteOptionsFromMethodDirective;
  let createEmbeddedViewMock: Mock;
  let clearMock: Mock;
  let detectChangesMock: Mock;
  let autocompleteOptionsMethod: TestAutocompleteOptionsMethod;
  let resolveMethod: TestResolveMethod;
  let ngControl: TestNgControl;
  let control: RxapFormControl;
  let autocompleteOptionsMethodCall: MockInstance;
  let resolveMethodCall: MockInstance;
  /** waits until the pending (tracked) option loading of the directive is finished */
  async function settle() {
    await TestBed.inject(ApplicationRef).whenStable();
  }

  let inputs: Record<string, ReturnType<typeof signal<any>>>;

  beforeEach(() => {
    const formDefinition: TestFormDefinition =
      new RxapFormBuilder<ITestFormDefinition>(TestFormDefinition).build();
    const ngControl = new TestNgControl(formDefinition.name);
    createEmbeddedViewMock = vi.fn();
    clearMock = vi.fn();
    detectChangesMock = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        AutocompleteOptionsFromMethodDirective,
        TestResolveMethod,
        TestAutocompleteOptionsMethod,
        {
          provide: NgControl,
          useValue: ngControl,
        },
        {
          provide: TemplateRef,
          useValue: {},
        },
        {
          provide: ViewContainerRef,
          useValue: {
            createEmbeddedView: createEmbeddedViewMock,
            clear: clearMock,
          },
        },
        {
          provide: ChangeDetectorRef,
          useValue: {
            detectChanges: detectChangesMock,
          },
        },
      ],
    });
    control = ngControl.control as RxapFormControl;
    autocompleteOptionsMethod = TestBed.inject(TestAutocompleteOptionsMethod);
    resolveMethod = TestBed.inject(TestResolveMethod);
    autocompleteOptionsMethodCall = vi.spyOn(
      autocompleteOptionsMethod,
      'call',
    );
    resolveMethodCall = vi.spyOn(resolveMethod, 'call');
    directive = TestBed.inject(AutocompleteOptionsFromMethodDirective);
    // the inputs are signal inputs and can not be assigned. Replace them with writable signals
    inputs = {
      parameters: signal<any>(undefined),
      resetOnChange: signal<any>(undefined),
      matAutocomplete: signal<any>(undefined),
      method: signal<any>(undefined),
      resolveMethod: signal<any>(undefined),
      isValue: signal<any>(undefined),
      toDisplay: signal<any>(undefined),
    };
    Object.assign(directive, inputs);
  });

  it('should only call the autocomplete options method if a value is set', async () => {
    await settle();
    directive.ngAfterViewInit();
    await settle();
    expect(autocompleteOptionsMethodCall).not.toHaveBeenCalled();
    expect(resolveMethodCall).not.toHaveBeenCalled();
    control.setValue('test');
    await settle();
    expect(autocompleteOptionsMethodCall).toHaveBeenCalledWith(
      { parameters: { search: 'test' } },
      expect.any(RxapFormControl),
    );
    expect(resolveMethodCall).not.toHaveBeenCalled();
  });

  it('should link directive with MatAutocomplete', async () => {
    inputs['matAutocomplete'].set({ displayWith: vi.fn() });

    await settle();
    directive.ngAfterViewInit();
    await settle();

    expect(autocompleteOptionsMethodCall).not.toHaveBeenCalled();
    expect(resolveMethodCall).not.toHaveBeenCalled();

    expect((inputs['matAutocomplete']() as any).displayWith('')).toBe(
      (directive as any).resolvedToDisplay().bind(directive)(''),
    );
    expect((inputs['matAutocomplete']() as any).displayWith('error')).toBe(
      (directive as any).resolvedToDisplay().bind(directive)('error'),
    );
  });

  it('should convert value to display', async () => {
    inputs['matAutocomplete'].set({ displayWith: vi.fn() });

    await settle();
    directive.ngAfterViewInit();
    await settle();

    directive.options = [{ value: 'test', display: 'display_test' }];

    expect((directive as any).resolvedToDisplay()('test')).toBe('display_test');
  });

  it('should resolve a value to display', async () => {
    const setValueSpy = vi.spyOn(control, 'setValue');

    await settle();
    directive.ngAfterViewInit();
    await settle();

    (directive as any).resolvedIsValue.set((value: any) => value === 'test');

    expect(setValueSpy).not.toHaveBeenCalled();
    // the initial (effect triggered) load has no search value and therefore results in an empty options list
    expect(directive.options).toEqual([]);

    control.setValue('test');
    await settle();
    expect(autocompleteOptionsMethodCall).not.toHaveBeenCalled();
    expect(resolveMethodCall).toHaveBeenCalledWith({ value: 'test' });
    expect(directive.options).toEqual([
      { value: 'test', display: 'resolved display' },
    ]);
    expect(createEmbeddedViewMock).toHaveBeenCalledWith(
      TestBed.inject(TemplateRef),
      { $implicit: { value: 'test', display: 'resolved display' } },
    );
  });
});
