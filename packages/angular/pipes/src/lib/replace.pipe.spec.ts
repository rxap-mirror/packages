import { ReplacePipe } from './replace.pipe';

describe('ReplacePipe', () => {
  it('create an instance', () => {
    const pipe = new ReplacePipe();
    expect(pipe).toBeTruthy();
  });

  it('should replace all matches of a global expression', () => {
    expect(new ReplacePipe().transform('a-b-c', /-/g, '+')).toBe('a+b+c');
  });

  it('should replace only the first match of a non global expression', () => {
    expect(new ReplacePipe().transform('a-b-c', /-/, '+')).toBe('a+b-c');
  });

  it('should return an empty string for an empty or missing value', () => {
    expect(new ReplacePipe().transform('', /a/g, 'b')).toBe('');
    expect(new ReplacePipe().transform(undefined as any, /a/g, 'b')).toBe('');
    expect(new ReplacePipe().transform(null as any, /a/g, 'b')).toBe('');
  });
});
