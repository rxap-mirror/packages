import {ParsedElement} from '../elements/parsed-element';
import {XmlParserService} from '../xml-parser.service';
import {RxapElement} from '../element';


export interface ElementParser<T extends ParsedElement = ParsedElement, Options = any> {
  propertyKey: string;
  options: Options;

  parse(
    xmlParser: XmlParserService,
    element: RxapElement,
    parsedElement: T,
  ): T;
}
