import { Mixin } from '@rxap/mixin';
import {
  getMetadata,
  getOwnMetadata,
} from '@rxap/reflect-metadata';
import {
  deepMerge,
  isConstructor,
} from '@rxap/utilities';
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
  ChildElementOptions,
  ChildElementMixin,
} from './mixins/child-element.mixin';
import { RequiredProperty } from './required-property';
import {
  ParsedElementType,
} from './utilities';
import { AddParserToMetadata } from './utilities/add-parser-to-metadata';
import { AddSerializerToMetadata } from './utilities/add-serializer-to-metadata';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementChildParserOptions extends ChildElementOptions {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementChildParser<T extends ParsedElement, Child extends ParsedElement>
  extends ChildElementMixin<Child> {
}

@Mixin(ChildElementMixin)
export class ElementChildParser<T extends ParsedElement, Child extends ParsedElement> implements ElementParser<T> {

  constructor(
    public readonly propertyKey: string,
    public readonly elementTypeOrFunction: ParsedElementType<Child> | (() => ParsedElementType<Child>),
    public readonly options: ElementChildParserOptions,
  ) {
    this.parse = this.parse.bind(this);
    Reflect.set(this.parse, 'propertyKey', propertyKey);
  }

  public parse(
    xmlParser: XmlParserService,
    element: RxapElement,
    parsedElement: T,
  ): T {

    element = this.applyPath(element);

    const elementType = this.findChildElementType(element);

    const tag = elementType.TAG ?? (this.hasTag ? this.tag : null);

    if (!tag) {
      if (this.isVirtual) {
        return parsedElement;
      }
      throw new Error('The element type tag is not defined!');
    }

    if (element.hasChild(tag)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      parsedElement[this.propertyKey] =
        xmlParser.parse(element.getChild(tag)!, elementType, parsedElement);
    } else if (this.required) {
      throw new RxapXmlParserValidateRequiredError(
        `Element child <${ tag }> is required in <${ parsedElement.__tag }>!`,
        parsedElement.__tag!,
      );
    }

    return parsedElement;
  }

  private findChildElementType(element: RxapElement): ParsedElementType<Child> {
    const elementType = this.elementType;

    if (!elementType) {
      throw new Error(`The element type is not defined for <${ element.name }>`);
    }

    const extendedTypes = this.getExtendedTypes(elementType);

    for (const extendedType of extendedTypes) {
      if (extendedType.TAG) {
        if (element.hasChild(extendedType.TAG)) {
          return extendedType;
        }
      }
    }

    return elementType;

  }

  private getExtendedTypes(type: ParsedElementType<Child>): Array<ParsedElementType<Child>> {
    const extendedTypes = getOwnMetadata<Array<ParsedElementType<Child>>>(ElementParserMetaData.EXTENDS, type) ?? [];

    for (const extendedType of [ ...extendedTypes ]) {
      extendedTypes.push(...this.getExtendedTypes(extendedType));
    }

    return extendedTypes;
  }

}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementChildSerializerOptions extends ChildElementOptions {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementChildSerializer<T extends ParsedElement, Child extends ParsedElement>
  extends ChildElementMixin<Child> {
}

@Mixin(ChildElementMixin)
export class ElementChildSerializer<T extends ParsedElement, Child extends ParsedElement> implements ElementSerializer<T> {

  constructor(
    public readonly propertyKey: string,
    public readonly elementTypeOrFunction: ParsedElementType<Child> | (() => ParsedElementType<Child>),
    public readonly options: ElementChildParserOptions,
  ) {
    this.serialize = this.serialize.bind(this);
    Reflect.set(this.serialize, 'propertyKey', propertyKey);
  }

  serialize(xmlParser: XmlSerializerService, element: RxapElement, parsedElement: T): void {

    element = this.coercePath(element);

    if (!parsedElement.__tag) {
      throw new Error('The element instance does not have a defined __tag property. If created manually, ensure to set it.');
    }

    // @ts-expect-error the propertyKey is set by the property decorator
    const child = parsedElement[this.propertyKey];

    if (child) {
      xmlParser.serialize(child, element);
    } else if (this.required) {
      throw new RxapXmlSerializerValidateRequiredError(
        `Element child <${ parsedElement.__tag }> is required.`,
        parsedElement.__tag!,
      );
    }

  }

}

/**
 * Decorator factory that creates a decorator to parse and validate a child element of a specified type.
 *
 * This decorator can be applied to properties within a class to automatically handle the parsing
 * and validation of child elements based on the specified `elementType`. It uses the `ElementChildParser`
 * to configure the parsing process according to the provided options and any existing metadata associated
 * with the property.
 *
 * @param elementType - The constructor of the child element type that this parser should target. This
 * helps in ensuring that the parsed data conforms to the specified type.
 * @param options - An optional `ElementChildOptions` object that provides additional configuration
 * settings for the parser. These options are merged with any existing metadata options
 * defined on the property.
 * Default is an empty object.
 *
 * @returns A decorator function that takes a target object and a property key. The decorator function
 * enhances the target object's property with parsing capabilities, ensuring that the property
 * adheres to the defined child element type and options.
 *
 * Usage:
 * - `elementType`: Pass the class (constructor function) that the property is expected to be an instance of.
 * - `options`: Configuration options such as `required` which, if set to true, will enforce that the property
 * must not be undefined or null after parsing.
 *
 * Example:
 * ```typescript
 * class MyComponent {
 * @ElementChild(SomeChildElement, { required: true })
 * child: SomeChildElement;
 * }
 * ```
 *
 * Note:
 * - The decorator will automatically merge any runtime metadata options associated with the property,
 * allowing for flexible and powerful configuration that can be adjusted without modifying the source code.
 * - If the `required` option is set to true, the property will also be decorated with a `RequiredProperty`
 * decorator to enforce its presence.
 */
export function ElementChild<Child extends ParsedElement>(
  elementType: ParsedElementType<Child> | (() => ParsedElementType<Child>),
  options: ElementChildParserOptions & ElementChildSerializerOptions = {},
) {
  return function (target: any, propertyKey: string) {
    options = deepMerge(options, getMetadata(ElementParserMetaData.OPTIONS, target, propertyKey) || {});
    const parser = new ElementChildParser(propertyKey, elementType, options);
    AddParserToMetadata(parser, target);
    const serializer = new ElementChildSerializer(propertyKey, elementType, options);
    AddSerializerToMetadata(serializer, target);
    if (options.required) {
      RequiredProperty()(target, propertyKey);
    }
  };
}
