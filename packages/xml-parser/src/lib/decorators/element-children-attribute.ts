import { Mixin } from '@rxap/mixin';
import { getMetadata } from '@rxap/reflect-metadata';
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
import { ElementParser } from './element.parser';
import { ElementParserMetaData } from './metadata-keys';
import {
  AttributeElementMixin,
  AttributeElementOptions,
} from './mixins/attribute-element.mixin';
import {
  ChildrenElementMixin,
  ChildrenElementOptions,
} from './mixins/children-element.mixin';
import {
  TagElementMixin,
  TagElementOptions,
} from './mixins/tag-element.mixin';
import { RequiredProperty } from './required-property';
import { AddParserToMetadata } from './utilities/add-parser-to-metadata';


// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementChildrenAttributeOptions<Value>
  extends AttributeElementOptions<Value>, TagElementOptions, ChildrenElementOptions {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementChildrenAttributeParser<T extends ParsedElement, Value>
  extends AttributeElementMixin<Value>, TagElementMixin, ChildrenElementMixin {
}

@Mixin(AttributeElementMixin, TagElementMixin, ChildrenElementMixin)
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class ElementChildrenAttributeParser<T extends ParsedElement = ParsedElement, Value = any>
  implements ElementParser<T> {

  constructor(
    public readonly propertyKey: string,
    public readonly options: ElementChildrenAttributeOptions<Value>,
  ) {
    this.parse = this.parse.bind(this);
    Reflect.set(this.parse, 'propertyKey', propertyKey);
  }

  public parse(xmlParser: XmlParserService, element: RxapElement, parsedElement: T): T {


    const rxapElementChildren = this.getChildren(element);

    if (!rxapElementChildren) {
      throw new RxapXmlParserValidateRequiredError(
        `The child group element '${ this.options.group }' is required for ${ parsedElement.__tag }!`,
        parsedElement.__tag!,
      );
    }

    const children = rxapElementChildren.filter(child => child.hasName(this.tag));

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
      .push(...children.map(child => {

        let value: Value | undefined = this.defaultValue ??
                                       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                       // @ts-ignore
                                       parsedElement[this.propertyKey];
        if (child.has(this.attribute)) {
          const rawValue: string = child.get(this.attribute, undefined, true)!;
          value = this.parseValue(rawValue);
        }

        if (value === undefined) {
          if (this.required) {
            throw new RxapXmlParserValidateRequiredError(
              `The attribute '${ this.attribute }' is required for child <${ parsedElement.__tag }>`,
              parsedElement.__tag!,
              this.attribute,
            );
          }
        }

        return value;

      }));

    return parsedElement;
  }


}

export function ElementChildrenAttribute<Value>(options: ElementChildrenAttributeOptions<Value>): (
  target: any, propertyKey: string) => void;
export function ElementChildrenAttribute<Value>(tag: string): (target: any, propertyKey: string) => void;
export function ElementChildrenAttribute<Value>(
  tag: string, options: Partial<ElementChildrenAttributeOptions<Value>>): (target: any, propertyKey: string) => void;
export function ElementChildrenAttribute<Value>(tag: string, attribute: string): (
  target: any, propertyKey: string) => void;
export function ElementChildrenAttribute<Value>(
  tag: string, attribute: string, options: Partial<ElementChildrenAttributeOptions<Value>>): (
  target: any, propertyKey: string) => void;
export function ElementChildrenAttribute<Value>(
  optionsOrTag: ElementChildrenAttributeOptions<Value> | string,
  optionsOrAttribute?: Partial<ElementChildrenAttributeOptions<Value>> | string,
  withOptions?: Partial<ElementChildrenAttributeOptions<Value>>,
): (
  target: any,
  propertyKey: string,
) => void {
  return function (target: any, propertyKey: string) {
    let tag: string;
    let attribute: string;
    let options: ElementChildrenAttributeOptions<Value>;

    // if the options parameter is not defined. Then try to parse the possible input
    if (!withOptions) {
      // possible input:
      // tag, attribute
      // tag, options
      // options
      if (typeof optionsOrAttribute === 'string') {
        // possible input:
        // tag, attribute
        if (typeof optionsOrTag !== 'string') {
          throw new Error('Invalid input. If the second parameter is a string the first must also be a string');
        }
        tag = optionsOrTag;
        attribute = optionsOrAttribute;
        options = {
          tag,
          attribute,
        };
      } else if (optionsOrAttribute === undefined) {
        // possible input
        // tag
        // options
        if (typeof optionsOrTag === 'string') {
          // possible input
          // tag
          tag = optionsOrTag;
          attribute = propertyKey;
          options = {
            tag,
            attribute,
          };
        } else if (optionsOrTag === undefined) {
          throw new Error('Invalid input. If the first parameter is undefined the second must be a string or object');
        } else {
          // possible input
          // options
          tag = optionsOrTag.tag;
          attribute = optionsOrTag.attribute ?? propertyKey;
          options = {
            ...optionsOrTag,
            tag,
            attribute,
          };
        }
      } else {
        // possible input
        // tag, options
        if (typeof optionsOrTag !== 'string') {
          throw new Error('Invalid input. If the second parameter is a object the first must also be a string');
        }
        tag = optionsOrTag;
        attribute = optionsOrAttribute.attribute ?? propertyKey;
        options = {
          ...optionsOrAttribute,
          tag,
          attribute,
        };
      }
    } else {
      // possible input
      // tag, attribute, options
      if (typeof optionsOrAttribute !== 'string') {
        throw new Error('Invalid input. If the third parameter is a object the second must also be a string');
      }
      if (typeof optionsOrTag !== 'string') {
        throw new Error('Invalid input. If the third parameter is a object the first must also be a string');
      }
      tag = optionsOrTag;
      attribute = optionsOrAttribute;
      options = {
        ...withOptions,
        tag,
        attribute,
      };
    }

    options = deepMerge(options, getMetadata(ElementParserMetaData.OPTIONS, target, propertyKey) ?? {});
    const optionsWithDefaults: ElementChildrenAttributeOptions<Value> = Object.assign(
      { attribute: propertyKey }, options);
    const parser = new ElementChildrenAttributeParser(propertyKey, optionsWithDefaults);
    AddParserToMetadata(parser, target);
    if (optionsWithDefaults.required) {
      RequiredProperty()(target, propertyKey);
    }
  };
}
