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
import { XmlSerializerService } from '../xml-serializer.service';
import { ElementParser } from './element.parser';
import { ElementSerializer } from './element.serializer';
import { ElementParserMetaData } from './metadata-keys';
import {
  TextContentElementOptions,
  TextContentElementMixin,
} from './mixins/text-content-element.mixin';
import { RequiredProperty } from './required-property';
import { AddParserToMetadata } from './utilities/add-parser-to-metadata';
import { AddSerializerToMetadata } from './utilities/add-serializer-to-metadata';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementTextContentParserOptions<Value>
  extends TextContentElementOptions<Value> {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementTextContentParser<T extends ParsedElement, Value>
  extends TextContentElementMixin<Value> {

}

@Mixin(TextContentElementMixin)
export class ElementTextContentParser<T extends ParsedElement, Value> implements ElementParser<T> {

  constructor(
    public readonly propertyKey: string,
    public readonly options: ElementTextContentParserOptions<Value>,
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementTextContentSerializerOptions<Value>
  extends TextContentElementOptions<Value> {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementTextContentSerializer<T extends ParsedElement, Value>
  extends TextContentElementMixin<Value> {

}

@Mixin(TextContentElementMixin)
export class ElementTextContentSerializer<T extends ParsedElement, Value> implements ElementSerializer<T> {

  constructor(
    public readonly propertyKey: string,
    public readonly options: ElementTextContentParserOptions<Value>,
  ) {
    this.serialize = this.serialize.bind(this);
    Reflect.set(this.serialize, 'propertyKey', propertyKey);
  }

  serialize(xmlParser: XmlSerializerService, element: RxapElement, parsedElement: T) {

    // @ts-expect-error the propertyKey is set by the property decorator
    const value = parsedElement[this.propertyKey];

    if (value !== undefined) {
      element.setTextContent(this.serializeValue(value));
    } else if (this.required) {
      throw new RxapXmlParserValidateRequiredError(
        `Element <${ parsedElement.__tag }> text content is required!`,
        parsedElement.__tag!,
      );
    }

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
 * @param {ElementTextContentParserOptions<Value>} [options={}] - Optional configuration options for element text content parsing.
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
export function ElementTextContent<Value>(options: ElementTextContentParserOptions<Value> & ElementTextContentSerializerOptions<Value> = {}) {
  return function (target: any, propertyKey: string) {
    options = deepMerge<ElementTextContentParserOptions<Value>>(
      options,
      getMetadata(ElementParserMetaData.OPTIONS, target, propertyKey) || {},
    );
    const parser = new ElementTextContentParser(propertyKey, options);
    AddParserToMetadata(parser, target);
    const serializer = new ElementTextContentSerializer(propertyKey, options);
    AddSerializerToMetadata(serializer, target);
    if (options.required) {
      RequiredProperty()(target, propertyKey);
    }
  };
}
