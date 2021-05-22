import {
  XmlElementMetadata,
  AddParserToMetadata
} from './utilities';
import {
  deepMerge,
  getMetadata,
  dasherize
} from '@rxap/utilities';
import { Mixin } from '@rxap/mixin';
import {
  TagElementParserMixin,
  TagElementOptions,
  IsTagElementOptions
} from './mixins/tag-element.parser.mixin';
import {
  TextContentElementParserMixin,
  TextContentElementOptions
} from './mixins/text-content-element.parser';
import { ElementParser } from './element.parser';
import {
  ParsedElement,
  XmlParserService,
  RequiredProperty,
  RxapElement,
  RxapXmlParserValidateRequiredError
} from '@rxap/xml-parser';

export interface ElementChildRawContentOptions<Value>
  extends TextContentElementOptions<Value>,
          TagElementOptions {
}

export function AssertElementChildRawContentOptions(options: any): asserts options is ElementChildRawContentOptions<any> {
  if (!IsTagElementOptions(options)) {
    throw new Error('The object is not a ElementChildRawContentOptions. The required property "tag" is missing!');
  }
}

export interface ElementChildRawContentParser<T extends ParsedElement>
  extends TextContentElementParserMixin<string>,
          TagElementParserMixin {}

@Mixin(TextContentElementParserMixin, TagElementParserMixin)
export class ElementChildRawContentParser<T extends ParsedElement>
  implements ElementParser<T> {

  constructor(
    public readonly propertyKey: string,
    public readonly options: ElementChildRawContentOptions<string>
  ) {
    this.parse = this.parse.bind(this);
    Reflect.set(this.parse, 'propertyKey', propertyKey);
  }

  public parse(
    xmlParser: XmlParserService,
    element: RxapElement,
    parsedElement: T
  ): T {

    if (element.hasChild(this.tag)) {
      const rawValue = element.getChildRawContent(this.tag, this.defaultValue);
      if (rawValue !== undefined) {
        // @ts-ignore
        parsedElement[ this.propertyKey ] = this.parseValue(rawValue);
      }
    } else if (this.required) {
      throw new RxapXmlParserValidateRequiredError(`Element <${element.name}> child <${this.tag}> raw content is required!`, parsedElement.__tag!);
    }

    return parsedElement;
  }

}

export function ElementChildRawContent<Value>(optionsOrString?: Partial<ElementChildRawContentOptions<Value>> | string) {
  return function(target: any, propertyKey: string) {
    let options = optionsOrString === undefined ?
                  { tag: dasherize(propertyKey) } :
                  typeof optionsOrString === 'string' ? { tag: optionsOrString } : optionsOrString;
    options     = deepMerge(options, getMetadata(XmlElementMetadata.OPTIONS, target, propertyKey) || {});
    if (!options.tag) {
      options.tag = dasherize(propertyKey);
    }

    AssertElementChildRawContentOptions(options);

    const parser = new ElementChildRawContentParser(propertyKey, options);
    AddParserToMetadata(parser, target);
    if (options.required) {
      RequiredProperty()(target, propertyKey);
    }
  };
}
