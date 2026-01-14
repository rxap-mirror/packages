import { NormalizeBaseHeaderButton } from './base-header-button';
import { HeaderButtonKind } from '../header-button-kind';

jest.mock('@rxap/utilities', () => ({
  capitalize: jest.fn((s) => s.charAt(0).toUpperCase() + s.slice(1)),
}));

describe('NormalizeBaseHeaderButton', () => {
  it('should normalize base header button', () => {
    const options = { kind: HeaderButtonKind.DEFAULT };
    const result = NormalizeBaseHeaderButton(options as any, 'user');

    expect(result.kind).toBe(HeaderButtonKind.DEFAULT);
    expect(result.label).toBe('Create User');
    expect(result.icon).toBe('add');
  });

  it('should handle missing label', () => {
    const result = NormalizeBaseHeaderButton({ kind: HeaderButtonKind.DEFAULT } as any);
    expect(result.label).toBeNull();
  });
});
