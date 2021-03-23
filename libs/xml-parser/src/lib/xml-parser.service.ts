import { RxapElement } from './element';
import {
  Type,
  getMetadata,
  hasIndexSignature,
  Constructor
} from '@rxap/utilities';
import { ParsedElement } from './elements/parsed-element';
import { ElementParserMetaData } from './decorators/metadata-keys';
import { ElementName } from './element-name';
import { XmlElementParserFunction } from './xml-element-parser-function';
import { AttributeOptions } from './decorators/attribute';
import { RxapXmlParserError } from './error';
import { DOMParser } from 'xmldom';

export interface ElementParserWithParsers {
  elementParser: Type<ParsedElement>;
  parsers: XmlElementParserFunction<ParsedElement>[];
}

export class XmlParserService {

  public readonly parsers = new Map<ElementName, ElementParserWithParsers>();

  constructor() {
    this.parse = this.parse.bind(this);
  }

  public register(...elementParsers: Array<Constructor<ParsedElement>>): void {
    for (const elementParser of elementParsers) {
      if (!elementParser) {
        throw new Error('Element Parser is undefined or null');
      }
      const elementName = getMetadata<string>(ElementParserMetaData.ELEMENT_NAME, elementParser);
      const parsers     = getMetadata<XmlElementParserFunction<any>[]>(ElementParserMetaData.ELEMENT_PARSERS, elementParser);

      if (!elementName) {
        throw new Error('Element name is not defined. Ensure that the @ElementParser is used');
      }

      if (!parsers) {
        throw new Error('Element parsers are not defined. Ensure that the @ElementParser is used');
      }

      this.parsers.set(elementName, { elementParser, parsers });
    }
  }

  public parseAttributes(parsedElement: ParsedElement, element: RxapElement): void {
    const attributes: AttributeOptions<any>[] = getMetadata(ElementParserMetaData.ATTRIBUTE, Object.getPrototypeOf(parsedElement)) || [];
    for (const attribute of attributes) {
      const textContent = element.getChildTextContent(attribute.elementName);
      if (hasIndexSignature(parsedElement)) {
        parsedElement[ attribute.propertyKey ] = textContent;
      } else {
        throw new Error('Parsed element has not in index signature');
      }
    }
  }

  /**
   *
   *
   * @param element
   * @param elementNameOrConstructor
   * @param args Constructor parameters for the ParsedElement instance
   * @param parent The parent Parsed Element
   */
  public parse<D extends ParsedElement>(
    element: RxapElement,
    elementNameOrConstructor: string | Constructor<D> = element.name,
    parent: ParsedElement | null,
    args: any[]                                       = []
  ): D {
    let elementName: string;
    let parser: ElementParserWithParsers;

    if (typeof elementNameOrConstructor === 'string') {
      elementName = elementNameOrConstructor;
      if (!this.parsers.has(elementName)) {
        throw new Error(`Parser for element '${elementName}' is not registered`);
      }

      parser = this.parsers.get(elementName) as any;
    } else {
      elementName = getMetadata<string>(ElementParserMetaData.ELEMENT_NAME, elementNameOrConstructor)!;
      parser      = {
        parsers:       getMetadata<XmlElementParserFunction<any>[]>(ElementParserMetaData.ELEMENT_PARSERS, elementNameOrConstructor)!,
        elementParser: elementNameOrConstructor
      };
    }

    // create the ParsedElement instance of the current element
    const instance = new parser.elementParser(...args);
    Reflect.set(instance, '__tag', element.name);
    Reflect.set(instance, '__parent', parent);

    this.parseAttributes(instance, element);

    if (instance.preParse) {
      instance.preParse();
    }

    parser.parsers.forEach(p => p(this, element, instance));

    if (instance.postParse) {
      instance.postParse();
    }

    const requiredProperties = getMetadata<object>(ElementParserMetaData.REQUIRED_ELEMENT_PROPERTIES, instance);

    if (requiredProperties && hasIndexSignature(instance)) {
      for (const [ propertyKey, message ] of Object.entries(requiredProperties)) {
        if (instance[ propertyKey ] === undefined) {
          console.log('prop', instance[ propertyKey ]);
          throw new RxapXmlParserError(`[${elementName}] ${message}`, '', instance.constructor.name);
        }
      }
    }

    if (instance.preValidate) {
      instance.preValidate();
    }

    if (instance.validate && !instance.validate()) {
      throw new RxapXmlParserError(`Could not parse element '${elementName}'. Parsed element is not valid`, '', instance.constructor.name);
    }

    if (instance.postValidate) {
      instance.postValidate();
    }

    return instance as any;
  }

  /**
   *
   * @param xml
   * @param args a list of args passed to the element constructor
   */
  public parseFromXml<D extends ParsedElement>(xml: string, ...args: any[]): D {

    let xmlDoc: Document;
    try {
      xmlDoc = new DOMParser().parseFromString(xml);
    } catch (e) {
      throw new Error('Could not parse xml string');
    }

    if (!xmlDoc.childNodes.length) {
      throw new Error('The parsed xml has not any element');
    }

    const definitionNode = Array.from(xmlDoc.childNodes).find(node => node.nodeName === 'definition');

    if (!definitionNode) {
      throw new Error('Could not find <definition> element!');
    }

    const root = new RxapElement(definitionNode as Element);

    if (root.name !== 'definition') {
      throw new Error(`The root node must be an <definition> element, but the root node is a <${root.name}> element!`);
    }

    return this.parse<D>(root, root.name, null, args);

  }

}
