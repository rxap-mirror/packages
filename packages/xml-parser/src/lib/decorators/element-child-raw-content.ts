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
import { XmlParserService } from '../xml-parser.service';
import { RxapElement } from '../element';
import { RxapXmlParserValidateRequiredError } from '../error';
import { RequiredProperty } from './required-property';

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
    TagElementParserMixin {
}

@Mixin(TextContentElementParserMixin, TagElementParserMixin)
export class ElementChildRawContentParser<T extends ParsedElement>
  implements ElementParser<T> {

  constructor(
    public readonly propertyKey: string,
    public readonly options: ElementChildRawContentOptions<string>,
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
      const rawValue = element.getChildRawContent(this.tag, this.defaultValue);
      if (rawValue !== undefined) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        parsedElement[this.propertyKey] = this.parseValue(rawValue);
      }
    } else if (this.required) {
      throw new RxapXmlParserValidateRequiredError(`Element <${element.name}> child <${this.tag}> raw content is required!`, parsedElement.__tag!);
    }

    return parsedElement;
  }

}

export function ElementChildRawContent<Value>(optionsOrString?: Partial<ElementChildRawContentOptions<Value>> | string) {
  return function (target: any, propertyKey: string) {
    let options = optionsOrString === undefined ?
      {tag: dasherize(propertyKey)} :
      typeof optionsOrString === 'string' ? {tag: optionsOrString} : optionsOrString;
    options = deepMerge(options, getMetadata(XmlElementMetadata.OPTIONS, target, propertyKey) || {});
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
