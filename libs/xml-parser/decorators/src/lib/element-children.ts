import {
  ParsedElementType,
  XmlElementMetadata,
  AddParserToMetadata
} from './utilities';
import {
  deepMerge,
  getMetadata,
  getOwnMetadata
} from '@rxap/utilities';
import { Mixin } from '@rxap/mixin';
import {
  ChildElementParserMixin,
  ChildElementOptions
} from './mixins/child-element-parser.mixin';
import {
  ParsedElement,
  XmlParserService,
  RequiredProperty,
  RxapElement
} from '@rxap/xml-parser';

export interface ElementChildrenOptions extends ChildElementOptions {
  min?: number;
  max?: number;
  group?: string;
}

export interface ElementChildrenParser<T extends ParsedElement, Child extends ParsedElement>
  extends ChildElementParserMixin<Child> {

}

export type ElementWithType<Child extends ParsedElement> = { element: RxapElement, type: ParsedElementType<Child> | null };

@Mixin(ChildElementParserMixin)
export class ElementChildrenParser<T extends ParsedElement, Child extends ParsedElement> {

  public get min(): number | null {
    return this.options.hasOwnProperty('min') ? this.options.min! : null;
  }

  public get max(): number | null {
    return this.options.hasOwnProperty('max') ? this.options.max! : null;
  }

  constructor(
    public readonly propertyKey: string,
    public readonly elementType: ParsedElementType<Child> | null,
    public readonly options: ElementChildrenOptions
  ) {
    this.parse = this.parse.bind(this);
    Reflect.set(this.parse, 'propertyKey', propertyKey);
  }

  public parse(
    xmlParser: XmlParserService,
    element: RxapElement,
    parsedElement: T
  ): T {

    let elementChildren: ElementWithType<Child>[];

    if (this.options.group) {

      const groupElement = element.getChild(this.options.group);

      if (!groupElement && this.required) {
        throw new Error(`The child group element '${this.options.group}' is required!`);
      }

      if (groupElement) {
        elementChildren = this.getChildren(groupElement);
      } else {
        elementChildren = [];
      }

    } else {
      elementChildren = this.getChildren(element);
    }

    const children = elementChildren
      .map(child => xmlParser.parse(child.element, child.type ?? child.element.name, parsedElement));

    if (this.required && children.length === 0) {
      throw new Error(`Some element child <${this.tag}> is required in <${parsedElement.__tag}>!`);
    }

    if (this.min !== null && this.min > children.length) {
      throw new Error(`Element child <${this.tag}> should be at least ${this.min} in <${parsedElement.__tag}>!`);
    }

    if (this.max !== null && this.max > children.length) {
      throw new Error(`Element child <${this.tag}> should be at most ${this.max} in <${parsedElement.__tag}>!`);
    }

    // @ts-ignore
    if (!Array.isArray(parsedElement[ this.propertyKey ])) {
      // @ts-ignore
      parsedElement[ this.propertyKey ] = [];
    }

    // @ts-ignore
    parsedElement[ this.propertyKey ]
      .push(...children);

    return parsedElement;
  }

  private getChildren(element: RxapElement): Array<ElementWithType<Child>> {
    let elementChildren: Array<ElementWithType<Child>>;

    if (this.hasTag) {
      elementChildren = element.getChildren(this.tag).map(child => ({ element: child, type: this.elementType }));

      if (this.elementType) {
        for (const extendedType of this.getExtendedTypes(this.elementType)) {
          if (extendedType.TAG && element.hasChild(extendedType.TAG)) {
            elementChildren.push(...element.getChildren(extendedType.TAG).map(child => ({ element: child, type: extendedType })));
          }
        }
      }

    } else {
      elementChildren = element.getAllChildNodes().map(child => ({ element: child, type: this.elementType }));
    }

    return elementChildren;
  }

  private getExtendedTypes(type: ParsedElementType<Child>): Array<ParsedElementType<Child>> {
    const extendedTypes = getOwnMetadata<Array<ParsedElementType<Child>>>(XmlElementMetadata.EXTENDS, type) ?? [];

    for (const extendedType of [ ...extendedTypes ]) {
      extendedTypes.push(...this.getExtendedTypes(extendedType));
    }

    return extendedTypes;
  }

}

export function ElementChildren<Child extends ParsedElement>(elementTyp: ParsedElementType<Child> | null = null, options: ElementChildrenOptions = {}) {
  return function(target: any, propertyKey: string) {
    options      = deepMerge(options, getMetadata(XmlElementMetadata.OPTIONS, target, propertyKey) || {});
    const parser = new ElementChildrenParser(propertyKey, elementTyp, options);
    AddParserToMetadata(parser, target);
    if (options.required) {
      RequiredProperty()(target, propertyKey);
    }
  };
}
