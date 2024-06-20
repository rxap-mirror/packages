import { Without } from '@rxap/utilities';
import { ElementParserMetaData } from './metadata-keys';
import { addToMetadata } from '@rxap/reflect-metadata';

export interface AttributeOptions<T> {
  propertyKey: string;
  elementName: string,
}

/**
 * Decorator factory for defining an attribute on a class property that should be parsed differently when an instance of the class is being created.
 * This decorator adds metadata to the class property, specifying how it should be handled as an attribute of a parsed element.
 *
 * @typeparam T - The type of the value that the attribute will hold.
 *
 * @param options - Configuration options for the attribute, excluding the 'propertyKey'. It is a partial set of `AttributeOptions<T>`, allowing optional customization such as the element name and additional parsing options.
 *
 * @returns A decorator function that takes a target class and the property key of the attribute. This decorator function then registers the attribute configuration along with the target class's metadata.
 *
 * ### Usage
 *
 * ```typescript
 * class MyComponent {
 * @Attribute({ elementName: "custom-name" })
 * myProperty: string;
 * }
 * ```
 *
 * In the above example, `myProperty` is decorated with `@Attribute`, specifying that it corresponds to an "custom-name" element when parsed.
 */
export function Attribute<T>(options: Partial<Without<AttributeOptions<T>, 'propertyKey'>>) {
  return function (target: any, propertyKey: string) {
    addToMetadata(
      ElementParserMetaData.ATTRIBUTE,
      {
        propertyKey,
        elementName: propertyKey, ...options,
      },
      target,
    );
  };
}
