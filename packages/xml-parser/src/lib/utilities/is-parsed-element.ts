import { hasMetadata } from '@rxap/reflect-metadata';
import { ElementParserMetaData, ParsedElement } from '@rxap/xml-parser';

export function isParsedElement<T extends ParsedElement = ParsedElement>(
  element: any
): element is T {
  if (element && typeof element === 'object') {
    return hasMetadata(ElementParserMetaData.PARSER, element.constructor);
  }

  return false;
}
