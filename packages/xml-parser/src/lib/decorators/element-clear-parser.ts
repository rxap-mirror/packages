import { setMetadata } from '@rxap/reflect-metadata';
import { ElementParserMetaData } from './metadata-keys';
import {
  GetAllElementParser,
  GetAllElementParserInstances,
} from './utilities';

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
