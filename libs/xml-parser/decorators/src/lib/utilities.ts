import {
  Constructor,
  getMetadata,
  setMetadata
} from '@rxap/utilities';
import { ElementParser } from './element.parser';
import {
  ParsedElement,
  XmlElementParserFunction
} from '@rxap/xml-parser';

export enum XmlElementMetadata {
  OPTIONS         = 'rxap/xml-parser/decorators/element-options',
  PARSER          = 'rxap-xml-parser-element-parsers',
  PARSER_INSTANCE = 'rxap/xml-parser/decorators/element-parser/instance',
  /**
   * @deprecated
   */
  NAME            = 'rxap-xml-parser-element-name',
  EXTENDS         = 'rxap-xml-parser-extends',
}

export type ParsedElementType<T extends ParsedElement = ParsedElement> = Constructor<T> & { TAG?: string };

export type XmlDecoratorElementParserFunction<T extends ParsedElement = ParsedElement> = XmlElementParserFunction<T> & { propertyKey: string };

export function GetAllElementParser<T extends ParsedElement>(type: Constructor<T>): Array<XmlDecoratorElementParserFunction<T>> {
  return getMetadata(XmlElementMetadata.PARSER, type) || [];
}

export function GetAllElementParserInstances<T extends ParsedElement>(type: Constructor<T>): Array<ElementParser<T>> {
  return getMetadata(XmlElementMetadata.PARSER_INSTANCE, type.prototype) || [];
}

export function FindElementParserInstanceForPropertyKey<T extends ParsedElement>(type: Constructor<T>, propertyKey: string): ElementParser<T> | undefined {
  return GetAllElementParserInstances(type).find(parser => parser.propertyKey === propertyKey);
}

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
    XmlElementMetadata.PARSER,
    [ ...addedParser, parser.parse ],
    target.constructor
  );

  const addedElementParser = GetAllElementParserInstances(target.constructor)
    .filter(p => p.propertyKey !== parser.propertyKey);

  setMetadata(
    XmlElementMetadata.PARSER_INSTANCE,
    [ ...addedElementParser, parser ],
    target
  );

}
