import { getMetadata } from '@rxap/reflect-metadata';
import {
  Constructor,
  hasIndexSignature,
  Type,
} from '@rxap/utilities';
import { DOMParser } from 'xmldom';
import { AttributeOptions } from './decorators/attribute';
import { ElementParserMetaData } from './decorators/metadata-keys';
import { XmlElementMetadata } from './decorators/utilities';
import {
  normalizeNodeName,
  RxapElement,
  RxapElementOptions,
} from './element';
import { ElementName } from './element-name';
import { ParsedElement } from './elements/parsed-element';
import { RxapXmlParserError } from './error';
import { XmlElementParserFunction } from './xml-element-parser-function';

export interface ElementParserWithParsers {
  elementParser: Type<ParsedElement>;
  parsers: XmlElementParserFunction<ParsedElement>[];
}

export class XmlParserService {

  public readonly parsers = new Map<ElementName, ElementParserWithParsers>();

  protected _rootElement = 'definition';

  protected get rootElement(): string {
    return normalizeNodeName(this._rootElement, this.elementOptions);
  }

  protected _rootParser: Constructor<ParsedElement> | null = null;

  constructor(public readonly elementOptions: RxapElementOptions = {}) {
    this.parse = this.parse.bind(this);
  }

  public register(...elementParsers: Array<Constructor<ParsedElement>>): void {
    for (const elementParser of elementParsers) {
      if (!elementParser) {
        throw new Error('Element Parser is undefined or null');
      }
      const elementName = getMetadata<string>(XmlElementMetadata.NAME, elementParser);
      const parsers = getMetadata<XmlElementParserFunction<any>[]>(
        XmlElementMetadata.PARSER,
        elementParser,
      );

      if (!elementName) {
        throw new Error('Element name is not defined. Ensure that the @ElementParser is used');
      }

      if (!parsers) {
        throw new Error('Element parsers are not defined. Ensure that the @ElementParser is used');
      }

      this.parsers.set(
        elementName,
        {
          elementParser,
          parsers,
        },
      );
    }
  }

  public setRootElement(nameOrElementParser: string | Constructor<ParsedElement>): void {
    if (typeof nameOrElementParser === 'string') {
      this._rootElement = nameOrElementParser;
    } else {
      const elementName = getMetadata<string>(XmlElementMetadata.NAME, nameOrElementParser);
      if (!elementName) {
        throw new Error(
          'Could not set the root Element. Element name is not defined. Ensure that the @ElementDef is used');
      }
      if (!this.parsers.has(elementName)) {
        this.register(nameOrElementParser);
      }
      this._rootParser = nameOrElementParser;
      this._rootElement = elementName;
    }
  }

  public parseAttributes(parsedElement: ParsedElement, element: RxapElement): void {
    const attributes: AttributeOptions<any>[] = getMetadata(
      ElementParserMetaData.ATTRIBUTE,
      Object.getPrototypeOf(parsedElement),
    ) || [];
    for (const attribute of attributes) {
      const textContent = element.getChildTextContent(attribute.elementName);
      if (hasIndexSignature(parsedElement)) {
        parsedElement[attribute.propertyKey] = textContent;
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
    args: any[] = [],
  ): D {

    const {
      elementName,
      parser,
    } = this.determineElementNameAndParser(elementNameOrConstructor);

    // create the ParsedElement instance of the current element
    const instance = new parser.elementParser(...args);
    Reflect.set(instance, '__tag', element.name);
    Reflect.set(instance, '__parent', parent);

    this.parseAttributes(instance, element);

    instance.preParse?.();

    for (const p of parser.parsers) {
      p(this, element, instance);
    }

    instance.postParse?.();

    const requiredProperties = getMetadata<object>(ElementParserMetaData.REQUIRED_ELEMENT_PROPERTIES, instance);

    if (requiredProperties && hasIndexSignature(instance)) {
      for (const [ propertyKey, message ] of Object.entries(requiredProperties)) {
        if (instance[propertyKey] === undefined) {
          console.log('prop', instance[propertyKey]);
          throw new RxapXmlParserError(`[${ elementName }] ${ message }`, '', instance.constructor.name);
        }
      }
    }

    instance.preValidate?.();

    if (instance.validate && !instance.validate()) {
      throw new RxapXmlParserError(
        `Could not parse element '${ elementName }'. Parsed element is not valid`,
        '',
        instance.constructor.name,
      );
    }

    instance.postValidate?.();

    return instance as any;
  }

  protected determineElementNameAndParser(elementNameOrConstructor: string | Constructor<ParsedElement>) {

    let elementName: string;
    let parser: ElementParserWithParsers;

    if (typeof elementNameOrConstructor === 'string') {
      elementName = elementNameOrConstructor;
      if (!this.parsers.has(elementName)) {
        throw new Error(`Parser for element '${ elementName }' is not registered`);
      }

      parser = this.parsers.get(elementName) as any;
    } else {
      elementName = getMetadata<string>(XmlElementMetadata.NAME, elementNameOrConstructor)!;
      parser = {
        parsers: getMetadata<XmlElementParserFunction<any>[]>(
            XmlElementMetadata.PARSER,
            elementNameOrConstructor,
        )!,
        elementParser: elementNameOrConstructor,
      };
    }

    return {
      elementName,
      parser,
    };

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
    } catch (e: any) {
      throw new Error('Could not parse xml string');
    }

    if (!xmlDoc.childNodes.length) {
      throw new Error('The parsed xml has not any element');
    }

    const root = this.determineRootElement(xmlDoc);

    return this.parse<D>(root, this._rootParser as Constructor<D> ?? root.name, null, args);
  }

  protected determineRootElement(xmlDoc: Document) {

    const rootNode = Array.from(xmlDoc.childNodes)
      .filter(node => node.nodeType === 1)
      .find(node => normalizeNodeName(node.nodeName, this.elementOptions) === this.rootElement);

    if (!rootNode) {
      throw new Error(`Could not find <${ this.rootElement }> element!`);
    }

    const root = new RxapElement(rootNode as Element, this.elementOptions);

    if (!root.hasName(this.rootElement)) {
      throw new Error(
        `The root node must be an <${ this.rootElement }> element, but the root node is a <${ root.name }> element!`);
    }

    return root;

  }

}
