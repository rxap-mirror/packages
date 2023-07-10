import {AddParserToMetadata, XmlElementMetadata} from './utilities';
import {deepMerge, hasIndexSignature} from '@rxap/utilities';
import {Mixin} from '@rxap/mixin';
import {TextContentElementOptions, TextContentElementParserMixin} from './mixins/text-content-element.parser';
import {getMetadata} from '@rxap/reflect-metadata';
import {ParsedElement} from '../elements/parsed-element';
import {XmlParserService} from '../xml-parser.service';
import {RxapElement} from '../element';
import {RxapXmlParserValidateRequiredError} from '../error';
import {RequiredProperty} from './required-property';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementTextContentOptions<Value>
  extends TextContentElementOptions<Value> {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementTextContentParser<T extends ParsedElement, Value>
  extends TextContentElementParserMixin<Value> {

}

@Mixin(TextContentElementParserMixin)
export class ElementTextContentParser<T extends ParsedElement, Value> {

  constructor(
    public readonly propertyKey: string,
    public readonly options: ElementTextContentOptions<Value>,
  ) {
    this.parse = this.parse.bind(this);
    Reflect.set(this.parse, 'propertyKey', propertyKey);
  }

  public parse(
    xmlParser: XmlParserService,
    element: RxapElement,
    parsedElement: T,
  ): T {

    const rawValue: string | undefined = element.getTextContent(undefined, true);

    if (!hasIndexSignature(parsedElement)) {
      throw new Error('Parsed Element has no index signature!');
    }

    let value: any | undefined = parsedElement[this.propertyKey];

    if (typeof rawValue === 'string') {
      value = this.parseValue(rawValue);
    }

    if (value === undefined || value === null || value === '') {
      if (this.required && this.defaultValue === undefined) {
        throw new RxapXmlParserValidateRequiredError(`Element <${parsedElement.__tag}> text content is required!`, parsedElement.__tag!);
      } else if (this.defaultValue !== undefined) {
        value = this.defaultValue;
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parsedElement[this.propertyKey] = value;

    return parsedElement;
  }

}

export function ElementTextContent<Value>(options: ElementTextContentOptions<Value> = {}) {
  return function (target: any, propertyKey: string) {
    options = deepMerge<ElementTextContentOptions<Value>>(options, getMetadata(XmlElementMetadata.OPTIONS, target, propertyKey) || {});
    const parser = new ElementTextContentParser(propertyKey, options);
    AddParserToMetadata(parser, target);
    if (options.required) {
      RequiredProperty()(target, propertyKey);
    }
  };
}
