import { Mixin } from '@rxap/mixin';

import { getMetadata } from '@rxap/reflect-metadata';

import { deepMerge } from '@rxap/utilities';
import { RxapElement } from '../element';
import { ParsedElement } from '../elements/parsed-element';
import { RxapXmlParserValidateRequiredError } from '../error';
import { XmlParserService } from '../xml-parser.service';
import { XmlSerializerService } from '../xml-serializer.service';
import { ElementParser } from './element.parser';
import { ElementSerializer } from './element.serializer';
import { ElementParserMetaData } from './metadata-keys';
import {
  AttributeElementMixin,
  AttributeElementOptions,
} from './mixins/attribute-element.mixin';
import {
  TagElementMixin,
  TagElementOptions,
} from './mixins/tag-element.mixin';
import { RequiredProperty } from './required-property';
import { AddParserToMetadata } from './utilities/add-parser-to-metadata';
import { AddSerializerToMetadata } from './utilities/add-serializer-to-metadata';


// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementChildAttributeOptions<Value>
  extends AttributeElementOptions<Value>, TagElementOptions {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementChildAttributeParser<T extends ParsedElement, Value>
  extends AttributeElementMixin<Value>, TagElementMixin {
}

@Mixin(AttributeElementMixin, TagElementMixin)
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class ElementChildAttributeParser<T extends ParsedElement = ParsedElement, Value = any>
  implements ElementParser<T> {

  constructor(
    public readonly propertyKey: string,
    public readonly options: ElementChildAttributeOptions<Value>,
  ) {
    this.parse = this.parse.bind(this);
    Reflect.set(this.parse, 'propertyKey', propertyKey);
  }

  public parse(xmlParser: XmlParserService, element: RxapElement, parsedElement: T): T {

    if (element.hasChild(this.tag)) {
      element = element.getChild(this.tag)!;

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
            `The attribute '${ this.attribute }' is required for child <${ parsedElement.__tag }>`,
            parsedElement.__tag!,
            this.attribute,
          );
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        parsedElement[this.propertyKey] = value;
      }

    } else if (this.required) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (parsedElement[this.propertyKey] === undefined) {
        throw new RxapXmlParserValidateRequiredError(
          `Element <${ element.name }> child <${ this.tag }> attribute is required!`,
          parsedElement.__tag!,
        );
      }
    }

    return parsedElement;
  }


}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementChildAttributeSerializerOptions<Value>
  extends AttributeElementOptions<Value>, TagElementOptions {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementChildAttributeSerializer<T extends ParsedElement, Value>
  extends AttributeElementMixin<Value>, TagElementMixin {
}

@Mixin(AttributeElementMixin, TagElementMixin)
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class ElementChildAttributeSerializer<T extends ParsedElement = ParsedElement, Value = any>
  implements ElementSerializer<T> {

  constructor(
    public readonly propertyKey: string,
    public readonly options: ElementChildAttributeSerializerOptions<Value>,
  ) {
    this.serialize = this.serialize.bind(this);
    Reflect.set(this.serialize, 'propertyKey', propertyKey);
  }

  serialize(xmlParser: XmlSerializerService, element: RxapElement, parsedElement: T) {

    // @ts-expect-error the propertyKey is set by the property decorator
    const child = parsedElement[this.propertyKey];

    if (child !== undefined) {
      if (!element.hasChild(this.tag)) {
        element.addChild(this.tag);
      }
      const childElement = element.getChild(this.tag)!;
      childElement.set(this.attribute, child);
    } else if (this.required) {
      throw new RxapXmlParserValidateRequiredError(
        `Element <${ element.name }> child <${ this.tag }> raw content is required!`,
        parsedElement.__tag!,
      );
    }

  }

}



export function ElementChildAttribute<Value>(options: ElementChildAttributeOptions<Value>): (
  target: any, propertyKey: string) => void;
export function ElementChildAttribute<Value>(tag: string): (target: any, propertyKey: string) => void;
export function ElementChildAttribute<Value>(
  tag: string, options: Partial<ElementChildAttributeOptions<Value>>): (target: any, propertyKey: string) => void;
export function ElementChildAttribute<Value>(tag: string, attribute: string): (
  target: any, propertyKey: string) => void;
export function ElementChildAttribute<Value>(
  tag: string, attribute: string, options: Partial<ElementChildAttributeOptions<Value>>): (
  target: any, propertyKey: string) => void;
export function ElementChildAttribute<Value>(
  optionsOrTag: ElementChildAttributeOptions<Value> | string,
  optionsOrAttribute?: Partial<ElementChildAttributeOptions<Value>> | string,
  withOptions?: Partial<ElementChildAttributeOptions<Value>>,
): (
  target: any,
  propertyKey: string,
) => void {
  return function (target: any, propertyKey: string) {
    let tag: string;
    let attribute: string;
    let options: ElementChildAttributeOptions<Value>;

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
    const optionsWithDefaults: ElementChildAttributeOptions<Value> = Object.assign({ attribute: propertyKey }, options);
    const parser = new ElementChildAttributeParser(propertyKey, optionsWithDefaults);
    AddParserToMetadata(parser, target);
    const serializer = new ElementChildAttributeSerializer(propertyKey, options);
    AddSerializerToMetadata(serializer, target);
    if (optionsWithDefaults.required) {
      RequiredProperty()(target, propertyKey);
    }
  };
}
