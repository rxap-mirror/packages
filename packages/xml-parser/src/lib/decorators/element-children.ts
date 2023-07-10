import {
  AddParserToMetadata,
  ParsedElementType,
  XmlElementMetadata,
} from './utilities';
import {
  deepMerge,
  hasIndexSignature,
} from '@rxap/utilities';
import { Mixin } from '@rxap/mixin';
import {
  ChildElementOptions,
  ChildElementParserMixin,
} from './mixins/child-element-parser.mixin';
import {
  getMetadata,
  getOwnMetadata,
} from '@rxap/reflect-metadata';
import {
  ChildrenElementOptions,
  ChildrenElementParserMixin,
} from './mixins/children-element-parser.mixin';
import { RxapElement } from '../element';
import { ParsedElement } from '../elements/parsed-element';
import { XmlParserService } from '../xml-parser.service';
import {
  RxapXmlParserValidateError,
  RxapXmlParserValidateRequiredError,
} from '../error';
import { RequiredProperty } from './required-property';

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
      throw new Error(`The element type is not defined for <${element.name}>`);
    }

    const elementTypes = [this.elementType, ...this.getExtendedTypes(this.elementType)];

    const rxapElementChildren = this.getChildren(element)

    if (!rxapElementChildren) {
      throw new RxapXmlParserValidateRequiredError(
        `The child group element '${this.options.group}' is required for ${parsedElement.__tag}!`,
        parsedElement.__tag!,
      );
    }

    const elementChildren = rxapElementChildren
      .map(childElement => this.attachType(childElement, elementTypes))
      .filter(ewt => ewt.type !== null);

    const children = elementChildren
      .map(child => xmlParser.parse(child.element, child.type ?? child.element.name, parsedElement));

    if (this.required && children.length === 0) {
      throw new RxapXmlParserValidateRequiredError(`Some element child <${this.tag}> is required in <${parsedElement.__tag}>!`, parsedElement.__tag!);
    }

    if (this.min !== null && this.min > children.length) {
      throw new RxapXmlParserValidateError(`Element child <${this.tag}> should be at least ${this.min} in <${parsedElement.__tag}>!`, parsedElement.__tag!);
    }

    if (this.max !== null && this.max > children.length) {
      throw new RxapXmlParserValidateError(`Element child <${this.tag}> should be at most ${this.max} in <${parsedElement.__tag}>!`, parsedElement.__tag!);
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
      if (element.name === this.tag) {
        return {element, type: this.elementType};
      }
    } else {
      if (element.name === this.elementType?.TAG) {
        return {element, type: this.elementType};
      }
    }

    const extendedElementType = elementTypes.find(et => element.name === et.TAG);

    if (extendedElementType) {
      return {element, type: extendedElementType};
    }

    return {element, type: null};
  }

  private getExtendedTypes(type: ParsedElementType<Child>): Array<ParsedElementType<Child>> {
    const extendedTypes = getOwnMetadata<Array<ParsedElementType<Child>>>(XmlElementMetadata.EXTENDS, type) ?? [];

    for (const extendedType of [...extendedTypes]) {
      extendedTypes.push(...this.getExtendedTypes(extendedType));
    }

    return extendedTypes;
  }

}

export function ElementChildren<Child extends ParsedElement>(elementTyp: ParsedElementType<Child> | null = null, options: ElementChildrenOptions = {}) {
  return function (target: any, propertyKey: string) {
    options = deepMerge(options, getMetadata(XmlElementMetadata.OPTIONS, target, propertyKey) || {});
    const parser = new ElementChildrenParser(propertyKey, elementTyp, options);
    AddParserToMetadata(parser, target);
    if (options.required) {
      RequiredProperty()(target, propertyKey);
    }
  };
}
