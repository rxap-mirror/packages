import { alpha, alphanumeric } from './alpha';
import { contains } from './contains';
import { equals } from './equals';
import { isAlpha, isAlphaLocales } from './isAlpha';
import { isAlphanumeric, isAlphanumericLocales } from './isAlphanumeric';
import { isAscii } from './isAscii';
import { isBase32 } from './isBase32';
import { isBase58 } from './isBase58';
import { isBase64 } from './isBase64';
import { isByteLength } from './isByteLength';
import { isEmpty } from './isEmpty';
import { isFullWidth } from './isFullWidth';
import { isHalfWidth } from './isHalfWidth';
import { isHexadecimal } from './isHexadecimal';
import { isHexColor } from './isHexColor';
import { isIn } from './isIn';
import { isJSON } from './isJSON';
import { isLength } from './isLength';
import { isLocale } from './isLocale';
import { isLowercase } from './isLowercase';
import { isMagnetURI } from './isMagnetURI';
import { isMimeType } from './isMimeType';
import { isMultibyte } from './isMultibyte';
import { isOctal } from './isOctal';
import { isSlug } from './isSlug';
import { isSurrogatePair } from './isSurrogatePair';
import { isUppercase } from './isUppercase';
import { isVariableWidth } from './isVariableWidth';
import { isWhitelisted } from './isWhitelisted';
import { matches } from './matches';
import { isBoolean } from './isBoolean';

function check(fn: (v: any, ...a: any[]) => boolean, valid: unknown[], invalid: unknown[], ...args: unknown[]) {
  for (const v of valid) {
    expect([v, fn(v, ...args)]).toEqual([v, true]);
  }
  for (const v of invalid) {
    expect([v, fn(v, ...args)]).toEqual([v, false]);
  }
}

describe('string validators', () => {
  it('rejects non strings', () => {
    for (const fn of [isAscii, isHexadecimal, isLowercase, isUppercase, isSlug, isOctal, isBase64, isBase32, isBase58]) {
      expect(() => fn(1 as any)).toThrow(TypeError);
    }
  });

  it('contains', () => {
    expect(contains('foobar', 'foo')).toBe(true);
    expect(contains('foobar', 'baz')).toBe(false);
    expect(contains('FooBar', 'foo')).toBe(false);
    expect(contains('FooBar', 'foo', { ignoreCase: true })).toBe(true);
  });

  it('equals', () => {
    expect(equals('a', 'a')).toBe(true);
    expect(equals('a', 'b')).toBe(false);
  });

  it('matches', () => {
    expect(matches('abc', /b/)).toBe(true);
    expect(matches('abc', 'B', 'i')).toBe(true);
    expect(matches('abc', /^b/)).toBe(false);
  });

  it('isAlpha / isAlphanumeric', () => {
    check(isAlpha, ['abc', 'ABC'], ['abc1', '', ' ', 'äö']);
    check(isAlpha, ['äöüß'], ['abc1'], 'de-DE');
    check(isAlpha, ['abc def'], ['abc1'], 'en-US', { ignore: ' ' });
    expect(() => isAlpha('a', 'xx')).toThrow('Invalid locale');
    expect(() => isAlpha('a', 'en-US', { ignore: 1 })).toThrow('ignore should be instance of a String or RegExp');
    expect(isAlpha('a-b', 'en-US', { ignore: /-/g })).toBe(true);
    check(isAlphanumeric, ['abc123', 'ABC'], ['abc 1', '', '-']);
    check(isAlphanumeric, ['äöü1'], ['ä-1'], 'de-DE');
    expect(isAlphanumeric('a b', 'en-US', { ignore: ' ' })).toBe(true);
    expect(() => isAlphanumeric('a', 'xx')).toThrow('Invalid locale');
    expect(isAlphaLocales).toContain('en-US');
    expect(isAlphanumericLocales).toContain('de-DE');
    expect(Object.keys(alpha)).toEqual(isAlphaLocales);
    expect(Object.keys(alphanumeric)).toEqual(isAlphanumericLocales);
  });

  it('every alpha locale accepts at least its own pattern for a-z or is a valid regexp', () => {
    for (const locale of isAlphaLocales) {
      expect(alpha[locale]).toBeInstanceOf(RegExp);
      expect(() => isAlpha('x', locale)).not.toThrow();
    }
    for (const locale of isAlphanumericLocales) {
      expect(() => isAlphanumeric('x', locale)).not.toThrow();
    }
  });

  it('isAscii / isMultibyte / width', () => {
    check(isAscii, ['foo'], ['fooä', '１２３', '']);
    check(isMultibyte, ['ひらがな', 'äbc'], ['abc', '']);
    check(isFullWidth, ['ひらがな', '１２３'], ['abc', '']);
    check(isHalfWidth, ['abc', '123', 'ｱｲｳ'], ['ひらがな']);
    check(isVariableWidth, ['abcひらがな', '１２３abc'], ['abc', 'ひらがな']);
    check(isSurrogatePair, ['𠮷野家', 'a𠮷'], ['abc', '']);
  });

  it('isBase32 / isBase58 / isBase64', () => {
    check(isBase32, ['ZG======', 'JBSWY3DPEB3W64TMMQ======'], ['zg======', 'ZG=', '1234', 'Z']);
    check(isBase58, ['3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy'], ['0OIl', 'abc0']);
    check(isBase64, ['TWFu', 'TWE=', 'TQ==', ''], ['TWF', 'T', '!!!!']);
    expect(isBase64('TWFu_-', { urlSafe: true })).toBe(true);
    expect(isBase64('TWFu+/', { urlSafe: true })).toBe(false);
    expect(isBase64('TQ', { urlSafe: true })).toBe(true);
    expect(isBase64('TW-_', { urlSafe: true })).toBe(true);
    expect(isBase64('TW-_')).toBe(false);
  });

  it('isHexadecimal / isHexColor / isOctal', () => {
    check(isHexadecimal, ['deadBEEF', '0xff', '0Xab', '01'], ['xyz', '', '0x']);
    check(isHexColor, ['#fff', '#FFFFFF', '#abcd', '#aabbccdd', 'fff'], ['#ff', '#ggg', '#fffff']);
    check(isOctal, ['0755', '0o17', '012'], ['0999', 'abc', '8']);
  });

  it('isLowercase / isUppercase', () => {
    check(isLowercase, ['abc', 'a1'], ['Abc']);
    check(isUppercase, ['ABC', 'A1'], ['aBC']);
  });

  it('isSlug', () => {
    check(isSlug, ['foo', 'foo-bar', 'foo_bar', 'foo123'], ['foo_', '-foo', 'foo--bar', 'foo bar', 'foo-', '']);
  });

  it('isLocale', () => {
    check(isLocale, ['en', 'en-US', 'de-DE', 'zh-Hans', 'en_US'.replace('_', '-')], ['', 'e', '1234', 'en-', 'toolongsubtag-abcdefghi']);
  });

  it('isEmpty', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty(' ')).toBe(false);
    expect(isEmpty(' ', { ignore_whitespace: true })).toBe(true);
    expect(isEmpty('a', { ignore_whitespace: true })).toBe(false);
  });

  it('isLength / isByteLength', () => {
    expect(isLength('abc', { min: 2, max: 4 })).toBe(true);
    expect(isLength('abc', { min: 4 })).toBe(false);
    expect(isLength('abc', { max: 2 })).toBe(false);
    expect(isLength('abc')).toBe(true);
    expect(isLength('𠮷', { min: 1, max: 1 })).toBe(true);
    expect(isByteLength('ä', { min: 2, max: 2 })).toBe(true);
    expect(isByteLength('ä', { max: 1 })).toBe(false);
    expect(isByteLength('abc', 2 as any)).toBe(true);
    expect(isByteLength('abc')).toBe(true);
  });

  it('isIn', () => {
    expect(isIn('a', ['a', 'b'] as any)).toBe(true);
    expect(isIn('c', ['a', 'b'] as any)).toBe(false);
    expect(isIn('ell', 'hello')).toBe(true);
    expect(isIn('xyz', 'hello')).toBe(false);
    expect(isIn('a', undefined)).toBe(false);
    expect(isIn('a', { a: 1 } as any)).toBe(true);
    expect(isIn('b', { a: 1 } as any)).toBe(false);
  });

  it('isWhitelisted', () => {
    expect(isWhitelisted('abc', 'abcd')).toBe(true);
    expect(isWhitelisted('abe', 'abcd')).toBe(false);
    expect(isWhitelisted('abc', ['a', 'b', 'c'])).toBe(true);
    expect(isWhitelisted('', 'abc')).toBe(true);
  });

  it('isJSON', () => {
    expect(isJSON('{"a":1}')).toBe(true);
    expect(isJSON('[1]')).toBe(true);
    expect(isJSON('nope')).toBe(false);
    expect(isJSON('1')).toBe(false);
    expect(isJSON('1', { allow_primitives: true })).toBe(false);
    expect(isJSON('true', { allow_primitives: true })).toBe(true);
    expect(isJSON('null')).toBe(false);
    expect(isJSON('null', { allow_primitives: true })).toBe(true);
  });

  it('isMimeType / isMagnetURI', () => {
    check(isMimeType, ['text/plain', 'application/json', 'image/svg+xml', 'application/vnd.api+json', 'text/html; charset=utf-8'], ['text', '/plain', 'text/', '']);
    check(isMagnetURI, ['magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a&dn=file&tr=udp://tracker'], ['magnet:', 'http://x', 'magnet:?xt=urn:btih:']);
  });

  it('isBoolean', () => {
    check(isBoolean, ['true', 'false', '1', '0'], ['yes', '', 'TRUE']);
    expect(isBoolean('yes', { loose: true })).toBe(true);
    expect(isBoolean('TRUE', { loose: true })).toBe(true);
    expect(isBoolean('No', { loose: true })).toBe(true);
    expect(isBoolean('maybe', { loose: true })).toBe(false);
  });
});
