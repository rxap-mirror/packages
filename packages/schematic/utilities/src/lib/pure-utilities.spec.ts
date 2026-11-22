import { Chunk } from './array/chunk';
import { GroupBy } from './array/group-by';
import { unique } from './array/unique';
import { coerceArray } from './coerce/array';
import { coerceBoolean } from './coerce/boolean';
import { coerceString } from './coerce/string';
import { IsFunction } from './function/is-function';
import { deepMerge } from './deep-merge';
import {
  AssertDefined,
  AssertDefinedAndNotNull,
  IsDefined,
  IsDefinedAndNotNull,
  IsEmpty,
  IsNotEmpty,
  IsUndefined,
  IsUndefinedOrNull,
} from './is-defined';
import { IsNotNull, IsNull } from './is-null';
import {
  DeleteEmptyProperties,
  DeleteNullProperties,
  DeleteUndefinedProperties,
} from './object/cleanup';
import { CoerceProperty } from './object/coerce-property';
import { DeleteProperties } from './object/delete-properties';
import {
  AssertObject,
  AssertRecord,
  IsObject,
  IsRecord,
} from './object/is-object';
import { hasProperty } from './has-property';
import { Required } from './required';
import { camelize } from './strings/camelize';
import { capitalize } from './strings/capitalize';
import { classify } from './strings/classify';
import { CoerceSuffix } from './strings/coerce-suffix';
import { dasherize } from './strings/dasherize';
import { decamelize } from './strings/decamelize';
import { levenshtein } from './strings/levenshtein';
import { underscore } from './strings/underscore';

describe('strings', () => {
  it('camelize', () => {
    expect(camelize('innerHTML')).toBe('innerHTML');
    expect(camelize('action_name')).toBe('actionName');
    expect(camelize('css-class-name')).toBe('cssClassName');
    expect(camelize('my favorite items')).toBe('myFavoriteItems');
    expect(camelize('My Favorite Items')).toBe('myFavoriteItems');
    expect(camelize('trailing-')).toBe('trailing');
  });
  it('capitalize / classify', () => {
    expect(capitalize('innerHTML')).toBe('InnerHTML');
    expect(capitalize('')).toBe('');
    expect(classify('action_name')).toBe('ActionName');
    expect(classify('css-class-name')).toBe('CssClassName');
    expect(classify('a.b-c')).toBe('A.BC');
  });
  it('decamelize / dasherize / underscore', () => {
    expect(decamelize('innerHTML')).toBe('inner_html');
    expect(decamelize('actionName')).toBe('action_name');
    expect(dasherize('actionName')).toBe('action-name');
    expect(dasherize('action_name')).toBe('action-name');
    expect(dasherize('my favorite items')).toBe('my-favorite-items');
    expect(dasherize('a/b\\c')).toBe('a-b-c');
    expect(underscore('actionName')).toBe('action_name');
    expect(underscore('css-class-name')).toBe('css_class_name');
    expect(underscore('my favorite items')).toBe('my_favorite_items');
  });
  it('levenshtein', () => {
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', '')).toBe(3);
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(levenshtein('same', 'same')).toBe(0);
  });
  it('CoerceSuffix without regexp merges overlapping suffix', () => {
    expect(CoerceSuffix('foo', '.ts')).toBe('foo.ts');
    expect(CoerceSuffix('foo.ts', '.ts')).toBe('foo.ts');
    expect(CoerceSuffix('foo.t', '.ts')).toBe('foo.ts');
  });
  it('CoerceSuffix with regexp', () => {
    expect(CoerceSuffix('foo', '-x', /-x$/)).toBe('foo-x');
    expect(CoerceSuffix('foo-x', '-x', /-x$/)).toBe('foo-x');
  });
});

describe('arrays', () => {
  it('Chunk', () => {
    expect(Chunk([ 1, 2, 3, 4, 5 ], 2)).toEqual([ [ 1, 2 ], [ 3, 4 ], [ 5 ] ]);
    expect(Chunk([], 2)).toEqual([]);
  });
  it('GroupBy', () => {
    const map = GroupBy([ { k: 'a', v: 1 }, { k: 'b', v: 2 }, { k: 'a', v: 3 } ], 'k' as any);
    expect(map.get('a' as any)).toHaveLength(2);
    expect(map.size).toBe(2);
  });
  it('unique', () => {
    expect([ 1, 2, 1, 3, 2 ].filter(unique())).toEqual([ 1, 2, 3 ]);
  });
});

describe('coerce', () => {
  it('coerceArray', () => {
    expect(coerceArray()).toEqual([]);
    expect(coerceArray(null)).toEqual([]);
    expect(coerceArray(1)).toEqual([ 1 ]);
    expect(coerceArray([ 1, 2 ])).toEqual([ 1, 2 ]);
  });
  it('coerceBoolean', () => {
    expect(coerceBoolean(undefined)).toBe(false);
    expect(coerceBoolean(null)).toBe(false);
    expect(coerceBoolean(false)).toBe(false);
    expect(coerceBoolean(0)).toBe(true);
    expect(coerceBoolean('')).toBe(true);
  });
  it('coerceString', () => {
    expect(coerceString(undefined)).toBe('undefined');
    expect(coerceString({ a: 1 })).toBe('{"a":1}');
    expect(coerceString({ a: 1 }, { space: 1 })).toBe('{\n "a": 1\n}');
    expect(coerceString(true)).toBe('true');
    expect(coerceString(false)).toBe('false');
    expect(coerceString(1.2345, { toFixed: 2 })).toBe('1.23');
    expect(coerceString('s')).toBe('s');
    expect(coerceString(() => 1)).toBe('function');
    expect(coerceString(Symbol('x'))).toBe('symbol');
    expect(coerceString(BigInt(5))).toBe('5');
  });
});

describe('type guards', () => {
  it('is-defined helpers', () => {
    expect(IsDefined(0)).toBe(true);
    expect(IsDefined(undefined)).toBe(false);
    expect(IsUndefined(undefined)).toBe(true);
    expect(IsUndefinedOrNull(null)).toBe(true);
    expect(IsUndefinedOrNull(0)).toBe(false);
    expect(IsDefinedAndNotNull(null)).toBe(false);
    expect(IsDefinedAndNotNull('x')).toBe(true);
    expect(IsEmpty('')).toBe(true);
    expect(IsEmpty(undefined)).toBe(true);
    expect(IsEmpty(0)).toBe(false);
    expect(IsNotEmpty('a')).toBe(true);
    expect(IsNull(null)).toBe(true);
    expect(IsNotNull(null)).toBe(false);
  });
  it('assertions', () => {
    expect(() => AssertDefined(undefined, 'c', 'Cls')).toThrow('Value is not defined');
    expect(() => AssertDefined(null, 'c')).not.toThrow();
    expect(() => AssertDefinedAndNotNull(undefined, 'c')).toThrow('not defined or not null');
    expect(() => AssertDefinedAndNotNull(null, 'c')).toThrow('not defined or not null');
    expect(() => AssertDefinedAndNotNull(1, 'c')).not.toThrow();
  });
  it('object guards', () => {
    expect(IsObject({})).toBeTruthy();
    expect(IsObject(null)).toBeFalsy();
    expect(IsObject('s')).toBe(false);
    expect(IsRecord({ a: 1 })).toBe(true);
    expect(IsRecord({})).toBe(true);
    expect(IsRecord(new Date())).toBe(false);
    expect(() => AssertObject(1)).toThrow('not a object instead: \'number\'');
    expect(() => AssertObject(null)).toThrow('null');
    expect(() => AssertObject({})).not.toThrow();
    expect(() => AssertRecord('x')).toThrow('not a record');
    expect(() => AssertRecord({})).not.toThrow();
  });
  it('IsFunction rejects classes', () => {
    expect(IsFunction(() => 1)).toBe(true);
    expect(IsFunction(class A {})).toBe(false);
    expect(IsFunction(function f() { return 1; })).toBe(false);
    expect(IsFunction(1)).toBe(false);
  });
});

describe('object helpers', () => {
  it('cleanup', () => {
    expect(DeleteUndefinedProperties({ a: 1, b: undefined, c: null })).toEqual({ a: 1, c: null });
    expect(DeleteNullProperties({ a: 1, b: undefined, c: null })).toEqual({ a: 1, b: undefined });
    expect(DeleteEmptyProperties({ a: 1, b: undefined, c: null })).toEqual({ a: 1 });
  });
  it('DeleteProperties does not mutate', () => {
    const o = { a: 1, b: 2 };
    expect(DeleteProperties(o, [ 'a' ])).toEqual({ b: 2 });
    expect(o).toEqual({ a: 1, b: 2 });
  });
  it('CoerceProperty creates nested paths without overriding', () => {
    const o: any = { x: { y: 1 } };
    CoerceProperty(o, 'x.y', 2);
    expect(o.x.y).toBe(1);
    CoerceProperty(o, 'x.z.w', 3);
    expect(o.x.z.w).toBe(3);
    CoerceProperty(o, 'top', 'v');
    expect(o.top).toBe('v');
  });
  it('hasProperty', () => {
    expect(hasProperty({ a: { b: 1 } }, 'a.b')).toBe(true);
    expect(hasProperty({ a: { b: 1 } }, 'a.b', 1)).toBe(true);
    expect(hasProperty({ a: { b: 1 } }, 'a.b', 2)).toBe(false);
    expect(hasProperty({ a: 1 }, 'b')).toBe(false);
    expect(hasProperty(null, 'a')).toBe(false);
    expect(hasProperty('str', 'a')).toBe(false);
    const sym = Symbol('s');
    expect(hasProperty({ [sym]: 1 }, sym)).toBe(true);
  });
});

describe('deepMerge', () => {
  it('merges objects recursively with right precedence', () => {
    expect(deepMerge({ a: { b: 1, c: 2 }, d: 1 } as any, { a: { b: 9 }, e: 5 } as any))
      .toEqual({ a: { b: 9, c: 2 }, d: 1, e: 5 });
  });
  it('replaces primitives and mismatched types', () => {
    expect(deepMerge(1 as any, 2 as any)).toBe(2);
    expect(deepMerge({ a: 1 } as any, 'x' as any)).toBe('x');
    expect(deepMerge({ a: [ 1 ] } as any, { a: 5 } as any)).toEqual({ a: 5 });
  });
  it('merges arrays by index and skips undefined', () => {
    expect(deepMerge([ 1, { a: 1 }, 3 ] as any, [ undefined, { b: 2 } ] as any)).toEqual([ 1, { a: 1, b: 2 }, 3 ]);
    expect(deepMerge([ 1 ] as any, [ 1, 2 ] as any)).toEqual([ 1, 2 ]);
  });
  it('does not mutate inputs', () => {
    const a = { x: { y: 1 } };
    deepMerge(a as any, { x: { y: 2 } } as any);
    expect(a.x.y).toBe(1);
  });
});

describe('Required decorator', () => {
  it('throws on unset access and allows assignment (decorator factory)', () => {
    class A {
      @Required
      public name!: string;
    }
    const a = new A();
    expect(() => a.name).toThrow('Attribute name is required');
    a.name = 'x';
    expect(a.name).toBe('x');
  });
  it('supports direct invocation with target and key', () => {
    const target: any = {};
    Required(target, 'prop');
    expect(() => target.prop).toThrow('Attribute prop is required');
    target.prop = 1;
    expect(target.prop).toBe(1);
  });
  it('works as decorator factory', () => {
    const decorator = Required(undefined);
    const target: any = {};
    decorator(target, 'prop');
    expect(() => target.prop).toThrow('Attribute prop is required');
    target.prop = 1;
    expect(target.prop).toBe(1);
  });
});
