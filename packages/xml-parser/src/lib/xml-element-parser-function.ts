import { ParsedElement } from './elements/parsed-element';
import { RxapElement } from './element';
import { XmlParserService } from './xml-parser.service';

export type XmlElementParserFunction<T extends ParsedElement = ParsedElement> = (
  parser: XmlParserService,
  element: RxapElement,
  instance?: T,
) => T;
