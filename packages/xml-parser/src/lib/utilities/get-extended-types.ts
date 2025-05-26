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

  const newTypes: Array<ParsedElementType<T>> = [];
  for (const extendedType of [...extendedTypes].filter(s => s !== type)) {
    newTypes.push(...getExtendedTypes(extendedType));
  }

  return extendedTypes.concat(newTypes);
}
