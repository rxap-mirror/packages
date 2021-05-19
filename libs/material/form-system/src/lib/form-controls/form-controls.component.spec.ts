import {
  FormControlsComponent,
  FormControlsComponentModule
} from '@rxap/material-form-system';
import {
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MockRender } from 'ng-mocks';
import {
  RxapFormsModule,
  FormDefinition,
  RxapForm,
  RxapFormGroup,
  RxapFormBuilder,
  RXAP_FORM_DEFINITION,
  FormDirective
} from '@rxap/forms';
import {
  Injectable,
  Injector,
  INJECTOR
} from '@angular/core';
import { By } from '@angular/platform-browser';

describe('@rxap/material-form-system', () => {

  describe('FormControlsComponent', () => {

    let fixture: ComponentFixture<any>;
    let loader: HarnessLoader;
    let formDirective: FormDirective;

    @RxapForm('test')
    @Injectable()
    class TestForm implements FormDefinition {
      rxapFormGroup!: RxapFormGroup;
    }

    function FormFactory(injector: Injector) {
      return new RxapFormBuilder(TestForm, injector).build();
    }

    beforeEach(async () => {

      await TestBed.configureTestingModule({
        imports: [
          FormControlsComponentModule,
          RxapFormsModule
        ],
        providers: [
          {
            provide: RXAP_FORM_DEFINITION,
            useFactory: FormFactory,
            deps: [INJECTOR]
          }
        ]
      }).compileComponents();

      fixture = MockRender(`
      <form rxapForm>
        <rxap-form-controls></rxap-form-controls>
      </form>
      `);
      loader = TestbedHarnessEnvironment.loader(fixture);
      formDirective = fixture.debugElement.query(By.directive(FormDirective)).injector.get(FormDirective);
    });

    it('should create', () => {
      expect(formDirective).toBeDefined();
      expect(formDirective).toBeInstanceOf(FormDirective);
    });

    it('should only trigger submit logic once', async () => {

      const submitButton = await loader.getHarness(
        MatButtonHarness.with({ text: 'Submit' })
      );

      const onSubmitSpy = spyOn(formDirective, 'onSubmit');

      await submitButton.click();

      expect(onSubmitSpy).toBeCalled();
      expect(onSubmitSpy).toBeCalledTimes(1);

    });

  });

});
