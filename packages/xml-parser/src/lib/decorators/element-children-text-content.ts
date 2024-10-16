import { Mixin } from '@rxap/mixin';
import { getMetadata } from '@rxap/reflect-metadata';
import {
  dasherize,
  deepMerge,
} from '@rxap/utilities';
import { RxapElement } from '../element';
import { ParsedElement } from '../elements/parsed-element';
import {
  RxapXmlParserValidateError,
  RxapXmlParserValidateRequiredError,
} from '../error';
import { XmlParserService } from '../xml-parser.service';
import { ElementParser } from './element.parser';
import { ElementParserMetaData } from './metadata-keys';
import {
  ChildrenElementOptions,
  ChildrenElementParserMixin,
} from './mixins/children-element-parser.mixin';
import {
  IsTagElementOptions,
  TagElementOptions,
  TagElementParserMixin,
} from './mixins/tag-element.parser.mixin';
import {
  TextContentElementOptions,
  TextContentElementParserMixin,
} from './mixins/text-content-element.parser.mixin';
import { RequiredProperty } from './required-property';
import { AddParserToMetadata } from './utilities';

export interface ElementChildrenTextContentOptions<Value>
  extends TextContentElementOptions<Value, Value[]>,
          TagElementOptions,
          ChildrenElementOptions {
}

/**
 * Asserts that the provided `options` object conforms to the `ElementChildrenTextContentOptions` type.
 *
 * This function checks if the given `options` object meets the criteria of being an instance of `ElementChildrenTextContentOptions` by verifying the presence of a `tag` property, which is essential for identifying the object as a valid `ElementChildrenTextContentOptions`.
 *
 * @param options - The object to be validated against the `ElementChildrenTextContentOptions` type.
 * @throws {Error} Throws an error if the `options` object does not have the required `tag` property, indicating that it is not a valid `ElementChildrenTextContentOptions`.
 *
 */
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
        `The child group element '${ this.options.group }' is required for ${ parsedElement.__tag }!`,
        parsedElement.__tag!,
      );
    }

    let list: Value[] = elementChildren.filter(child => child.hasName(this.tag)).map(child => {
      const rawValue = child.getTextContent(undefined, true);
      if (rawValue !== undefined) {
        return this.parseValue(rawValue);
      }
      return undefined;
    }).filter(item => item !== undefined);

    if (list.length === 0) {
      list = this.defaultValue ?? [];
    }

    if (this.required && list.length === 0) {
      throw new RxapXmlParserValidateRequiredError(
        `Some element child <${ this.tag }> is required in <${ parsedElement.__tag }>!`,
        parsedElement.__tag!,
      );
    }

    if (this.min !== null && this.min > list.length) {
      throw new RxapXmlParserValidateError(
        `Element child <${ this.tag }> should be at least ${ this.min } in <${ parsedElement.__tag }>!`,
        parsedElement.__tag!,
      );
    }

    if (this.max !== null && this.max > list.length) {
      throw new RxapXmlParserValidateError(
        `Element child <${ this.tag }> should be at most ${ this.max } in <${ parsedElement.__tag }>!`,
        parsedElement.__tag!,
      );
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parsedElement[this.propertyKey] = list;

    return parsedElement;
  }

}

/**
 * Decorator factory that creates a decorator to parse the text content of children elements of a specified XML/HTML tag.
 *
 * This decorator can be applied to properties within classes that are intended to parse XML/HTML data. It configures
 * the parsing behavior based on the provided options or defaults derived from the property name if no options are specified.
 *
 * @param {Partial<ElementChildrenTextContentOptions<Value>> | string} optionsOrString - Configuration options for the decorator,
 * or a string specifying the tag name of the element whose children's text content should be parsed.
 * If a string is provided, it is used as the tag name. If an object is provided, it can specify various parsing options.
 * If omitted, the tag name is derived by dasherizing the property name.
 *
 * @returns {Function} A class property decorator that configures the parser for the specified property.
 *
 * ### Usage
 *
 * ```typescript
 * @ElementChildrenTextContent({ tag: 'item', required: true })
 * items: string[];
 * ```
 *
 * In the above example, the decorator will configure the parser to parse the text content of children of `<item>` elements.
 * The `required` option specifies that at least one `<item>` element must be present.
 */
export function ElementChildrenTextContent<Value>(optionsOrString?: Partial<ElementChildrenTextContentOptions<Value>> | string) {
  return function (target: any, propertyKey: string) {
    let options = optionsOrString === undefined ?
      { tag: dasherize(propertyKey) } :
      typeof optionsOrString === 'string' ? { tag: optionsOrString } : optionsOrString;
    options = deepMerge(options, getMetadata(ElementParserMetaData.OPTIONS, target, propertyKey) || {});
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
