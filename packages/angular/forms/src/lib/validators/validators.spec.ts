import { FormControl } from '@angular/forms';
import { IsArray } from './is-array';
import { IsBoolean } from './is-boolean';
import { IsComplex } from './is-complex';
import { IsDate } from './is-date';
import { IsEmail } from './is-email';
import { IsEnum } from './is-enum';
import { IsInt } from './is-int';
import { IsIP } from './is-ip';
import { _IsNumber, IsNumber, isNumber } from './is-number';
import { IsObject } from './is-object';
import { IsPhoneNumber } from './is-phone-number';
import { IsPort } from './is-port';
import { IsString } from './is-string';
import { IsUrl } from './is-url';
import { IsUUID } from './is-uuid';

const run = (validator: (c: any) => any, value: any) => validator(new FormControl(value));

describe('validators', () => {
  describe.each([
    ['IsArray', IsArray(), [[], [1]], ['x', 1, {}], 'isArray'],
    ['IsBoolean', IsBoolean(), [true, false], ['x', 1], 'isBoolean'],
    ['IsString', IsString(), ['', 'a'], [1, {}], 'isString'],
    ['IsDate', IsDate(), [new Date()], [new Date('x'), 'x', 5], 'isDate'],
    ['IsObject', IsObject(), [{}, () => 1], [[], 'x', 1], 'isObject'],
    ['IsEmail', IsEmail(), ['a@b.de'], ['x', 1, 'a@'], 'isEmail'],
    ['IsEnum', IsEnum({ entity: { A: 'a', B: 'b' } }), ['a', 'b'], ['A', 'c'], 'isEnum'],
    ['IsInt', IsInt(), [1, 0, -5], [1.5, 'x', NaN], 'isInt'],
    ['IsIP', IsIP(), ['127.0.0.1'], ['x', 1, '999.1.1.1'], 'isIp'],
    ['IsUUID', IsUUID(), ['550e8400-e29b-41d4-a716-446655440000'], ['x', 1], 'isUuid'],
    ['IsUrl', IsUrl(), ['https://example.com'], ['x y', 1], 'isURL'],
    ['_IsNumber', _IsNumber(), [1, '2', 1.5], ['x', Infinity, NaN], 'isNumber'],
  ] as any[])('%s', (_name, validator, valid, invalid, key) => {
    it('accepts null', () => expect(run(validator, null)).toBeNull());
    it.each(valid.map((x: any) => [x]))('accepts %p', (v) => expect(run(validator, v)).toBeNull());
    it.each(invalid.map((x: any) => [x]))('rejects %p', (v) => {
      const result = run(validator, v);
      expect(result).toHaveProperty(key);
      expect(result[key].actual).toBe(v);
    });
  });

  it('passes the custom message through', () => {
    expect(run(IsString({ message: 'm' }), 1)!['isString'].message).toBe('m');
  });

  it('IsPort accepts ports and rejects others', () => {
    expect(run(IsPort(), null)).toBeNull();
    expect(run(IsPort(), '8080')).toBeNull();
    expect(run(IsPort(), '70000')).toHaveProperty('isPort');
    expect(run(IsPort(), 80)).toHaveProperty('isPort');
  });

  it('IsPhoneNumber validates with locale', () => {
    expect(run(IsPhoneNumber(), null)).toBeNull();
    expect(run(IsPhoneNumber({ locale: 'de-DE' }), '+4915112345678')).toBeNull();
    expect(run(IsPhoneNumber({ locale: 'de-DE' }), 'abc')).toHaveProperty('isPhoneNumber');
  });

  it('IsIP / IsUUID expected text includes the version', () => {
    expect(run(IsIP({ version: 6 }), '1.1.1.1')!['isIp'].expected).toContain('IPv6');
    expect(run(IsIP(), 'x')!['isIp'].expected).toContain('IPv4');
    expect(run(IsUUID({ version: '4' }), 'x')!['isUuid'].expected).toContain('version 4');
    expect(run(IsUUID(), 'x')!['isUuid'].expected).toBe('A valid uuid');
  });

  describe('number', () => {
    it('isNumber options', () => {
      expect(isNumber('1')).toBe(false);
      expect(isNumber(Infinity)).toBe(false);
      expect(isNumber(Infinity, { allowInfinity: true })).toBe(true);
      expect(isNumber(NaN)).toBe(false);
      expect(isNumber(NaN, { allowNaN: true })).toBe(true);
      expect(isNumber(1.23, { maxDecimalPlaces: 1 })).toBe(false);
      expect(isNumber(1.2, { maxDecimalPlaces: 1 })).toBe(true);
      expect(isNumber(1, { maxDecimalPlaces: 0 })).toBe(true);
    });
    it('strict mode rejects numeric strings', () => {
      expect(run(_IsNumber({ options: { strict: true } }), '2')).toHaveProperty('isNumber');
    });
    it('deprecated IsNumber', () => {
      expect(run(IsNumber, null)).toBeNull();
      expect(run(IsNumber, '12')).toBeNull();
      expect(run(IsNumber, 'x')).toHaveProperty('isNumber');
    });
  });

  describe('IsComplex', () => {
    const v = (options: any) => IsComplex({ options, message: 'm' });
    it('accepts null and rejects non strings', () => {
      expect(run(v({ min: 1 }), null)).toBeNull();
      expect(run(v({ min: 1 }), 5)).toHaveProperty('isString');
    });
    it('checks character classes', () => {
      expect(run(v({ uppercase: 1, digit: 2, special: 1, lowercase: 1, upperLower: 1, alphaNumeric: 1 }), 'aB12!')).toBeNull();
      const err = run(v({ uppercase: 1, digit: 1 }), 'abc');
      expect(err!['isComplex'].actual).toEqual({ uppercase: false, digit: false });
      expect(err!['isComplex'].message).toBe('m');
    });
    it('checks length options', () => {
      expect(run(v({ min: 3 }), 'ab')).toBeTruthy();
      expect(run(v({ min: 3 }), 'abc')).toBeNull();
      expect(run(v({ max: 3 }), 'abcd')).toBeTruthy();
      expect(run(v({ max: 3 }), 'abc')).toBeNull();
      expect(run(v({ exact: 2 }), 'abc')).toBeTruthy();
      expect(run(v({ exact: 2 }), 'ab')).toBeNull();
    });
    it('accepts empty options', () => {
      expect(run(v({}), 'x')).toBeNull();
    });
  });
});
