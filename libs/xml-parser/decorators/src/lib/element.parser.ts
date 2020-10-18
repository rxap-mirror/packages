import {
  XmlParserService,
  RxapElement,
  ParsedElement
} from '@rxap/xml-parser';

export interface ElementParser<T extends ParsedElement = ParsedElement, Options = any> {
  propertyKey: string;
  options: Options;

  parse(
    xmlParser: XmlParserService,
    element: RxapElement,
    parsedElement: T
  ): T;
}
