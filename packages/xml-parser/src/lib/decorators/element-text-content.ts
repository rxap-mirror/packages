import { Mixin } from '@rxap/mixin';
import { getMetadata } from '@rxap/reflect-metadata';
import {
  deepMerge,
  hasIndexSignature,
} from '@rxap/utilities';
import { RxapElement } from '../element';
import { ParsedElement } from '../elements/parsed-element';
import { RxapXmlParserValidateRequiredError } from '../error';
import { XmlParserService } from '../xml-parser.service';
import { ElementParserMetaData } from './metadata-keys';
import {
  TextContentElementOptions,
  TextContentElementParserMixin,
} from './mixins/text-content-element.parser';
import { RequiredProperty } from './required-property';
import { AddParserToMetadata } from './utilities';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementTextContentOptions<Value>
  extends TextContentElementOptions<Value> {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementTextContentParser<T extends ParsedElement, Value>
  extends TextContentElementParserMixin<Value> {

}

@Mixin(TextContentElementParserMixin)
export class ElementTextContentParser<T extends ParsedElement, Value> {

  constructor(
    public readonly propertyKey: string,
    public readonly options: ElementTextContentOptions<Value>,
  ) {
    this.parse = this.parse.bind(this);
    Reflect.set(this.parse, 'propertyKey', propertyKey);
  }

  public parse(
    xmlParser: XmlParserService,
    element: RxapElement,
    parsedElement: T,
  ): T {

    const rawValue: string | undefined = element.getTextContent(undefined, true);

    if (!hasIndexSignature(parsedElement)) {
      throw new Error('Parsed Element has no index signature!');
    }

    let value: any | undefined = parsedElement[this.propertyKey];

    if (typeof rawValue === 'string') {
      value = this.parseValue(rawValue);
    }

    if (value === undefined || value === null || value === '') {
      if (this.required && this.defaultValue === undefined) {
        throw new RxapXmlParserValidateRequiredError(
          `Element <${ parsedElement.__tag }> text content is required!`,
          parsedElement.__tag!,
        );
      } else if (this.defaultValue !== undefined) {
        value = this.defaultValue;
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parsedElement[this.propertyKey] = value;

    return parsedElement;
  }

}

/**
 * Decorator factory that creates a decorator to parse and inject text content from a DOM element into a class property.
 *
 * This decorator factory allows customization through `ElementTextContentOptions`. It merges user-provided options
 * with metadata options (if any) associated with the property. The merged options are then used to create an instance
 * of `ElementTextContentParser` which is responsible for the actual parsing and assignment of the text content to the
 * class property.
 *
 * If the `required` option is set to true, the property is also decorated with a `RequiredProperty` decorator to enforce
 * its presence.
 *
 * @param {ElementTextContentOptions<Value>} [options={}] - Optional configuration options for element text content parsing.
 * @returns A class property decorator that configures text content parsing based on the provided options.
 *
 * @template Value - The expected type of the property's value.
 *
 * ### Usage
 *
 * ```typescript
 * class MyComponent {
 * @ElementTextContent({ selector: '#myElement', required: true })
 * public textContent: string;
 * }
 * ```
 */
export function ElementTextContent<Value>(options: ElementTextContentOptions<Value> = {}) {
  return function (target: any, propertyKey: string) {
    options = deepMerge<ElementTextContentOptions<Value>>(
      options,
      getMetadata(ElementParserMetaData.OPTIONS, target, propertyKey) || {},
    );
    const parser = new ElementTextContentParser(propertyKey, options);
    AddParserToMetadata(parser, target);
    if (options.required) {
      RequiredProperty()(target, propertyKey);
    }
  };
}
