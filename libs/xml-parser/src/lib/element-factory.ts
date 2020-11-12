import { ParsedElement } from './elements/parsed-element';
import {
  Constructor,
  getMetadata,
  hasIndexSignature
} from '@rxap/utilities';
import { ElementParserMetaData } from './decorators/metadata-keys';
import { RxapXmlParserError } from './error';

export function ElementFactory<Element extends ParsedElement>(
  ElementConstructor: Constructor<Element> & { TAG?: string },
  properties: { [K in keyof Element]?: Element[K] }
): Element {

  const element = new ElementConstructor();
  if (element.preParse) {
    element.preParse();
  }
  Object.assign(element, properties);
  if (element.postParse) {
    element.postParse();
  }

  const requiredProperties = getMetadata<object>(ElementParserMetaData.REQUIRED_ELEMENT_PROPERTIES, element);

  if (requiredProperties && hasIndexSignature(element)) {
    for (const [ propertyKey, message ] of Object.entries(requiredProperties)) {
      if (!element.hasOwnProperty(propertyKey) || element[ propertyKey ] === undefined) {
        throw new RxapXmlParserError(`[${ElementConstructor.TAG}] ${message}`, '', element.constructor.name);
      }
    }
  }

  if (element.preValidate) {
    element.preValidate();
  }
  if (element.validate) {
    if (!element.validate()) {
      throw new Error(`The element '${ElementConstructor.TAG}' created with the element factory is not valid!`);
    }
  }
  if (element.postValidate) {
    element.postValidate();
  }

  return element;
}
