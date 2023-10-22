import { addToMetadata } from '@rxap/reflect-metadata';
import { ParsedElement } from '../elements/parsed-element';
import { ElementParserMetaData } from './metadata-keys';
import { ParsedElementType } from './utilities';

export function ElementExtends<Parent extends ParsedElement>(elementType: ParsedElementType<Parent>) {
  return function (target: any) {
    addToMetadata(ElementParserMetaData.EXTENDS, target, elementType);
  };
}
