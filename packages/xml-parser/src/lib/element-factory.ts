import { ParsedElement } from './elements/parsed-element';
import {
  Constructor,
  hasIndexSignature,
} from '@rxap/utilities';
import { ElementParserMetaData } from './decorators/metadata-keys';
import { RxapXmlParserError } from './error';
import { getMetadata } from '@rxap/reflect-metadata';

/**
 * Creates an instance of a specified element type, initializes it with provided properties, and performs validation.
 * This factory function is designed to work with elements that potentially include lifecycle hooks for parsing and validation.
 *
 * @template Element - A generic type extending ParsedElement which includes optional lifecycle methods like preParse, postParse, preValidate, validate, and postValidate.
 * @param ElementConstructor - A constructor function for the element type `Element`. This constructor can optionally include a static `TAG` property used for error messaging.
 * @param properties - An object containing properties to initialize the element. Each property key should match a property key of `Element`.
 * @returns An instance of `Element` fully initialized and validated.
 *
 * @throws RxapXmlParserError - Throws an error if any required property as defined in metadata is missing.
 * @throws Error - Throws a generic error if the element fails the validation check.
 *
 * ### Lifecycle:
 * - **preParse**: Called before properties are assigned.
 * - **postParse**: Called after properties are assigned.
 * - **preValidate**: Called before validation.
 * - **validate**: Called to perform custom validation, should return a boolean indicating validity.
 * - **postValidate**: Called after validation if the element is valid.
 *
 * ### Usage:
 * This function is typically used in scenarios where elements are dynamically created and require a structured initialization and validation process.
 * It ensures that all elements are not only constructed with the correct properties but also adhere to a defined validation protocol.
 */
export function ElementFactory<Element extends ParsedElement>(
  ElementConstructor: Constructor<Element> & { TAG?: string },
  properties: { [K in keyof Element]?: Element[K] },
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
      if (element[propertyKey] === undefined) {
        throw new RxapXmlParserError(`[${ ElementConstructor.TAG }] ${ message }`, '', element.constructor.name);
      }
    }
  }

  if (element.preValidate) {
    element.preValidate();
  }
  if (element.validate) {
    if (!element.validate()) {
      throw new Error(`The element '${ ElementConstructor.TAG }' created with the element factory is not valid!`);
    }
  }
  if (element.postValidate) {
    element.postValidate();
  }

  return element;
}
