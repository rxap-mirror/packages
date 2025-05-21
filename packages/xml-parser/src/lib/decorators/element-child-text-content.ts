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
import { XmlSerializerService } from '../xml-serializer.service';
import { ElementParser } from './element.parser';
import { ElementSerializer } from './element.serializer';
import { ElementParserMetaData } from './metadata-keys';
import {
  IsTagElementOptions,
  TagElementOptions,
  TagElementMixin,
} from './mixins/tag-element.mixin';
import {
  TextContentElementOptions,
  TextContentElementMixin,
} from './mixins/text-content-element.mixin';
import { RequiredProperty } from './required-property';
import { AddParserToMetadata } from './utilities/add-parser-to-metadata';
import { AddSerializerToMetadata } from './utilities/add-serializer-to-metadata';

export interface ElementChildTextContentParserOptions<Value>
  extends TextContentElementOptions<Value>,
          TagElementOptions {
}

/**
 * Asserts that the provided `options` object conforms to the `ElementChildTextContentOptions` type.
 *
 * This function checks if the given `options` object meets the criteria of being an instance of `ElementChildTextContentOptions` by verifying the presence of a `tag` property, which is essential for identifying the options as valid for elements with text content.
 *
 * @param options - The object to be validated against the `ElementChildTextContentOptions` type.
 * @throws {Error} Throws an error if the `options` object does not have a `tag` property, indicating it is not a valid `ElementChildTextContentOptions` object.
 *
 * @template T - The type parameter that extends the basic HTMLElement interface, specifying the type of element these options are associated with.
 */
export function AssertElementChildTextContentOptions(options: any): asserts options is ElementChildTextContentParserOptions<any> {
  if (!IsTagElementOptions(options)) {
    throw new Error('The object is not a ElementChildTextContentOptions. The required property "tag" is missing!');
  }
}

export interface ElementChildTextContentParser<T extends ParsedElement, Value>
  extends TextContentElementMixin<Value>,
          TagElementMixin {
}

@Mixin(TextContentElementMixin, TagElementMixin)
export class ElementChildTextContentParser<T extends ParsedElement, Value>
  implements ElementParser<T> {

  constructor(
    public readonly propertyKey: string,
    public readonly options: ElementChildTextContentParserOptions<Value>,
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

export interface ElementChildTextContentSerializerOptions<Value>
  extends TextContentElementOptions<Value>,
          TagElementOptions {
}

export interface ElementChildTextContentSerializer<T extends ParsedElement, Value>
  extends TextContentElementMixin<Value>,
          TagElementMixin {
}

@Mixin(TextContentElementMixin, TagElementMixin)
export class ElementChildTextContentSerializer<T extends ParsedElement, Value>
  implements ElementSerializer<T> {

  constructor(
    public readonly propertyKey: string,
    public readonly options: ElementChildTextContentSerializerOptions<Value>,
  ) {
    this.serialize = this.serialize.bind(this);
    Reflect.set(this.serialize, 'propertyKey', propertyKey);
  }

  serialize(xmlParser: XmlSerializerService, element: RxapElement, parsedElement: T) {

    // @ts-expect-error the propertyKey is set by the property decorator
    const child = parsedElement[this.propertyKey];

    if (child !== undefined) {
      element.setChildTextContent(this.tag, this.serializeValue(child));
    } else if (this.required) {
      throw new RxapXmlParserValidateRequiredError(
        `Element <${ element.name }> child <${ this.tag }> raw content is required!`,
        parsedElement.__tag!,
      );
    }

  }

}

/**
 * Decorator factory that creates a decorator to parse the text content of a child element specified by a tag.
 * This decorator can be applied to properties within a class to automatically parse and assign the text content
 * of a child element from the associated DOM element of the class instance.
 *
 * @param {Partial<ElementChildTextContentParserOptions<Value>> | string} optionsOrString - Configuration options for the decorator or a string specifying the tag of the child element. If a string is provided, it is used as the tag name. If an object is provided, it can specify various parsing options including the tag name.
 *
 * The options object may include:
 * - `tag`: A string specifying the tag name of the child element whose text content is to be parsed.
 * - `required`: A boolean indicating whether the child element is required. If set to true and the child element is missing, an error will be thrown.
 * - Additional options specific to the parsing and handling of the element's content can also be included.
 *
 * @returns {Function} A class property decorator that, when applied, configures the property to parse and store the text content of the specified child element.
 *
 * ### Usage
 *
 * ```typescript
 * @ElementChildTextContent({ tag: 'span', required: true })
 * public someProperty: string;
 * ```
 *
 * In this example, `someProperty` will be automatically populated with the text content of a `<span>` element found within the host element of the class instance. If the `<span>` is not found and `required` is set to true, an error will be thrown.
 */
export function ElementChildTextContent<Value>(optionsOrString?: Partial<ElementChildTextContentParserOptions<Value> & ElementChildTextContentSerializerOptions<Value>> | string) {
  return function (target: any, propertyKey: string) {
    let options = optionsOrString === undefined ?
      { tag: dasherize(propertyKey) } :
      typeof optionsOrString === 'string' ? { tag: optionsOrString } : optionsOrString;
    options = deepMerge(options, getMetadata(ElementParserMetaData.OPTIONS, target, propertyKey) || {});
    if (!options.tag) {
      options.tag = dasherize(propertyKey);
    }

    AssertElementChildTextContentOptions(options);

    const parser = new ElementChildTextContentParser(propertyKey, options);
    AddParserToMetadata(parser, target);
    const serializer = new ElementChildTextContentSerializer(propertyKey, options);
    AddSerializerToMetadata(serializer, target);
    if (options.required) {
      RequiredProperty()(target, propertyKey);
    }
  };
}
