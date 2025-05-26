import { ElementExtends } from '@rxap/xml-parser';
import { getExtendedTypes } from './get-extended-types';

describe('getExtendedTypes', () => {

  it('should return empty list', () => {

    class Root {}

    expect(getExtendedTypes(Root)).toHaveLength(0);

  });

  it('should return one extended type', () => {

    class Root {}

    @ElementExtends(Root)
    class Child extends Root {}

    expect(getExtendedTypes(Root)).toEqual([ Child ]);

  });

  it('should return multiple extended types', () => {

    class Root {}

    @ElementExtends(Root)
    class ChildA extends Root {}

    @ElementExtends(Root)
    class ChildB extends Root {}

    @ElementExtends(Root)
    class ChildC extends Root {}

    expect(getExtendedTypes(Root)).toEqual([ ChildA, ChildB, ChildC ]);

  });

  it('should return sub-sub type', () => {

    class Root {}

    @ElementExtends(Root)
    class Child extends Root {}

    @ElementExtends(Child)
    class SubChild extends Child {}

    expect(getExtendedTypes(Root)).toHaveLength(2);
    expect(getExtendedTypes(Root)).toEqual([ Child, SubChild ]);

  })

  it('should return multiple sub-sub type', () => {

    class Root {}

    @ElementExtends(Root)
    class Child extends Root {}

    @ElementExtends(Child)
    class SubChildA extends Child {}

    @ElementExtends(Child)
    class SubChildB extends Child {}

    @ElementExtends(Child)
    class SubChildC extends Child {}

    expect(getExtendedTypes(Root)).toHaveLength(4);
    expect(getExtendedTypes(Root)).toEqual([ Child, SubChildA, SubChildB, SubChildC ]);

  })

  it('should return sub-sub-sub type', () => {

    class Root {}

    @ElementExtends(Root)
    class Child extends Root {}

    @ElementExtends(Child)
    class SubChild extends Child {}

    @ElementExtends(SubChild)
    class SubSubChild extends SubChild {}

    expect(getExtendedTypes(Root)).toHaveLength(3);
    expect(getExtendedTypes(Root)).toEqual([ Child, SubChild, SubSubChild ]);

  })

});
