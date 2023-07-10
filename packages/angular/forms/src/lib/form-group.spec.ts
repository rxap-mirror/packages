import {
  of,
  Subject,
} from 'rxjs';
import { RxapFormGroup } from './form-group';
import { RxapFormControl } from './form-control';

interface Person {
  name: string | null;
  phone: {
    num: number | null;
    prefix: number | null;
  };
}

describe('FormGroup', () => {

  let control: RxapFormGroup;

  beforeEach(() => {

    control = new RxapFormGroup<Person>(
      {
        name: new RxapFormControl(null, { controlId: 'name' }),
        phone: new RxapFormGroup(
          {
            num: new RxapFormControl(null, { controlId: 'num' }),
            prefix: new RxapFormControl(null, { controlId: 'prefix' }),
          },
          { controlId: 'phone' },
        ),
      },
      {
        validators: () => ({ isInvalid: true }),
        controlId: 'person',
      },
    );

  });

  it('should valueChanges$', () => {
    const spy = jest.fn();
    control.value$.subscribe(spy);
    expect(spy)
      .toHaveBeenCalledWith({
        name: null,
        phone: {
          num: null,
          prefix: null,
        },
      });
    control.patchValue({
      name: 'changed',
    });
    expect(spy)
      .toHaveBeenCalledWith({
        name: 'changed',
        phone: {
          num: null,
          prefix: null,
        },
      });
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
    expect(spy).toHaveBeenCalledWith('INVALID');
    control.disable();
    expect(spy).toHaveBeenCalledWith('DISABLED');
  });

  it('should select$', () => {
    const spy = jest.fn();
    control.select(state => state.name).subscribe(spy);
    expect(spy).toHaveBeenCalledWith(null);
    control.patchValue({
      name: 'changed',
    });
    expect(spy).toHaveBeenCalledWith('changed');
    control.patchValue({
      name: 'changed',
    });
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should setValue', () => {

    control.setValue(
      of({
        name: 'a',
        phone: {
          num: 1,
          prefix: 2,
        },
      }),
    );
    expect(control.value).toEqual({
      name: 'a',
      phone: {
        num: 1,
        prefix: 2,
      },
    });

    control.setValue({
      name: 'd',
      phone: {
        num: 1,
        prefix: 2,
      },
    });
    expect(control.value).toEqual({
      name: 'd',
      phone: {
        num: 1,
        prefix: 2,
      },
    });
  });

  it('should patchValue', () => {

    control.patchValue(
      of({
        name: 'patched',
      }),
    );

    expect(control.value).toEqual({
      name: 'patched',
      phone: {
        num: null,
        prefix: null,
      },
    });

    control.patchValue({
      name: 'dd',
      phone: {
        num: 1,
        prefix: 2,
      },
    });

    expect(control.value).toEqual({
      name: 'dd',
      phone: {
        num: 1,
        prefix: 2,
      },
    });
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
    subject.next({ someError: true });
    expect(control.errors).toEqual({ someError: true });
    subject.next(null);
    expect(control.errors).toEqual(null);
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

  it('should getControl', () => {
    const nameControl = control.getControl('name');
    expect(nameControl).toBeInstanceOf(RxapFormControl);
    const numControl = control.getControl('phone', 'num');
    expect(numControl).toBeInstanceOf(RxapFormControl);
  });

  it('should errorChanges$', () => {
    const validator = (_control: RxapFormGroup<Person>) =>
      _control.getRawValue().name === 'Test' ? { invalidName: true } : null;
    control.setValidators(validator as any);
    const spy = jest.fn();
    control.errors$.subscribe(spy);
    expect(spy).toHaveBeenCalledWith(null);
    control.patchValue({ name: 'Test' });
    expect(spy).toHaveBeenCalledWith({ invalidName: true });
  });
});
