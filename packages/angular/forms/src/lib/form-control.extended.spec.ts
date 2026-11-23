import { of, Subject } from 'rxjs';
import { RxapFormArray } from './form-array';
import { RxapFormControl } from './form-control';
import { RxapFormGroup } from './form-group';

describe('RxapFormControl (extended)', () => {

  describe('rxapFormDefinition', () => {

    it('resolves the form definition through the parent', () => {
      const control = new RxapFormControl<any>('v', { controlId: 'c' });
      const group = new RxapFormGroup<any>({ c: control }, { controlId: 'root' });
      const definition = { rxapFormGroup: group };
      Reflect.set(group, '_rxapFormDefinition', definition);

      expect(control.rxapFormDefinition).toBe(definition);
    });

  });

  describe('readonly', () => {

    it('applies the readonly option and emits the state change', () => {
      const control = new RxapFormControl<any>('v', { controlId: 'c', readonly: true });
      const spy = vi.fn();

      expect(control.readonly).toBe(true);
      control.stateChanges.subscribe(spy);
      control.readonly = false;

      expect(control.readonly).toBe(false);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('emits the readonly state with readonly$', () => {
      const control = new RxapFormControl<any>('v', { controlId: 'c' });
      const spy = vi.fn();
      control.readonly$.subscribe(spy);

      expect(spy).toHaveBeenLastCalledWith(false);
      control.readonly = true;
      expect(spy).toHaveBeenLastCalledWith(true);
      control.readonly = true;
      expect(spy).toHaveBeenCalledTimes(2);
      control.readonly = false;
      expect(spy).toHaveBeenLastCalledWith(false);
    });

    it('follows the readonly state of the parent', () => {
      const control = new RxapFormControl<any>('v', { controlId: 'c' });
      const group = new RxapFormGroup<any>({ c: control }, { controlId: 'root' });

      group.readonly = true;

      expect(control.readonly).toBe(true);
    });

  });

  describe('control paths', () => {

    it('has the control id as path without a parent', () => {
      const control = new RxapFormControl<any>('v', { controlId: 'c' });

      expect(control.controlPath).toBe('c');
      expect(control.fullControlPath).toBe('c');
    });

    it('uses the control id for a control directly below a root with a control path', () => {
      const control = new RxapFormControl<any>('v', { controlId: 'c' });
      new RxapFormArray<any>([ control ], {
        controlId: 'list',
        builder: () => control,
        controlInsertedFn: () => undefined,
        controlRemovedFn: () => undefined,
      });

      expect(control.controlPath).toBe('c');
      expect(control.fullControlPath).toBe('list.c');
    });

  });

  describe('setValue / patchValue with observables', () => {

    it('sets the value and calls the registered set value callbacks', () => {
      const control = new RxapFormControl<string>('init', { controlId: 'c' });
      const callback = vi.fn();
      control.registerOnSetValue(callback);
      const subject = new Subject<string>();

      const subscription = control.setValue(subject);
      subject.next('first');

      expect(control.value).toBe('first');
      expect(callback).toHaveBeenCalledWith('first', undefined);

      subscription.unsubscribe();
      subject.next('second');
      expect(control.value).toBe('first');
    });

    it('stores the initial state when patching an observable with setInitialValue', () => {
      const control = new RxapFormControl<string>('init', { controlId: 'c' });

      control.patchValue(of('loaded'), { setInitialValue: true });

      expect(control.value).toBe('loaded');
      expect(control.initialState).toBe('loaded');
    });

    it('does not store the initial state when patching an observable without setInitialValue', () => {
      const control = new RxapFormControl<string>('init', { controlId: 'c' });

      control.patchValue(of('loaded'));

      expect(control.value).toBe('loaded');
      expect(control.initialState).toBe('init');
    });

  });

  describe('reset', () => {

    it('resets to the value returned by a state function', () => {
      const control = new RxapFormControl<string>('init', { controlId: 'c' });
      control.setValue('changed');

      control.reset((() => 'from-function') as any);

      expect(control.value).toBe('from-function');
    });

    it('resets to the initial state if none is passed', () => {
      const control = new RxapFormControl<string>('init', { controlId: 'c' });
      control.setValue('changed');

      control.reset();

      expect(control.value).toBe('init');
    });

    it('resolves a function as initial state on reset', () => {
      const control = new RxapFormControl<string>((() => 'lazy') as any, { controlId: 'c' });
      control.setValue('changed');

      control.reset();

      expect(control.value).toBe('lazy');
    });

  });

  describe('validators', () => {

    it('merges async validators', () => {
      const control = new RxapFormControl<string>('v', { controlId: 'c' });

      control.mergeAsyncValidators((() => of({ asyncError: true })) as any);

      expect(control.errors).toEqual({ asyncError: true });
    });

    it('sets a single error by key', () => {
      const control = new RxapFormControl<string>('v', { controlId: 'c' });

      control.setError('custom', { detail: 1 });

      expect(control.hasError('custom')).toBe(true);
      expect(control.getError('custom')).toEqual({ detail: 1 });
      expect(control.invalid).toBe(true);
    });

  });

});
