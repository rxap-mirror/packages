import {AddParserToMetadata, ParsedElementType, XmlElementMetadata} from './utilities';
import {deepMerge} from '@rxap/utilities';
import {Mixin} from '@rxap/mixin';
import {ChildElementOptions, ChildElementParserMixin} from './mixins/child-element-parser.mixin';
import {getMetadata, getOwnMetadata} from '@rxap/reflect-metadata';
import {ParsedElement} from '../elements/parsed-element';
import {XmlParserService} from '../xml-parser.service';
import {RxapElement} from '../element';
import {RxapXmlParserValidateRequiredError} from '../error';
import {RequiredProperty} from './required-property';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementChildOptions extends ChildElementOptions {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementChildParser<T extends ParsedElement, Child extends ParsedElement>
  extends ChildElementParserMixin<Child> {
}

@Mixin(ChildElementParserMixin)
export class ElementChildParser<T extends ParsedElement, Child extends ParsedElement> {

  constructor(
    public readonly propertyKey: string,
    public readonly elementType: ParsedElementType<Child>,
    public readonly options: ElementChildOptions,
  ) {
    this.parse = this.parse.bind(this);
    Reflect.set(this.parse, 'propertyKey', propertyKey);
  }

  public parse(
    xmlParser: XmlParserService,
    element: RxapElement,
    parsedElement: T,
  ): T {

    const elementType = this.findChildElementType(element);

    if (!this.tag) {
      throw new Error('The element type tag is not defined!');
    }

    if (element.hasChild(this.tag)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      parsedElement[this.propertyKey] =
        xmlParser.parse(element.getChild(this.tag)!, elementType, parsedElement);
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

    for (const extendedType of [...extendedTypes]) {
      extendedTypes.push(...this.getExtendedTypes(extendedType));
    }

    return extendedTypes;
  }

}

export function ElementChild<Child extends ParsedElement>(elementType: ParsedElementType<Child>, options: ElementChildOptions = {}) {
  return function (target: any, propertyKey: string) {
    options = deepMerge(options, getMetadata(XmlElementMetadata.OPTIONS, target, propertyKey) || {});
    const parser = new ElementChildParser(propertyKey, elementType, options);
    AddParserToMetadata(parser, target);
    if (options.required) {
      RequiredProperty()(target, propertyKey);
    }
  };
}
