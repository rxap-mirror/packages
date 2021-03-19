import { Mixin } from '@rxap/mixin';
import {
  RequiredElementParserMixin,
  RequiredElementOptions
} from './required-element.parser.mixin';
import {
  DefaultValueElementOptions,
  DefaultValueElementParserMixin
} from './default-value-element.parser.mixin';
import {
  ParseValueElementParserMixin,
  ParseValueElementOptions
} from './parse-value-element-parser.mixin';

export interface AttributeElementOptions<Value>
  extends RequiredElementOptions, DefaultValueElementOptions<Value>, ParseValueElementOptions<Value> {
  attribute: string;
}

export interface AttributeElementParserMixin<Value>
  extends RequiredElementParserMixin,
          DefaultValueElementParserMixin<Value>,
          ParseValueElementParserMixin<Value> {}

@Mixin(RequiredElementParserMixin, DefaultValueElementParserMixin, ParseValueElementParserMixin)
export class AttributeElementParserMixin<Value> {

  public get attribute(): string {
    return this.options.attribute!;
  }

  constructor(readonly options: any = {}) {}

}
