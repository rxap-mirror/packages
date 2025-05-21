import { Mixin } from '@rxap/mixin';
import { getMetadata } from '@rxap/reflect-metadata';
import { deepMerge } from '@rxap/utilities';
import { RxapElement } from '../element';
import { ParsedElement } from '../elements/parsed-element';
import {
  RxapXmlParserValidateRequiredError,
  RxapXmlSerializerValidateRequiredError,
} from '../error';
import { XmlParserService } from '../xml-parser.service';
import { XmlSerializerService } from '../xml-serializer.service';
import { ElementParser } from './element.parser';
import { ElementSerializer } from './element.serializer';
import { ElementParserMetaData } from './metadata-keys';
import {
  AttributeElementOptions,
  AttributeElementMixin,
} from './mixins/attribute-element.mixin';
import { RequiredProperty } from './required-property';
import { AddParserToMetadata } from './utilities/add-parser-to-metadata';
import { AddSerializerToMetadata } from './utilities/add-serializer-to-metadata';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementAttributeParserOptions<Value>
  extends AttributeElementOptions<Value> {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementAttributeParser<T extends ParsedElement, Value>
  extends AttributeElementMixin<Value> {
}

@Mixin(AttributeElementMixin)
export class ElementAttributeParser<T extends ParsedElement = ParsedElement, Value = any> implements ElementParser<T> {

  constructor(
    public readonly propertyKey: string,
    public readonly options: ElementAttributeParserOptions<Value>,
  ) {
    this.parse = this.parse.bind(this);
    Reflect.set(this.parse, 'propertyKey', propertyKey);
  }

  public parse(xmlParser: XmlParserService, element: RxapElement, parsedElement: T): T {

    let value: Value | undefined = this.defaultValue ??
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      parsedElement[this.propertyKey];
    if (element.has(this.attribute)) {
      const rawValue: string = element.get(this.attribute, undefined, true)!;
      value = this.parseValue(rawValue);
    }

    if (value === undefined) {
      if (this.required) {
        throw new RxapXmlParserValidateRequiredError(
          `The attribute '${ this.attribute }' is required for <${ parsedElement.__tag }>`,
          parsedElement.__tag!,
          this.attribute,
        );
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      parsedElement[this.propertyKey] = value;
    }


    return parsedElement;
  }


}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementAttributeSerializerOptions<Value>
  extends AttributeElementOptions<Value> {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementAttributeSerializer<T extends ParsedElement, Value>
  extends AttributeElementMixin<Value> {
}

@Mixin(AttributeElementMixin)
export class ElementAttributeSerializer<T extends ParsedElement = ParsedElement, Value = any> implements ElementSerializer<T> {

  constructor(
    public readonly propertyKey: string,
    public readonly options: ElementAttributeParserOptions<Value>,
  ) {
    this.serialize = this.serialize.bind(this);
    Reflect.set(this.serialize, 'propertyKey', propertyKey);
  }

  public serialize(xmlParser: XmlSerializerService, element: RxapElement, parsedElement: T): void {
    // @ts-expect-error the propertyKey is set by the property decorator
    const value = parsedElement[this.propertyKey];
    if (value !== undefined) {
      element.set(this.options.attribute, this.serializeValue(value));
    } else if (this.required) {
      throw new RxapXmlSerializerValidateRequiredError(
        `The attribute '${ this.attribute }' is required for <${ parsedElement.__tag }>`,
        parsedElement.__tag!,
        this.attribute,
      );
    }
  }

}

export function ElementAttribute<Value>(): (target: any, propertyKey: string) => void;
export function ElementAttribute<Value>(attribute: string): (target: any, propertyKey: string) => void;
export function ElementAttribute<Value>(options: Partial<ElementAttributeParserOptions<Value> & ElementAttributeSerializerOptions<Value>>): (
  target: any,
  propertyKey: string,
) => void;
/**
 * Decorator factory that binds a DOM element attribute to a property of a class.
 * This decorator provides a way to specify custom behavior through options, allowing
 * the attribute value to be parsed and handled according to the provided settings.
 *
 * @param optionsOrString - This parameter can either be a string specifying the name of the attribute,
 * or an object containing options for configuring the attribute behavior.
 * If a string is provided, it is used as the name of the attribute.
 * If an object is provided, it can include any properties from `ElementAttributeOptions<Value>`.
 * If omitted, the name of the property to which the decorator is applied will be used as the attribute name.
 *
 * @returns A decorator function that takes two parameters:
 * - `target`: The prototype of the class.
 * - `propertyKey`: The name of the property.
 *
 * The decorator initializes an `ElementAttributeParser` with the specified options, which handles
 * the parsing and assignment of the attribute value to the class property. It also ensures that
 * the property is registered with metadata that can be used by other parts of the system, such as
 * serialization or additional validation mechanisms.
 *
 * If the `required` option is set to true in the options object, the property will also be decorated
 * with a `RequiredProperty` decorator, enforcing that the attribute must be provided.
 *
 * ### Example Usage
 *
 * ```typescript
 * class Component {
 * @ElementAttribute({ attribute: 'data-id', required: true })
 * id: string;
 * }
 * ```
 *
 * In this example, the `id` property of `Component` instances will be linked to the 'data-id' attribute
 * of the corresponding DOM element. The attribute is marked as required, meaning it must be present.
 *
 */
export function ElementAttribute<Value>(optionsOrString?: Partial<ElementAttributeParserOptions<Value> & ElementAttributeSerializerOptions<Value>> | string): (
  target: any,
  propertyKey: string,
) => void {
  return function (target: any, propertyKey: string) {
    let options: Partial<ElementAttributeParserOptions<Value>> = optionsOrString === undefined ?
      { attribute: propertyKey } :
      typeof optionsOrString === 'string' ? { attribute: optionsOrString } : optionsOrString;
    options = deepMerge(options, getMetadata(ElementParserMetaData.OPTIONS, target, propertyKey) ?? {});
    const optionsWithDefaults: ElementAttributeParserOptions<Value> = Object.assign({ attribute: propertyKey }, options);
    const parser = new ElementAttributeParser(propertyKey, optionsWithDefaults);
    AddParserToMetadata(parser, target);
    const serializer = new ElementAttributeSerializer(propertyKey, optionsWithDefaults);
    AddSerializerToMetadata(serializer, target);
    if (optionsWithDefaults.required) {
      RequiredProperty()(target, propertyKey);
    }
  };
}
