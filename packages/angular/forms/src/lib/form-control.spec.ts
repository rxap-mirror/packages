import {
  of,
  Subject,
} from 'rxjs';
import { Validators } from '@angular/forms';
import { RxapFormControl } from './form-control';

describe('@rxap/forms', () => {

  describe('FormControl', () => {

    let control: RxapFormControl;

    beforeEach(() => {
      control = new RxapFormControl(null, { controlId: 'test' });
    });

    it('should valueChanges$', () => {
      const spy = jest.fn();
      control.value$.subscribe(spy);
      expect(spy).toHaveBeenCalledWith(null);
      control.patchValue('patched');
      expect(spy).toHaveBeenCalledWith('patched');
    });

    it('should disabledChanges$', () => {
      const spy = jest.fn();
      control.disabled$.subscribe(spy);
      expect(spy).toHaveBeenCalledWith(false);
      control.disable();
      expect(spy).toHaveBeenCalledWith(true);
      control.disable();
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should enabledChanges$', () => {
      const spy = jest.fn();
      control.enabled$.subscribe(spy);
      expect(spy).toHaveBeenCalledWith(true);
      control.disable();
      expect(spy).toHaveBeenCalledWith(false);
      control.disable();
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should statusChanges$', () => {
      const spy = jest.fn();
      control.status$.subscribe(spy);
      expect(spy).toHaveBeenCalledWith('VALID');
      control.disable();
      expect(spy).toHaveBeenCalledWith('DISABLED');
    });

    it('should setValue', () => {

      control.setValue(of('value'));
      expect(control.value).toEqual('value');

      control.setValue('new value');
      expect(control.value).toEqual('new value');
    });

    it('should patchValue', () => {

      control.patchValue(of('value'));
      expect(control.value).toEqual('value');

      control.patchValue('new value');
      expect(control.value).toEqual('new value');
    });

    it('should disabledWhile', () => {
      const subject = new Subject<boolean>();
      control.disabledWhile(subject);
      expect(control.disabled).toBeFalsy();
      subject.next(true);
      expect(control.disabled).toBeTruthy();
      subject.next(false);
      expect(control.disabled).toBeFalsy();
    });

    it('should enableWhile', () => {
      const subject = new Subject<boolean>();
      control.enabledWhile(subject);
      expect(control.enabled).toBeTruthy();
      subject.next(false);
      expect(control.enabled).toBeFalsy();
      subject.next(true);
      expect(control.enabled).toBeTruthy();
    });

    it('should mergeValidators', () => {
      control.setValidators(Validators.required);
      expect(control.errors).toEqual({required: true});
      control.mergeValidators(Validators.minLength(2));
      expect(control.errors).toEqual({required: true});
      control.patchValue('a');
      expect(control.errors).toEqual({
        minlength: {
          actualLength: 1,
          requiredLength: 2,
        },
      });
    });

    it('should markAsTouched/Untouched', () => {
      const spy = jest.fn();
      control.touch$.subscribe(spy);
      control.markAsTouched();
      expect(spy).toHaveBeenCalledWith(true);
      control.markAsUntouched();
      expect(spy).toHaveBeenCalledWith(false);
    });

    it('should markAsPristine/Dirty', () => {
      const spy = jest.fn();
      control.dirty$.subscribe(spy);
      control.markAllAsDirty();
      expect(spy).toHaveBeenCalledWith(true);
      control.markAsPristine();
      expect(spy).toHaveBeenCalledWith(false);
    });

    it('should markAllAsDirty', () => {
      jest.spyOn(control, 'markAsDirty');
      control.markAllAsDirty();
      expect(control.markAsDirty).toHaveBeenCalled();
    });

    it('should reset', () => {
      jest.spyOn(control, 'reset');
      control.reset();
      expect(control.reset).toHaveBeenCalled();
    });

    it('should setValidators', () => {
      jest.spyOn(control, 'setValidators');
      control.setValidators([]);
      expect(control.setValidators).toHaveBeenCalled();
    });

    it('should setAsyncValidators', () => {
      jest.spyOn(control, 'setAsyncValidators');
      control.setAsyncValidators([]);
      expect(control.setAsyncValidators).toHaveBeenCalled();
    });

    it('should validateOn', () => {
      const subject = new Subject<object | null>();
      control.validateOn(subject);
      subject.next({someError: true});
      expect(control.errors).toEqual({someError: true});
      subject.next(null);
      expect(control.errors).toEqual(null);
    });

    it('should hasErrorAndTouched', () => {
      control.setValidators(Validators.required);
      control.setValue('');
      expect(control.hasErrorAndTouched('required')).toBeFalsy();
      control.markAsTouched();
      expect(control.hasErrorAndTouched('required')).toBeTruthy();
    });

    it('should hasErrorAndDirty', () => {
      control.setValidators(Validators.required);
      control.setValue('');
      expect(control.hasErrorAndDirty('required')).toBeFalsy();
      control.markAsDirty();
      expect(control.hasErrorAndDirty('required')).toBeTruthy();
    });

    it('should setEnable', () => {
      control.setEnable();
      expect(control.enabled).toBe(true);
      control.setEnable(false);
      expect(control.enabled).toBe(false);
    });

    it('should setDisable', () => {
      control.setDisable();
      expect(control.enabled).toBe(false);
      control.setDisable(false);
      expect(control.enabled).toBe(true);
    });

    it('should errorChanges$', () => {
      control.setValidators(Validators.required);
      const spy = jest.fn();
      control.errors$.subscribe(spy);
      expect(spy).toHaveBeenCalledWith({required: true});
      control.patchValue(null);
      control.patchValue('');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({required: true});
      control.patchValue('Test');
      expect(spy).toHaveBeenCalledWith(null);
    });

  });

});
