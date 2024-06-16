import {
  NormalizedTypeImport,
  NormalizeTypeImport,
  TypeImport,
} from '@rxap/ts-morph';
import { Normalized } from '@rxap/utilities';
import {
  MethodOptions,
  NormalizedMethodOptions,
  NormalizeMethodOptions,
} from '../../method/method-options';
import { HeaderButtonKind } from '../header-button-kind';
import {
  BaseHeaderButton,
  NormalizeBaseHeaderButton,
  NormalizedBaseHeaderButton,
} from './base-header-button';

export interface MethodHeaderButton extends BaseHeaderButton {
  method?: MethodOptions;
}

export interface NormalizedMethodHeaderButton extends Readonly<Normalized<Omit<MethodHeaderButton, keyof BaseHeaderButton | 'method'>> & NormalizedBaseHeaderButton> {
  kind: HeaderButtonKind.METHOD;
  method: NormalizedMethodOptions;
}

export function IsMethodHeaderButton(header: BaseHeaderButton): header is MethodHeaderButton {
  return header.kind === HeaderButtonKind.METHOD;
}

export function IsNormalizedMethodHeaderButton(header: NormalizedBaseHeaderButton): header is NormalizedMethodHeaderButton {
  return header.kind === HeaderButtonKind.METHOD;
}

export function NormalizeMethodHeaderButton(options: MethodHeaderButton, label?: string): NormalizedMethodHeaderButton {
  if (!options.method) {
    throw new Error('The import property is required for a form header button');
  }
  return Object.freeze({
    ...NormalizeBaseHeaderButton(options),
    kind: HeaderButtonKind.METHOD,
    method: NormalizeMethodOptions(options.method),
  });
}
