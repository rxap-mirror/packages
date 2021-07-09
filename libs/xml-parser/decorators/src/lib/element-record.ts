import {
  XmlElementMetadata,
  AddParserToMetadata
} from './utilities';
import {
  deepMerge,
  dasherize,
  camelize
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
import { getMetadata } from '@rxap/utilities/reflect-metadata';

export interface ElementRecordOptions<Value>
  extends TextContentElementOptions<Value>,
          TagElementOptions {
}

export function AssertElementRecordOptions(options: any): asserts options is ElementRecordOptions<any> {
  if (!IsTagElementOptions(options)) {
    throw new Error('The object is not a ElementRecordOptions. The required property "tag" is missing!');
  }
}

export interface ElementRecordParser<T extends ParsedElement, Value>
  extends TextContentElementParserMixin<Value>,
          TagElementParserMixin {}

@Mixin(TextContentElementParserMixin, TagElementParserMixin)
export class ElementRecordParser<T extends ParsedElement, Value>
  implements ElementParser<T> {

  constructor(
    public readonly propertyKey: string,
    public readonly options: ElementRecordOptions<Value>
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
      // @ts-ignore
      parsedElement[ this.propertyKey ] = {};
      for (const child of element.getChild(this.tag)!.getAllChildNodes()) {
        // @ts-ignore
        parsedElement[ this.propertyKey ][ camelize(child.name) ] = child.getTextContent();
      }
    } else if (this.required) {
      throw new RxapXmlParserValidateRequiredError(`Element <${element.name}> child <${this.tag}> text content is required!`, parsedElement.__tag!);
    }

    return parsedElement;
  }

}

export function ElementRecord<Value>(optionsOrString?: Partial<ElementRecordOptions<Value>> | string) {
  return function(target: any, propertyKey: string) {
    let options = optionsOrString === undefined ?
                  { tag: dasherize(propertyKey) } :
                  typeof optionsOrString === 'string' ? { tag: optionsOrString } : optionsOrString;
    options     = deepMerge(options, getMetadata(XmlElementMetadata.OPTIONS, target, propertyKey) || {});
    if (!options.tag) {
      options.tag = dasherize(propertyKey);
    }

    AssertElementRecordOptions(options);

    const parser = new ElementRecordParser(propertyKey, options);
    AddParserToMetadata(parser, target);
    if (options.required) {
      RequiredProperty()(target, propertyKey);
    }
  };
}
