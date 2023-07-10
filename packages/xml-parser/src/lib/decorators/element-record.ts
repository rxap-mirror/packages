import {
  AddParserToMetadata,
  XmlElementMetadata,
} from './utilities';
import {
  camelize,
  dasherize,
  deepMerge,
  hasIndexSignature,
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
    TagElementParserMixin {
}

@Mixin(TextContentElementParserMixin, TagElementParserMixin)
export class ElementRecordParser<T extends ParsedElement, Value>
  implements ElementParser<T> {

  constructor(
    public readonly propertyKey: string,
    public readonly options: ElementRecordOptions<Value>,
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

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      parsedElement[this.propertyKey] = {};
      for (const child of element.getChild(this.tag)!.getAllChildNodes()) {

        if (!hasIndexSignature(parsedElement)) {
          throw new Error('Parsed Element has no index signature!');
        }

        parsedElement[this.propertyKey][child.has('propertyKey') ? child.get('propertyKey') : this.convertTagToPropertyKey(child.name)]
          = child.getTextContent();
      }
    } else if (this.required) {
      throw new RxapXmlParserValidateRequiredError(`Element <${element.name}> child <${this.tag}> text content is required!`, parsedElement.__tag!);
    }

    return parsedElement;
  }

  private convertTagToPropertyKey(name: string): string {
    if (name.includes('-')) {
      return camelize(name);
    }
    return name;
  }

}

export function ElementRecord<Value>(optionsOrString?: Partial<ElementRecordOptions<Value>> | string) {
  return function (target: any, propertyKey: string) {
    let options = optionsOrString === undefined ?
      {tag: dasherize(propertyKey)} :
      typeof optionsOrString === 'string' ? {tag: optionsOrString} : optionsOrString;
    options = deepMerge(options, getMetadata(XmlElementMetadata.OPTIONS, target, propertyKey) || {});
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
