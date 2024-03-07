import {
  INJECTOR,
  Injector,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  AbstractControl,
  NgControl,
} from '@angular/forms';
import {
  FormType,
  RxapForm,
  RxapFormBuilder,
  RxapFormControl,
  UseFormControl,
} from '@rxap/forms';
import { Mixin } from '@rxap/mixin';
import { Method } from '@rxap/pattern';
import { ControlOptions } from '@rxap/utilities';
import {
  ExtractOptionsMethodMixin,
  UseOptionsMethod,
} from './extract-options-method.mixin';

describe('ExtractOptionsMethodMixin', () => {

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface TestComponent extends ExtractOptionsMethodMixin {
  }

  @Mixin(ExtractOptionsMethodMixin)
  class TestComponent {

    constructor(
      public readonly ngControl: NgControl,
      public readonly injector: Injector,
    ) {
    }

    extract() {
      return this.extractOptionsMethod();
    }

  }

  class TestMethod implements Method<ControlOptions> {
    call(): ControlOptions {
      return [];
    }
  }

  interface ITestFormDefinition {
    name: string;
  }

  const config = {adapter: {}};

  @RxapForm('test')
  class TestFormDefinition implements FormType<ITestFormDefinition> {

    @UseOptionsMethod(TestMethod)
    @UseFormControl()
    name!: RxapFormControl;

    @UseOptionsMethod(TestMethod, config)
    @UseFormControl()
    age!: RxapFormControl;

  }

  class TestNgControl extends NgControl {

    constructor(private readonly _control: AbstractControl) {
      super();
    }

    override get control(): AbstractControl<any, any> | null {
      return this._control;
    }

    override viewToModelUpdate(newValue: any): void {
      throw new Error('Method not implemented.');
    }

  }

  let formDefinition: TestFormDefinition;
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestMethod,
      ],
    });
    formDefinition = new RxapFormBuilder<ITestFormDefinition>(TestFormDefinition).build();
    injector       = TestBed.inject(INJECTOR);
  });

  it('should extract options method', () => {

    const testComponent = new TestComponent(new TestNgControl(formDefinition.name), injector);

    expect(testComponent.extract()).toEqual(injector.get(TestMethod));

  });

  it('should extract options method with configruation', () => {

    const testComponent = new TestComponent(new TestNgControl(formDefinition.age), injector);

    expect(testComponent.extract()).toEqual(injector.get(TestMethod));

  });

});
