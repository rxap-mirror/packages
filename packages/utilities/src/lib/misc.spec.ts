import { objectReducer } from './array-reducers';
import { AssertsInstanceOf } from './asserts-instance-of';
import { assertIsArray } from './asserts/array';
import { assertIsFunction } from './asserts/function';
import { assertIsObject } from './asserts/object';
import { coerceArray } from './coerce/array';
import { coerceBoolean } from './coerce/boolean';
import { coerceString } from './coerce/string';
import { DebounceCall } from './decorators/debounce-call';
import { IsRequiredPropertyDefined, Required } from './decorators/required';
import { DownloadObjectAsJsonFile } from './download-object-as-json-file';
import { RxapError, RxapUtilitiesError } from './error';
import { IsFunction } from './function/is-function';
import { GetFromObjectFactory, getFromObjectFactory, getFromObject } from './get-from-object';
import { GetPropertyDescriptor } from './get-property-descriptor';
import { GetProxyTarget, PROXY_TARGET } from './get-proxy-target';
import { hasProperty } from './has-property';
import {
  applyContextToFunctionOrConstant,
  getIdentifierProperties,
  getIdentifierPropertyValue,
  hasIdentifierProperty,
  IsMaterialIcon,
  isObject as helpersIsObject,
  IsSvgIcon,
  NormalizeIconConfig,
  ToControlOptions,
} from './helpers';
import { HasRxapOnInitMethod } from './hooks';
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
import { JoinPath, joinPath, joinWith, joinWithDash } from './join';
import { noop } from './noop';
import { ToOptions } from './options/to-options';
import { ToOptionsFromObject } from './options/to-options-from-object';
import { ToOptionsWithObject } from './options/to-options-with-object';
import { assertsObject } from './object/asserts-object';
import { CamelizePropertyKeys } from './object/camelize-property-keys';
import { DeleteNullProperties } from './object/delete-null-properties';
import { DeleteProperties } from './object/delete-properties';
import { DeleteUndefinedProperties } from './object/delete-undefined-properties';
import { isConstructor } from './object/is-constructor';
import { AssertObject, AssertRecord, IsObject, IsRecord } from './object/is-object';
import { GenerateRandomString } from './random/string';
import {
  camelize,
  capitalize,
  classify,
  dasherize,
  decamelize,
  levenshtein,
  underscore,
} from './strings';
import { IsThemeDensity, ThemeDensity } from './theme-density';
import { TryAndLogOnError, TryAndLogOnErrorAsync } from './try-log';
import { Chunk } from './array/chunk';
import { GroupBy } from './array/group-by';
import { unique } from './array/unique';
import { CoerceArrayItems } from './array/coerce-array-items';

describe('array helpers', () => {
  it('objectReducer merges', () => {
    expect(([{ a: 1 }, { b: 2 }, { a: 3 }] as any[]).reduce(objectReducer)).toEqual({ a: 3, b: 2 });
  });

  it('Chunk', () => {
    expect(Chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(Chunk([], 2)).toEqual([]);
  });

  it('GroupBy by key and function', () => {
    const list = [{ t: 'a', v: 1 }, { t: 'b', v: 2 }, { t: 'a', v: 3 }];
    const byKey = GroupBy(list, 't');
    expect(byKey.get('a')).toEqual([list[0], list[2]]);
    expect(GroupBy(list, (i) => i.v % 2).get(1)).toEqual([list[0], list[2]]);
  });

  it('unique with default, keys and compare function', () => {
    expect([1, 2, 1, 3, 2].filter(unique())).toEqual([1, 2, 3]);
    const items = [{ a: 1, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 1 }];
    expect(items.filter(unique(['a']))).toEqual([items[0], items[2]]);
    expect(items.filter(unique(['a', 'b']))).toEqual(items);
    expect(items.filter(unique<any>((x, y) => x.b === y.b))).toEqual([items[0], items[1]]);
  });

  describe('CoerceArrayItems extras', () => {
    it('unshift via legacy arguments', () => {
      const a = [1];
      CoerceArrayItems(a, [2, 1], undefined, true);
      expect(a).toEqual([2, 1]);
    });

    it('replace and merge', () => {
      const a: any[] = [{ id: 1, x: 1 }];
      CoerceArrayItems(a, [{ id: 1, y: 2 }], { compareTo: (l, r) => l.id === r.id, merge: true });
      expect(a).toEqual([{ id: 1, x: 1, y: 2 }]);
      CoerceArrayItems(a, [{ id: 1 }], { compareTo: (l, r) => l.id === r.id, replace: true });
      expect(a).toEqual([{ id: 1 }]);
    });

    it('sorted insertion with compareFn', () => {
      const a = [1, 3];
      CoerceArrayItems(a, [2, 0, 4], { compareFn: (l: number, r: number) => l - r });
      expect(a).toEqual([0, 1, 2, 3, 4]);
      const b: number[] = [];
      CoerceArrayItems(b, [1], { compareFn: (l: number, r: number) => l - r });
      expect(b).toEqual([1]);
      const c = [1, 3];
      CoerceArrayItems(c, [2, 0, 4], { compareFn: (l: number, r: number) => l - r, unshift: true });
      expect(c).toEqual([0, 1, 2, 3, 4]);
    });
  });
});

describe('asserts / coerce', () => {
  it('AssertsInstanceOf', () => {
    class A {}
    expect(() => AssertsInstanceOf(new A(), A)).not.toThrow();
    expect(() => AssertsInstanceOf({}, A)).toThrow('Instance should be instance of A!');
    expect(() => AssertsInstanceOf({}, A, 'Custom')).toThrow('Custom');
  });

  it('assertIs*', () => {
    expect(() => assertIsArray([])).not.toThrow();
    expect(() => assertIsArray({})).toThrow('Value is not an array');
    expect(() => assertIsFunction(() => 1)).not.toThrow();
    expect(() => assertIsFunction(null, 'custom')).toThrow('custom');
    expect(() => assertIsObject({})).not.toThrow();
    expect(() => assertIsObject(null)).toThrow('Value is not an object');
    expect(() => assertIsObject('s')).toThrow(RxapUtilitiesError);
    expect(() => assertsObject({})).not.toThrow();
    expect(() => assertsObject(1)).toThrow('must be an object');
  });

  it('coerceArray', () => {
    expect(coerceArray()).toEqual([]);
    expect(coerceArray(null)).toEqual([]);
    expect(coerceArray(1)).toEqual([1]);
    expect(coerceArray([1])).toEqual([1]);
  });

  it('coerceBoolean', () => {
    expect(coerceBoolean(undefined)).toBe(false);
    expect(coerceBoolean(null)).toBe(false);
    expect(coerceBoolean(false)).toBe(false);
    expect(coerceBoolean('')).toBe(true);
    expect(coerceBoolean(0)).toBe(true);
    expect(coerceBoolean(true)).toBe(true);
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

describe('decorators', () => {
  it('DebounceCall debounces', () => {
    jest.useFakeTimers();
    const spy = jest.fn();
    class A {
      @DebounceCall(100)
      call(v: number) {
        spy(v);
      }
    }
    const a = new A();
    a.call(1);
    a.call(2);
    jest.advanceTimersByTime(99);
    expect(spy).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(2);
    jest.useRealTimers();
  });

  it('Required throws until the property is set', () => {
    class A {
      @Required name!: string;
    }
    const a = new A();
    expect(() => a.name).toThrow('Attribute name is required');
    expect(IsRequiredPropertyDefined(a, 'name')).toBe(false);
    a.name = 'x';
    expect(a.name).toBe('x');
    expect(IsRequiredPropertyDefined(a, 'name')).toBe(true);
  });

  it('Required with stack factory', () => {
    class A {
      @Required(() => 'my-stack') name!: string;
    }
    try {
      void new A().name;
      fail('should throw');
    } catch (e: any) {
      expect(e).toBeInstanceOf(RxapUtilitiesError);
      expect(e.stack).toBe('my-stack');
      expect(e.scope).toBe('A');
    }
  });
});

describe('RxapError', () => {
  it('exposes metadata', () => {
    const e = new RxapUtilitiesError('msg', 'CODE', 'Cls');
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBe('RxapError');
    expect(e.packageName).toBe('@rxap/utilities');
    expect(e.className).toBe('Cls');
    expect(e.toJSON()).toMatchObject({ package: '@rxap/utilities', message: 'msg', code: 'CODE', scope: 'Cls', className: 'Cls' });
    expect(new RxapError('p', 'm').code).toBeUndefined();
  });
});

describe('object helpers', () => {
  it('getFromObject / factories', () => {
    const obj = { a: { b: 1 } };
    expect(GetFromObjectFactory('a.b')(obj)).toBe(1);
    expect(getFromObjectFactory('a.c', 'd')(obj)).toBe('d');
  });

  it('GetPropertyDescriptor walks the prototype chain', () => {
    class A { get x() { return 1; } }
    class B extends A {}
    expect(GetPropertyDescriptor(new B(), 'y')).toBeUndefined();
    expect(GetPropertyDescriptor(B.prototype, 'x')?.get).toBeDefined();
    expect(GetPropertyDescriptor({ z: 1 }, 'z')?.value).toBe(1);
  });

  it('GetProxyTarget', () => {
    const target = { a: 1 };
    const proxy = new Proxy(target, { get: (t, k) => (k === PROXY_TARGET ? t : (t as any)[k]) });
    expect(GetProxyTarget(proxy)).toBe(target);
  });

  it('hasProperty', () => {
    expect(hasProperty({ a: 1 }, 'a')).toBe(true);
    expect(hasProperty({ a: 1 }, 'a', 1)).toBe(true);
    expect(hasProperty({ a: 1 }, 'a', 2)).toBe(false);
    expect(hasProperty({ a: { b: 2 } }, 'a.b')).toBe(true);
    expect(hasProperty({ a: { b: 2 } }, 'a.b', 2)).toBe(true);
    expect(hasProperty({ a: { b: 2 } }, 'a.b', 3)).toBe(false);
    expect(hasProperty({ a: { b: { c: 1 } } }, 'a.b.c')).toBe(true);
    expect(hasProperty({ b: 1 }, 'a.b')).toBe(false);
    expect(hasProperty({ a: null }, 'a.b')).toBe(false);
    expect(hasProperty({ a: { b: 2 } }, 'a.c')).toBe(false);
    expect(hasProperty({ a: 1 }, 'b')).toBe(false);
    const s = Symbol('s');
    expect(hasProperty({ [s]: 1 }, s)).toBe(true);
    expect(hasProperty(null, 'a')).toBe(false);
    expect(hasProperty('str', 'length')).toBe(false);
  });

  it('DeleteProperties', () => {
    expect(DeleteProperties({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ b: 2 });
  });

  it('DeleteNullProperties / DeleteUndefinedProperties', () => {
    expect(DeleteNullProperties({ a: null, b: 1 })).toEqual({ b: 1 });
    expect(DeleteNullProperties({ a: { b: null }, l: [{ c: null, d: 1 }] }, true)).toEqual({ a: {}, l: [{ d: 1 }] });
    expect(DeleteNullProperties(null as any)).toBeNull();
    expect(DeleteUndefinedProperties({ a: undefined, b: 1 })).toEqual({ b: 1 });
    expect(DeleteUndefinedProperties({ a: { b: undefined }, l: [{ c: undefined, d: 1 }] }, true)).toEqual({ a: {}, l: [{ d: 1 }] });
    expect(DeleteUndefinedProperties(5 as any)).toBe(5);
  });

  it('CamelizePropertyKeys adds camelized keys', () => {
    const r: any = CamelizePropertyKeys({ my_key: 1, plain: 2 });
    expect(r.myKey).toBe(1);
    expect(r.plain).toBe(2);
  });

  it('isConstructor', () => {
    expect(isConstructor(class A {})).toBeTruthy();
    expect(isConstructor(() => 1)).toBeFalsy();
  });

  it('IsObject / IsRecord / Assert*', () => {
    expect(IsObject({})).toBe(true);
    expect(IsObject(null)).toBeFalsy();
    expect(IsRecord({ a: 1 })).toBe(true);
    expect(IsRecord({})).toBe(true);
    expect(IsRecord(Object.create({ x: 1 }))).toBe(true);
    expect(IsRecord(new Date())).toBe(false);
    expect(() => AssertObject({})).not.toThrow();
    expect(() => AssertObject(null)).toThrow("instead: 'null'");
    expect(() => AssertRecord({ a: 1 })).not.toThrow();
    expect(() => AssertRecord('s')).toThrow('not a record');
  });

  it('helpers isObject', () => {
    expect(helpersIsObject({})).toBe(true);
    expect(helpersIsObject([])).toBe(false);
    expect(helpersIsObject(null)).toBe(false);
    for (const v of [1, BigInt(1), true, () => 1, 's', Symbol('s'), undefined]) {
      expect(helpersIsObject(v)).toBe(false);
    }
  });

  it('IsFunction', () => {
    expect(IsFunction(() => 1)).toBe(true);
    expect(IsFunction(function () { return 1; })).toBe(false);
    expect(IsFunction(1)).toBe(false);
  });
});

describe('helpers.ts', () => {
  it('ToControlOptions', () => {
    expect(ToControlOptions(['a'])).toEqual([{ value: 'a', display: 'a' }]);
  });

  it('applyContextToFunctionOrConstant', () => {
    expect(applyContextToFunctionOrConstant((a: number) => a + 1, [1])).toBe(2);
    expect(applyContextToFunctionOrConstant(5)).toBe(5);
    expect(applyContextToFunctionOrConstant(undefined, undefined, 7)).toBe(7);
    expect(applyContextToFunctionOrConstant(() => 3)).toBe(3);
  });

  it('identifier helpers', () => {
    expect(hasIdentifierProperty({ id: 1 })).toBe(true);
    expect(hasIdentifierProperty({ foo: 1 })).toBe(false);
    expect(getIdentifierProperties({ id: 1, key: 2, x: 3 })).toEqual(['id', 'key']);
    expect(getIdentifierPropertyValue({ uuid: 'u' })).toBe('u');
    expect(getIdentifierPropertyValue({ _id: 'a' })).toBe('a');
    expect(getIdentifierPropertyValue({})).toBeNull();
  });

  it('icon helpers', () => {
    expect(NormalizeIconConfig('home')).toEqual({ icon: 'home' });
    const svg = { svgIcon: 's' };
    expect(NormalizeIconConfig(svg)).toBe(svg);
    expect(IsSvgIcon(svg)).toBe(true);
    expect(IsSvgIcon('s')).toBe(false);
    expect(IsSvgIcon(undefined)).toBe(false);
    expect(IsMaterialIcon({ icon: 'i' })).toBe(true);
    expect(IsMaterialIcon(svg)).toBe(false);
  });
});

describe('hooks / is-null / is-defined', () => {
  it('HasRxapOnInitMethod', () => {
    expect(HasRxapOnInitMethod({ rxapOnInit() { return; } })).toBe(true);
    expect(HasRxapOnInitMethod({})).toBe(false);
    expect(HasRxapOnInitMethod(null)).toBeFalsy();
  });

  it('IsNull / IsNotNull', () => {
    expect(IsNull(null)).toBe(true);
    expect(IsNull(undefined)).toBe(false);
    expect(IsNotNull(0)).toBe(true);
    expect(IsNotNull(null)).toBe(false);
  });

  it('predicates', () => {
    expect(IsDefined(null)).toBe(true);
    expect(IsDefined(undefined)).toBe(false);
    expect(IsUndefined(undefined)).toBe(true);
    expect(IsUndefinedOrNull(null)).toBe(true);
    expect(IsUndefinedOrNull(0)).toBe(false);
    expect(IsDefinedAndNotNull(0)).toBe(true);
    expect(IsDefinedAndNotNull(null)).toBe(false);
    expect(IsEmpty('')).toBe(true);
    expect(IsEmpty(null)).toBe(true);
    expect(IsEmpty(0)).toBe(false);
    expect(IsNotEmpty('a')).toBe(true);
  });

  it('AssertDefined', () => {
    expect(() => AssertDefined(1, 'c')).not.toThrow();
    expect(() => AssertDefined(undefined, 'c', 'Cls')).toThrow('Value is not defined');
  });

  it('AssertDefinedAndNotNull rejects undefined and null', () => {
    expect(() => AssertDefinedAndNotNull(1, 'c')).not.toThrow();
    expect(() => AssertDefinedAndNotNull(0, 'c')).not.toThrow();
    expect(() => AssertDefinedAndNotNull(undefined, 'c')).toThrow(RxapUtilitiesError);
    expect(() => AssertDefinedAndNotNull(null, 'c')).toThrow(RxapUtilitiesError);
  });
});

describe('join', () => {
  it('JoinPath', () => {
    expect(JoinPath('a', '/b/', null, undefined, '/', 'c//')).toBe('a/b/c');
    expect(joinPath('/a/', '/b')).toBe('a/b');
    expect(JoinPath()).toBe('');
  });

  it('joinWith', () => {
    expect(joinWith(['a', null, 'b', ''], '_')).toBe('a_b');
    expect(joinWith(['a', 'a', 'b'], '-', { removeDuplicated: true })).toBe('a-b');
    expect(joinWith(['a', undefined], '-', { removeEmpty: true })).toBe('a');
    expect(() => joinWith(['a', ''], '-', { strict: true })).toThrow('Invalid join items');
    expect(() => joinWith(['a', null], '-', { strict: true })).toThrow();
    expect(joinWithDash(['a', 'b'])).toBe('a-b');
  });
});

describe('strings', () => {
  it('decamelize / dasherize / underscore', () => {
    expect(decamelize('innerHTML')).toBe('inner_html');
    expect(decamelize('css-class-name')).toBe('css-class-name');
    expect(dasherize('innerHTML')).toBe('inner-html');
    expect(dasherize('action_name')).toBe('action-name');
    expect(dasherize('my favorite items')).toBe('my-favorite-items');
    expect(underscore('css-class-name')).toBe('css_class_name');
    expect(underscore('my favorite items')).toBe('my_favorite_items');
    expect(underscore('innerHTML')).toBe('inner_html');
  });

  it('camelize / classify / capitalize', () => {
    expect(camelize('action_name')).toBe('actionName');
    expect(camelize('css-class-name')).toBe('cssClassName');
    expect(camelize('My Favorite Items')).toBe('myFavoriteItems');
    expect(classify('css-class-name')).toBe('CssClassName');
    expect(classify('a.b_c')).toBe('A.BC');
    expect(capitalize('action_name')).toBe('Action_name');
    expect(capitalize('')).toBe('');
  });

  it('levenshtein', () => {
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', '')).toBe(3);
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(levenshtein('same', 'same')).toBe(0);
  });
});

describe('misc', () => {
  it('noop returns undefined', () => {
    expect(noop()).toBeUndefined();
  });

  it('ThemeDensity', () => {
    expect(IsThemeDensity(-1)).toBe(true);
    expect(IsThemeDensity(ThemeDensity.Dense)).toBe(true);
    expect(IsThemeDensity(5)).toBe(false);
  });

  it('GenerateRandomString', () => {
    expect(GenerateRandomString()).toMatch(/^[A-Za-z0-9]{32}$/);
    expect(GenerateRandomString(5)).toHaveLength(5);
    expect(GenerateRandomString(0)).toBe('');
  });

  it('TryAndLogOnError', () => {
    const err = jest.spyOn(console, 'error').mockImplementation();
    expect(TryAndLogOnError((a: number) => a * 2)(2)).toBe(4);
    const failing = TryAndLogOnError(() => { throw new Error('boom'); }, 'dflt');
    expect(failing()).toBe('dflt');
    expect(err).toHaveBeenCalledWith('boom', expect.any(Error));
    err.mockRestore();
  });

  it('TryAndLogOnErrorAsync', async () => {
    const err = jest.spyOn(console, 'error').mockImplementation();
    expect(await TryAndLogOnErrorAsync(async (a: number) => a * 2)(2)).toBe(4);
    expect(await TryAndLogOnErrorAsync(() => { throw new Error('boom'); }, 'd')()).toBe('d');
    expect(await TryAndLogOnErrorAsync(() => Promise.reject(new Error('x')))()).toBeNull();
    expect(err).toHaveBeenCalledTimes(2);
    err.mockRestore();
  });

  it('DownloadObjectAsJsonFile', () => {
    const anchor = document.createElement('a');
    const click = jest.spyOn(anchor, 'click').mockImplementation(() => undefined);
    const remove = jest.spyOn(anchor, 'remove');
    jest.spyOn(document, 'createElement').mockReturnValueOnce(anchor);
    DownloadObjectAsJsonFile({ a: 1 }, 'file');
    expect(anchor.getAttribute('download')).toBe('file.json');
    expect(anchor.getAttribute('href')).toContain('data:text/json');
    expect(click).toHaveBeenCalled();
    expect(remove).toHaveBeenCalled();
    jest.restoreAllMocks();
  });
});

describe('options', () => {
  it('ToOptions', () => {
    expect(ToOptions([1, 2])).toEqual([{ value: 1, display: '1' }, { value: 2, display: '2' }]);
    expect(ToOptions([{ id: 1, n: 'a' }], (i) => i.id, (i) => i.n)).toEqual([{ value: 1, display: 'a' }]);
  });

  it('ToOptionsFromObject', () => {
    expect(ToOptionsFromObject({ a: 'A' })).toEqual([{ value: 'a', display: 'A' }]);
    expect(ToOptionsFromObject({ a: 1 }, (k) => k.toUpperCase(), (p) => `#${p}`)).toEqual([{ value: 'A', display: '#1' }]);
  });

  it('ToOptionsWithObject', () => {
    expect(ToOptionsWithObject([1, 2] as any, (p: any) => `n${p}`)).toEqual([
      { value: 1, display: 'n1' },
      { value: 2, display: 'n2' },
    ]);
    expect(ToOptionsWithObject({ a: 1 }, String)).toEqual([]);
  });
});

describe('getFromObject extras', () => {
  it('returns the object for an empty path and default for primitives', () => {
    const o = { a: 1 };
    expect(getFromObject(o, '')).toBe(o);
    expect(getFromObject(null as any, 'a', 'd')).toBe('d');
    expect(getFromObject(1 as any, 'a', 'd')).toBe('d');
  });
});
