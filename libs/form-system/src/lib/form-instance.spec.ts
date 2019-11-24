import { FormInstance } from './form-instance';
import { RxapFormDefinition } from './form-definition/form-definition';
import { FormDefinitionLoader } from './form-definition-loader';
import { inject } from '@angular/core/testing';
import { RxapFormControl } from './form-definition/decorators/control';
import { InputFormControl } from './forms/form-controls/input.form-control';
import { RxapOnValueChange } from './form-definition/decorators/on-value-change';
import { RxapForm } from './form-definition/decorators/form-definition';
import { RxapControlValidator } from './form-definition/decorators/control-validator';
import { BaseFormControl } from './forms/form-controls/base.form-control';
import Spy = jasmine.Spy;

describe('Form System', () => {

  describe('FormInstance', () => {

    it('should get control by control path', inject([ FormDefinitionLoader ], (fdl: FormDefinitionLoader) => {

      @RxapForm('form')
      class FormDefinition extends RxapFormDefinition<any> {

        @RxapFormControl()
        username!: InputFormControl<string>;

        @RxapFormControl()
        password!: InputFormControl<string>;

      }

      const instance = new FormInstance(fdl.load(FormDefinition));

      expect(instance.formDefinition.group.hasControl('username')).toBeTruthy();
      expect(instance.formDefinition.group.hasControl('password')).toBeTruthy();
      expect(instance.formDefinition.group.formId).toBe('form');

      expect(instance.getControlByPath('form.username')).not.toBeNull();
      expect(instance.getControlByPath('form.password')).not.toBeNull();

      expect(instance.getControlByPath('form.username')).toBeInstanceOf(BaseFormControl);
      expect(instance.getControlByPath('form.password')).toBeInstanceOf(BaseFormControl);


    }));

    it('should call onChange method on value change', inject([ FormDefinitionLoader ], (fdl: FormDefinitionLoader) => {

      const FORM_ID = 'form';

      @RxapForm(FORM_ID)
      class FormDefinition extends RxapFormDefinition<any> {

        @RxapFormControl()
        username!: InputFormControl<string>;

        @RxapFormControl()
        password!: InputFormControl<string>;

        @RxapOnValueChange('username', 'password')
        onChange() {}

      }

      const instance = new FormInstance(fdl.load(FormDefinition));

      const usernameValue = 'my username';

      const onChangeSpy = spyOn(instance.formDefinition, 'onChange');

      instance.loadOnValueChange(instance.formDefinition);
      instance.handelOnValueChange();

      instance.formDefinition.username.setValue(usernameValue);

      expect(onChangeSpy).toBeCalled();

      instance.formDefinition.password.setValue(usernameValue);

      expect(onChangeSpy).toBeCalledTimes(2);


    }));

    describe('should be valid or invalid after call runValidators', () => {

      it('form definition without validators', inject([ FormDefinitionLoader ], (fdl: FormDefinitionLoader) => {


        @RxapForm('form')
        class FormDefinition extends RxapFormDefinition<any> {

          @RxapFormControl()
          username!: InputFormControl<string>;

          @RxapFormControl()
          password!: InputFormControl<string>;

        }

        const instance = new FormInstance(fdl.load(FormDefinition));

        instance.rxapOnInit();

        expect(instance.formDefinition.group.isValid).toBeNull();
        expect(instance.formDefinition.group.isInvalid).toBeNull();
        expect(instance.formDefinition.group.controls.get('username')!.isValid).toBeNull();
        expect(instance.formDefinition.group.controls.get('username')!.isInvalid).toBeNull();
        expect(instance.formDefinition.group.controls.get('password')!.isValid).toBeNull();
        expect(instance.formDefinition.group.controls.get('password')!.isInvalid).toBeNull();

        instance.runValidators();

        expect(instance.formDefinition.group.isValid).toBeTruthy();
        expect(instance.formDefinition.group.isInvalid).toBeFalsy();
        expect(instance.formDefinition.group.controls.get('username')!.isValid).toBeTruthy();
        expect(instance.formDefinition.group.controls.get('username')!.isInvalid).toBeFalsy();
        expect(instance.formDefinition.group.controls.get('password')!.isValid).toBeTruthy();
        expect(instance.formDefinition.group.controls.get('password')!.isInvalid).toBeFalsy();

        instance.formDefinition.group.setValue({ username: 'username', password: 'password' });

        expect(instance.formDefinition.group.value).toEqual({ username: 'username', password: 'password' });
        expect(instance.formDefinition.group.controls.get('username')!.value).toEqual('username');
        expect(instance.formDefinition.group.controls.get('password')!.value).toEqual('password');

        instance.runValidators();

        expect(instance.formDefinition.group.isValid).toBeTruthy();
        expect(instance.formDefinition.group.isInvalid).toBeFalsy();
        expect(instance.formDefinition.group.controls.get('username')!.isValid).toBeTruthy();
        expect(instance.formDefinition.group.controls.get('username')!.isInvalid).toBeFalsy();
        expect(instance.formDefinition.group.controls.get('password')!.isValid).toBeTruthy();
        expect(instance.formDefinition.group.controls.get('password')!.isInvalid).toBeFalsy();

        instance.rxapOnDestroy();

      }));

      it('form definition with validators', inject([ FormDefinitionLoader ], (fdl: FormDefinitionLoader) => {


        @RxapForm('form')
        class FormDefinition extends RxapFormDefinition<any> {

          @RxapControlValidator({
            validator: value => value === 'username'
          })
          @RxapFormControl()
          username!: InputFormControl<string>;

          @RxapControlValidator({
            validator: value => value === 'password'
          })
          @RxapFormControl()
          password!: InputFormControl<string>;

        }

        const instance = new FormInstance(fdl.load(FormDefinition));

        instance.rxapOnInit();

        expect(instance.formDefinition.group.isValid).toBeNull();
        expect(instance.formDefinition.group.isInvalid).toBeNull();
        expect(instance.formDefinition.group.controls.get('username')!.isValid).toBeNull();
        expect(instance.formDefinition.group.controls.get('username')!.isInvalid).toBeNull();
        expect(instance.formDefinition.group.controls.get('password')!.isValid).toBeNull();
        expect(instance.formDefinition.group.controls.get('password')!.isInvalid).toBeNull();

        expect(instance.controlValidators.size).toBe(2);

        instance.runValidators();

        expect(instance.formDefinition.group.isValid).toBeFalsy();
        expect(instance.formDefinition.group.isInvalid).toBeTruthy();
        expect(instance.formDefinition.group.controls.get('username')!.isValid).toBeFalsy();
        expect(instance.formDefinition.group.controls.get('username')!.isInvalid).toBeTruthy();
        expect(instance.formDefinition.group.controls.get('password')!.isValid).toBeFalsy();
        expect(instance.formDefinition.group.controls.get('password')!.isInvalid).toBeTruthy();

        instance.formDefinition.group.setValue({ username: 'username', password: 'password' });

        expect(instance.formDefinition.group.value).toEqual({ username: 'username', password: 'password' });
        expect(instance.formDefinition.group.controls.get('username')!.value).toEqual('username');
        expect(instance.formDefinition.group.controls.get('password')!.value).toEqual('password');

        instance.runValidators();

        expect(instance.formDefinition.group.isValid).toBeTruthy();
        expect(instance.formDefinition.group.isInvalid).toBeFalsy();
        expect(instance.formDefinition.group.controls.get('username')!.isValid).toBeTruthy();
        expect(instance.formDefinition.group.controls.get('username')!.isInvalid).toBeFalsy();
        expect(instance.formDefinition.group.controls.get('password')!.isValid).toBeTruthy();
        expect(instance.formDefinition.group.controls.get('password')!.isInvalid).toBeFalsy();

        instance.rxapOnDestroy();

      }));

    });

    describe('submit form instance', () => {

      let instance: FormInstance<any>;
      let rxapOnSubmitSpy: Spy;
      let rxapOnSubmitValid: Spy;
      let rxapOnSubmitInvalid: Spy;
      let rxapOnSubmitError: Spy;
      let formInvalidSubmitSpy: Spy;
      let formValidSubmitSpy: Spy;

      beforeEach(inject([ FormDefinitionLoader ], (fdl: FormDefinitionLoader) => {


        @RxapForm('form')
        class FormDefinition extends RxapFormDefinition<any> {

          @RxapControlValidator({
            validator: value => value === 'username'
          })
          @RxapFormControl()
          username!: InputFormControl<string>;

          @RxapControlValidator({
            validator: value => value === 'password'
          })
          @RxapFormControl()
          password!: InputFormControl<string>;

        }

        const formInvalidSubmit = { onInvalidSubmit: async () => null };
        const formValidSubmit   = { onValidSubmit: async () => null };

        instance = new FormInstance(fdl.load(FormDefinition), formInvalidSubmit, formValidSubmit);

        rxapOnSubmitSpy      = spyOn(instance.formDefinition, 'rxapOnSubmit');
        rxapOnSubmitValid    = spyOn(instance.formDefinition, 'rxapOnSubmitValid');
        rxapOnSubmitInvalid  = spyOn(instance.formDefinition, 'rxapOnSubmitInvalid');
        rxapOnSubmitError    = spyOn(instance.formDefinition, 'rxapOnSubmitError');
        formInvalidSubmitSpy = spyOn(formInvalidSubmit, 'onInvalidSubmit');
        formValidSubmitSpy   = spyOn(formValidSubmit, 'onValidSubmit');

        instance.rxapOnInit();

      }));

      afterEach(() => {
        instance.rxapOnDestroy();
      });

      it('submit invalid form', () => {

        instance.submit();

        expect(rxapOnSubmitSpy).toBeCalled();
        expect(rxapOnSubmitValid).not.toBeCalled();
        expect(rxapOnSubmitInvalid).toBeCalled();
        expect(rxapOnSubmitError).not.toBeCalled();
        expect(formValidSubmitSpy).not.toBeCalled();
        expect(formInvalidSubmitSpy).toBeCalled();

      });

      it('submit valid form', () => {

        instance.formDefinition.group.setValue({ username: 'username', password: 'password' });

        expect(instance.formValidSubmit).not.toBeNull();

        instance.submit();

        expect(rxapOnSubmitSpy).toBeCalled();
        expect(rxapOnSubmitValid).toBeCalled();
        expect(rxapOnSubmitInvalid).not.toBeCalled();
        expect(rxapOnSubmitError).not.toBeCalled();
        expect(formValidSubmitSpy).toBeCalled();
        expect(formInvalidSubmitSpy).not.toBeCalled();

      });

    });

  });

});
