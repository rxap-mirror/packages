import {
  AddParserToMetadata,
  XmlElementMetadata,
} from './utilities';
import {
  dasherize,
  deepMerge,
} from '@rxap/utilities';
import { Mixin } from '@rxap/mixin';
import {
  IsTagElementOptions,
  TagElementOptions,
  TagElementParserMixin,
} from './mixins/tag-element.parser.mixin';
import {
  TextContentElementOptions,
  TextContentElementParserMixin,
} from './mixins/text-content-element.parser';
import { ElementParser } from './element.parser';
import { getMetadata } from '@rxap/reflect-metadata';
import { ParsedElement } from '../elements/parsed-element';
import { RxapElement } from '../element';
import { XmlParserService } from '../xml-parser.service';
import { RxapXmlParserValidateRequiredError } from '../error';
import { RequiredProperty } from './required-property';

export interface ElementChildTextContentOptions<Value>
  extends TextContentElementOptions<Value>,
          TagElementOptions {
}

export function AssertElementChildTextContentOptions(options: any): asserts options is ElementChildTextContentOptions<any> {
  if (!IsTagElementOptions(options)) {
    throw new Error('The object is not a ElementChildTextContentOptions. The required property "tag" is missing!');
  }
}

export interface ElementChildTextContentParser<T extends ParsedElement, Value>
  extends TextContentElementParserMixin<Value>,
          TagElementParserMixin {
}

@Mixin(TextContentElementParserMixin, TagElementParserMixin)
export class ElementChildTextContentParser<T extends ParsedElement, Value>
  implements ElementParser<T> {

  constructor(
    public readonly propertyKey: string,
    public readonly options: ElementChildTextContentOptions<Value>,
  ) {
    this.parse = this.parse.bind(this);
    Reflect.set(this.parse, 'propertyKey', propertyKey);
  }

  public parse(
    xmlParser: XmlParserService,
    element: RxapElement,
    parsedElement: T,
  ): T {

    if (element.hasChild(this.tag)) {
      const rawValue = element.getChildTextContent(this.tag, this.defaultValue, true);
      if (rawValue !== undefined) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        parsedElement[this.propertyKey] = this.parseValue(rawValue);
      }
    } else if (this.required) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (parsedElement[this.propertyKey] === undefined) {
        throw new RxapXmlParserValidateRequiredError(
          `Element <${ element.name }> child <${ this.tag }> text content is required!`,
          parsedElement.__tag!,
        );
      }
    }

    return parsedElement;
  }

}

export function ElementChildTextContent<Value>(optionsOrString?: Partial<ElementChildTextContentOptions<Value>> | string) {
  return function (target: any, propertyKey: string) {
    let options = optionsOrString === undefined ?
      { tag: dasherize(propertyKey) } :
      typeof optionsOrString === 'string' ? { tag: optionsOrString } : optionsOrString;
    options = deepMerge(options, getMetadata(XmlElementMetadata.OPTIONS, target, propertyKey) || {});
    if (!options.tag) {
      options.tag = dasherize(propertyKey);
    }

    AssertElementChildTextContentOptions(options);

    const parser = new ElementChildTextContentParser(propertyKey, options);
    AddParserToMetadata(parser, target);
    if (options.required) {
      RequiredProperty()(target, propertyKey);
    }
  };
}
