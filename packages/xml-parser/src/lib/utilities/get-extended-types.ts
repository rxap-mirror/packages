import { getOwnMetadata } from '@rxap/reflect-metadata';
import {
  ElementParserMetaData,
  ParsedElement,
  ParsedElementType,
} from '@rxap/xml-parser';

export function getExtendedTypes<T extends ParsedElement>(
  type: ParsedElementType<T>
): Array<ParsedElementType<T>> {
  const extendedTypes =
    getOwnMetadata<Array<ParsedElementType<T>>>(
      ElementParserMetaData.EXTENDS,
      type
    ) ?? [];

  for (const extendedType of [...extendedTypes]) {
    extendedTypes.push(...getExtendedTypes(extendedType));
  }

  return extendedTypes;
}
