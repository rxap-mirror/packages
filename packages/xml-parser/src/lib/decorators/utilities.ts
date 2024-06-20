import {
  getMetadata,
  setMetadata,
} from '@rxap/reflect-metadata';
import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '../elements/parsed-element';
import { XmlElementParserFunction } from '../xml-element-parser-function';
import { ElementParser } from './element.parser';
import { ElementParserMetaData } from './metadata-keys';

export type ParsedElementType<T extends ParsedElement = ParsedElement> = Constructor<T> & { TAG?: string };

export type XmlDecoratorElementParserFunction<T extends ParsedElement = ParsedElement> = XmlElementParserFunction<T> & {
  propertyKey: string
};

/**
 * Retrieves an array of XML decorator element parser functions for a specified type.
 *
 * This function fetches parser functions that have been associated with a specific class type
 * using metadata. It utilizes the `ElementParserMetaData.PARSER` key to access these functions.
 * If no parser functions are found, it returns an empty array.
 *
 * @param type - The constructor of the class (type) for which the parser functions are to be retrieved.
 * This class must extend from `ParsedElement`.
 * @returns An array of XML decorator element parser functions associated with the specified type.
 * If no functions are associated, an empty array is returned.
 *
 * @typeParam T - A generic type parameter that extends `ParsedElement`, indicating the type of elements
 * to be parsed.
 *
 * @example
 * ```typescript
 * class MyElement extends ParsedElement {}
 * const parsers = GetAllElementParser(MyElement);
 * ```
 */
export function GetAllElementParser<T extends ParsedElement>(type: Constructor<T>): Array<XmlDecoratorElementParserFunction<T>> {
  return getMetadata(ElementParserMetaData.PARSER, type) || [];
}

/**
 * Retrieves all parser instances associated with a specific element type.
 *
 * This function fetches an array of `ElementParser` instances that are linked to a given class type derived from `ParsedElement`. It utilizes metadata associated with the element parsers to find the relevant instances. If no instances are found, it returns an empty array.
 *
 * @param type A constructor function of the element type for which parser instances are to be retrieved. This type must extend from `ParsedElement`.
 * @returns An array of `ElementParser` instances associated with the specified type. Returns an empty array if no instances are found.
 *
 * @template T The specific type of `ParsedElement` that the parser handles.
 */
export function GetAllElementParserInstances<T extends ParsedElement>(type: Constructor<T>): Array<ElementParser<T>> {
  return getMetadata(ElementParserMetaData.PARSER_INSTANCE, type.prototype) || [];
}

/**
 * Retrieves an instance of `ElementParser` that corresponds to a specific property key within a given class type.
 *
 * This function searches through all available `ElementParser` instances associated with the specified class type.
 * It returns the first `ElementParser` instance where the `propertyKey` matches the provided `propertyKey` argument.
 * If no matching `ElementParser` is found, the function returns `undefined`.
 *
 * @param type - The constructor of the class type `T` which extends `ParsedElement`. This class type determines
 * the context in which the element parsers are sought.
 * @param propertyKey - The property key string to match against the `propertyKey` of the `ElementParser` instances.
 * @returns An `ElementParser<T>` instance that matches the specified `propertyKey`, or `undefined` if no match is found.
 *
 * @template T - The type of the parsed element, extending `ParsedElement`, which defines the structure and properties
 * expected in the parser instances.
 */
export function FindElementParserInstanceForPropertyKey<T extends ParsedElement>(
  type: Constructor<T>,
  propertyKey: string,
): ElementParser<T> | undefined {
  return GetAllElementParserInstances(type).find(parser => parser.propertyKey === propertyKey);
}

/**
 * Adds a parser to the metadata of the specified target. This function first retrieves all existing parsers,
 * filters them based on certain conditions, and then appends the new parser to the metadata.
 *
 * @param {ElementParser} parser - The parser instance to be added. This parser should have a `parse` method and a `propertyKey`.
 * @param {any} target - The target object to which the parser will be added. This is typically a class or a class instance.
 *
 * The function operates in two main steps:
 * 1. It retrieves all element parsers associated with the constructor of the target, filters out any existing parsers that
 * should not be overwritten, and then adds the new parser's `parse` method to the `ElementParserMetaData.PARSER` metadata key.
 * 2. It retrieves all element parser instances associated with the constructor of the target, filters out any existing parser
 * instances that have the same `propertyKey` as the new parser, and then adds the new parser instance to the
 * `ElementParserMetaData.PARSER_INSTANCE` metadata key.
 *
 * Note: The function currently does not handle overwriting existing parsers with the same `propertyKey`. This functionality
 * needs to be tested and potentially implemented.
 */
export function AddParserToMetadata(parser: ElementParser, target: any) {

  // TODO : test overwrite functionality

  const addedParser = GetAllElementParser(target.constructor)
    .filter(p => {
      // if (p.hasOwnProperty('propertyKey')) {
      //   return p.propertyKey !== parser.propertyKey;
      // }
      return true;
    });

  setMetadata(
    ElementParserMetaData.PARSER,
    [ ...addedParser, parser.parse ],
    target.constructor,
  );

  const addedElementParser = GetAllElementParserInstances(target.constructor)
    .filter(p => p.propertyKey !== parser.propertyKey);

  setMetadata(
    ElementParserMetaData.PARSER_INSTANCE,
    [ ...addedElementParser, parser ],
    target,
  );

}
