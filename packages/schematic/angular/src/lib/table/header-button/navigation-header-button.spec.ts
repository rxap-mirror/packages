import { NormalizeNavigationHeaderButton, IsNavigationHeaderButton, IsNormalizedNavigationHeaderButton } from './navigation-header-button';
import { HeaderButtonKind } from '../header-button-kind';

jest.mock('./base-header-button', () => ({ NormalizeBaseHeaderButton: jest.fn((o) => ({ ...o })) }));

describe('NormalizeNavigationHeaderButton', () => {
  it('should normalize navigation header button', () => {
    const options = { kind: HeaderButtonKind.NAVIGATION, route: '/home' };
    const result = NormalizeNavigationHeaderButton(options as any);

    expect(result.kind).toBe(HeaderButtonKind.NAVIGATION);
    expect(result.route).toBe('/home');
  });

  it('should throw if route is missing', () => {
    expect(() => NormalizeNavigationHeaderButton({ kind: HeaderButtonKind.NAVIGATION } as any)).toThrow('The route property is required for a navigation header button');
  });

  describe('Type Guards', () => {
    it('IsNavigationHeaderButton', () => {
      expect(IsNavigationHeaderButton({ kind: HeaderButtonKind.NAVIGATION } as any)).toBe(true);
    });
    it('IsNormalizedNavigationHeaderButton', () => {
      expect(IsNormalizedNavigationHeaderButton({ kind: HeaderButtonKind.NAVIGATION } as any)).toBe(true);
    });
  });
});
