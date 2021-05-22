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
  RxapElement,
  RxapXmlParserValidateRequiredError
} from '@rxap/xml-parser';

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

    const elementType = this.findChildElementType(element);

    if (!elementType.TAG) {
      throw new Error('The element type tag is not defined!');
    }

    if (element.hasChild(elementType.TAG)) {
      // @ts-ignore
      parsedElement[ this.propertyKey ] =
        xmlParser.parse(element.getChild(elementType.TAG)!, elementType, parsedElement);
    } else if (this.required) {
      throw new RxapXmlParserValidateRequiredError(`Element child <${this.tag}> is required in <${parsedElement.__tag}>!`, parsedElement.__tag!);
    }

    return parsedElement;
  }

  private findChildElementType(element: RxapElement): ParsedElementType<Child> {

    const extendedTypes = this.getExtendedTypes(this.elementType);

    for (const extendedType of extendedTypes) {
      if (extendedType.TAG) {
        if (element.hasChild(extendedType.TAG)) {
          return extendedType;
        }
      }
    }

    return this.elementType;

  }

  private getExtendedTypes(type: ParsedElementType<Child>): Array<ParsedElementType<Child>> {
    const extendedTypes = getOwnMetadata<Array<ParsedElementType<Child>>>(XmlElementMetadata.EXTENDS, type) ?? [];

    for (const extendedType of [ ...extendedTypes ]) {
      extendedTypes.push(...this.getExtendedTypes(extendedType));
    }

    return extendedTypes;
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
