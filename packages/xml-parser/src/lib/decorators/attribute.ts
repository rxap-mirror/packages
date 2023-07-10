import {Without} from '@rxap/utilities';
import {ElementParserMetaData} from './metadata-keys';
import {addToMetadata} from '@rxap/reflect-metadata';

export interface AttributeOptions<T> {
  propertyKey: string;
  elementName: string,
}

export function Attribute<T>(options: Partial<Without<AttributeOptions<T>, 'propertyKey'>>) {
  return function (target: any, propertyKey: string) {
    addToMetadata(ElementParserMetaData.ATTRIBUTE, {propertyKey, elementName: propertyKey, ...options}, target);
  };
}
