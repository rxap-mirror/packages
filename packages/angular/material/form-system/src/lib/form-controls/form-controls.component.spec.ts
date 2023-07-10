import { FormControlsComponent } from './form-controls.component';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatLegacyButtonHarness as MatButtonHarness } from '@angular/material/legacy-button/testing';
import { MockRender } from 'ng-mocks';
import {
  FormDirective,
  FormType,
  RXAP_FORM_DEFINITION,
  RxapForm,
  RxapFormBuilder,
  RxapFormGroup,
  RxapFormsModule,
} from '@rxap/forms';
import {
  Injectable,
  Injector,
  INJECTOR,
} from '@angular/core';
import { By } from '@angular/platform-browser';

describe('@rxap/material-form-system', () => {

  xdescribe('FormControlsComponent', () => {

    let fixture: ComponentFixture<any>;
    let loader: HarnessLoader;
    let formDirective: FormDirective;

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ITestForm {

    }

    @RxapForm('test')
    @Injectable()
    class TestForm implements FormType<ITestForm> {
      rxapFormGroup!: RxapFormGroup;
    }

    function FormFactory(injector: Injector) {
      return new RxapFormBuilder<ITestForm>(TestForm, injector).build();
    }

    beforeEach(async () => {

      await TestBed.configureTestingModule({
        imports: [
          FormControlsComponent,
          RxapFormsModule,
        ],
        providers: [
          {
            provide: RXAP_FORM_DEFINITION,
            useFactory: FormFactory,
            deps: [INJECTOR],
          },
        ],
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

    it('should only trigger the submit logic once', async () => {

      const submitButton = await loader.getHarness(
        MatButtonHarness.with({text: 'Submit'}),
      );

      const onSubmitSpy = spyOn(formDirective, 'onSubmit');

      await submitButton.click();

      expect(onSubmitSpy).toBeCalled();
      expect(onSubmitSpy).toBeCalledTimes(1);

    });

  });

});
