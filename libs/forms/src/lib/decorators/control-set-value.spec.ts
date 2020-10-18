import { RxapForm } from './form';
import { RxapFormControl } from '../form-control';
import { UseFormControl } from './use-form-control';
import { RxapFormGroup } from '../form-group';
import { FormDefinition } from '../model';
import { ControlSetValue } from './control-set-value';
import {
  Provider,
  Injector,
  INJECTOR
} from '@angular/core';
import {
  RXAP_FORM_DEFINITION_BUILDER,
  RXAP_FORM_DEFINITION
} from '../directives/tokens';
import { TestBed } from '@angular/core/testing';
import { RxapFormBuilder } from '../form-builder';

describe('@rxap/forms', () => {

  describe('decorators', () => {

    describe('@ControlSetValue', () => {

      @RxapForm('test')
      class TestForm implements FormDefinition {

        public rxapFormGroup!: RxapFormGroup;

        @UseFormControl()
        public username!: RxapFormControl;

        public call1 = false;
        public call2 = false;

        @ControlSetValue('username')
        public onUsernameChange(value: string): void {
          this.call1 = true;
        }

        @ControlSetValue('username')
        public onUsernameChange2(value: string): void {
          this.call2 = true;
        }

      }

      const TestFormProviders: Provider[] = [
        TestForm,
        {
          provide:    RXAP_FORM_DEFINITION_BUILDER,
          useFactory: (injector: Injector) => new RxapFormBuilder(TestForm, injector),
          deps:       [ INJECTOR ]
        },
        {
          provide:    RXAP_FORM_DEFINITION,
          useFactory: (builder: RxapFormBuilder) => builder.build(),
          deps:       [ RXAP_FORM_DEFINITION_BUILDER ]
        }
      ];

      it('should register on change method', () => {

        TestBed.configureTestingModule({
          providers: [
            TestFormProviders
          ]
        });

        const form = TestBed.inject<TestForm>(RXAP_FORM_DEFINITION);

        form.username.setValue('rxap');

        expect(Reflect.get(form.username, '_onSetValue')).toBeInstanceOf(Array);
        expect(Reflect.get(form.username, '_onSetValue').length).toEqual(2);

        expect(form.call1).toBeTruthy();
        expect(form.call2).toBeTruthy();

      });

    });

  });

});
