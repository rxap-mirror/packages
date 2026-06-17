import { DeleteNullProperties } from './delete-null-properties';

describe('DeleteNullProperties function', () => {
  test('should remove null properties from an object', () => {
    const inputObj = {
      a: 1,
      b: null,
      c: 'test',
    };

    const expectedOutput = {
      a: 1,
      c: 'test',
    };

    expect(DeleteNullProperties(inputObj)).toEqual(expectedOutput);
  });

  test('should not remove null properties from nested objects if recursive flag is not set', () => {
    const inputObj = {
      a: 1,
      b: null,
      c: {
        d: 3,
        e: null,
      },
    };

    const expectedOutput = {
      a: 1,
      c: {
        d: 3,
        e: null,
      },
    };

    expect(DeleteNullProperties(inputObj)).toEqual(expectedOutput);
  });

  test('should remove null properties from nested objects if recursive flag is set', () => {
    const inputObj = {
      a: 1,
      b: null,
      c: {
        d: 3,
        e: null,
      },
    };

    const expectedOutput = {
      a: 1,
      c: {
        d: 3,
      },
    };

    expect(DeleteNullProperties(inputObj, true)).toEqual(expectedOutput);
  });

  test('should preserve Date instances when recursive (not destroy them)', () => {
    const date = new Date('2020-01-01T00:00:00.000Z');
    const result: any = DeleteNullProperties({ a: date, b: null }, true);
    expect(result.a).toBeInstanceOf(Date);
    expect(result.a.getTime()).toBe(date.getTime());
    expect('b' in result).toBe(false);
  });
});
