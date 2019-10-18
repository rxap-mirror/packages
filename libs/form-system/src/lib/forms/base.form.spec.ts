import { BaseForm } from './base.form';

describe('Form System', () => {

  describe('Forms', () => {

    describe('BaseForm', () => {

      let baseForm: BaseForm<any>;

      beforeEach(() => {
        baseForm = new BaseForm<any>();
      });

      it('should update value and valueChange$ property on setValue', () => {

        expect(baseForm.value).toBe(null);

        const value = 'my-value';

        baseForm.setValue(value);

        expect(baseForm.value).toBe(value);

      })

    })

  })

});
