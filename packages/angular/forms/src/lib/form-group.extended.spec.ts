import { of } from 'rxjs';
import { RxapFormArray } from './form-array';
import { RxapFormControl } from './form-control';
import { RxapFormGroup } from './form-group';

const ctl = (value: any, controlId: string) => new RxapFormControl<any>(value, { controlId });

const emptyArray = (controls: any[], controlId = 'arr') => new RxapFormArray<any>(controls, {
  controlId,
  builder: () => {
    throw new Error('not used');
  },
  controlInsertedFn: () => undefined,
  controlRemovedFn: () => undefined,
});

describe('RxapFormGroup (extended)', () => {

  describe('rxapFormDefinition', () => {

    it('returns the definition of a root group', () => {
      const group = new RxapFormGroup<any>({}, { controlId: 'root' });
      expect(group.rxapFormDefinition).toBeUndefined();

      const definition = { rxapFormGroup: group };
      Reflect.set(group, '_rxapFormDefinition', definition);

      expect(group.rxapFormDefinition).toBe(definition);
    });

    it('prefers the own definition of a nested group', () => {
      const child = new RxapFormGroup<any>({}, { controlId: 'child' });
      const root = new RxapFormGroup<any>({ child }, { controlId: 'root' });
      const rootDefinition = { rxapFormGroup: root };
      const childDefinition = { rxapFormGroup: child };
      Reflect.set(root, '_rxapFormDefinition', rootDefinition);

      expect(child.rxapFormDefinition).toBe(rootDefinition);

      Reflect.set(child, '_rxapFormDefinition', childDefinition);

      expect(child.rxapFormDefinition).toBe(childDefinition);
    });

    it('is undefined for a nested group if no ancestor has a definition', () => {
      const child = new RxapFormGroup<any>({}, { controlId: 'child' });
      new RxapFormGroup<any>({ child }, { controlId: 'root' });

      expect(child.rxapFormDefinition).toBeUndefined();
    });

  });

  describe('readonly', () => {

    it('emits a state change on the child controls when the flag is set', () => {
      const name = ctl('n', 'name');
      const spy = vi.fn();
      name.stateChanges.subscribe(spy);
      const nested = new RxapFormGroup<any>({}, { controlId: 'nested' });
      const group = new RxapFormGroup<any>({ name, nested }, { controlId: 'root' });

      expect(group.readonly).toBe(false);
      group.readonly = true;

      expect(group.readonly).toBe(true);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('inherits the readonly flag from the parent', () => {
      const child = new RxapFormGroup<any>({}, { controlId: 'child' });
      const root = new RxapFormGroup<any>({ child }, { controlId: 'root' });

      root.readonly = true;

      expect(child.readonly).toBe(true);
    });

  });

  describe('control path', () => {

    it('uses the control id for a group directly below a root with a control path', () => {
      const group = new RxapFormGroup<any>({}, { controlId: 'item' });
      const root = emptyArray([ group ], 'list');

      expect(root.controlPath).toBe('list');
      expect(group.controlPath).toBe('item');
      expect(group.fullControlPath).toBe('list.item');
    });

    it('joins the path of deeper groups', () => {
      const leaf = new RxapFormGroup<any>({}, { controlId: 'leaf' });
      const item = new RxapFormGroup<any>({ leaf }, { controlId: 'item' });
      emptyArray([ item ], 'list');

      expect(leaf.controlPath).toBe('item.leaf');
      expect(leaf.fullControlPath).toBe('list.item.leaf');
    });

    it('has an empty control path and the control id as full path without parent', () => {
      const group = new RxapFormGroup<any>({}, { controlId: 'root' });

      expect(group.controlPath).toBe('');
      expect(group.fullControlPath).toBe('root');
    });

  });

  describe('control management', () => {

    it('adds, checks and removes controls', () => {
      const group = new RxapFormGroup<any>({ a: ctl('1', 'a') }, { controlId: 'root' });

      group.addControl('b', ctl('2', 'b'));
      expect(group.contains('b')).toBe(true);
      expect(group.value).toEqual({ a: '1', b: '2' });

      group.removeControl('a');
      expect(group.contains('a')).toBe(false);
      expect(group.value).toEqual({ b: '2' });
    });

    it('replaces a control', () => {
      const group = new RxapFormGroup<any>({ a: ctl('1', 'a') }, { controlId: 'root' });
      const replacement = ctl('9', 'a');

      group.setControl('a', replacement);

      expect(group.getControl('a')).toBe(replacement);
      expect(group.value).toEqual({ a: '9' });
    });

  });

  describe('patchValue', () => {

    it('ignores null and undefined', () => {
      const group = new RxapFormGroup<any>({ a: ctl('1', 'a') }, { controlId: 'root' });

      group.patchValue(null as any);
      group.patchValue(undefined as any);

      expect(group.value).toEqual({ a: '1' });
    });

    it('ignores unknown properties', () => {
      const group = new RxapFormGroup<any>({ a: ctl('1', 'a') }, { controlId: 'root' });

      group.patchValue({ a: '2', unknown: 'x' });

      expect(group.value).toEqual({ a: '2' });
    });

  });

  describe('validators', () => {

    it('merges validators', () => {
      const group = new RxapFormGroup<any>({ a: ctl('1', 'a') }, {
        controlId: 'root',
        validators: () => ({ first: true }),
      });

      group.mergeValidators(() => ({ second: true }));

      expect(group.errors).toEqual({ first: true, second: true });
    });

    it('merges async validators', () => {
      const group = new RxapFormGroup<any>({ a: ctl('1', 'a') }, { controlId: 'root' });

      group.mergeAsyncValidators((() => of({ asyncError: true })) as any);

      expect(group.errors).toEqual({ asyncError: true });
    });

  });

  describe('mark all', () => {

    it('marks all children as pristine and untouched', () => {
      const name = ctl('n', 'name');
      const group = new RxapFormGroup<any>({ name }, { controlId: 'root' });
      group.markAllAsDirty();
      group.markAllAsTouched();
      expect(name.dirty).toBe(true);

      group.markAllAsPristine();
      group.markAllAsUntouched();

      expect(name.pristine).toBe(true);
      expect(name.untouched).toBe(true);
      expect(group.pristine).toBe(true);
      expect(group.untouched).toBe(true);
    });

  });

});
