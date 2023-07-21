import { DeleteUndefinedProperties } from './delete-undefined-properties';

describe('DeleteUndefinedProperties', () => {
  it('should remove undefined properties from the object', () => {
    const obj = {
      a: 1,
      b: undefined,
      c: 'test',
    };
    const expectedObj = {
      a: 1,
      c: 'test',
    };

    const result = DeleteUndefinedProperties(obj);

    expect(result).toEqual(expectedObj);
  });

  it('should not remove undefined properties from nested objects when recursive is false', () => {
    const obj = {
      a: 1,
      b: undefined,
      c: {
        d: 4,
        e: undefined,
      },
    };
    const expectedObj = {
      a: 1,
      c: {
        d: 4,
        e: undefined,
      },
    };

    const result = DeleteUndefinedProperties(obj);

    expect(result).toEqual(expectedObj);
  });

  it('should remove undefined properties from nested objects when recursive is true', () => {
    const obj = {
      a: 1,
      b: undefined,
      c: {
        d: 4,
        e: undefined,
      },
    };
    const expectedObj = {
      a: 1,
      c: { d: 4 },
    };

    const result = DeleteUndefinedProperties(obj, true);

    expect(result).toEqual(expectedObj);
  });

  it('should return an empty object if the input object only has undefined properties', () => {
    const obj = {
      a: undefined,
      b: undefined,
    };
    const expectedObj = {};

    const result = DeleteUndefinedProperties(obj);

    expect(result).toEqual(expectedObj);
  });

  it('should return the same object if there are no undefined properties', () => {
    const obj = {
      a: 1,
      b: 'test',
      c: {
        d: 4,
        e: 'test',
      },
    };

    const result = DeleteUndefinedProperties(obj);

    expect(result).toEqual(obj);
  });
});
