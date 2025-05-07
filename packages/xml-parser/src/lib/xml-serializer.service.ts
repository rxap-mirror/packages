import { getMetadata } from '@rxap/reflect-metadata';
import { ElementParserMetaData } from './decorators/metadata-keys';
import {
  RxapElement,
  RxapElementOptions,
} from './element';
import { ParsedElement } from './elements/parsed-element';
import { XmlElementSerializerFunction } from './xml-element-serializer-function';

export class XmlSerializerService {

  constructor(
    private readonly DOMParser: typeof window.DOMParser,
    private readonly XMLSerializer: typeof window.XMLSerializer,
    public readonly elementOptions: RxapElementOptions = {},
  ) {
    this.serialize = this.serialize.bind(this);
  }

  private createElement(tagName: string, options?: ElementCreationOptions) {
    const parser = this.createDOMParser();
    return parser.parseFromString('<html></html>', 'application/xml').createElement(tagName, options);
  }

  /**
   *
   *
   * @param element
   */
  public serialize<D extends ParsedElement>(
    instance: D,
    parent?: RxapElement
  ): RxapElement {

    const {serializers, elementName} = this.determineElementNameAndSerializer(instance);

    const element = this.createElement(elementName);

    if (instance.__xmlns?.size) {
      instance.__xmlns.forEach((value, key) => {
        if (key) {
          element.setAttribute(`xmlns:${key}`, value);
        } else {
          element.setAttribute('xmlns', value);
        }
      });
    }

    if (parent) {
      parent.appendChild(element);
    }

    // create the ParsedElement instance of the current element

    const rxapElement = new RxapElement(element, this.DOMParser, this.elementOptions);

    instance.preSerialize?.(rxapElement);

    for (const s of serializers) {
      try {
        s(this, rxapElement, instance);
      } catch (e: any) {
        console.debug({
          instance,
          parent,
          element,
          serializer: s,
          serializers,
        });
        throw new Error(`Error while serializing element '${elementName}' with serializer '${s.name}': ${e.message}`);
      }
    }

    instance.postSerialize?.(rxapElement);

    return rxapElement;
  }

  protected determineElementNameAndSerializer(element: ParsedElement) {

    const elementName = element.__tag ?? getMetadata<string>(ElementParserMetaData.NAME, element.constructor)!;
    const serializers = getMetadata<XmlElementSerializerFunction<any>[]>(
      ElementParserMetaData.SERIALIZER,
      element.constructor,
    ) ?? [];

    return { elementName, serializers };
  }

  public serializeToXml<D extends ParsedElement>(instance: D): string {
    const element = this.serialize<D>(instance);
    const serializer = this.createXMLSerializer();
    return serializer.serializeToString(element.element);
  }

  private createDOMParser() {
    return new this.DOMParser();
  }

  private createXMLSerializer() {
    return new this.XMLSerializer();
  }

}
