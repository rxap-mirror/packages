import { isAfter as _isAfter } from './isAfter';
import { isBefore as _isBefore } from './isBefore';
import { isDate as _isDate } from './isDate';
import { isDecimal as _isDecimal } from './isDecimal';
import { isDivisibleBy as _isDivisibleBy } from './isDivisibleBy';
import { isFloat as _isFloat, isFloatLocales } from './isFloat';
import { isInt as _isInt } from './isInt';
import { isISO8601 as _isISO8601 } from './isISO8601';
import { isLatLong as _isLatLong } from './isLatLong';
import { isNumeric as _isNumeric } from './isNumeric';
import { isPort as _isPort } from './isPort';
import { isRFC3339 as _isRFC3339 } from './isRFC3339';
import { isSemVer as _isSemVer } from './isSemVer';

const isAfter: (v: any, ...a: any[]) => boolean = _isAfter as any;
const isBefore: (v: any, ...a: any[]) => boolean = _isBefore as any;
const isDate: (v: any, ...a: any[]) => boolean = _isDate as any;
const isDecimal: (v: any, ...a: any[]) => boolean = _isDecimal as any;
const isDivisibleBy: (v: any, ...a: any[]) => boolean = _isDivisibleBy as any;
const isFloat: (v: any, ...a: any[]) => boolean = _isFloat as any;
const isISO8601: (v: any, ...a: any[]) => boolean = _isISO8601 as any;
const isInt: (v: any, ...a: any[]) => boolean = _isInt as any;
const isLatLong: (v: any, ...a: any[]) => boolean = _isLatLong as any;
const isNumeric: (v: any, ...a: any[]) => boolean = _isNumeric as any;
const isPort: (v: any, ...a: any[]) => boolean = _isPort as any;
const isRFC3339: (v: any, ...a: any[]) => boolean = _isRFC3339 as any;
const isSemVer: (v: any, ...a: any[]) => boolean = _isSemVer as any;

function check(fn: (v: any, ...a: any[]) => boolean, valid: unknown[], invalid: unknown[], ...args: unknown[]) {
  for (const v of valid) {
    expect([v, fn(v, ...args)]).toEqual([v, true]);
  }
  for (const v of invalid) {
    expect([v, fn(v, ...args)]).toEqual([v, false]);
  }
}

describe('numeric validators', () => {
  it('isInt', () => {
    check(isInt, ['13', '-0', '0', '123', '+1'], ['1.0', 'abc', '', ' 1', '1e3']);
    expect(isInt('01')).toBe(true);
    expect(isInt('01', { allow_leading_zeroes: false })).toBe(false);
    expect(isInt('-01', { allow_leading_zeroes: false })).toBe(false);
    expect(isInt('10', { min: 5 })).toBe(true);
    expect(isInt('10', { max: 20 })).toBe(true);
    expect(isInt('100', { max: 20 })).toBe(false);
    expect(isInt('5', { min: 1, max: 10 })).toBe(true);
    expect(isInt('0', { min: 1 })).toBe(false);
    expect(isInt('11', { max: 10 })).toBe(false);
    expect(isInt('5', { gt: 4, lt: 6 })).toBe(true);
    expect(isInt('5', { gt: 5 })).toBe(false);
    expect(isInt('5', { lt: 5 })).toBe(false);
  });

  it('isFloat', () => {
    check(isFloat, ['1.5', '-1.5', '.5', '1', '1e3', '+1.0'], ['abc', '', '-', '1.5.5']);
    expect(isFloat('1,5', { locale: 'de-DE' })).toBe(true);
    expect(isFloat('1,5')).toBe(false);
    expect(isFloat('5', { min: 1, max: 10 })).toBe(true);
    expect(isFloat('0.5', { min: 1 })).toBe(false);
    expect(isFloat('11', { max: 10 })).toBe(false);
    expect(isFloat('5', { gt: 5 })).toBe(false);
    expect(isFloat('5', { lt: 5 })).toBe(false);
    expect(isFloatLocales).toContain('en-US');
  });

  it('isDecimal', () => {
    check(isDecimal, ['1.5', '-1.5', '.5', '1.00', '1'], ['abc', '', '1.5.5']);
    expect(isDecimal('1,5', { locale: 'de-DE' })).toBe(true);
    expect(isDecimal('1.55', { decimal_digits: '2' })).toBe(true);
    expect(isDecimal('1.555', { decimal_digits: '2' })).toBe(false);
    expect(isDecimal('1.5', { force_decimal: true })).toBe(true);
    expect(isDecimal('1', { force_decimal: true })).toBe(false);
    expect(() => isDecimal('1', { locale: 'xx' })).toThrow('Invalid locale');
  });

  it('isNumeric', () => {
    check(isNumeric, ['1', '-1', '1.5', '+1', '.5', '007'], ['abc', '', '1.5.5', '1 2']);
    expect(isNumeric('+1', { no_symbols: true })).toBe(false);
    expect(isNumeric('12', { no_symbols: true })).toBe(true);
    expect(isNumeric('1,5', { locale: 'de-DE' })).toBe(true);
  });

  it('isDivisibleBy', () => {
    expect(isDivisibleBy('10', '5')).toBe(true);
    expect(isDivisibleBy('10', '3')).toBe(false);
    expect(isDivisibleBy('abc', '3')).toBe(false);
  });

  it('isPort', () => {
    check(isPort, ['1', '80', '65535', '0', '08080'], ['65536', '-1', 'abc', '', '80.5']);
  });

  it('isLatLong', () => {
    check(isLatLong, ['0,0', '90,180', '-90,-180', '(-17.738223, 85.605469)', '47.1231231, 179.99999999', '+90.0, -127.554334'], ['91,0', '0,181', 'abc', '10']);
    expect(isLatLong('90.0000, 180.0', { checkDMS: true })).toBe(false);
    expect(isLatLong(`40°26'46"N, 79°58'56"W`, { checkDMS: true })).toBe(true);
    expect(isLatLong(`40°26'46"N, 79°58'56"W`)).toBe(false);
  });

  it('isSemVer', () => {
    check(isSemVer, ['1.2.3', '0.0.0', '1.2.3-alpha.1', '1.2.3+build', '1.2.3-rc.1+b5'], ['1.2', 'v1.2.3', '01.2.3', '1.2.3-', 'a.b.c', '']);
  });
});

describe('date validators', () => {
  it('isDate', () => {
    check(isDate, ['2020-02-29', '2000-01-01', '2020/02/29'], ['2021-02-29', '2020-13-01', 'abc', '']);
    expect(isDate('2020/02/29', { format: 'YYYY/MM/DD' })).toBe(true);
    expect(isDate('29-02-2020', { format: 'DD-MM-YYYY' })).toBe(true);
    expect(isDate('29/02/2020', { format: 'DD/MM/YYYY' })).toBe(true);
    expect(isDate('2020-02-29', { format: 'nonsense' })).toBe(false);
    expect(isDate('29-02-2020', { format: 'DD/MM/YYYY' })).toBe(true);
    expect(isDate('29-02-2020', { format: 'DD/MM/YYYY', strictMode: true })).toBe(false);
    expect(isDate('2020-02-29', { format: 'YYYY-MM-DD', strictMode: true })).toBe(true);
    expect(isDate('2020/02/29', { strictMode: true })).toBe(true);
    expect(isDate('2020-02-29', { strictMode: true })).toBe(false);
    expect(isDate('02/29/20', 'MM/DD/YY')).toBe(true);
    expect(isDate(new Date())).toBe(true);
    expect(isDate(new Date('invalid'))).toBe(false);
    expect(isDate({} as any)).toBe(false);
    expect(isDate(5 as any)).toBe(false);
  });

  it('isISO8601', () => {
    check(isISO8601, ['2020-01-01', '2020-01-01T10:20:30Z', '2020-01-01T10:20:30+01:00', '2020-W01-1', '2020-001'], ['2020-13-01', 'abc', '', '2020-1-1']);
    expect(isISO8601('2020-02-30', { strict: true })).toBe(false);
    expect(isISO8601('2020-02-29', { strict: true })).toBe(true);
    expect(isISO8601('2020-01-01T10:20:30Z', { strictSeparator: true })).toBe(true);
    expect(isISO8601('2020-01-01 10:20:30Z', { strictSeparator: true })).toBe(false);
    expect(isISO8601('2020-01-01 10:20:30Z')).toBe(true);
  });

  it('isRFC3339', () => {
    check(isRFC3339, ['2020-01-01T10:20:30Z', '2020-01-01T10:20:30.123+01:00', '2020-01-01 10:20:30Z'], ['2020-01-01', 'abc', '2020-13-01T10:20:30Z', '2020-01-01T25:00:00Z']);
  });

  it('isAfter / isBefore', () => {
    expect(isAfter('2020-02-01', '2020-01-01')).toBe(true);
    expect(isAfter('2019-02-01', '2020-01-01')).toBe(false);
    expect(isAfter('2999-01-01')).toBe(true);
    expect(isAfter('abc', '2020-01-01')).toBe(false);
    expect(isAfter('2020-01-01', 'abc')).toBe(false);
    expect(isBefore('2019-02-01', '2020-01-01')).toBe(true);
    expect(isBefore('2020-02-01', '2020-01-01')).toBe(false);
    expect(isBefore('1999-01-01')).toBe(true);
    expect(isBefore('abc', '2020-01-01')).toBe(false);
  });
});
