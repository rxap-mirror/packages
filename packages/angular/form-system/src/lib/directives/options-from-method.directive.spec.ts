import {
  ChangeDetectorRef,
  Injectable,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
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
    const formDefinition: TestFormDefinition =
      new RxapFormBuilder<ITestFormDefinition>(TestFormDefinition).build();
    ngControl = new TestNgControl(formDefinition.name);
    control = ngControl.control as RxapFormControl;
    createEmbeddedViewMock = jest.fn();
    clearMock = jest.fn();
    detectChangesMock = jest.fn();
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
    method = TestBed.inject(TestMethod);
    methodCallSpy = jest.spyOn(method, 'call');
    directive = TestBed.inject(OptionsFromMethodDirective);
  });

  it('should not call options method on initial ngOnChanges if paramters are set', fakeAsync(() => {
    directive.parameters = { data: 'data' };
    directive.ngOnChanges({
      parameters: {
        currentValue: directive.parameters,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    tick();
    expect(clearMock).not.toHaveBeenCalled();
    expect(createEmbeddedViewMock).not.toHaveBeenCalled();
    expect(detectChangesMock).not.toHaveBeenCalled();
    expect(methodCallSpy).not.toHaveBeenCalled();
  }));

  it('should not call options method on initial ngOnChanges if without paramters is set', fakeAsync(() => {
    directive.ngOnChanges({});
    tick();
    expect(clearMock).not.toHaveBeenCalled();
    expect(createEmbeddedViewMock).not.toHaveBeenCalled();
    expect(detectChangesMock).not.toHaveBeenCalled();
    expect(methodCallSpy).not.toHaveBeenCalled();
  }));

  it('should call options method after ngAfterViewInit', fakeAsync(() => {
    directive.ngOnChanges({});
    tick();
    directive.ngAfterViewInit();
    tick();
    expect(clearMock).toHaveBeenCalledTimes(1);
    expect(createEmbeddedViewMock).not.toHaveBeenCalled();
    expect(detectChangesMock).toHaveBeenCalledTimes(1);
    expect(methodCallSpy).toHaveBeenCalled();
    expect(methodCallSpy).toHaveBeenCalledWith(
      undefined,
      expect.any(RxapFormControl),
    );
  }));

  it('should pass the paratmers to the method call', fakeAsync(() => {
    methodCallSpy.mockReturnValue([
      { value: 'value', display: 'display' },
      { value: 'value', display: 'display' },
      { value: 'value', display: 'display' },
    ]);
    directive.parameters = { data: 'data' };
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
    expect(methodCallSpy).toHaveBeenCalledTimes(1);
    expect(methodCallSpy).toHaveBeenCalledWith(
      directive.parameters,
      expect.any(RxapFormControl),
    );
    expect(methodCallSpy.mock.lastCall).toEqual([
      directive.parameters,
      expect.any(RxapFormControl),
    ]);
    expect(clearMock).toHaveBeenCalledTimes(1);
    expect(clearMock).toHaveBeenCalledTimes(1);
    expect(createEmbeddedViewMock).toHaveBeenCalledTimes(3);
    expect(createEmbeddedViewMock).toHaveBeenCalledWith(
      TestBed.inject(TemplateRef),
      { $implicit: { value: 'value', display: 'display' } },
    );
    expect(detectChangesMock).toHaveBeenCalledTimes(1);
  }));

  it('should call the method without parameters', fakeAsync(() => {
    methodCallSpy.mockReturnValue([
      { value: 'value', display: 'display' },
      { value: 'value', display: 'display' },
      { value: 'value', display: 'display' },
    ]);
    directive.ngOnChanges({});
    tick();
    directive.ngAfterViewInit();
    tick();
    expect(methodCallSpy).toHaveBeenCalledTimes(1);
    expect(methodCallSpy.mock.lastCall).toEqual([
      undefined,
      expect.any(RxapFormControl),
    ]);
    expect(clearMock).toHaveBeenCalledTimes(1);
    expect(clearMock).toHaveBeenCalledTimes(1);
    expect(createEmbeddedViewMock).toHaveBeenCalledTimes(3);
    expect(createEmbeddedViewMock).toHaveBeenCalledWith(
      TestBed.inject(TemplateRef),
      { $implicit: { value: 'value', display: 'display' } },
    );
    expect(detectChangesMock).toHaveBeenCalledTimes(1);
  }));

  it('should reset control of resetOnChange is set', fakeAsync(() => {
    const resetSpy = jest.spyOn(control, 'reset');
    directive.resetOnChange = 'custom value';
    directive.ngOnChanges({});
    tick();
    directive.ngAfterViewInit();
    tick();
    expect(clearMock).toHaveBeenCalledTimes(1);
    expect(createEmbeddedViewMock).not.toHaveBeenCalled();
    expect(detectChangesMock).toHaveBeenCalledTimes(1);
    expect(resetSpy).toHaveBeenCalledTimes(1);
    expect(resetSpy).toHaveBeenCalledWith(directive.resetOnChange);
  }));

  it('should reload the options if the parameters are changed', fakeAsync(() => {
    directive.ngOnChanges({});
    tick();
    directive.ngAfterViewInit();
    tick();
    expect(clearMock).toHaveBeenCalledTimes(1);
    expect(createEmbeddedViewMock).not.toHaveBeenCalled();
    expect(detectChangesMock).toHaveBeenCalledTimes(1);
    expect(methodCallSpy).toHaveBeenCalledTimes(1);
    expect(methodCallSpy).toHaveBeenCalledWith(
      undefined,
      expect.any(RxapFormControl),
    );
    directive.parameters = { data: 'data' };
    directive.ngOnChanges({
      parameters: {
        currentValue: directive.parameters,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    tick();
    expect(clearMock).toHaveBeenCalledTimes(2);
    expect(createEmbeddedViewMock).not.toHaveBeenCalled();
    expect(detectChangesMock).toHaveBeenCalledTimes(2);
    expect(methodCallSpy).toHaveBeenCalledTimes(2);
    expect(methodCallSpy).toHaveBeenCalledWith(
      directive.parameters,
      expect.any(RxapFormControl),
    );
  }));
});
