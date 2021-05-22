import {
  XmlElementMetadata,
  AddParserToMetadata
} from './utilities';
import {
  deepMerge,
  getMetadata
} from '@rxap/utilities';
import { Mixin } from '@rxap/mixin';
import {
  TextContentElementParserMixin,
  TextContentElementOptions
} from './mixins/text-content-element.parser';
import {
  ParsedElement,
  XmlParserService,
  RequiredProperty,
  RxapElement,
  RxapXmlParserValidateRequiredError
} from '@rxap/xml-parser';


export interface ElementTextContentOptions<Value>
  extends TextContentElementOptions<Value> {}

export interface ElementTextContentParser<T extends ParsedElement, Value>
  extends TextContentElementParserMixin<Value> {

}

@Mixin(TextContentElementParserMixin)
export class ElementTextContentParser<T extends ParsedElement, Value> {

  constructor(
    public readonly propertyKey: string,
    public readonly options: ElementTextContentOptions<Value>
  ) {
    this.parse = this.parse.bind(this);
    Reflect.set(this.parse, 'propertyKey', propertyKey);
  }

  public parse(
    xmlParser: XmlParserService,
    element: RxapElement,
    parsedElement: T
  ): T {

    const rawValue: string | undefined = element.getTextContent(undefined, true);
    // @ts-ignore
    let value: any | undefined         = parsedElement[ this.propertyKey ];

    if (typeof rawValue === 'string') {
      // @ts-ignore
      value = parsedElement[ this.propertyKey ] = this.parseValue(rawValue);
    }

    if (this.required) {
      if (value === undefined) {
        throw new RxapXmlParserValidateRequiredError(`Element <${parsedElement.__tag}> text content is required!`, parsedElement.__tag!);
      }
    }

    return parsedElement;
  }

}

export function ElementTextContent<Value>(options: ElementTextContentOptions<Value> = {}) {
  return function(target: any, propertyKey: string) {
    options      = deepMerge<ElementTextContentOptions<Value>>(options, getMetadata(XmlElementMetadata.OPTIONS, target, propertyKey) || {});
    const parser = new ElementTextContentParser(propertyKey, options);
    AddParserToMetadata(parser, target);
    if (options.required) {
      RequiredProperty()(target, propertyKey);
    }
  };
}
