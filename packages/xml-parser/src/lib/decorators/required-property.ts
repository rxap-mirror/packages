import { ElementParserMetaData } from './metadata-keys';
import { mergeWithMetadata } from '@rxap/reflect-metadata';

/**
 * Decorator that marks a property of a class as required. It optionally allows for a custom message to be specified.
 * If no message is provided, a default message indicating that the property is required will be used.
 *
 * @param message - Optional custom message to display if the property is not provided.
 * @returns A decorator function that takes the target object and the property key as arguments.
 *
 * ### Usage
 *
 * ```typescript
 * class MyComponent {
 * @RequiredProperty('Custom message for missing property')
 * importantProperty: string;
 * }
 * ```
 *
 * In this example, `importantProperty` is marked as required. If `importantProperty` is not provided,
 * "Custom message for missing property" will be displayed as an error message.
 */
export function RequiredProperty(message?: string) {
  return function (target: any, propertyKey: string) {
    mergeWithMetadata(
      ElementParserMetaData.REQUIRED_ELEMENT_PROPERTIES,
      { [propertyKey]: message || `Element property '${ propertyKey }' is required.` },
      target,
    );
  };
}
