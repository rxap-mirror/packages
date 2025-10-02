import {
  hasMetadata,
  setMetadata,
} from '@rxap/reflect-metadata';
import { ElementParserMetaData } from './metadata-keys';
import { ParsedElementType } from './utilities';

export const ELEMENT_REGISTRY = new Map<string, ParsedElementType>();

/**
 * A decorator factory that assigns a specific HTML tag name to a class and configures its metadata for element parsing.
 *
 * This function returns a decorator function that, when applied to a class, sets a static `TAG` property on the class
 * to the provided `tag` argument. It also ensures that the class has metadata related to element parsing. If no parser
 * metadata is present, it initializes an empty parser array in the metadata.
 *
 * @param tag The HTML tag name to be associated with the target class.
 * @returns A class decorator that sets the `TAG` property and configures element parsing metadata on the target class.
 *
 * ### Example
 * ```typescript
 * @ElementDef('custom-element')
 * class MyCustomElement {
 * // class body
 * }
 * console.log(MyCustomElement.TAG); // Outputs: 'custom-element'
 * ```
 */
export function ElementDef(tag: string) {
  return function (target: any) {
    target.TAG = tag;
    if (ELEMENT_REGISTRY.has(tag)) {
      console.warn(`The tag ${ tag } is already registered`);
    }
    ELEMENT_REGISTRY.set(tag, target);
    // TODO : remove deprecated
    setMetadata(ElementParserMetaData.NAME, tag, target);
    if (!hasMetadata(ElementParserMetaData.PARSER, target)) {
      setMetadata(ElementParserMetaData.PARSER, [], target);
    }
  };
}
