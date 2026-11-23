import { FormArrayOptions } from './model';
import { RxapFormArray } from './form-array';
import { RxapFormControl } from './form-control';
import { RxapFormGroup } from './form-group';
import { of, Subject } from 'rxjs';

const ctl = (value: any, controlId: string) => new RxapFormControl<any>(value, { controlId });

function createArray(
  controls: any[] = [ ctl('a', '0'), ctl('b', '1') ],
  options: Partial<FormArrayOptions> = {},
  controlId = 'arr',
): RxapFormArray<any> {
  return new RxapFormArray<any>(controls, {
    controlId,
    builder: (state: any, o: { controlId: string }) => ctl(state, o.controlId),
    controlInsertedFn: () => undefined,
    controlRemovedFn: () => undefined,
    ...options,
  });
}

describe('RxapFormArray (extended)', () => {

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => vi.restoreAllMocks());

  describe('readonly', () => {

    it('emits a state change on every child control when the readonly flag is set', () => {
      const first = ctl('a', '0');
      const second = ctl('b', '1');
      const firstSpy = vi.fn();
      const secondSpy = vi.fn();
      first.stateChanges.subscribe(firstSpy);
      second.stateChanges.subscribe(secondSpy);
      const array = createArray([ first, second ]);

      expect(array.readonly).toBe(false);
      array.readonly = true;

      expect(array.readonly).toBe(true);
      expect(firstSpy).toHaveBeenCalledTimes(1);
      expect(secondSpy).toHaveBeenCalledTimes(1);
    });

    it('inherits the readonly flag of the parent', () => {
      const array = createArray();
      const parent = new RxapFormGroup<any>({ arr: array }, { controlId: 'root' });

      expect(array.readonly).toBe(false);
      parent.readonly = true;
      expect(array.readonly).toBe(true);
    });

  });

  describe('rxapFormDefinition', () => {

    it('resolves the form definition of the parent', () => {
      const array = createArray();
      const parent = new RxapFormGroup<any>({ arr: array }, { controlId: 'root' });
      const definition = { rxapFormGroup: parent };
      Reflect.set(parent, '_rxapFormDefinition', definition);

      expect(array.rxapFormDefinition).toBe(definition);
    });

  });

  describe('control paths', () => {

    it('builds the control path and the full control path along nested arrays', () => {
      const innermost = createArray([], {}, 'innermost');
      const inner = createArray([ innermost ], {}, 'inner');
      const outer = createArray([ inner ], {}, 'outer');

      expect(outer.controlPath).toBe('outer');
      expect(outer.fullControlPath).toBe('outer');
      expect(inner.controlPath).toBe('inner');
      expect(inner.fullControlPath).toBe('outer.inner');
      expect(innermost.controlPath).toBe('inner.innermost');
      expect(innermost.fullControlPath).toBe('outer.inner.innermost');
    });

    it('falls back to the control id for an array without a parent', () => {
      const array = createArray();

      expect(array.controlPath).toBe('arr');
      expect(array.fullControlPath).toBe('arr');
    });

  });

  describe('insert / push / setControl', () => {

    it('inserts a control at the given index and warns about the usage', () => {
      const array = createArray();

      array.insert(1, ctl('x', 'x'));

      expect(console.warn).toHaveBeenCalledWith('It is not recommend to use the FormArray.insert method');
      expect(array.value).toEqual([ 'a', 'x', 'b' ]);
    });

    it('replaces a control and warns about the usage', () => {
      const array = createArray();
      const replacement = ctl('x', '0');

      array.setControl(0, replacement);

      expect(console.warn).toHaveBeenCalledWith('It is not recommend to use the FormArray.setControl method');
      expect(array.at(0)).toBe(replacement);
      expect(array.value).toEqual([ 'x', 'b' ]);
    });

  });

  describe('removeAt', () => {

    it('removes the control itself when the remove callback has not touched the controls', () => {
      const removed = vi.fn();
      const array = createArray([ ctl('a', '0'), ctl('b', '1') ], { controlRemovedFn: removed });

      array.removeAt(0);

      expect(removed).toHaveBeenCalledWith(0);
      expect(console.warn).toHaveBeenCalledWith('It is not recommend to use the FormArray.removeAt method');
      expect(array.value).toEqual([ 'b' ]);
    });

    it('only updates the value when the remove callback has already removed the control', () => {
      const controls = [ ctl('a', '0'), ctl('b', '1') ];
      const array = createArray(controls, { controlRemovedFn: (index) => controls.splice(index, 1) });
      const spy = vi.fn();
      array.valueChanges.subscribe(spy);

      array.removeAt(1);

      expect(array.length).toBe(1);
      expect(array.value).toEqual([ 'a' ]);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('does not emit a value change if emitEvent is false', () => {
      const controls = [ ctl('a', '0'), ctl('b', '1') ];
      const array = createArray(controls, { controlRemovedFn: (index) => controls.splice(index, 1) });
      const spy = vi.fn();
      array.valueChanges.subscribe(spy);

      array.removeAt(0, { emitEvent: false });

      expect(array.value).toEqual([ 'b' ]);
      expect(spy).not.toHaveBeenCalled();
    });

  });

  describe('insertAt', () => {

    it('appends a control built by the builder and passes the index as control id', () => {
      const builder = vi.fn((state: any, o: { controlId: string }) => ctl(state, o.controlId));
      const inserted = vi.fn();
      const array = createArray([ ctl('a', '0'), ctl('b', '1') ], { builder, controlInsertedFn: inserted });

      array.insertAt(undefined, 'c');

      expect(builder).toHaveBeenCalledWith('c', { controlId: '2' });
      expect(inserted).toHaveBeenCalledWith(2, expect.any(RxapFormControl));
      expect(array.value).toEqual([ 'a', 'b', 'c' ]);
    });

    it('shifts the control ids of the following controls when inserting in the middle', () => {
      const array = createArray([ ctl('a', '0'), ctl('b', '1') ]);

      array.insertAt(0, 'x');

      expect(array.value).toEqual([ 'x', 'a', 'b' ]);
      expect((array.at(1) as RxapFormControl).controlId).toBe('1');
      expect((array.at(2) as RxapFormControl).controlId).toBe('2');
    });

    it('registers a control that was already added to the controls by the insert callback', () => {
      const controls: any[] = [ ctl('a', '0'), ctl('b', '1') ];
      const array = createArray(controls, {
        controlInsertedFn: (index, control) => controls.splice(index, 0, control),
      });
      const spy = vi.fn();
      array.valueChanges.subscribe(spy);

      array.insertAt(2, 'c');

      expect(array.length).toBe(3);
      expect(array.at(2).parent).toBe(array);
      expect(array.value).toEqual([ 'a', 'b', 'c' ]);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('does not emit if emitEvent is false', () => {
      const controls: any[] = [ ctl('a', '0') ];
      const array = createArray(controls, {
        controlInsertedFn: (index, control) => controls.splice(index, 0, control),
      });
      const spy = vi.fn();
      array.valueChanges.subscribe(spy);

      array.insertAt(1, 'c', { emitEvent: false });

      expect(array.value).toEqual([ 'a', 'c' ]);
      expect(spy).not.toHaveBeenCalled();
    });

    it('inserts the form group of a definition returned by the builder', () => {
      const group = new RxapFormGroup<any>({ name: ctl('n', 'name') }, { controlId: '0' });
      const array = createArray([], {
        builder: () => ({ rxapFormGroup: group }) as any,
      });

      array.insertAt(undefined, undefined);

      expect(array.length).toBe(1);
      expect(array.at(0)).toBe(group);
      expect(group.parent).toBe(array);
    });

    it('registers the form group of a definition that was already added by the insert callback', () => {
      const group = new RxapFormGroup<any>({ name: ctl('n', 'name') }, { controlId: '0' });
      const controls: any[] = [];
      const array = createArray(controls, {
        builder: () => ({ rxapFormGroup: group }) as any,
        controlInsertedFn: (index, definition) => controls.splice(index, 0, (definition as any).rxapFormGroup),
      });

      array.insertAt(undefined, undefined);

      expect(array.length).toBe(1);
      expect(group.parent).toBe(array);
      expect(array.value).toEqual([ { name: 'n' } ]);
    });

  });

  describe('validators', () => {

    it('merges validators', () => {
      const array = createArray();
      array.setValidators((c: any) => (c.length < 3 ? { minLength: true } : null));
      array.mergeValidators((c: any) => (c.length > 1 ? { tooMany: true } : null));

      expect(array.errors).toEqual({ minLength: true, tooMany: true });
    });

    it('merges async validators', () => {
      const array = createArray();
      array.mergeAsyncValidators((() => of({ asyncError: true })) as any);

      expect(array.errors).toEqual({ asyncError: true });
      expect(array.status).toBe('INVALID');
    });

  });

  describe('markAll', () => {

    it('marks all children as pristine and untouched', () => {
      const array = createArray();
      array.markAllAsDirty();
      array.markAllAsTouched();
      expect(array.dirty).toBe(true);
      expect(array.at(0).dirty).toBe(true);
      expect(array.at(0).touched).toBe(true);

      array.markAllAsPristine();
      array.markAllAsUntouched();

      expect(array.pristine).toBe(true);
      expect(array.untouched).toBe(true);
      expect(array.at(0).pristine).toBe(true);
      expect(array.at(1).pristine).toBe(true);
      expect(array.at(0).untouched).toBe(true);
      expect(array.at(1).untouched).toBe(true);
    });

  });

  describe('patchValue', () => {

    it('ignores null and undefined', () => {
      const array = createArray();

      array.patchValue(null as any);
      array.patchValue(undefined as any);

      expect(array.value).toEqual([ 'a', 'b' ]);
    });

    it('removes surplus controls when strict is set', () => {
      const controls: any[] = [ ctl('a', '0'), ctl('b', '1'), ctl('c', '2') ];
      const removed = vi.fn();
      const array = createArray(controls, {
        controlRemovedFn: (index) => {
          removed(index);
          controls.splice(index, 1);
        },
      });

      array.patchValue([ 'x' ], { strict: true });

      expect(removed.mock.calls).toEqual([ [ 2 ], [ 1 ] ]);
      expect(array.value).toEqual([ 'x' ]);
    });

    it('keeps surplus controls when strict is not set', () => {
      const array = createArray();

      array.patchValue([ 'x' ]);

      expect(array.value).toEqual([ 'x', 'b' ]);
    });

    it('creates missing controls when coerce is set', () => {
      const controls: any[] = [ ctl('a', '0') ];
      const array = createArray(controls, {
        controlInsertedFn: (index, control) => controls.splice(index, 0, control),
      });

      array.patchValue([ 'x', 'y', 'z' ], { coerce: true });

      expect(array.value).toEqual([ 'x', 'y', 'z' ]);
      expect(array.length).toBe(3);
    });

    it('does not create missing controls when coerce is not set', () => {
      const array = createArray();

      array.patchValue([ 'x', 'y', 'z' ]);

      expect(array.value).toEqual([ 'x', 'y' ]);
    });

    it('patches the value of an observable', () => {
      const array = createArray();
      const subject = new Subject<string[]>();

      const subscription = array.patchValue(subject);
      subject.next([ 'p', 'q' ]);
      subscription!.unsubscribe();
      subject.next([ 'r', 's' ]);

      expect(array.value).toEqual([ 'p', 'q' ]);
    });

  });

  describe('error helpers', () => {

    it('reads and sets errors', () => {
      const array = createArray();

      array.setErrors({ custom: 'value' });

      expect(array.hasError('custom')).toBe(true);
      expect(array.getError('custom')).toBe('value');
      expect(array.hasError('other')).toBe(false);
    });

    it('proxies the typed accessors', () => {
      const array = createArray();
      array.setValue([ '1', '2' ]);

      expect(array.getRawValue()).toEqual([ '1', '2' ]);
      array.reset([ 'r', 's' ]);
      expect(array.value).toEqual([ 'r', 's' ]);
    });

  });

});
