import {
  ParsedElementType,
  XmlElementMetadata,
  AddParserToMetadata
} from './utilities';
import {
  deepMerge,
  getMetadata
} from '@rxap/utilities';
import {
  ParsedElement,
  RxapElement,
  XmlParserService,
  RequiredProperty
} from '@rxap/xml-parser';
import { Mixin } from '@rxap/mixin';
import {
  ChildElementParserMixin,
  ChildElementOptions
} from './mixins/child-element-parser.mixin';

export interface ElementChildOptions extends ChildElementOptions {}

export interface ElementChildParser<T extends ParsedElement, Child extends ParsedElement>
  extends ChildElementParserMixin<Child> {

}

@Mixin(ChildElementParserMixin)
export class ElementChildParser<T extends ParsedElement, Child extends ParsedElement> {

  constructor(
    public readonly propertyKey: string,
    public readonly elementType: ParsedElementType<Child>,
    public readonly options: ElementChildOptions
  ) {
    this.parse = this.parse.bind(this);
    Reflect.set(this.parse, 'propertyKey', propertyKey);
  }

  public parse(
    xmlParser: XmlParserService,
    element: RxapElement,
    parsedElement: T
  ): T {

    if (element.hasChild(this.tag)) {
      // @ts-ignore
      parsedElement[ this.propertyKey ] =
        xmlParser.parse(element.getChild(this.tag)!, this.elementType);
    } else if (this.required) {
      throw new Error(`Element child <${this.tag}> is required!`);
    }

    return parsedElement;
  }

}

export function ElementChild<Child extends ParsedElement>(elementType: ParsedElementType<Child>, options: ElementChildOptions = {}) {
  return function(target: any, propertyKey: string) {
    options      = deepMerge(options, getMetadata(XmlElementMetadata.OPTIONS, target, propertyKey) || {});
    const parser = new ElementChildParser(propertyKey, elementType, options);
    AddParserToMetadata(parser, target);
    if (options.required) {
      RequiredProperty()(target, propertyKey);
    }
  };
}
