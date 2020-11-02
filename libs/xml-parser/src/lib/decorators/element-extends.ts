import { ParsedElement } from '../elements/parsed-element';
import {
  ParsedElementType,
  XmlElementMetadata
} from '../../../decorators/src/lib/utilities';
import { addToMetadata } from '@rxap/utilities';

export function ElementExtends<Parent extends ParsedElement>(elementType: ParsedElementType<Parent>) {
  return function(target: any) {
    addToMetadata(XmlElementMetadata.EXTENDS, target, elementType);
  };
}
