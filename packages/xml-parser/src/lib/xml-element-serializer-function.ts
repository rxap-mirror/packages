import { RxapElement } from './element';
import { ParsedElement } from './elements/parsed-element';
import { XmlSerializerService } from './xml-serializer.service';

export type XmlElementSerializerFunction<T extends ParsedElement = ParsedElement> = (
  serializer: XmlSerializerService,
  element: RxapElement,
  instance?: T,
) => T;
