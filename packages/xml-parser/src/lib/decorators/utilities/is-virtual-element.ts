import { getOwnMetadata } from '@rxap/reflect-metadata';
import { ElementParserMetaData } from '../metadata-keys';
import { ParsedElementType } from '../utilities';
import { ParsedElement } from '../../elements/parsed-element';

export function isVirtualElement(elementOrType: ParsedElement | ParsedElementType | null) {
  if (!elementOrType) {
    return false;
  }
  const constructor = typeof elementOrType === 'function' ? elementOrType : elementOrType.constructor;
  return getOwnMetadata(ElementParserMetaData.VIRTUAL, constructor) === true;
}
