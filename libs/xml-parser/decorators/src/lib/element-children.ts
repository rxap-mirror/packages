import {
  ParsedElementType,
  XmlElementMetadata,
  AddParserToMetadata
} from './utilities';
import {
  ParsedElement,
  XmlParserService,
  RxapElement,
  RequiredProperty
} from '@rxap/xml-parser';
import {
  deepMerge,
  getMetadata
} from '@rxap/utilities';
import { Mixin } from '@rxap/mixin';
import {
  ChildElementParserMixin,
  ChildElementOptions
} from './mixins/child-element-parser.mixin';

export interface ElementChildrenOptions extends ChildElementOptions {
  min?: number;
  max?: number;
}

export interface ElementChildrenParser<T extends ParsedElement, Child extends ParsedElement>
  extends ChildElementParserMixin<Child> {

}

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

    let elementChildren: RxapElement[];

    if (this.hasTag) {
      elementChildren = element.getChildren(this.tag);
    } else {
      elementChildren = element.getAllChildNodes();
    }

    // @ts-ignore
    const children = parsedElement[ this.propertyKey ] = elementChildren
      .map(child => xmlParser.parse(child, this.elementType ?? child.name));

    if (this.required && children.length === 0) {
      throw new Error(`Element child <${this.tag}> is required!`);
    }

    if (this.min !== null && this.min > children.length) {
      throw new Error(`Element child <${this.tag}> should be at least ${this.min}!`);
    }

    if (this.max !== null && this.max > children.length) {
      throw new Error(`Element child <${this.tag}> should be at most ${this.max}!`);
    }

    return parsedElement;
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
