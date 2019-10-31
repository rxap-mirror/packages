import { FormInstance } from './form-instance';
import { RxapFormDefinition } from './form-definition/form-definition';
import { FormDefinitionLoader } from './form-definition-loader';
import { inject } from '@angular/core/testing';
import { RxapFormControl } from './form-definition/decorators/control';
import { InputFormControl } from './forms/form-controls/input.form-control';
import { RxapOnValueChange } from './form-definition/decorators/on-value-change';
import { RxapForm } from './form-definition/decorators/form-definition';

describe('Form System', () => {

  describe('FormInstance', () => {

    it('should call on value change functions on value change', inject([ FormDefinitionLoader ], (fdl: FormDefinitionLoader) => {

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

      instance.handelOnValueChange(instance.formDefinition);

      instance.formDefinition.username.setValue(usernameValue);

      expect(onChangeSpy).toBeCalled();

      instance.formDefinition.password.setValue(usernameValue);

      expect(onChangeSpy).toBeCalledTimes(2);


    }));

  });

});
