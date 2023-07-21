import { EachProperty } from './each-property';

describe('eachProperty function', () => {
  it('should correctly iterate over properties', () => {
    const obj = {
      a: 1,
      b: {
        c: 2,
        d: [ 3, 4, 5 ],
      },
    };

    const results = Array.from(EachProperty(obj));

    expect(results).toEqual([
      {
        value: 1,
        key: 'a',
        propertyPath: 'a',
        isObject: false,
        isArray: false,
        isPrimitive: true,
        parent: null,
      },
      {
        value: obj.b,
        key: 'b',
        propertyPath: 'b',
        isObject: true,
        isArray: false,
        isPrimitive: false,
        parent: null,
      },
      {
        value: 2,
        key: 'c',
        propertyPath: 'b.c',
        isObject: false,
        isArray: false,
        isPrimitive: true,
        parent: obj.b,
      },
      {
        value: obj.b.d,
        key: 'd',
        propertyPath: 'b.d',
        isObject: false,
        isArray: true,
        isPrimitive: false,
        parent: obj.b,
      },
      {
        value: 3,
        key: '0',
        propertyPath: 'b.d.0',
        isObject: false,
        isArray: false,
        isPrimitive: true,
        parent: obj.b.d,
      },
      {
        value: 4,
        key: '1',
        propertyPath: 'b.d.1',
        isObject: false,
        isArray: false,
        isPrimitive: true,
        parent: obj.b.d,
      },
      {
        value: 5,
        key: '2',
        propertyPath: 'b.d.2',
        isObject: false,
        isArray: false,
        isPrimitive: true,
        parent: obj.b.d,
      },
    ]);
  });
});
