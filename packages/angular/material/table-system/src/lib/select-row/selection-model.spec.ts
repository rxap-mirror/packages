import { SelectionModel } from './selection-model';

describe('SelectionModel', () => {
  it('selects, deselects and toggles in multiple mode', () => {
    const m = new SelectionModel<number>(true);
    const changes: any[] = [];
    m.changed.subscribe((c) => changes.push(c));
    m.select(1, 2);
    expect(m.selected).toEqual([1, 2]);
    expect(m.isSelected(1)).toBe(true);
    m.deselect(1);
    expect(m.selected).toEqual([2]);
    m.toggle(2);
    expect(m.isEmpty()).toBe(true);
    m.toggle(3);
    expect(m.hasValue()).toBe(true);
    expect(m.isMultipleSelection()).toBe(true);
    expect(changes.length).toBe(4);
    expect(changes[0].added).toEqual([1, 2]);
  });

  it('keeps one value in single mode', () => {
    const m = new SelectionModel<number>(false);
    m.select(1);
    m.select(2);
    expect(m.selected).toEqual([2]);
    expect(() => m.select(1, 2)).toThrow();
  });

  it('supports initial values without emitting', () => {
    const spy = vi.fn();
    const m = new SelectionModel<number>(true, [1, 2]);
    m.changed.subscribe(spy);
    expect(m.selected).toEqual([1, 2]);
    expect(spy).not.toHaveBeenCalled();
    const single = new SelectionModel<number>(false, [1, 2]);
    expect(single.selected).toEqual([1]);
  });

  it('sets the selection and clears', () => {
    const m = new SelectionModel<number>(true, [1]);
    m.setSelection(2, 3);
    expect(m.selected).toEqual([2, 3]);
    m.clear();
    expect(m.selected).toEqual([]);
  });

  it('does not emit when emitChanges is false', () => {
    const spy = vi.fn();
    const m = new SelectionModel<number>(true, undefined, false);
    m.changed.subscribe(spy);
    m.select(1);
    expect(spy).not.toHaveBeenCalled();
  });

  it('uses compareWith and sorts', () => {
    const m = new SelectionModel<{ id: number }>(true, undefined, true, (a, b) => a.id === b.id);
    const one = { id: 1 };
    m.select({ id: 2 }, one);
    expect(m.isSelected({ id: 1 })).toBe(true);
    m.deselect(one);
    expect(m.isSelected({ id: 1 })).toBe(false);
    m.select({ id: 1 });
    m.sort((a, b) => a.id - b.id);
    expect(m.selected.map((s) => s.id)).toEqual([1, 2]);
  });
});
