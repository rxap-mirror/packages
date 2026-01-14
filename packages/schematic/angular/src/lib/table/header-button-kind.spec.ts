import { HeaderButtonKind } from './header-button-kind';

describe('HeaderButtonKind', () => {
  it('should have the expected values', () => {
    expect(HeaderButtonKind.DEFAULT).toBe('default');
    expect(HeaderButtonKind.FORM).toBe('form');
    expect(HeaderButtonKind.METHOD).toBe('method');
    expect(HeaderButtonKind.NAVIGATION).toBe('navigation');
  });
});
