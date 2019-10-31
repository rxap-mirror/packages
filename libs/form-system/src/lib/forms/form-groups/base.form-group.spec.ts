import { BaseFormGroup } from './base.form-group';
import { BaseFormControl } from '../../..';

describe('Form System', () => {

  describe('Forms', () => {

    describe('Form Groups', () => {

      describe('BaseFormGroup', () => {

        let baseFormGroup: BaseFormGroup<any>;

        beforeEach(() => {
          baseFormGroup = new BaseFormGroup<any>('', '');
        });

        describe('Control management', () => {

          describe('Add Control', () => {

            it('should throw if parent is not equal the current BaseFormGroup instance', () => {

              const control = BaseFormControl.EMPTY(BaseFormGroup.EMPTY());

              expect(() => baseFormGroup.addControl(control, 'control')).toThrow();

            });

            it('should throw if controlId is not a string', () => {

              expect(() => baseFormGroup.addControl({ parent: baseFormGroup } as any, 0 as any)).toThrow();

            });

            it('should call control init method', () => {

              const control = { parent: baseFormGroup, init: () => {} };

              const initSpy = spyOn(control, 'init');

              baseFormGroup.addControl(control as any, 'control');

              expect(initSpy).toBeCalled();

            });

            it('should add control to controls map', () => {

              const control = { parent: baseFormGroup, init: () => {}, value: 'value', controlId: 'control' };

              expect(baseFormGroup.controls.size).toBe(0);

              baseFormGroup.addControl(control as any);

              expect(baseFormGroup.controls.size).toBe(1);
              expect(baseFormGroup.controls.has(control.controlId)).toBeTruthy();

            });

            it('should call update value method', () => {

              const control = { parent: baseFormGroup, init: () => {}, value: 'value', controlId: 'control' };

              const updateValueSpy = spyOn(baseFormGroup, 'updateValue');

              baseFormGroup.addControl(control as any);

              expect(updateValueSpy).toBeCalled();
              expect(updateValueSpy).toBeCalledWith({ [ control.controlId ]: control.value }, { emit: false, force: true, onlySelf: true });

            });


          });

          describe('Remove Control', () => {

            it('should remove control from control map', () => {

              const control = BaseFormControl.EMPTY(baseFormGroup);

              expect(baseFormGroup.controls.size).toBe(1);

              baseFormGroup.removeControl(control.controlId);

              expect(baseFormGroup.controls.size).toBe(0);

            });

            it('should update value', () => {

              const control1 = new BaseFormControl('control1', baseFormGroup);
              const control2 = new BaseFormControl('control2', baseFormGroup);
              const control3 = new BaseFormControl('control3', baseFormGroup);
              const control4 = new BaseFormControl('control4', baseFormGroup);
              const control5 = new BaseFormControl('control5', baseFormGroup);

              control1.setValue('value1');
              control2.setValue('value2');
              control3.setValue('value3');
              control4.setValue('value4');
              control5.setValue('value5');

              expect(baseFormGroup.value).toEqual({ control1: 'value1', control2: 'value2', control3: 'value3', control4: 'value4', control5: 'value5' });

              baseFormGroup.removeControl('control2');

              expect(baseFormGroup.value).toEqual({ control1: 'value1', control3: 'value3', control4: 'value4', control5: 'value5' });

            });

          });

        });

        describe('Value change', () => {

          let control1: BaseFormControl<any>;
          let control2: BaseFormControl<any>;
          let control3: BaseFormControl<any>;

          beforeEach(() => {
            control1 = new BaseFormControl('control1', baseFormGroup);
            control2 = new BaseFormControl('control2', baseFormGroup);
            control3 = new BaseFormControl('control3', baseFormGroup);

            control1.setValue('value1');
            control2.setValue('value2');
            control3.setValue('value3');
          });

          describe('setValue', () => {

            it('should update child control values', () => {

              expect(baseFormGroup.value).toEqual({ control1: 'value1', control2: 'value2', control3: 'value3' });

              const newValue = { control1: 'newvalue1', control2: 'value2', control3: 'value3' };

              baseFormGroup.setValue(newValue);

              expect(baseFormGroup.value).toEqual(newValue);

              expect(control1.value).toEqual(newValue.control1);
              expect(control2.value).toEqual(newValue.control2);
              expect(control3.value).toEqual(newValue.control3);


            });

          });

        });


      });

    });

  });

});
