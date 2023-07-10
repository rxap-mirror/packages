import { RxapForm } from './form';
import { RxapFormControl } from '../form-control';
import { ValidationErrors } from '../types';
import { UseFormControl } from './use-form-control';
import { ControlAsyncValidator } from './control-async-validator';
import { TestBed } from '@angular/core/testing';
import {
  Injector,
  INJECTOR,
  Provider,
} from '@angular/core';
import {
  RXAP_FORM_DEFINITION,
  RXAP_FORM_DEFINITION_BUILDER,
} from '../directives/tokens';
import { RxapFormGroup } from '../form-group';
import { FormType } from '../model';
import { RxapFormBuilder } from '../form-builder';
import { Observable } from 'rxjs';

describe('@rxap/form-system', () => {

  describe('decorators', () => {

    describe('@ControlAsyncValidator', () => {

      interface ITestForm {
        username: string;
      }

      @RxapForm('test')
      class TestForm implements FormType<ITestForm> {

        public rxapFormGroup!: RxapFormGroup;

        @UseFormControl()
        public username!: RxapFormControl;

        @ControlAsyncValidator('username')
        public uniqueUsername(control: RxapFormControl): Promise<ValidationErrors | null> {
          return Promise.resolve(control.value === 'rxap' ? null : {username: 'only rxap is allowed'});
        }

      }

      const TestFormProviders: Provider[] = [
        TestForm,
        {
          provide: RXAP_FORM_DEFINITION_BUILDER,
          useFactory: (injector: Injector) => new RxapFormBuilder<ITestForm>(TestForm, injector),
          deps: [INJECTOR],
        },
        {
          provide: RXAP_FORM_DEFINITION,
          useFactory: (builder: RxapFormBuilder) => builder.build(),
          deps: [RXAP_FORM_DEFINITION_BUILDER],
        },
      ];

      it('should add async validator to control', () => {

        TestBed.configureTestingModule({
          providers: [
            TestFormProviders,
          ],
        });

        const form = TestBed.inject<TestForm>(RXAP_FORM_DEFINITION);

        expect(form).toBeInstanceOf(TestForm);
        const asyncValidator = form.username.asyncValidator!(form.username);
        expect(asyncValidator).toBeInstanceOf(Observable);
        expect((asyncValidator as any).toPromise()).resolves.toEqual({username: 'only rxap is allowed'});

      });

    });

  });

});
