import { setMetadata } from '@rxap/reflect-metadata';
import { ElementParser } from '../element.parser';
import { ElementParserMetaData } from '../metadata-keys';
import {
  GetAllElementParser,
  GetAllElementParserInstances,
  GetAllOwnElementParser,
  GetAllOwnElementParserInstances,
} from '../utilities';

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

  const addedParser = GetAllElementParser(target.constructor)
    .filter(p => {
      const propertyKey = Reflect.get(p, 'propertyKey');
      return !propertyKey || propertyKey !== parser.propertyKey;
    });

  const existingOwnAddedParser = GetAllOwnElementParser(target.constructor).filter(p => {
    const propertyKey = Reflect.get(p, 'propertyKey');
    return propertyKey === parser.propertyKey;
  });

  setMetadata(
    ElementParserMetaData.PARSER,
    [ ...existingOwnAddedParser, ...addedParser, parser.parse ],
    target.constructor,
  );

  const addedElementParser = GetAllElementParserInstances(target.constructor)
    .filter(p => p.propertyKey !== parser.propertyKey);

  const existingOwnAddedElementParser = GetAllOwnElementParserInstances(target.constructor)
    .filter(p => p.propertyKey === parser.propertyKey);

  setMetadata(
    ElementParserMetaData.PARSER_INSTANCE,
    [ ...existingOwnAddedElementParser, ...addedElementParser, parser ],
    target,
  );

}
