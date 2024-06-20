import { mergeWithMetadata } from '@rxap/reflect-metadata';
import { ElementParserMetaData } from '../metadata-keys';
import { FindElementParserInstanceForPropertyKey } from '../utilities';

export interface RequiredElementOptions {
  required?: boolean;
}

/**
 * Decorator function that marks a property as required within an element parser.
 * It ensures that the property is defined and throws an error if the property is already associated with another element parser.
 *
 * @param {RequiredElementOptions} options - Configuration options for the required element, defaulting to `{ required: true }`.
 * This allows customization of the requirement behavior, although currently only supports the `required` flag.
 *
 * @returns {Function} A decorator function that takes a target object and a property key, and applies the required configuration.
 *
 * @throws {Error} Throws an error if the property is already associated with an element parser, indicating incorrect decorator order.
 *
 * @example
 * ```typescript
 * class Example {
 * @ElementRequired()
 * @ElementTextContent()
 * public title: string;
 * }
 * ```
 * In this example, the `title` property of the `Example` class is marked as required and associated with text content from an element.
 * The `@ElementRequired` decorator must be used after any `@Element...` decorators to ensure proper metadata registration.
 */
export function ElementRequired(options: RequiredElementOptions = { required: true }) {
  return function (target: any, propertyKey: string) {
    if (FindElementParserInstanceForPropertyKey(target.constructor, propertyKey)) {
      throw new Error(
        'The @ElementRequired decorator must be use after the @Element(Attribute|Child|ChildTextContent|TextContent) decorator');
    }
    mergeWithMetadata(ElementParserMetaData.OPTIONS, options, target, propertyKey);
  };
}

export class RequiredElementParserMixin {

  public readonly options!: any;

  public get required(): boolean {
    return !!this.options.required;
  }

}
