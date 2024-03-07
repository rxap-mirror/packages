import {
  ChangeDetectorRef,
  Injectable,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import {
  FormType,
  RxapForm,
  RxapFormBuilder,
  RxapFormControl,
  UseFormControl,
} from '@rxap/forms';
import { Method } from '@rxap/pattern';
import { ControlOptions } from '@rxap/utilities';
import { UseOptionsMethod } from '../mixins/extract-options-method.mixin';
import { OptionsFromMethodDirective } from './options-from-method.directive';
import { TestNgControl } from './test-ng-control';

describe('OptionsFromMethodDirective', () => {

  @Injectable()
  class TestMethod implements Method<ControlOptions> {
    call(): ControlOptions {
      return [];
    }
  }

  interface ITestFormDefinition {
    name: string;
  }

  @RxapForm('test')
  class TestFormDefinition implements FormType<ITestFormDefinition> {

    @UseOptionsMethod(TestMethod)
    @UseFormControl()
    name!: RxapFormControl;

  }

  let createEmbeddedViewMock: jest.Mock;
  let clearMock: jest.Mock;
  let detectChangesMock: jest.Mock;
  let directive: OptionsFromMethodDirective;
  let method: TestMethod;
  let ngControl: TestNgControl;
  let control: RxapFormControl;
  let methodCallSpy: jest.SpyInstance;

  beforeEach(() => {
    const formDefinition: TestFormDefinition = new RxapFormBuilder<ITestFormDefinition>(TestFormDefinition).build();
    ngControl                                = new TestNgControl(formDefinition.name);
    control                                  = ngControl.control as RxapFormControl;
    createEmbeddedViewMock                   = jest.fn();
    clearMock                                = jest.fn();
    detectChangesMock                        = jest.fn();
    TestBed.configureTestingModule({
      providers: [
        OptionsFromMethodDirective,
        TestMethod,
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
    method        = TestBed.inject(TestMethod);
    methodCallSpy = jest.spyOn(method, 'call');
    directive     = TestBed.inject(OptionsFromMethodDirective);
  });

  it('should not call options method on initial ngOnChanges if paramters are set', fakeAsync(() => {
    directive.parameters = {data: 'data'};
    directive.ngOnChanges({
      parameters: {
        currentValue: directive.parameters,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    tick();
    expect(clearMock).not.toBeCalled();
    expect(createEmbeddedViewMock).not.toBeCalled();
    expect(detectChangesMock).not.toBeCalled();
    expect(methodCallSpy).not.toBeCalled();
  }));

  it('should not call options method on initial ngOnChanges if without paramters is set', fakeAsync(() => {
    directive.ngOnChanges({});
    tick();
    expect(clearMock).not.toBeCalled();
    expect(createEmbeddedViewMock).not.toBeCalled();
    expect(detectChangesMock).not.toBeCalled();
    expect(methodCallSpy).not.toBeCalled();
  }));

  it('should call options method after ngAfterViewInit', fakeAsync(() => {
    directive.ngOnChanges({});
    tick();
    directive.ngAfterViewInit();
    tick();
    expect(clearMock).toBeCalledTimes(1);
    expect(createEmbeddedViewMock).not.toBeCalled();
    expect(detectChangesMock).toBeCalledTimes(1);
    expect(methodCallSpy).toBeCalled();
    expect(methodCallSpy).toBeCalledWith(undefined);
  }));

  it('should pass the paratmers to the method call', fakeAsync(() => {
    methodCallSpy.mockReturnValue([ {value: 'value', display: 'display'},
      {value: 'value', display: 'display'},
      {value: 'value', display: 'display'} ]);
    directive.parameters = {data: 'data'};
    directive.ngOnChanges({
      parameters: {
        currentValue: directive.parameters,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    tick();
    directive.ngAfterViewInit();
    tick();
    expect(methodCallSpy).toBeCalledTimes(1);
    expect(methodCallSpy).toBeCalledWith(directive.parameters);
    expect(methodCallSpy.mock.lastCall).toEqual([ directive.parameters ]);
    expect(clearMock).toBeCalledTimes(1);
    expect(clearMock).toBeCalledTimes(1);
    expect(createEmbeddedViewMock).toBeCalledTimes(3);
    expect(createEmbeddedViewMock)
    .toBeCalledWith(TestBed.inject(TemplateRef), {$implicit: {value: 'value', display: 'display'}});
    expect(detectChangesMock).toBeCalledTimes(1);
  }));

  it('should call the method without parameters', fakeAsync(() => {
    methodCallSpy.mockReturnValue([ {value: 'value', display: 'display'},
      {value: 'value', display: 'display'},
      {value: 'value', display: 'display'} ]);
    directive.ngOnChanges({});
    tick();
    directive.ngAfterViewInit();
    tick();
    expect(methodCallSpy).toBeCalledTimes(1);
    expect(methodCallSpy.mock.lastCall).toEqual([]);
    expect(clearMock).toBeCalledTimes(1);
    expect(clearMock).toBeCalledTimes(1);
    expect(createEmbeddedViewMock).toBeCalledTimes(3);
    expect(createEmbeddedViewMock)
    .toBeCalledWith(TestBed.inject(TemplateRef), {$implicit: {value: 'value', display: 'display'}});
    expect(detectChangesMock).toBeCalledTimes(1);
  }));

  it('should reset control of resetOnChange is set', fakeAsync(() => {
    const resetSpy          = jest.spyOn(control, 'reset');
    directive.resetOnChange = 'custom value';
    directive.ngOnChanges({});
    tick();
    directive.ngAfterViewInit();
    tick();
    expect(clearMock).toBeCalledTimes(1);
    expect(createEmbeddedViewMock).not.toBeCalled();
    expect(detectChangesMock).toBeCalledTimes(1);
    expect(resetSpy).toBeCalledTimes(1);
    expect(resetSpy).toBeCalledWith(directive.resetOnChange);
  }));

  it('should reload the options if the parameters are changed', fakeAsync(() => {
    directive.ngOnChanges({});
    tick();
    directive.ngAfterViewInit();
    tick();
    expect(clearMock).toBeCalledTimes(1);
    expect(createEmbeddedViewMock).not.toBeCalled();
    expect(detectChangesMock).toBeCalledTimes(1);
    expect(methodCallSpy).toBeCalledTimes(1);
    expect(methodCallSpy).toBeCalledWith(undefined);
    directive.parameters = {data: 'data'};
    directive.ngOnChanges({
      parameters: {
        currentValue: directive.parameters,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    tick();
    expect(clearMock).toBeCalledTimes(2);
    expect(createEmbeddedViewMock).not.toBeCalled();
    expect(detectChangesMock).toBeCalledTimes(2);
    expect(methodCallSpy).toBeCalledTimes(2);
    expect(methodCallSpy).toBeCalledWith(directive.parameters);
  }));

});
