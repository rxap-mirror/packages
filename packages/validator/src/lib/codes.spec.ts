import { isBIC as _isBIC } from './isBIC';
import { isCreditCard as _isCreditCard } from './isCreditCard';
import { isCurrency as _isCurrency } from './isCurrency';
import { isEAN as _isEAN } from './isEAN';
import { isHSL as _isHSL } from './isHSL';
import { isIBAN as _isIBAN, isIBANLocales } from './isIBAN';
import { isIdentityCard as _isIdentityCard } from './isIdentityCard';
import { isIMEI as _isIMEI } from './isIMEI';
import { isISBN as _isISBN } from './isISBN';
import { isISIN as _isISIN } from './isISIN';
import { isISO31661Alpha2 as _isISO31661Alpha2, CountryCodes } from './isISO31661Alpha2';
import { isISO31661Alpha3 as _isISO31661Alpha3 } from './isISO31661Alpha3';
import { isISRC as _isISRC } from './isISRC';
import { isISSN as _isISSN } from './isISSN';
import { isLicensePlate as _isLicensePlate } from './isLicensePlate';
import { isMobilePhone as _isMobilePhone, isMobilePhoneLocales } from './isMobilePhone';
import { isPassportNumber as _isPassportNumber } from './isPassportNumber';
import { isPostalCode as _isPostalCode, isPostalCodeLocales } from './isPostalCode';
import { isRgbColor as _isRgbColor } from './isRgbColor';
import { isStrongPassword as _isStrongPassword } from './isStrongPassword';
import { isTaxID as _isTaxID } from './isTaxID';
import { isVAT as _isVAT, vatMatchers } from './isVAT';

type Fn = (v: any, ...a: any[]) => any;
const isBIC: Fn = _isBIC;
const isCreditCard: Fn = _isCreditCard;
const isCurrency: Fn = _isCurrency;
const isEAN: Fn = _isEAN;
const isHSL: Fn = _isHSL;
const isIBAN: Fn = _isIBAN;
const isIdentityCard: Fn = _isIdentityCard;
const isIMEI: Fn = _isIMEI;
const isISBN: Fn = _isISBN;
const isISIN: Fn = _isISIN;
const isISO31661Alpha2: Fn = _isISO31661Alpha2;
const isISO31661Alpha3: Fn = _isISO31661Alpha3;
const isISRC: Fn = _isISRC;
const isISSN: Fn = _isISSN;
const isLicensePlate: Fn = _isLicensePlate;
const isMobilePhone: Fn = _isMobilePhone;
const isPassportNumber: Fn = _isPassportNumber;
const isPostalCode: Fn = _isPostalCode;
const isRgbColor: Fn = _isRgbColor;
const isStrongPassword: Fn = _isStrongPassword;
const isTaxID: Fn = _isTaxID;
const isVAT: Fn = _isVAT;

function check(fn: Fn, valid: unknown[], invalid: unknown[], ...args: unknown[]) {
  for (const v of valid) {
    expect([v, !!fn(v, ...args)]).toEqual([v, true]);
  }
  for (const v of invalid) {
    expect([v, !!fn(v, ...args)]).toEqual([v, false]);
  }
}

describe('financial / identifier validators', () => {
  it('isCreditCard', () => {
    check(isCreditCard, ['4111111111111111', '4111 1111 1111 1111', '5500-0000-0000-0004', '378282246310005'], ['4111111111111112', 'abc', '', '1234']);
  });

  it('isIBAN', () => {
    check(isIBAN, ['DE89370400440532013000', 'GB29NWBK60161331926819', 'FR1420041010050500013M02606'], ['DE89370400440532013001', 'XX00', '', 'DE8937040044053201300']);
    expect(isIBANLocales).toContain('DE');
  });

  it('isBIC', () => {
    check(isBIC, ['DEUTDEFF', 'DEUTDEFF500', 'NEDSZAJJ'], ['DEUT', 'DEUTXXFF', '12345678', '']);
  });

  it('isEAN', () => {
    check(isEAN, ['4006381333931', '96385074', '036000291452'.padStart(13, '0')], ['4006381333932', '123', 'abc', '']);
  });

  it('isISBN', () => {
    check(isISBN, ['0306406152', '978-3-16-148410-0', '9783161484100', '0-306-40615-2'], ['0306406153', '123', '9783161484101', '']);
    expect(isISBN('0306406152', 10)).toBe(true);
    expect(isISBN('0306406152', 13)).toBe(false);
    expect(isISBN('9783161484100', '13')).toBe(true);
    expect(isISBN('9783161484100', 10)).toBe(false);
    expect(isISBN('043942089X', 10)).toBe(true);
    expect(isISBN('0306406152', 11 as any)).toBe(false);
  });

  it('isISIN', () => {
    check(isISIN, ['US0378331005', 'AU0000XVGZA3', 'DE000BAY0017'], ['US0378331006', 'abc', '', 'US037833100']);
  });

  it('isISSN', () => {
    check(isISSN, ['0378-5955', '03785955', '2434-561X', '2434-561x'], ['0378-5956', '1234', '', '0378-59555']);
    expect(isISSN('03785955', { require_hyphen: true })).toBe(false);
    expect(isISSN('0378-5955', { require_hyphen: true })).toBe(true);
    expect(isISSN('2434-561x', { case_sensitive: true })).toBe(false);
  });

  it('isISRC', () => {
    check(isISRC, ['USRC17607839', 'US-RC1-76-07839'.replace(/-/g, '')], ['US123', '', 'usrc1760783']);
  });

  it('isIMEI', () => {
    check(isIMEI, ['356938035643809', '490154203237518'], ['356938035643808', '123', '', '35693803564380a']);
    expect(isIMEI('35-693803-564380-9', { allow_hyphens: true })).toBe(true);
    expect(isIMEI('35-693803-564380-9')).toBe(false);
    expect(isIMEI('123456789012345')).toBe(false);
    expect(isIMEI('35-693803-564380-8', { allow_hyphens: true })).toBe(false);
  });

  it('isCurrency', () => {
    check(isCurrency, ['$10', '$10.50', '-$10', '$1,000.00', '10', '$0'], ['$', 'abc', '', '$10.5.5']);
    expect(isCurrency('10', { require_symbol: true })).toBe(false);
    expect(isCurrency('€10', { symbol: '€' })).toBe(true);
    expect(isCurrency('10€', { symbol: '€', symbol_after_digits: true })).toBe(true);
    expect(isCurrency('$ 10', { allow_space_after_symbol: true })).toBe(true);
    expect(isCurrency('-$10', { allow_negatives: false })).toBe(false);
    expect(isCurrency('($10)', { parens_for_negatives: true })).toBe(true);
    expect(isCurrency('$10.50', { allow_decimal: false })).toBe(false);
    expect(isCurrency('$10,50', { decimal_separator: ',', thousands_separator: '.' })).toBe(true);
    expect(isCurrency('$10', { require_decimal: true })).toBe(false);
    expect(isCurrency('$10.5', { digits_after_decimal: [2] })).toBe(false);
  });

  it('isBtc/eth covered in network; isRgbColor / isHSL', () => {
    check(isRgbColor, ['rgb(0,0,0)', 'rgba(0,0,0,0.5)', 'rgb(10%,20%,30%)'], ['rgb(256,0,0)', 'rgb(0,0)', 'abc', '', '#fff']);
    expect(isRgbColor('rgb(10%,20%,30%)', false)).toBe(false);
    expect(isRgbColor('rgb(1,2,3)', false)).toBe(true);
    check(isHSL, ['hsl(0,0%,0%)', 'hsl(360, 100%, 50%)', 'hsla(120,50%,50%,0.5)', 'hsl(120deg 50% 50%)'], ['abc', '', 'hsl(1,2,3)']);
  });

  it('isStrongPassword', () => {
    check(isStrongPassword, ['Passw0rd!x'], ['password', 'Passw0rd', 'Sh0rt!a', '']);
    expect(isStrongPassword('abcdefgh', { minLowercase: 1, minUppercase: 0, minNumbers: 0, minSymbols: 0, minLength: 8 })).toBe(true);
    expect(isStrongPassword('abc', { minLength: 3, minLowercase: 3, minUppercase: 0, minNumbers: 0, minSymbols: 0 })).toBe(true);
    expect(typeof isStrongPassword('Passw0rd!x', { returnScore: true })).toBe('number');
    expect(isStrongPassword('Passw0rd!x', { returnScore: true })).toBeGreaterThan(isStrongPassword('aaaaaaaaaa', { returnScore: true }));
  });

  it('isISO3166', () => {
    check(isISO31661Alpha2, ['DE', 'us', 'FR'], ['XX', 'DEU', '', 'D']);
    check(isISO31661Alpha3, ['DEU', 'usa', 'FRA'], ['XXX', 'DE', '', 'DEUU']);
    expect(CountryCodes).toContain('DE');
  });
});

describe('locale based validators', () => {
  it('isMobilePhone', () => {
    check(isMobilePhone, ['+4915112345678', '015112345678', '+14155552671', '4155552671'], ['abc', '', '123']);
    check(isMobilePhone, ['+4915112345678', '015112345678'], ['+14155552671x', '123'], 'de-DE');
    check(isMobilePhone, ['4155552671'], ['abc'], 'en-US');
    check(isMobilePhone, ['015112345678'], ['abc'], ['de-DE', 'en-GB']);
    expect(isMobilePhone('015112345678', 'any', { strictMode: true })).toBe(false);
    expect(isMobilePhone('+4915112345678', 'de-DE', { strictMode: true })).toBe(true);
    expect(() => isMobilePhone('1', 'xx-XX' as any)).toThrow('Invalid locale');
    expect(isMobilePhoneLocales).toContain('de-DE');
    for (const l of isMobilePhoneLocales) {
      expect(typeof isMobilePhone('1', l)).toBe('boolean');
    }
  });

  it('isPostalCode', () => {
    check(isPostalCode, ['10115', '01067'], ['1011', 'abcde', '', '101155'], 'DE');
    check(isPostalCode, ['SW1A 1AA', 'EC1A 1BB'], ['12345', ''], 'GB');
    check(isPostalCode, ['12345', '12345-6789'], ['1234', 'abcde'], 'US');
    check(isPostalCode, ['10115', 'SW1A 1AA'], ['', '!!'], 'any');
    expect(() => isPostalCode('1', 'XX')).toThrow('Invalid locale');
    for (const l of isPostalCodeLocales) {
      expect(typeof isPostalCode('1', l)).toBe('boolean');
    }
  });

  it('smoke tests every tax id / identity card locale with generated input', () => {
    let seed = 42;
    const rnd = (n: number) => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed % n;
    };
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const taxLocales = ['bg-BG', 'cs-CZ', 'de-AT', 'de-DE', 'dk-DK', 'el-CY', 'el-GR', 'en-GB', 'en-IE', 'en-US', 'es-ES', 'et-EE', 'fi-FI', 'fr-BE', 'fr-FR', 'fr-LU', 'hr-HR', 'hu-HU', 'it-IT', 'lv-LV', 'mt-MT', 'nl-NL', 'pl-PL', 'pt-BR', 'pt-PT', 'ro-RO', 'sk-SK', 'sl-SI', 'sv-SE'];
    const idLocales = ['ES', 'IN', 'IR', 'IT', 'NO', 'TH', 'he-IL', 'ar-LY', 'ar-TN', 'zh-CN', 'zh-TW'];
    let taxValid = 0;
    let idValid = 0;
    for (let i = 0; i < 4000; i++) {
      const len = 6 + rnd(14);
      const alnum = Array.from({ length: len }, () => alphabet[rnd(36)]).join('');
      const digits = Array.from({ length: len }, () => alphabet[rnd(10)]).join('');
      for (const input of [alnum, digits]) {
        for (const l of taxLocales) {
          if (isTaxID(input, l)) taxValid++;
        }
        for (const l of idLocales) {
          if (isIdentityCard(input, l)) idValid++;
        }
      }
    }
    expect(taxValid).toBeGreaterThan(0);
    expect(idValid).toBeGreaterThan(0);
  });

  it('isTaxID', () => {
    expect(isTaxID('94-3401259')).toBe(true);
    expect(isTaxID('abc', 'en-US')).toBe(false);
    expect(isTaxID('', 'en-US')).toBe(false);
    expect(isTaxID('12345678909', 'pt-BR')).toBe(true);
    expect(() => isTaxID('1', 'xx-XX')).toThrow('Invalid locale');
    expect(isTaxID('94-3401259', 'en-US')).toBe(true);
  });

  it('isVAT', () => {
    expect(isVAT('IT12345678901', 'IT')).toBe(true);
    expect(isVAT('12345678901', 'IT')).toBe(true);
    expect(isVAT('IT1234567890', 'IT')).toBe(false);
    expect(isVAT('GB999 9999 00', 'GB')).toBe(true);
    expect(isVAT('GB999 9999 97', 'GB')).toBe(false);
    expect(() => isVAT('1', 'XX')).toThrow("Invalid country code: 'XX'");
    expect(() => isVAT(1 as any, 'IT')).toThrow(TypeError);
    expect(Object.keys(vatMatchers)).toEqual(expect.arrayContaining(['GB', 'IT']));
  });

  it('isLicensePlate', () => {
    check(isLicensePlate, ['B AB 1234', 'M-AB 123', 'HH AB 12'], ['', '!!!!'], 'de-DE');
    expect(isLicensePlate('B AB 1234', 'any')).toBe(true);
    expect(isLicensePlate('!!', 'any')).toBe(false);
    expect(() => isLicensePlate('x', 'xx')).toThrow('Invalid locale');
  });

  it('isIdentityCard', () => {
    check(isIdentityCard, ['12345678Z'], ['12345678A', '', 'abc'], 'ES');
    expect(isIdentityCard('12345678Z', 'any')).toBe(true);
    expect(isIdentityCard('!', 'any')).toBe(false);
    expect(() => isIdentityCard('x', 'xx')).toThrow('Invalid locale');
  });

  it('isPassportNumber', () => {
    check(isPassportNumber, ['C01X00T47', 'c01x00t47', 'C01X 00T47'], ['', '123', 'C01X00T4'], 'DE');
    expect(isPassportNumber('123', 'XX')).toBe(false);
  });
});
