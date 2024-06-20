import { Mixin } from '@rxap/mixin';
import {
  getMetadata,
  getOwnMetadata,
} from '@rxap/reflect-metadata';
import {
  deepMerge,
  hasIndexSignature,
} from '@rxap/utilities';
import { RxapElement } from '../element';
import { ParsedElement } from '../elements/parsed-element';
import {
  RxapXmlParserValidateError,
  RxapXmlParserValidateRequiredError,
} from '../error';
import { XmlParserService } from '../xml-parser.service';
import { ElementParserMetaData } from './metadata-keys';
import {
  ChildElementOptions,
  ChildElementParserMixin,
} from './mixins/child-element-parser.mixin';
import {
  ChildrenElementOptions,
  ChildrenElementParserMixin,
} from './mixins/children-element-parser.mixin';
import { RequiredProperty } from './required-property';
import {
  AddParserToMetadata,
  ParsedElementType,
} from './utilities';

export interface ElementChildrenOptions extends ChildElementOptions, ChildrenElementOptions {

}

export interface ElementChildrenParser<T extends ParsedElement, Child extends ParsedElement>
  extends ChildElementParserMixin<Child>, ChildrenElementParserMixin {

}

export type ElementWithType<Child extends ParsedElement> = {
  element: RxapElement,
  type: ParsedElementType<Child> | null
};

@Mixin(ChildElementParserMixin, ChildrenElementParserMixin)
export class ElementChildrenParser<T extends ParsedElement, Child extends ParsedElement> {

  constructor(
    public readonly propertyKey: string,
    public readonly elementType: ParsedElementType<Child> | null,
    public readonly options: ElementChildrenOptions,
  ) {
    this.parse = this.parse.bind(this);
    Reflect.set(this.parse, 'propertyKey', propertyKey);
  }

  public parse(
    xmlParser: XmlParserService,
    element: RxapElement,
    parsedElement: T,
  ): T {

    // TODO : add test. Persevere child element order with extend child type
    if (!this.elementType) {
      throw new Error(`The element type is not defined for <${ element.name }>`);
    }

    const elementTypes = [ this.elementType, ...this.getExtendedTypes(this.elementType) ];

    const rxapElementChildren = this.getChildren(element);

    if (!rxapElementChildren) {
      throw new RxapXmlParserValidateRequiredError(
        `The child group element '${ this.options.group }' is required for ${ parsedElement.__tag }!`,
        parsedElement.__tag!,
      );
    }

    const elementChildren = rxapElementChildren
      .map(childElement => this.attachType(childElement, elementTypes))
      .filter(ewt => ewt.type !== null);

    const children = elementChildren
      .map(child => xmlParser.parse(child.element, child.type ?? child.element.name, parsedElement));

    if (this.required && children.length === 0) {
      throw new RxapXmlParserValidateRequiredError(
        `Some element child <${ this.tag }> is required in <${ parsedElement.__tag }>!`,
        parsedElement.__tag!,
      );
    }

    if (this.min !== null && this.min > children.length) {
      throw new RxapXmlParserValidateError(
        `Element child <${ this.tag }> should be at least ${ this.min } in <${ parsedElement.__tag }>!`,
        parsedElement.__tag!,
      );
    }

    if (this.max !== null && this.max > children.length) {
      throw new RxapXmlParserValidateError(
        `Element child <${ this.tag }> should be at most ${ this.max } in <${ parsedElement.__tag }>!`,
        parsedElement.__tag!,
      );
    }

    if (!hasIndexSignature(parsedElement)) {
      throw new Error('The parsed element has no index signature');
    }

    if (!Array.isArray(parsedElement[this.propertyKey])) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      parsedElement[this.propertyKey] = [];
    }

    parsedElement[this.propertyKey]
      .push(...children);

    return parsedElement;
  }

  private attachType(element: RxapElement, elementTypes: ParsedElementType<Child>[]): ElementWithType<Child> {
    if (this.hasTag) {
      if (element.hasName(this.tag)) {
        return {
          element,
          type: this.elementType,
        };
      }
    } else {
      if (this.elementType?.TAG && element.hasName(this.elementType?.TAG)) {
        return {
          element,
          type: this.elementType,
        };
      }
    }

    const extendedElementType = elementTypes.find(et => et.TAG && element.hasName(et.TAG));

    if (extendedElementType) {
      return {
        element,
        type: extendedElementType,
      };
    }

    return {
      element,
      type: null,
    };
  }

  private getExtendedTypes(type: ParsedElementType<Child>): Array<ParsedElementType<Child>> {
    const extendedTypes = getOwnMetadata<Array<ParsedElementType<Child>>>(ElementParserMetaData.EXTENDS, type) ?? [];

    for (const extendedType of [ ...extendedTypes ]) {
      extendedTypes.push(...this.getExtendedTypes(extendedType));
    }

    return extendedTypes;
  }

}

/**
 * Decorator factory that creates a decorator to parse children elements of a specified type from a parent element.
 * This decorator can be applied to properties within a class to automatically handle the parsing of child elements
 * based on the specified element type and options.
 *
 * @param elementTyp - The type of the child elements to parse. If null, it will parse children without type checking.
 * @param options - Configuration options for parsing the children elements. Default is an empty object.
 * Options can include custom parsing rules like filtering or transformations.
 *
 * @returns A decorator function that can be applied to a property within a class. This decorator will configure
 * the property to automatically parse and assign children elements of the specified type.
 *
 * Example Usage:
 * ```
 * @ElementChildren(SomeChildElement, { required: true })
 * public children: SomeChildElement[];
 * ```
 *
 * The decorator modifies the target class's metadata to include a parser for the specified property. If the `required`
 * option is set to true, it also ensures that the property is marked as required.
 */
export function ElementChildren<Child extends ParsedElement>(
  elementTyp: ParsedElementType<Child> | null = null,
  options: ElementChildrenOptions = {},
) {
  return function (target: any, propertyKey: string) {
    options = deepMerge(options, getMetadata(ElementParserMetaData.OPTIONS, target, propertyKey) || {});
    const parser = new ElementChildrenParser(propertyKey, elementTyp, options);
    AddParserToMetadata(parser, target);
    if (options.required) {
      RequiredProperty()(target, propertyKey);
    }
  };
}
