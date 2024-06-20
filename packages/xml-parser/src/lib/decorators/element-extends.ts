import { addToMetadata } from '@rxap/reflect-metadata';
import { ParsedElement } from '../elements/parsed-element';
import { ElementParserMetaData } from './metadata-keys';
import { ParsedElementType } from './utilities';

/**
 * A decorator factory that marks a class as extending a specific type of parsed element.
 * This is used in scenarios where elements are parsed and need to inherit or extend
 * properties from a parent parsed element.
 *
 * @typeparam Parent - The base class type that the target is extending. Must extend from `ParsedElement`.
 * @param elementType - The type of the parent element that the target class will extend.
 * @returns A class decorator that adds metadata to the class indicating the type of the parent element it extends.
 *
 * ### Example
 * ```typescript
 * @ElementExtends(SomeBaseElement)
 * class MyCustomElement extends SomeBaseElement {
 * // class implementation here
 * }
 * ```
 */
export function ElementExtends<Parent extends ParsedElement>(elementType: ParsedElementType<Parent>) {
  return function (target: any) {
    addToMetadata(ElementParserMetaData.EXTENDS, target, elementType);
  };
}
