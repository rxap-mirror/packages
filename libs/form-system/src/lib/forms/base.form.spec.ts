import { BaseForm } from './base.form';
import { BaseFormGroup } from './form-groups/base.form-group';

describe('Form System', () => {

  describe('Forms', () => {

    describe('BaseForm', () => {

      let baseForm: BaseForm<any>;

      beforeEach(() => {
        baseForm = new BaseForm<any>('', '');
      });

      it('should update value and valueChange$ property on setValue', () => {

        expect(baseForm.value).toBe(undefined);

        const value = 'my-value';

        baseForm.setValue(value);

        expect(baseForm.value).toBe(value);

      });

      it('should set error for parent if parent is defined', () => {

        const formControlId = 'form';

        const parent = new BaseFormGroup('', '', null as any);

        const form = new BaseForm('', formControlId, parent);

        const parentSetErrorSpy = spyOn(parent, 'setError');

        const errorKey   = 'errorKey';
        const errorValue = 'errorValue';

        form.setError(errorKey, errorValue);

        expect(parentSetErrorSpy).toBeCalled();
        expect(parentSetErrorSpy).toBeCalledWith([ formControlId, errorKey ].join('.'), errorValue);

      })

    })

  })

});
