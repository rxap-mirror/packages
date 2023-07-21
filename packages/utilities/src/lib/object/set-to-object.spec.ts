import { SetToObject } from './set-to-object';

describe('SetToObject', () => {
  it('should correctly assign a value to a simple object', () => {
    const obj = { a: 1 };
    SetToObject(obj, 'a', 2);
    expect(obj).toEqual({ a: 2 });
  });

  it('should correctly assign a value to a nested object', () => {
    const obj = { a: { b: { c: 0 } } };
    SetToObject(obj, 'a.b.c', 42);
    expect(obj).toEqual({ a: { b: { c: 42 } } });
  });

  it('should correctly assign a value to a new property', () => {
    const obj = { a: { b: { c: 0 } } };
    SetToObject(obj, 'a.b.d', 100);
    expect(obj)
      .toEqual({
        a: {
          b: {
            c: 0,
            d: 100,
          },
        },
      });
  });

  it('should correctly assign a value to a new nested object', () => {
    const obj = { a: 1 };
    SetToObject(obj, 'b.c.d', 42);
    expect(obj)
      .toEqual({
        a: 1,
        b: { c: { d: 42 } },
      });
  });

  it('should do nothing when path is empty', () => {
    const obj = { a: 1 };
    SetToObject(obj, '', 2);
    expect(obj).toEqual({ a: 1 });
  });

  it('should handle non-object values', () => {
    const obj = 5;
    SetToObject(obj, 'a.b', 2);
    expect(obj).toBe(5);
  });
});
