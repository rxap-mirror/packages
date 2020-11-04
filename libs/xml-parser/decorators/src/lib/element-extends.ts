import { ParsedElement } from '@rxap/xml-parser';
import { addToMetadata } from '@rxap/utilities';
import {
  ParsedElementType,
  XmlElementMetadata
} from './utilities';

export function ElementExtends<Parent extends ParsedElement>(elementType: ParsedElementType<Parent>) {
  return function(target: any) {
    addToMetadata(XmlElementMetadata.EXTENDS, target, elementType);
  };
}
