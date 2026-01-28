import { BackendOptions } from '../backend/backend-options';
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
  MethodHeaderButton,
  NormalizedMethodHeaderButton,
  NormalizeMethodHeaderButton,
} from './header-button/method-header-button';
import {
  NavigationHeaderButton,
  NormalizedNavigationHeaderButton,
  NormalizeNavigationHeaderButton,
} from './header-button/navigation-header-button';

export type HeaderButton = BaseHeaderButton | FormHeaderButton | NavigationHeaderButton | MethodHeaderButton;

export type NormalizedHeaderButton = NormalizedBaseHeaderButton | NormalizedFormHeaderButton | NormalizedNavigationHeaderButton | NormalizedMethodHeaderButton

export function NormalizeHeaderButton(item: HeaderButton | null | undefined, backend: BackendOptions, label?: string): NormalizedBaseHeaderButton | null {
  if (!item || Object.keys(item).length === 0) {
    return null;
  }
  switch (item.kind) {
    case HeaderButtonKind.FORM:
      return NormalizeFormHeaderButton(item, backend, label);
    case HeaderButtonKind.NAVIGATION:
      return NormalizeNavigationHeaderButton(item, label);
    case HeaderButtonKind.METHOD:
      return NormalizeMethodHeaderButton(item, label);
    default:
      return NormalizeBaseHeaderButton(item, label);
  }
}
