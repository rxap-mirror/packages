import { Constructor } from '@rxap/utilities';
import { getMetadata } from '@rxap/reflect-metadata';
import { XmlParserService } from '../xml-parser.service';
import { ParsedElement } from '../elements/parsed-element';
import { ElementParserMetaData } from '../decorators/metadata-keys';
import { RxapElement } from '../element';

export class TestingXmlParserService extends XmlParserService {

  public parseFromXmlTesting<D extends ParsedElement>(xml: string, elementParser: Constructor<D>): D {

    this.register(elementParser);

    const elementName = getMetadata<string>(ElementParserMetaData.ELEMENT_NAME, elementParser);

    let xmlDoc: Document;
    try {
      xmlDoc = new DOMParser().parseFromString(xml, 'text/xml');
    } catch (e: any) {
      throw new Error('Could not parse xml string');
    }

    if (!xmlDoc.childNodes.length) {
      throw new Error('The parsed xml has not any element');
    }

    const root = new RxapElement(xmlDoc.childNodes.item(0) as Element);

    if (root.name === 'parsererror') {
      throw new Error(root.getTextContent());
    }

    if (root.name !== elementName) {
      throw new Error(`The root node must be an <${ elementName }> element. Found a <${ root.name }>`);
    }

    return this.parse<D>(root, root.name, null, []);

  }

}
