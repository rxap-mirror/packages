import { FormInstance } from './form-instance';
import { RxapFormDefinition } from './form-definition/form-definition';
import { FormDefinitionLoader } from './form-definition-loader';
import { inject } from '@angular/core/testing';
import { RxapFormControl } from './form-definition/decorators/control';
import { InputFormControl } from './forms/form-controls/input.form-control';
import { RxapOnValueChange } from './form-definition/decorators/on-value-change';
import { getMetadataKeys } from '../../../utilities/src';

describe('Form System', () => {

  describe('FormInstance', () => {

    it('should call on value change functions on value change', inject([ FormDefinitionLoader ], (fdl: FormDefinitionLoader) => {

      class FormDefinition extends RxapFormDefinition<any> {

        @RxapFormControl()
        username: InputFormControl<string>;

        @RxapOnValueChange('username')
        onChange() {}

      }

      const instance = new FormInstance(fdl.load(FormDefinition));

      const usernameValue = 'my username';

      const onChangeSpy = spyOn(instance.formDefinition, 'onChange');

      instance.formDefinition.username.setValue(usernameValue);

      console.log('D', getMetadataKeys(instance.formDefinition.constructor.prototype));

      expect(onChangeSpy).toBeCalled();


    }));

  });

});
