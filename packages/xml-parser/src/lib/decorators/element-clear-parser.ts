import { setMetadata } from '@rxap/reflect-metadata';
import { ElementParserMetaData } from './metadata-keys';
import {
  GetAllElementParser,
  GetAllElementParserInstances,
} from './utilities';

/**
 * Decorator factory that clears specific element parser metadata from a class or its instance.
 * It removes metadata entries related to the specified property from both the class and its instances.
 *
 * @remarks
 * This decorator is useful when you need to dynamically alter the parsing behavior associated with
 * specific properties of a class, typically used in scenarios involving conditional parsing or
 * overriding inherited parsing configurations.
 *
 * The decorator first retrieves all parser metadata associated with the class and its instances,
 * filters out the metadata for the given property, and then resets the metadata without the entries
 * for that property.
 *
 * @param target - The prototype of the class on which the decorator is applied.
 * @param propertyKey - The property key for which the parser metadata should be cleared.
 *
 * Usage:
 * Apply `@ElementClearParser()` to a property within a class to clear its associated parser metadata.
 *
 * Example:
 * ```typescript
 * @ElementClearParser()
 * someProperty: string;
 * ```
 */
export function ElementClearParser() {
  return function (target: any, propertyKey: string) {
    const clearedParsers = GetAllElementParser(target.constructor)
      .filter(parser => parser.propertyKey !== propertyKey);
    const clearedParserInstances = GetAllElementParserInstances(target.constructor)
      .filter(parser => parser.propertyKey !== propertyKey);
    setMetadata(
      ElementParserMetaData.PARSER,
      clearedParsers,
      target.constructor,
    );
    setMetadata(
      ElementParserMetaData.PARSER_INSTANCE,
      clearedParserInstances,
      target,
    );
  };
}
