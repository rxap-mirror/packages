import {GetAllElementParser, GetAllElementParserInstances, XmlElementMetadata} from './utilities';
import {setMetadata} from '@rxap/reflect-metadata';

export function ElementClearParser() {
  return function (target: any, propertyKey: string) {
    const clearedParsers = GetAllElementParser(target.constructor)
      .filter(parser => parser.propertyKey !== propertyKey);
    const clearedParserInstances = GetAllElementParserInstances(target.constructor)
      .filter(parser => parser.propertyKey !== propertyKey);
    setMetadata(
      XmlElementMetadata.PARSER,
      clearedParsers,
      target.constructor,
    );
    setMetadata(
      XmlElementMetadata.PARSER_INSTANCE,
      clearedParserInstances,
      target,
    );
  };
}
