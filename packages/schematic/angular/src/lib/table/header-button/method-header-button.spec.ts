import { NormalizeMethodHeaderButton, IsMethodHeaderButton, IsNormalizedMethodHeaderButton } from './method-header-button';
import { HeaderButtonKind } from '../header-button-kind';

jest.mock('./base-header-button', () => ({ NormalizeBaseHeaderButton: jest.fn((o) => ({ ...o })) }));
jest.mock('../../method/method-options', () => ({ NormalizeMethodOptions: jest.fn((m) => m) }));

describe('NormalizeMethodHeaderButton', () => {
  it('should normalize method header button', () => {
    const options = { kind: HeaderButtonKind.METHOD, method: { kind: 'default' } };
    const result = NormalizeMethodHeaderButton(options as any);

    expect(result.kind).toBe(HeaderButtonKind.METHOD);
    expect(result.method).toBeDefined();
  });

  it('should throw if method is missing', () => {
    expect(() => NormalizeMethodHeaderButton({ kind: HeaderButtonKind.METHOD } as any)).toThrow('The import property is required for a form header button');
  });

  describe('Type Guards', () => {
    it('IsMethodHeaderButton', () => {
      expect(IsMethodHeaderButton({ kind: HeaderButtonKind.METHOD } as any)).toBe(true);
    });
    it('IsNormalizedMethodHeaderButton', () => {
      expect(IsNormalizedMethodHeaderButton({ kind: HeaderButtonKind.METHOD } as any)).toBe(true);
    });
  });
});
