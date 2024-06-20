import { Mixin } from '@rxap/mixin';
import { getMetadata } from '@rxap/reflect-metadata';
import {
  camelize,
  dasherize,
  deepMerge,
  hasIndexSignature,
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

export interface ElementRecordOptions<Value>
  extends TextContentElementOptions<Value>,
          TagElementOptions {
}

/**
 * Asserts that the provided `options` object conforms to the `ElementRecordOptions<any>` type.
 *
 * This function checks if the given `options` object meets the criteria of being an instance of `ElementRecordOptions<any>`,
 * specifically by verifying the presence of a "tag" property, which is essential for identifying the object as a valid `ElementRecordOptions`.
 * If the `options` object does not meet the criteria, the function throws an error indicating the absence of the required "tag" property.
 *
 * @param options - The object to be validated against the `ElementRecordOptions<any>` type.
 * @throws {Error} Throws an error if the `options` object does not have the required "tag" property.
 */
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

        parsedElement[this.propertyKey][child.has('propertyKey') ?
          child.get('propertyKey') :
          this.convertTagToPropertyKey(child.name)]
          = child.getTextContent();
      }
    } else if (this.required) {
      throw new RxapXmlParserValidateRequiredError(
        `Element <${ element.name }> child <${ this.tag }> text content is required!`,
        parsedElement.__tag!,
      );
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

/**
 * Decorator factory that creates a decorator to be applied to class properties for element record parsing.
 * It configures the parsing behavior based on the provided options or defaults derived from the property name.
 *
 * @param {Partial<ElementRecordOptions<Value>> | string} optionsOrString - Configuration options for the element record parser,
 * or a string specifying the tag name directly. If a string is provided, it is used as the tag name.
 * If omitted, the tag name is derived by dasherizing the property name.
 *
 * @returns {Function} A decorator function that takes a target class and its property key to apply metadata and parsing logic.
 *
 * The decorator function internally:
 * - Resolves the configuration options for the element record. If `optionsOrString` is undefined, it defaults to using
 * a dasherized version of the property key as the tag. If it's a string, that string is used as the tag.
 * Otherwise, it treats it as partial options.
 * - Merges these options with any existing metadata options on the property.
 * - Ensures a tag is defined, defaulting to a dasherized property key if not explicitly provided.
 * - Validates the resolved options using `AssertElementRecordOptions`.
 * - Creates an instance of `ElementRecordParser` with the resolved options and associates it with the property.
 * - Registers the parser in the metadata of the target object.
 * - If the `required` option is set, it applies a `RequiredProperty` decorator to ensure the property must be set.
 *
 * Usage example:
 * ```typescript
 * class MyComponent {
 * @ElementRecord({ tag: 'my-element', required: true })
 * myElement: HTMLElement;
 * }
 * ```
 */
export function ElementRecord<Value>(optionsOrString?: Partial<ElementRecordOptions<Value>> | string) {
  return function (target: any, propertyKey: string) {
    let options = optionsOrString === undefined ?
      { tag: dasherize(propertyKey) } :
      typeof optionsOrString === 'string' ? { tag: optionsOrString } : optionsOrString;
    options = deepMerge(options, getMetadata(ElementParserMetaData.OPTIONS, target, propertyKey) || {});
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
