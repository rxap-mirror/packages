import { hasMetadata } from '@rxap/reflect-metadata';
import { ElementParserMetaData } from '../decorators/metadata-keys';
import { ParsedElement } from '../elements/parsed-element';

export function isParsedElement<T extends ParsedElement = ParsedElement>(
  element: any
): element is T {
  if (element && typeof element === 'object') {
    return hasMetadata(ElementParserMetaData.PARSER, element.constructor);
  }

  return false;
}
