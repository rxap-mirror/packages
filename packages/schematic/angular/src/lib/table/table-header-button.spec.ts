import { NormalizeHeaderButton } from './table-header-button';
import { HeaderButtonKind } from './header-button-kind';
import { NormalizeFormHeaderButton } from './header-button/form-header-button';
import { NormalizeBaseHeaderButton } from './header-button/base-header-button';

jest.mock('./header-button/form-header-button', () => ({ NormalizeFormHeaderButton: jest.fn(() => ({ kind: 'form' })) }));
jest.mock('./header-button/method-header-button', () => ({ NormalizeMethodHeaderButton: jest.fn(() => ({ kind: 'method' })) }));
jest.mock('./header-button/navigation-header-button', () => ({ NormalizeNavigationHeaderButton: jest.fn(() => ({ kind: 'navigation' })) }));
jest.mock('./header-button/base-header-button', () => ({ NormalizeBaseHeaderButton: jest.fn(() => ({ kind: 'default' })) }));

describe('HeaderButton Multiplexer', () => {
  it('should return null for empty input', () => {
    expect(NormalizeHeaderButton()).toBeNull();
    expect(NormalizeHeaderButton({} as any)).toBeNull();
  });

  it('should route to NormalizeFormHeaderButton', () => {
    NormalizeHeaderButton({ kind: HeaderButtonKind.FORM } as any);
    expect(NormalizeFormHeaderButton).toHaveBeenCalled();
  });

  it('should route to NormalizeBaseHeaderButton by default', () => {
    NormalizeHeaderButton({ kind: HeaderButtonKind.DEFAULT } as any);
    expect(NormalizeBaseHeaderButton).toHaveBeenCalled();
  });
});
