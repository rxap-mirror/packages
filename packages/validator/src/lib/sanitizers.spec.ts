import { blacklist } from './blacklist';
import { escape } from './escape';
import { ltrim } from './ltrim';
import { normalizeEmail } from './normalizeEmail';
import { rtrim } from './rtrim';
import { stripLow } from './stripLow';
import { toBoolean } from './toBoolean';
import { toDate } from './toDate';
import { toFloat } from './toFloat';
import { toInt } from './toInt';
import { trim } from './trim';
import { unescape } from './unescape';
import { assertString } from './util/assertString';
import { includes } from './util/includes';
import { merge } from './util/merge';
import { multilineRegexp } from './util/multilineRegex';
import { toString } from './util/toString';
import { typeOf } from './util/typeOf';
import { iso7064Check, luhnCheck, reverseMultiplyAndSum } from './util/algorithms';
import { whitelist } from './whitelist';

describe('util', () => {
  it('assertString', () => {
    expect(() => assertString('a')).not.toThrow();
    expect(() => assertString(new String('a'))).not.toThrow();
    expect(() => assertString(1)).toThrow('Expected a string but received a number');
    expect(() => assertString(null)).toThrow('received a null');
    expect(() => assertString([])).toThrow('received a Array');
  });

  it('merge', () => {
    expect(merge({ a: 1 }, { a: 2, b: 3 })).toEqual({ a: 1, b: 3 });
    expect(merge(undefined, { a: 1 })).toEqual({ a: 1 });
  });

  it('includes', () => {
    expect(includes([1, 2], 2)).toBe(true);
    expect(includes([1, 2], 3)).toBe(false);
  });

  it('toString', () => {
    expect(toString(null)).toBe('');
    expect(toString(undefined)).toBe('');
    expect(toString(NaN)).toBe('');
    expect(toString(12)).toBe('12');
    expect(toString('x')).toBe('x');
    expect(toString({ toString: () => 'custom' })).toBe('custom');
    expect(toString(Object.create(null))).toBe('[object Object]');
    expect(toString([1, 2])).toBe('1,2');
  });

  it('typeOf', () => {
    expect(typeOf(null)).toBe('null');
    expect(typeOf([])).toBe('array');
    expect(typeOf(new Date())).toBe('date');
    expect(typeOf({})).toBe('object');
    expect(typeOf('s')).toBe('string');
  });

  it('multilineRegexp', () => {
    expect(multilineRegexp(['^a', 'b$'], 'i').test('AB')).toBe(true);
  });

  it('algorithms', () => {
    expect(luhnCheck('4111111111111111')).toBe(true);
    expect(luhnCheck('4111111111111112')).toBe(false);
    expect(reverseMultiplyAndSum([1, 2, 3], 4)).toBe(1 * 4 + 2 * 3 + 3 * 2);
    expect(iso7064Check('12345678903')).toBe(true);
    expect(iso7064Check('12345678904')).toBe(false);
  });
});

describe('sanitizers', () => {
  it('trim helpers', () => {
    expect(ltrim('  a  ')).toBe('a  ');
    expect(ltrim('--a--', '-')).toBe('a--');
    expect(rtrim('a  ', '')).toBe('a');
    expect(rtrim('--a--', '-')).toBe('--a');
    expect(trim('--a--', '-')).toBe('a');
    expect(trim('[a]', '[]')).toBe('a');
    expect(ltrim('.a', '.')).toBe('a');
    expect(() => ltrim(1)).toThrow(TypeError);
  });

  it('blacklist / whitelist / stripLow', () => {
    expect(blacklist('abc123', '0-9')).toBe('abc');
    expect(whitelist('abc123', 'a-b')).toBe('ab');
    expect(stripLow('a\x00b\nc')).toBe('abc');
    expect(stripLow('a\x00b\nc', true)).toBe('ab\nc');
  });

  it('escape / unescape roundtrip', () => {
    const raw = `<a href="x" b='y'>/\\\`&</a>`;
    const esc = escape(raw);
    expect(esc).not.toMatch(/[<>"'`]/);
    expect(esc).toContain('&lt;');
    expect(esc).toContain('&amp;');
    expect(unescape(esc)).toBe(raw);
  });

  it('toBoolean', () => {
    expect(toBoolean('1')).toBe(true);
    expect(toBoolean('anything')).toBe(true);
    expect(toBoolean('0')).toBe(false);
    expect(toBoolean('false')).toBe(false);
    expect(toBoolean('FALSE')).toBe(false);
    expect(toBoolean('')).toBe(false);
    expect(toBoolean('true', true)).toBe(true);
    expect(toBoolean('1', true)).toBe(true);
    expect(toBoolean('yes', true)).toBe(false);
  });

  it('toDate / toInt / toFloat', () => {
    expect(toDate('2020-01-01')).toEqual(new Date('2020-01-01'));
    expect(toDate('nope')).toBeNull();
    expect(toInt('12abc')).toBe(12);
    expect(toInt('ff', 16)).toBe(255);
    expect(toFloat('1.5')).toBe(1.5);
    expect(toFloat('abc')).toBeNaN();
  });

  it('normalizeEmail', () => {
    expect(normalizeEmail('Some.One+tag@GMail.com')).toBe('someone@gmail.com');
    expect(normalizeEmail('a.b@googlemail.com')).toBe('ab@gmail.com');
    expect(normalizeEmail('a.b@googlemail.com', { gmail_convert_googlemaildotcom: false })).toBe('ab@googlemail.com');
    expect(normalizeEmail('A.B+x@gmail.com', { gmail_remove_dots: false, gmail_remove_subaddress: false })).toBe('a.b+x@gmail.com');
    expect(normalizeEmail('+x@gmail.com')).toBe(false);
    expect(normalizeEmail('User+tag@Outlook.com')).toBe('user@outlook.com');
    expect(normalizeEmail('+x@outlook.com')).toBe(false);
    expect(normalizeEmail('User-tag@yahoo.com')).toBe('user@yahoo.com');
    expect(normalizeEmail('-x@yahoo.com', { yahoo_remove_subaddress: false })).toBe('-x@yahoo.com');
    expect(normalizeEmail('User+tag@iCloud.com')).toBe('user@icloud.com');
    expect(normalizeEmail('+x@me.com')).toBe(false);
    expect(normalizeEmail('User@Yandex.ua')).toBe('user@yandex.ru');
    expect(normalizeEmail('User@Example.COM')).toBe('user@example.com');
    expect(normalizeEmail('User@Example.COM', { all_lowercase: false })).toBe('User@example.com');
    expect(normalizeEmail('nodomain@')).toBe(false);
  });
});
