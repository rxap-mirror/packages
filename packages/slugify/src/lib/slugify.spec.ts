import {
  slugify,
  Slugify,
} from './slugify';

describe('@rxap/slugify', () => {

  it('should create slugify string', () => {

    expect(new Slugify().replace('customer-value')).toEqual('customer-value');
    expect(new Slugify().replace('customer/value')).toEqual('customervalue');

  });

  it('should create with random suffix', () => {

    expect(slugify('value', { suffix: true })).toMatch(/^value-\w{12}$/);

  });


  it('should transliterate special characters', () => {
    expect(slugify('Äpfel & Birnen')).toEqual('Apfel-and-Birnen');
    expect(slugify('€5')).toEqual('euro5');
  });

  it('should use locale specific mappings', () => {
    expect(slugify('Über', { locale: 'de' })).toEqual('UEber');
    expect(slugify('đồng', { locale: 'vi' })).toEqual('dong');
  });

  it('should fall back to default mapping for unknown locales', () => {
    expect(slugify('Über', { locale: 'xx' })).toEqual('Uber');
  });

  it('should lowercase', () => {
    expect(slugify('Hello World', { lower: true })).toEqual('hello-world');
  });

  it('should collapse whitespace and trim', () => {
    expect(slugify('  a   b  ')).toEqual('a-b');
  });

  it('should support a custom replacement', () => {
    expect(slugify('hello world', { replacement: '_' })).toEqual('hello_world');
  });

  it('should support strict mode', () => {
    expect(slugify('Hello, World!', { strict: true })).toEqual('Hello-World');
    expect(slugify('a.b_c', { strict: true })).toEqual('abc');
  });

  it('should support a custom remove pattern', () => {
    expect(slugify('banana', { remove: /[aeiou]/g })).toEqual('bnn');
  });

  it('should support a custom suffix length', () => {
    expect(slugify('v', { suffix: true, suffixLength: 4 })).toMatch(/^v-\w{4}$/);
  });

  it('should support a custom map', () => {
    expect(slugify('I ☺ it', {}, { '☺': 'smile' })).toEqual('I-smile-it');
  });

  it('should extend the charMap of an instance', () => {
    const s = new Slugify();
    s.extend({ '☺': 'smile' });
    expect(s.charMap['☺']).toBe('smile');
    expect(new Slugify().charMap['☺']).toBeUndefined();
  });
});
