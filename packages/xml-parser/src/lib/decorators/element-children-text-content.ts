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
import {
  ChildrenElementOptions,
  ChildrenElementParserMixin,
} from './mixins/children-element-parser.mixin';
import { ParsedElement } from '../elements/parsed-element';
import { XmlParserService } from '../xml-parser.service';
import { RxapElement } from '../element';
import {
  RxapXmlParserValidateError,
  RxapXmlParserValidateRequiredError,
} from '../error';
import { RequiredProperty } from './required-property';

export interface ElementChildrenTextContentOptions<Value>
  extends TextContentElementOptions<Value, Value[]>,
          TagElementOptions,
          ChildrenElementOptions {
}

export function AssertElementChildrenTextContentOptions(options: any): asserts options is ElementChildrenTextContentOptions<any> {
  if (!IsTagElementOptions(options)) {
    throw new Error('The object is not a ElementChildrenTextContentOptions. The required property "tag" is missing!');
  }
}

export interface ElementChildrenTextContentParser<T extends ParsedElement, Value>
  extends TextContentElementParserMixin<Value, Value[]>,
    TagElementParserMixin,
    ChildrenElementParserMixin {
}

@Mixin(TextContentElementParserMixin, TagElementParserMixin, ChildrenElementParserMixin)
export class ElementChildrenTextContentParser<T extends ParsedElement, Value>
  implements ElementParser<T> {

  constructor(
    public readonly propertyKey: string,
    public readonly options: ElementChildrenTextContentOptions<Value>,
  ) {
    this.parse = this.parse.bind(this);
    Reflect.set(this.parse, 'propertyKey', propertyKey);
  }

  public parse(
    xmlParser: XmlParserService,
    element: RxapElement,
    parsedElement: T,
  ): T {

    const elementChildren = this.getChildren(element);

    if (!elementChildren) {
      throw new RxapXmlParserValidateRequiredError(
        `The child group element '${this.options.group}' is required for ${parsedElement.__tag}!`,
        parsedElement.__tag!,
      );
    }

    let list = elementChildren.map(child => {
      const rawValue = child.getChildTextContent(this.tag, undefined, true);
      if (rawValue !== undefined) {
        return this.parseValue(rawValue);
      }
      return undefined;
    }).filter(item => item !== undefined);

    if (list.length === 0) {
      list = this.defaultValue ?? [];
    }

    if (this.required && list.length === 0) {
      throw new RxapXmlParserValidateRequiredError(`Some element child <${this.tag}> is required in <${parsedElement.__tag}>!`, parsedElement.__tag!);
    }

    if (this.min !== null && this.min > list.length) {
      throw new RxapXmlParserValidateError(`Element child <${this.tag}> should be at least ${this.min} in <${parsedElement.__tag}>!`, parsedElement.__tag!);
    }

    if (this.max !== null && this.max > list.length) {
      throw new RxapXmlParserValidateError(`Element child <${this.tag}> should be at most ${this.max} in <${parsedElement.__tag}>!`, parsedElement.__tag!);
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parsedElement[this.propertyKey] = list;

    return parsedElement;
  }

}

export function ElementChildrenTextContent<Value>(optionsOrString?: Partial<ElementChildrenTextContentOptions<Value>> | string) {
  return function (target: any, propertyKey: string) {
    let options = optionsOrString === undefined ?
      {tag: dasherize(propertyKey)} :
      typeof optionsOrString === 'string' ? {tag: optionsOrString} : optionsOrString;
    options = deepMerge(options, getMetadata(XmlElementMetadata.OPTIONS, target, propertyKey) || {});
    if (!options.tag) {
      options.tag = dasherize(propertyKey);
    }

    AssertElementChildrenTextContentOptions(options);

    const parser = new ElementChildrenTextContentParser(propertyKey, options);
    AddParserToMetadata(parser, target);
    if (options.required) {
      RequiredProperty()(target, propertyKey);
    }
  };
}
