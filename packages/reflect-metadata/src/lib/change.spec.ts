import {
  HasOnChangeMethod,
  hasOnChangeMethod,
  PropertyChange,
  ProxyChangeDetection,
  RxapDetectChanges,
} from './change';

describe('change detection', () => {
  class Model {
    initialized?: boolean;
    changes: PropertyChange[] = [];

    @RxapDetectChanges name = 'a';
    @RxapDetectChanges nested: any = { x: 1 };
    untracked = 0;

    rxapOnPropertyChange(change: PropertyChange) {
      this.changes.push(change);
    }
  }

  it('HasOnChangeMethod checks for the callback', () => {
    expect(HasOnChangeMethod({ rxapOnPropertyChange() {} })).toBe(true);
    expect(HasOnChangeMethod({ rxapOnPropertyChange: 1 })).toBe(false);
    expect(HasOnChangeMethod({})).toBeFalsy();
    expect(hasOnChangeMethod).toBe(HasOnChangeMethod);
  });

  it('reports changes of decorated properties', () => {
    const m = ProxyChangeDetection(new Model());
    m.name = 'b';
    expect(m.changes).toEqual([{ propertyKey: 'name', currentValue: 'b', previousValue: 'a' }]);
    expect(m.name).toBe('b');
  });

  it('ignores untracked properties and unchanged values', () => {
    const m = ProxyChangeDetection(new Model());
    m.untracked = 5;
    m.name = 'a';
    m.nested = { x: 1 };
    expect(m.changes).toEqual([]);
    m.nested = { x: 2 };
    expect(m.changes).toHaveLength(1);
  });

  it('does not report changes before the instance is initialized', () => {
    const model = new Model();
    model.initialized = false;
    const m = ProxyChangeDetection(model);
    m.name = 'b';
    expect(m.changes).toEqual([]);
    m.initialized = true;
    m.name = 'c';
    expect(m.changes).toHaveLength(1);
  });

  it('works for instances without a callback', () => {
    class Plain {
      @RxapDetectChanges value = 1;
    }
    const p = ProxyChangeDetection(new Plain());
    expect(() => (p.value = 2)).not.toThrow();
    expect(p.value).toBe(2);
  });
});
