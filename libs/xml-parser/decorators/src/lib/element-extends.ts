import { ParsedElement } from '@rxap/xml-parser';
import {
  ParsedElementType,
  XmlElementMetadata
} from './utilities';
import { addToMetadata } from '@rxap/utilities/reflect-metadata';

export function ElementExtends<Parent extends ParsedElement>(elementType: ParsedElementType<Parent>) {
  return function(target: any) {
    addToMetadata(XmlElementMetadata.EXTENDS, target, elementType);
  };
}
