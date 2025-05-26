import { getOwnMetadata } from '@rxap/reflect-metadata';
import { ElementParserMetaData } from '../decorators/metadata-keys';
import {
  ParsedElementType,
} from '../decorators/utilities';
import { ParsedElement } from '../elements/parsed-element';

export function getExtendedTypes<T extends ParsedElement>(
  type: ParsedElementType<T>,
  known: ParsedElementType<T>[] = [type]
): Array<ParsedElementType<T>> {
  const extendedTypes =
    (getOwnMetadata<Array<ParsedElementType<T>>>(
      ElementParserMetaData.EXTENDS,
      type
    ) ?? []).filter(k => !known.includes(k));

  const newTypes: Array<ParsedElementType<T>> = [];
  for (const extendedType of extendedTypes) {
    newTypes.push(...getExtendedTypes(extendedType, extendedTypes.concat(known)).filter(s => !known.includes(s)));
  }

  return extendedTypes.concat(newTypes).filter((v, index, self) => self.indexOf(v) === index);
}
