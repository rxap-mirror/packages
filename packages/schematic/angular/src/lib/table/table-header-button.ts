import { HeaderButtonKind } from './header-button-kind';
import {
  BaseHeaderButton,
  NormalizeBaseHeaderButton,
  NormalizedBaseHeaderButton,
} from './header-button/base-header-button';
import {
  FormHeaderButton,
  NormalizedFormHeaderButton,
  NormalizeFormHeaderButton,
} from './header-button/form-header-button';
import {
  NavigationHeaderButton,
  NormalizedNavigationHeaderButton,
  NormalizeNavigationHeaderButton,
} from './header-button/navigation-header-button';

export type HeaderButton = BaseHeaderButton | FormHeaderButton | NavigationHeaderButton

export type NormalizedHeaderButton = NormalizedBaseHeaderButton | NormalizedFormHeaderButton | NormalizedNavigationHeaderButton;

export function NormalizeHeaderButton(item?: HeaderButton, label?: string): NormalizedBaseHeaderButton | null {
  if (!item || Object.keys(item).length === 0) {
    return null;
  }
  switch (item.kind) {
    case HeaderButtonKind.FORM:
      return NormalizeFormHeaderButton(item, label);
    case HeaderButtonKind.NAVIGATION:
      return NormalizeNavigationHeaderButton(item, label);
    default:
      return NormalizeBaseHeaderButton(item, label);
  }
}
