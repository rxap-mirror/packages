import { isBtcAddress as _isBtcAddress } from './isBtcAddress';
import { isDataURI as _isDataURI } from './isDataURI';
import { isEmail as _isEmail } from './isEmail';
import { isEthereumAddress as _isEthereumAddress } from './isEthereumAddress';
import { isFQDN as _isFQDN } from './isFQDN';
import { isHash as _isHash } from './isHash';
import { isIP as _isIP } from './isIP';
import { isIPRange as _isIPRange } from './isIPRange';
import { isJWT as _isJWT } from './isJWT';
import { isMACAddress as _isMACAddress } from './isMACAddress';
import { isMD5 as _isMD5 } from './isMD5';
import { isMongoId as _isMongoId } from './isMongoId';
import { isURL as _isURL } from './isURL';
import { isUUID as _isUUID } from './isUUID';

const isBtcAddress: (v: any, ...a: any[]) => boolean = _isBtcAddress as any;
const isDataURI: (v: any, ...a: any[]) => boolean = _isDataURI as any;
const isEmail: (v: any, ...a: any[]) => boolean = _isEmail as any;
const isEthereumAddress: (v: any, ...a: any[]) => boolean = _isEthereumAddress as any;
const isFQDN: (v: any, ...a: any[]) => boolean = _isFQDN as any;
const isHash: (v: any, ...a: any[]) => boolean = _isHash as any;
const isIP: (v: any, ...a: any[]) => boolean = _isIP as any;
const isIPRange: (v: any, ...a: any[]) => boolean = _isIPRange as any;
const isJWT: (v: any, ...a: any[]) => boolean = _isJWT as any;
const isMACAddress: (v: any, ...a: any[]) => boolean = _isMACAddress as any;
const isMD5: (v: any, ...a: any[]) => boolean = _isMD5 as any;
const isMongoId: (v: any, ...a: any[]) => boolean = _isMongoId as any;
const isURL: (v: any, ...a: any[]) => boolean = _isURL as any;
const isUUID: (v: any, ...a: any[]) => boolean = _isUUID as any;

function check(fn: (v: any, ...a: any[]) => boolean, valid: unknown[], invalid: unknown[], ...args: unknown[]) {
  for (const v of valid) {
    expect([v, fn(v, ...args)]).toEqual([v, true]);
  }
  for (const v of invalid) {
    expect([v, fn(v, ...args)]).toEqual([v, false]);
  }
}

describe('network validators', () => {
  it('isIP', () => {
    check(isIP, ['127.0.0.1', '255.255.255.255', '::1', '2001:db8::ff00:42:8329', 'fe80::1%eth0'], ['256.0.0.1', '1.2.3', 'abc', '', '1.2.3.4.5', '02001:db8::1']);
    expect(isIP('127.0.0.1', 4)).toBe(true);
    expect(isIP('127.0.0.1', 6)).toBe(false);
    expect(isIP('::1', '6')).toBe(true);
    expect(isIP('::1', 4)).toBe(false);
    expect(isIP('1.1.1.1', 5)).toBe(false);
  });

  it('isIPRange', () => {
    check(isIPRange, ['127.0.0.1/24', '10.0.0.0/8', '::1/128', '2001:db8::/32'], ['127.0.0.1', '127.0.0.1/33', '::1/129', 'abc/2', '1.1.1.1/a']);
    expect(isIPRange('127.0.0.1/24', 4)).toBe(true);
    expect(isIPRange('127.0.0.1/24', 6)).toBe(false);
    expect(isIPRange('::1/64', 6)).toBe(true);
  });

  it('isFQDN', () => {
    check(isFQDN, ['example.com', 'sub.example.co.uk', 'a-b.example.org', 'xn--bcher-kva.example'], ['example', '-a.com', 'a-.com', 'exa_mple.com', '', 'a..com', 'example.c', 'example.123']);
    expect(isFQDN('example', { require_tld: false })).toBe(true);
    expect(isFQDN('example.com.', { allow_trailing_dot: true })).toBe(true);
    expect(isFQDN('example.com.')).toBe(false);
    expect(isFQDN('exa_mple.com', { allow_underscores: true })).toBe(true);
    expect(isFQDN('*.example.com')).toBe(false);
    expect(isFQDN('example.123', { allow_numeric_tld: true })).toBe(true);
    expect(isFQDN('a'.repeat(64) + '.com')).toBe(false);
  });

  it('isEmail', () => {
    check(isEmail, ['foo@bar.com', 'foo.bar+baz@sub.example.org', 'x@y.co', '"quoted"@example.com'], ['foo', 'foo@', '@bar.com', 'foo@bar', 'foo bar@x.com', 'foo@@bar.com', '', 'a@b..com']);
    expect(isEmail('Name <foo@bar.com>', { allow_display_name: true })).toBe(true);
    expect(isEmail('Name <foo@bar.com>')).toBe(false);
    expect(isEmail('foo@bar.com', { require_display_name: true })).toBe(false);
    expect(isEmail('Name <foo@bar.com>', { require_display_name: true })).toBe(true);
    expect(isEmail('"Na.me" <foo@bar.com>', { allow_display_name: true })).toBe(true);
    expect(isEmail('Na.me <foo@bar.com>', { allow_display_name: true })).toBe(false);
    expect(isEmail('üser@example.com')).toBe(true);
    expect(isEmail('üser@example.com', { allow_utf8_local_part: false })).toBe(false);
    expect(isEmail('foo@bar', { require_tld: false })).toBe(true);
    expect(isEmail('foo@[127.0.0.1]', { allow_ip_domain: true })).toBe(true);
    expect(isEmail('foo@[127.0.0.1]')).toBe(false);
    expect(isEmail('foo@bar.com', { blacklisted_chars: 'o' })).toBe(false);
    expect(isEmail('a'.repeat(250) + '@b.com')).toBe(false);
    expect(isEmail('a'.repeat(65) + '@b.com')).toBe(false);
    expect(isEmail('foo.bar@gmail.com')).toBe(true);
    expect(isEmail('a@gmail.com', { domain_specific_validation: true })).toBe(false);
    expect(isEmail('foo.bar@gmail.com', { domain_specific_validation: true })).toBe(true);
    expect(isEmail('a'.repeat(65) + '@b.com', { ignore_max_length: true })).toBe(true);
    expect(isEmail('foo@bar.com', { domain_specific_validation: true })).toBe(true);
  });

  it('isURL', () => {
    check(isURL, ['http://example.com', 'https://example.com/path?x=1#frag', 'http://127.0.0.1:3000', 'http://127.0.0.1/a', 'ftp://example.com', 'http://user:pw@example.com', 'example.com', 'http://[::1]:80/'], ['', 'http://', 'http://.com', 'mailto:a@b.com', 'http://exa mple.com', 'http://example.com:99999', '//example.com', 'javascript:alert(1)']);
    expect(isURL('example.com', { require_protocol: true })).toBe(false);
    expect(isURL('http://example.com', { protocols: ['https'] })).toBe(false);
    expect(isURL('https://example.com', { protocols: ['https'] })).toBe(true);
    expect(isURL('http://localhost', { require_tld: false })).toBe(true);
    expect(isURL('http://localhost')).toBe(false);
    expect(isURL('//example.com', { allow_protocol_relative_urls: true })).toBe(true);
    expect(isURL('http://example.com', { require_host: true })).toBe(true);
    expect(isURL('http://example.com', { require_valid_protocol: false })).toBe(true);
    expect(isURL('http://example.com', { host_whitelist: ['other.com'] })).toBe(false);
    expect(isURL('http://example.com', { host_whitelist: ['example.com'] })).toBe(true);
    expect(isURL('http://example.com', { host_blacklist: ['example.com'] })).toBe(false);
    expect(isURL('http://example.com', { require_port: true })).toBe(false);
    expect(isURL('http://example.com:80', { require_port: true })).toBe(true);
    expect(isURL('http://example.com', { disallow_auth: true })).toBe(true);
    expect(isURL('http://u:p@example.com', { disallow_auth: true })).toBe(false);
    expect(isURL('http://example.com:80', { validate_length: true })).toBe(true);
    expect(isURL('http://example.com/' + 'a'.repeat(2100))).toBe(false);
    expect(isURL('http://example_x.com', { allow_underscores: true })).toBe(true);
    expect(isURL('http://example.com.', { allow_trailing_dot: true })).toBe(true);
    expect(isURL('http://example.com/a b')).toBe(false);
  });

  it('isMACAddress', () => {
    check(isMACAddress, ['ab:cd:ef:01:23:45', 'AB-CD-EF-01-23-45', 'abcd.ef01.2345'], ['ab:cd:ef:01:23', 'zz:cd:ef:01:23:45', '', 'ab:cd:ef:01:23:45:67']);
    expect(isMACAddress('abcdef012345', { no_separators: true })).toBe(true);
    expect(isMACAddress('abcdef012345')).toBe(false);
    expect(isMACAddress('abcdef012345', { no_colons: true })).toBe(true);
  });

  it('isUUID', () => {
    const v4 = '550e8400-e29b-41d4-a716-446655440000';
    check(isUUID, [v4, '6ba7b810-9dad-11d1-80b4-00c04fd430c8'], ['', 'abc', '550e8400e29b41d4a716446655440000', '550e8400-e29b-41d4-a716-44665544000g']);
    expect(isUUID(v4, 4)).toBe(true);
    expect(isUUID(v4, '4')).toBe(true);
    expect(isUUID(v4, 1)).toBe(false);
    expect(isUUID(v4, 3)).toBe(false);
    expect(isUUID(v4, 'all')).toBe(true);
    expect(isUUID(v4, 'nonsense' as any)).toBe(false);
  });

  it('isMongoId / isMD5 / isHash', () => {
    check(isMongoId, ['507f1f77bcf86cd799439011'], ['507f1f77bcf86cd79943901', '507f1f77bcf86cd79943901z', '']);
    check(isMD5, ['d41d8cd98f00b204e9800998ecf8427e'], ['d41d8cd98f00b204e9800998ecf8427', '']);
    expect(isHash('d41d8cd98f00b204e9800998ecf8427e', 'md5')).toBe(true);
    expect(isHash('da39a3ee5e6b4b0d3255bfef95601890afd80709', 'sha1')).toBe(true);
    expect(isHash('da39a3ee5e6b4b0d3255bfef95601890afd80709', 'md5')).toBe(false);
    expect(isHash('a'.repeat(64), 'sha256')).toBe(true);
    expect(isHash('a'.repeat(96), 'sha384')).toBe(true);
    expect(isHash('a'.repeat(128), 'sha512')).toBe(true);
    expect(isHash('a'.repeat(8), 'crc32')).toBe(true);
    expect(isHash('a'.repeat(8), 'crc32b')).toBe(true);
    expect(isHash('a'.repeat(32), 'md4')).toBe(true);
    expect(isHash('a'.repeat(32), 'ripemd128')).toBe(true);
    expect(isHash('a'.repeat(40), 'ripemd160')).toBe(true);
    expect(isHash('a'.repeat(48), 'tiger192')).toBe(true);
    expect(isHash('a'.repeat(64), 'xxx')).toBe(false);
  });

  it('isJWT', () => {
    check(isJWT, ['eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abc_-123', 'a.b.c', 'a.b'], ['a', '', 'a.b.c.d', 'a b.c.d']);
  });

  it('isDataURI', () => {
    check(isDataURI, ['data:text/plain;base64,SGVsbG8=', 'data:,Hello', 'data:image/png;base64,iVBORw0KGgo='], ['data:', 'text/plain;base64,SGVsbG8=', '', 'data:text/plain;base64,###']);
  });

  it('isBtcAddress / isEthereumAddress', () => {
    check(isBtcAddress, ['1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'], ['abc', '', '0BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2']);
    check(isEthereumAddress, ['0x52908400098527886E0F7030069857D2E4169EE7', '0xde709f2102306220921060314715629080e2fb77'], ['0x52908400098527886E0F7030069857D2E4169EE', '52908400098527886E0F7030069857D2E4169EE7', '', '0xZ2908400098527886E0F7030069857D2E4169EE7']);
  });
});
