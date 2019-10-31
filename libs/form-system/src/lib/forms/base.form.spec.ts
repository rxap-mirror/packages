import {
  BaseForm,
  defaultSetValueOptions
} from './base.form';
import { BaseFormGroup } from './form-groups/base.form-group';

describe('Form System', () => {

  describe('Forms', () => {

    describe('BaseForm', () => {

      let baseForm: BaseForm<any>;

      beforeEach(() => {
        baseForm = new BaseForm<any>('', 'control');
      });

      describe('setValue', () => {

        it('should update value property', () => {

          expect(baseForm.value).toBe(undefined);

          const value = 'my-value';

          baseForm.setValue(value);

          expect(baseForm.value).toBe(value);

        });

        it('should emit value change', () => {

          expect(baseForm.value).toBe(undefined);

          const value = 'my-value';

          const valueChangeNextSpy = spyOn(baseForm.valueChange$, 'next');

          baseForm.setValue(value);

          expect(valueChangeNextSpy).toBeCalled();

        });

        it('should not emit value change if options.emit = false', () => {

          expect(baseForm.value).toBe(undefined);

          const value = 'my-value';

          const valueChangeNextSpy = spyOn(baseForm.valueChange$, 'next');

          baseForm.setValue(value, { emit: false });

          expect(valueChangeNextSpy).not.toBeCalled();

        });

        it('should not emit value change if value has not changed', () => {

          expect(baseForm.value).toBe(undefined);

          const value = 'my-value';

          const valueChangeNextSpy = spyOn(baseForm.valueChange$, 'next');

          baseForm.setValue(value);
          baseForm.setValue(value);
          baseForm.setValue(value);

          expect(valueChangeNextSpy).toBeCalled();
          expect(valueChangeNextSpy).toBeCalledTimes(1);

        });

        it('should emit value change if value has not changed and options.force = true', () => {

          expect(baseForm.value).toBe(undefined);

          const value = 'my-value';

          const valueChangeNextSpy = spyOn(baseForm.valueChange$, 'next');

          baseForm.setValue(value, { force: true });
          baseForm.setValue(value, { force: true });
          baseForm.setValue(value, { force: true });

          expect(valueChangeNextSpy).toBeCalled();
          expect(valueChangeNextSpy).toBeCalledTimes(3);

        });

        it('should call parent updateValue function if parent is present', () => {

          const parent: any      = new BaseForm('', 'parent');
          parent[ 'addControl' ] = () => {};
          baseForm               = new BaseForm('', 'control', parent);

          const updateValueSpy = spyOn(parent, 'updateValue');

          const value = 'my-value';

          baseForm.setValue(value);

          expect(updateValueSpy).toBeCalled();
          expect(updateValueSpy).toBeCalledWith({ [ baseForm.controlId ]: value }, defaultSetValueOptions());

        });

        it('should not call parent updateValue function if parent is present and options.skipParent = true', () => {

          const parent: any      = new BaseForm('', 'parent');
          parent[ 'addControl' ] = () => {};
          baseForm               = new BaseForm('', 'control', parent);

          const updateValueSpy = spyOn(parent, 'updateValue');

          const value = 'my-value';

          baseForm.setValue(value, { skipParent: true });

          expect(updateValueSpy).not.toBeCalled();

        });

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
