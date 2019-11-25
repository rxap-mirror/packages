import {
  NgModelControlComponent,
  NgModelControlSubscriptions
} from './ng-model-control.component';
import { BaseFormControl } from '../forms/form-controls/base.form-control';
import createSpy = jasmine.createSpy;

describe('Form System', () => {

  describe('Form Controls', () => {

    describe('NgModelControl', () => {

      let component: NgModelControlComponent<any, any>;
      let control: BaseFormControl<any>;

      beforeEach(() => {

        component = new NgModelControlComponent<any, BaseFormControl<any>>({ markForCheck: () => {} } as any);
        control   = component.control = BaseFormControl.EMPTY();

        control.init();
        control.rxapOnInit();


      });

      it('[BUG] registerOnModelChange would not call passed functions if the model getter is not used', () => {

        const valueChangeSpy = createSpy();

        component.registerOnModelChange(valueChangeSpy);

        expect(valueChangeSpy).not.toBeCalled();

        const value = 'value';

        control.setValue(value);

        expect(valueChangeSpy).toBeCalled();

      });

      describe('[BUG] model should always return the current control value. In standalone mode and normal mode', () => {

        it('standalone mode', () => {

          component.registerOnModelChange(() => {});

          expect(component.model).toBe(control.value);

          control.setValue('test');

          expect(component.model).toBe(control.value);

          control.setValue(null);

          expect(component.model).toBe(control.value);

        });

        it('normal mode', () => {

          expect(component.model).toBe(control.value);

          control.setValue('test');

          expect(component.model).toBe(control.value);

          control.setValue(null);

          expect(component.model).toBe(control.value);

        });

      });

      it('registerOnModelChange should call passed function if the control value changes', () => {

        const valueChangeSpy = createSpy();

        expect(component.control).toBeInstanceOf(BaseFormControl);

        expect(component.subscriptions.has(NgModelControlSubscriptions.MODEL)).toBeFalsy();
        expect(component.subscriptions.has(NgModelControlSubscriptions.ON_CHANGE)).toBeFalsy();

        component.registerOnModelChange(valueChangeSpy);

        expect(component.subscriptions.has(NgModelControlSubscriptions.MODEL)).toBeTruthy();
        expect(component.subscriptions.has(NgModelControlSubscriptions.ON_CHANGE)).toBeTruthy();

        const value = 'value';

        control.setValue(value);

        expect(valueChangeSpy).toBeCalled();
        expect(valueChangeSpy).toBeCalledWith(value);


      });


    });

  });

});
