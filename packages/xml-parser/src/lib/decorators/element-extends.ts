import { ParsedElement } from '../elements/parsed-element';
import {
  ParsedElementType,
  XmlElementMetadata,
} from './utilities';
import { addToMetadata } from '@rxap/reflect-metadata';

export function ElementExtends<Parent extends ParsedElement>(elementType: ParsedElementType<Parent>) {
  return function (target: any) {
    addToMetadata(XmlElementMetadata.EXTENDS, target, elementType);
  };
}
