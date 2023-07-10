import { RxapForm } from './form';
import {
  Injector,
  INJECTOR,
  Provider,
} from '@angular/core';
import {
  RXAP_FORM_DEFINITION,
  RXAP_FORM_DEFINITION_BUILDER,
} from '../directives/tokens';
import { TestBed } from '@angular/core/testing';
import { RxapFormBuilder } from '../form-builder';
import { UseFormControl } from './use-form-control';
import { FormType } from '../model';
import { ControlValidator } from './control-validator';
import { RxapFormGroup } from '../form-group';
import { RxapFormControl } from '../form-control';
import { ValidationErrors } from '../types';

describe('@rxap/forms', () => {

  describe('decorators', () => {

    describe('@ControlValidator', () => {

      interface ITestForm {
        username: string;
      }

      @RxapForm('test')
      class TestForm implements FormType<ITestForm> {

        public rxapFormGroup!: RxapFormGroup;

        @UseFormControl()
        public username!: RxapFormControl;

        @ControlValidator('username')
        public uniqueUsername(control: RxapFormControl): ValidationErrors | null {
          return control.value === 'rxap' ? null : { username: 'only rxap is allowed' };
        }

      }

      const TestFormProviders: Provider[] = [
        TestForm,
        {
          provide: RXAP_FORM_DEFINITION_BUILDER,
          useFactory: (injector: Injector) => new RxapFormBuilder<ITestForm>(TestForm, injector),
          deps: [ INJECTOR ],
        },
        {
          provide: RXAP_FORM_DEFINITION,
          useFactory: (builder: RxapFormBuilder) => builder.build(),
          deps: [ RXAP_FORM_DEFINITION_BUILDER ],
        },
      ];

      it('should add validator to control', () => {

        TestBed.configureTestingModule({
          providers: [
            TestFormProviders,
          ],
        });

        const form = TestBed.inject<TestForm>(RXAP_FORM_DEFINITION);

        expect(form).toBeInstanceOf(TestForm);
        expect(form.username.validator).not.toBeNull();
        expect(form.username.validator!(form.username)).toEqual({ username: 'only rxap is allowed' });

      });

    });

  });

});
