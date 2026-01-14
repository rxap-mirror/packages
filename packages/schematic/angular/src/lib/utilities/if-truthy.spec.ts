import { NormalizeIfTruthy } from './if-truthy';
import { NormalizeDataProperty } from '@rxap/ts-morph';

jest.mock('@rxap/ts-morph', () => ({
  NormalizeDataProperty: jest.fn((val) => `normalized-${val}`),
}));

describe('NormalizeIfTruthy', () => {
  it('should return null if item is undefined', () => {
    expect(NormalizeIfTruthy(undefined)).toBeNull();
  });

  it('should return null if item is an empty object', () => {
    expect(NormalizeIfTruthy({} as any)).toBeNull();
  });

  it('should normalize property using NormalizeDataProperty', () => {
    const item = { property: 'test-property' as any };
    const result = NormalizeIfTruthy(item);

    expect(NormalizeDataProperty).toHaveBeenCalledWith('test-property');
    expect(result).toEqual({
      property: 'normalized-test-property',
    });
    expect(Object.isSealed(result)).toBe(true);
  });
});
