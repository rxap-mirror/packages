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
});
