import {RxapFormControl} from './form-control';
import {RxapFormArray} from './form-array';
import {
  Subject,
  of,
} from 'rxjs';

describe('@rxap/forms', () => {

  describe('FormArray', () => {

    let control: RxapFormArray;

    beforeEach(() => {

      control = new RxapFormArray<string>([
        new RxapFormControl('', {controlId: 'control1'}),
        new RxapFormControl('', {controlId: 'control1'}),
      ], {
        controlId: 'test',
        builder: () => {
          throw new Error();
        },
        controlInsertedFn: () => {
        },
        controlRemovedFn: () => {
        },
      });

    });

    it('should valueChanges$', () => {
      const spy = jest.fn();
      control.value$.subscribe(spy);
      expect(spy).toHaveBeenCalledWith(['', '']);
      control.patchValue(['1', '2']);
      expect(spy).toHaveBeenCalledWith(['1', '2']);
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

    it('should select$', () => {
      const spy = jest.fn();
      control.select(state => state[0]).subscribe(spy);
      expect(spy).toHaveBeenCalledWith('');
      control.patchValue(['1', '2']);
      expect(spy).toHaveBeenCalledWith('1');
      control.patchValue(['1', '2']);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should setValue', () => {

      control.setValue(of(['1', '2']));
      expect(control.value).toEqual(['1', '2']);
      control.setValue(['3', '4']);
      expect(control.value).toEqual(['3', '4']);
    });

    it('should patchValue', () => {

      control.patchValue(of(['1', '2']));
      expect(control.value).toEqual(['1', '2']);
      control.patchValue(['5', '4']);
      expect(control.value).toEqual(['5', '4']);
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

    describe('with error', () => {

      beforeEach(() => {

        const errorFn = (group: any) => {
          return {isInvalid: true};
        };

        control = new RxapFormArray<string>([
          new RxapFormControl('', {controlId: 'control1'}),
          new RxapFormControl('', {controlId: 'control1'}),
        ], {
          validators: [errorFn], controlId: 'test',
          controlRemovedFn: () => {
          },
          controlInsertedFn: () => {
          },
          builder: () => {
            throw new Error();
          },
        });

      });

      it('should hasErrorAndTouched', () => {
        expect(control.hasErrorAndTouched('isInvalid')).toBeFalsy();
        control.markAsTouched();
        expect(control.hasErrorAndTouched('isInvalid')).toBeTruthy();
      });

      it('should hasErrorAndDirty', () => {
        expect(control.hasErrorAndDirty('isInvalid')).toBeFalsy();
        control.markAsDirty();
        expect(control.hasErrorAndDirty('isInvalid')).toBeTruthy();
      });

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
      const spy = jest.fn();
      const validator = (_control: RxapFormArray) => (_control.length < 4 ? {minimum: 4} : null);
      control.setValidators(validator as any);
      control.errors$.subscribe(spy);
      expect(spy).toHaveBeenCalledWith({minimum: 4});
      control.push(new RxapFormControl('Name', {controlId: 'control1'}));
      control.push(new RxapFormControl('Phone', {controlId: 'control1'}));
      expect(spy).toHaveBeenCalledWith(null);
    });

  });

});
