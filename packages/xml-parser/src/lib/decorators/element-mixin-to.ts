import { Mixin } from '@rxap/mixin';
import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '../elements/parsed-element';
import {
  ElementNamespace,
  getElementNamespaceMetadata,
  hasElementNamespaceMetadata,
} from './element-namespace';

export function ElementMixinTo(element: Constructor<ParsedElement>) {
  return function (target: any) {
    Mixin(target)(element);
    let existingNamespaces: Record<string, string> = {};
    if (hasElementNamespaceMetadata(element)) {
      existingNamespaces = getElementNamespaceMetadata(element);
    }
    if (hasElementNamespaceMetadata(target)) {
      existingNamespaces = {
        ...existingNamespaces,
        ...getElementNamespaceMetadata(target),
      };
    }
    if (Object.keys(existingNamespaces).length > 0) {
      ElementNamespace(existingNamespaces)(element);
    }
  };
}
