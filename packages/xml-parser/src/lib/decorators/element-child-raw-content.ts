import { Mixin } from '@rxap/mixin';
import { getMetadata } from '@rxap/reflect-metadata';
import {
  dasherize,
  deepMerge,
} from '@rxap/utilities';
import { RxapElement } from '../element';
import { ParsedElement } from '../elements/parsed-element';
import { RxapXmlParserValidateRequiredError } from '../error';
import { XmlParserService } from '../xml-parser.service';
import { ElementParser } from './element.parser';
import { ElementParserMetaData } from './metadata-keys';
import {
  IsTagElementOptions,
  TagElementOptions,
  TagElementParserMixin,
} from './mixins/tag-element.parser.mixin';
import {
  TextContentElementOptions,
  TextContentElementParserMixin,
} from './mixins/text-content-element.parser';
import { RequiredProperty } from './required-property';
import { AddParserToMetadata } from './utilities';

export interface ElementChildRawContentOptions<Value>
  extends TextContentElementOptions<Value>,
          TagElementOptions {
}

/**
 * Asserts that the provided `options` object is an instance of `ElementChildRawContentOptions`.
 * This function performs a runtime check to ensure that the `options` object conforms to the expected structure
 * of `ElementChildRawContentOptions`. Specifically, it checks if the `options` object has a "tag" property,
 * which is essential for identifying it as a valid `ElementChildRawContentOptions` instance.
 *
 * @param options - The object to be validated as an instance of `ElementChildRawContentOptions`.
 * @throws {Error} Throws an error if the `options` object does not have a "tag" property, indicating
 * that it is not a valid `ElementChildRawContentOptions`.
 * @template T - The type parameter that specifies the type of the content within the `ElementChildRawContentOptions`.
 */
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
      throw new RxapXmlParserValidateRequiredError(
        `Element <${ element.name }> child <${ this.tag }> raw content is required!`,
        parsedElement.__tag!,
      );
    }

    return parsedElement;
  }

}

/**
 * Decorator factory that creates a decorator to parse and inject raw content from a child element into a class property.
 *
 * This decorator can be applied to properties within classes that are meant to interact with DOM-like structures, where
 * the content of a specified child element is directly assigned to the property. The child element is identified by a tag,
 * which can be customized through the options provided.
 *
 * @param {Partial<ElementChildRawContentOptions<Value>> | string} optionsOrString - This parameter can either be a string
 * representing the tag of the child element or an object containing various configuration options. If a string is provided,
 * it is used as the tag name of the child element. If an object is provided, it can specify detailed options such as the tag name,
 * whether the child element is required, and other parser-specific options.
 *
 * @returns {Function} A class decorator function that takes two parameters: `target`, the constructor of the class, and
 * `propertyKey`, the name of the property to which the decorator is applied. This decorator function initializes and configures
 * an instance of `ElementChildRawContentParser` based on the provided options and attaches it to the metadata of the target class.
 *
 * ### Usage
 *
 * ```typescript
 * class MyComponent {
 * @ElementChildRawContent({ tag: 'my-child', required: true })
 * content: string;
 * }
 * ```
 *
 * In the above example, the `ElementChildRawContent` decorator is used to specify that the `content` property of `MyComponent`
 * should be filled with the raw content of a child element `<my-child>` which is required to be present.
 *
 */
export function ElementChildRawContent<Value>(optionsOrString?: Partial<ElementChildRawContentOptions<Value>> | string) {
  return function (target: any, propertyKey: string) {
    let options = optionsOrString === undefined ?
      { tag: dasherize(propertyKey) } :
      typeof optionsOrString === 'string' ? { tag: optionsOrString } : optionsOrString;
    options = deepMerge(options, getMetadata(ElementParserMetaData.OPTIONS, target, propertyKey) || {});
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
