import { ElementParserMetaData } from './metadata-keys';
import { ElementName } from '../element-name';
import { XmlElementParserFunction } from '../xml-element-parser-function';
import {
  addToMetadata,
  hasMetadata,
  setMetadata,
} from '@rxap/reflect-metadata';

export function ElementParser(
  elementName: ElementName,
  ...parsers: XmlElementParserFunction<any>[]
) {
  return function (target: any) {
    setMetadata(ElementParserMetaData.ELEMENT_NAME, elementName, target);
    for (const parser of parsers) {
      addToMetadata(ElementParserMetaData.ELEMENT_PARSERS, parser, target);
    }
    if (!hasMetadata(ElementParserMetaData.ELEMENT_PARSERS, target)) {
      setMetadata(ElementParserMetaData.ELEMENT_PARSERS, [], target);
    }
    target.TAG = elementName;
  };
}
