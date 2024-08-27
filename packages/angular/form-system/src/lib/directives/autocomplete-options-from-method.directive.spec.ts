import { UseResolveMethod } from '../mixins/extract-resolve-method.mixin';
import {
  AutocompleteOptionsFromMethodDirective,
  UseAutocompleteOptionsMethod,
} from './autocomplete-options-from-method.directive';
import { ChangeDetectorRef, Injectable, TemplateRef, ViewContainerRef } from '@angular/core';
import { Method } from '@rxap/pattern';
import { ControlOption, ControlOptions } from '@rxap/utilities';
import { FormType, RxapForm, RxapFormBuilder, RxapFormControl, UseFormControl } from '@rxap/forms';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { TestNgControl } from './test-ng-control';

describe.skip(AutocompleteOptionsFormMethodDirective.name, () => {

  @Injectable()
  class TestAutocompleteOptionsMethod implements Method<ControlOptions> {
    call({search}: { search?: string | null }): ControlOptions {
      const list = !search ? [] : [ {
        value: '92765e0a-08fb-421c-b65e-0a08fbb21c58',
        display: 'display',
      } ].filter(option => option.display.toLowerCase().includes(search.toLowerCase()));
      return list;
    }
  }

  @Injectable()
  class TestResolveMethod implements Method<ControlOption, string> {

    call(value: string): ControlOption {
      return {value, display: 'resolved display'};
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
  let createEmbeddedViewMock: jest.Mock;
  let clearMock: jest.Mock;
  let detectChangesMock: jest.Mock;
  let autocompleteOptionsMethod: TestAutocompleteOptionsMethod;
  let resolveMethod: TestResolveMethod;
  let ngControl: TestNgControl;
  let control: RxapFormControl;
  let autocompleteOptionsMethodCall: jest.SpyInstance;
  let resolveMethodCall: jest.SpyInstance;

  beforeEach(() => {
    const formDefinition: TestFormDefinition = new RxapFormBuilder<ITestFormDefinition>(TestFormDefinition).build();
    const ngControl                          = new TestNgControl(formDefinition.name);
    createEmbeddedViewMock                   = jest.fn();
    clearMock                                = jest.fn();
    detectChangesMock                        = jest.fn();
    TestBed.configureTestingModule({
      providers: [
        AutocompleteOptionsFormMethodDirective,
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
    control                       = ngControl.control as RxapFormControl;
    autocompleteOptionsMethod     = TestBed.inject(TestAutocompleteOptionsMethod);
    resolveMethod                 = TestBed.inject(TestResolveMethod);
    autocompleteOptionsMethodCall = jest.spyOn(autocompleteOptionsMethod, 'call');
    resolveMethodCall             = jest.spyOn(resolveMethod, 'call');
    directive                     = TestBed.inject(AutocompleteOptionsFormMethodDirective);
  });

  it('should only call the autocomplete options method if a value is set', fakeAsync(() => {
    directive.ngOnChanges({});
    tick();
    directive.ngAfterViewInit();
    tick();
    expect(autocompleteOptionsMethodCall).not.toBeCalled();
    expect(resolveMethodCall).not.toBeCalled();
    control.setValue('test');
    tick();
    expect(autocompleteOptionsMethodCall).toBeCalledWith({parameters: {search: 'test'}});
    expect(resolveMethodCall).not.toBeCalled();
  }));

  it('should link directive with MatAutocomplete', fakeAsync(() => {

    directive.matAutocomplete = {
      displayWith: jest.fn(),
    } as any;

    directive.ngOnChanges({});
    tick();
    directive.ngAfterViewInit();
    tick();

    expect(autocompleteOptionsMethodCall).not.toBeCalled();
    expect(resolveMethodCall).not.toBeCalled();

    expect(directive.matAutocomplete!.displayWith!('')).toBe(directive.toDisplay.bind(directive)(''));
    expect(directive.matAutocomplete!.displayWith!('error')).toBe(directive.toDisplay.bind(directive)('error'));

  }));

  it('should convert value to display', fakeAsync(() => {
    directive.matAutocomplete = {
      displayWith: jest.fn(),
    } as any;

    directive.ngOnChanges({});
    tick();
    directive.ngAfterViewInit();
    tick();

    directive.options = [ {value: 'test', display: 'display_test'} ];

    expect(directive.toDisplay('test')).toBe('display_test');

  }));

  it('should resolve a value to display', fakeAsync(() => {

    const setValueSpy = jest.spyOn(control, 'setValue');

    directive.ngOnChanges({});
    tick();
    directive.ngAfterViewInit();
    tick();

    directive.isValue = jest.fn().mockImplementation(value => value === 'test');

    expect(setValueSpy).not.toBeCalled();
    expect(directive.options).toEqual([]);

    control.setValue('test');
    expect(clearMock).toBeCalledTimes(1);
    expect(createEmbeddedViewMock).not.toBeCalled();
    expect(detectChangesMock).toBeCalledTimes(1);
    expect(autocompleteOptionsMethodCall).not.toBeCalled();
    expect(resolveMethodCall).toBeCalledTimes(1);
    expect(resolveMethodCall).toBeCalledWith({value: 'test'});
    tick();
    expect(directive.options).toEqual([ {value: 'test', display: 'resolved display'} ]);
    expect(clearMock).toBeCalledTimes(2);
    expect(createEmbeddedViewMock).toBeCalledTimes(1);
    expect(createEmbeddedViewMock)
    .toBeCalledWith(TestBed.inject(TemplateRef), {$implicit: {value: 'test', display: 'resolved display'}});
    expect(detectChangesMock).toBeCalledTimes(2);
    expect(autocompleteOptionsMethodCall).not.toBeCalled();


  }));

});
