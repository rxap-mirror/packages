import { RxapElement } from '../element';
import { ParsedElement } from '../elements/parsed-element';
import { XmlSerializerService } from '../xml-serializer.service';


export interface ElementSerializer<T extends ParsedElement = ParsedElement, Options = any> {
  propertyKey: string;
  options: Options;

  serialize(
    xmlParser: XmlSerializerService,
    element: RxapElement,
    parsedElement: T,
  ): T;
}
