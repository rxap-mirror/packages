import { getMetadata } from '@rxap/reflect-metadata';
import { Constructor } from '@rxap/utilities';
import { XmlElementMetadata } from '../decorators/utilities';
import { RxapElement } from '../element';
import { ParsedElement } from '../elements/parsed-element';
import { XmlParserService } from '../xml-parser.service';

export class TestingXmlParserService extends XmlParserService {

  public parseFromXmlTesting<D extends ParsedElement>(xml: string, elementParser: Constructor<D>): D {

    this.register(elementParser);

    const elementName = getMetadata<string>(XmlElementMetadata.NAME, elementParser);

    let xmlDoc: Document;
    try {
      xmlDoc = new DOMParser().parseFromString(xml, 'text/xml');
    } catch (e: any) {
      throw new Error('Could not parse xml string');
    }

    if (!xmlDoc.childNodes.length) {
      throw new Error('The parsed xml has not any element');
    }

    const root = new RxapElement(xmlDoc.childNodes.item(0) as Element, this.elementOptions);

    if (root.name === 'parsererror') {
      throw new Error(root.getTextContent());
    }

    if (root.name !== elementName) {
      throw new Error(`The root node must be an <${ elementName }> element. Found a <${ root.name }>`);
    }

    return this.parse<D>(root, root.name, null, []);

  }

}
