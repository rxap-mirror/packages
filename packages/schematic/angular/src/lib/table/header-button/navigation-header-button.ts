import { Normalized } from '@rxap/utilities';
import { FormComponent } from '../../form/form-component';
import { HeaderButtonKind } from '../header-button-kind';
import {
  BaseHeaderButton,
  NormalizeBaseHeaderButton,
  NormalizedBaseHeaderButton,
} from './base-header-button';

export interface NavigationHeaderButton extends BaseHeaderButton {
  form?: FormComponent;
  relativeTo?: boolean;
  route?: string;
}

export interface NormalizedNavigationHeaderButton extends Readonly<Normalized<Omit<NavigationHeaderButton, keyof BaseHeaderButton | 'form'>> & NormalizedBaseHeaderButton> {
  kind: HeaderButtonKind.NAVIGATION;
  relativeTo: boolean;
  route: string;
}

export function IsNavigationHeaderButton(header: BaseHeaderButton): header is NavigationHeaderButton {
  return header.kind === HeaderButtonKind.NAVIGATION;
}

export function IsNormalizedNavigationHeaderButton(header: NormalizedBaseHeaderButton): header is NormalizedNavigationHeaderButton {
  return header.kind === HeaderButtonKind.NAVIGATION;
}

export function NormalizeNavigationHeaderButton(options: NavigationHeaderButton, label?: string): NormalizedNavigationHeaderButton {
  if (!options.route) {
    throw new Error('The route property is required for a navigation header button');
  }
  return Object.freeze({
    ...NormalizeBaseHeaderButton(options),
    kind: HeaderButtonKind.NAVIGATION,
    relativeTo: options.relativeTo ?? false,
    route: options.route,
  });
}
