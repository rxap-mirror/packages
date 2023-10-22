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

export function GetAllElementParser<T extends ParsedElement>(type: Constructor<T>): Array<XmlDecoratorElementParserFunction<T>> {
  return getMetadata(ElementParserMetaData.PARSER, type) || [];
}

export function GetAllElementParserInstances<T extends ParsedElement>(type: Constructor<T>): Array<ElementParser<T>> {
  return getMetadata(ElementParserMetaData.PARSER_INSTANCE, type.prototype) || [];
}

export function FindElementParserInstanceForPropertyKey<T extends ParsedElement>(
  type: Constructor<T>,
  propertyKey: string,
): ElementParser<T> | undefined {
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
