import { Mixin } from '@rxap/mixin';
import { getMetadata } from '@rxap/reflect-metadata';
import { deepMerge } from '@rxap/utilities';
import { RxapElement } from '../element';
import { ParsedElement } from '../elements/parsed-element';
import { RxapXmlParserValidateRequiredError } from '../error';
import { XmlParserService } from '../xml-parser.service';
import { ElementParser } from './element.parser';
import { ElementParserMetaData } from './metadata-keys';
import {
  AttributeElementOptions,
  AttributeElementParserMixin,
} from './mixins/attribute-element-parser.mixin';
import { RequiredProperty } from './required-property';
import { AddParserToMetadata } from './utilities';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementAttributeOptions<Value>
  extends AttributeElementOptions<Value> {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementAttributeParser<T extends ParsedElement, Value>
  extends AttributeElementParserMixin<Value> {
}

@Mixin(AttributeElementParserMixin)
export class ElementAttributeParser<T extends ParsedElement = ParsedElement, Value = any> implements ElementParser<T> {

  constructor(
    public readonly propertyKey: string,
    public readonly options: ElementAttributeOptions<Value>,
  ) {
    this.parse = this.parse.bind(this);
    Reflect.set(this.parse, 'propertyKey', propertyKey);
  }

  public parse(xmlParser: XmlParserService, element: RxapElement, parsedElement: T): T {

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
          `The attribute '${ this.attribute }' is required for <${ parsedElement.__tag }>`,
          parsedElement.__tag!,
          this.attribute,
        );
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      parsedElement[this.propertyKey] = value;
    }


    return parsedElement;
  }


}

export function ElementAttribute<Value>(): (target: any, propertyKey: string) => void;
export function ElementAttribute<Value>(attribute: string): (target: any, propertyKey: string) => void;
export function ElementAttribute<Value>(options: Partial<ElementAttributeOptions<Value>>): (
  target: any,
  propertyKey: string,
) => void;
export function ElementAttribute<Value>(optionsOrString?: Partial<ElementAttributeOptions<Value>> | string): (
  target: any,
  propertyKey: string,
) => void {
  return function (target: any, propertyKey: string) {
    let options: Partial<ElementAttributeOptions<Value>> = optionsOrString === undefined ?
      { attribute: propertyKey } :
      typeof optionsOrString === 'string' ? { attribute: optionsOrString } : optionsOrString;
    options = deepMerge(options, getMetadata(ElementParserMetaData.OPTIONS, target, propertyKey) ?? {});
    const optionsWithDefaults: ElementAttributeOptions<Value> = Object.assign({ attribute: propertyKey }, options);
    const parser = new ElementAttributeParser(propertyKey, optionsWithDefaults);
    AddParserToMetadata(parser, target);
    if (optionsWithDefaults.required) {
      RequiredProperty()(target, propertyKey);
    }
  };
}
