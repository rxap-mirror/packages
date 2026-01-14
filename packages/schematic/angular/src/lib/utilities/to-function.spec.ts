import { NormalizeToFunction } from './to-function';
import { NormalizeDataProperty } from '@rxap/ts-morph';

jest.mock('@rxap/ts-morph', () => ({
  NormalizeDataProperty: jest.fn((val, defaultType) => ({ val, defaultType })),
}));

describe('NormalizeToFunction', () => {
  it('should return null if toFunction is undefined', () => {
    expect(NormalizeToFunction(undefined)).toBeNull();
  });

  it('should return null if toFunction is null', () => {
    expect(NormalizeToFunction(null)).toBeNull();
  });

  it('should return null if toFunction is an empty object', () => {
    expect(NormalizeToFunction({} as any)).toBeNull();
  });

  it('should normalize property using NormalizeDataProperty with defaultType', () => {
    const toFunction = { property: 'test-property' as any };
    const result = NormalizeToFunction(toFunction, 'string');

    expect(NormalizeDataProperty).toHaveBeenCalledWith('test-property', 'string');
    expect(result).toEqual({
      property: { val: 'test-property', defaultType: 'string' },
    });
    expect(Object.isFrozen(result)).toBe(true);
  });

  it('should use "unknown" as default defaultType', () => {
    const toFunction = { property: 'test-property' as any };
    NormalizeToFunction(toFunction);
    expect(NormalizeDataProperty).toHaveBeenCalledWith('test-property', 'unknown');
  });
});
