import {Mixin} from '@rxap/mixin';
import {RequiredElementOptions, RequiredElementParserMixin} from './required-element.parser.mixin';
import {DefaultValueElementOptions, DefaultValueElementParserMixin} from './default-value-element.parser.mixin';
import {ParseValueElementOptions, ParseValueElementParserMixin} from './parse-value-element-parser.mixin';

export interface AttributeElementOptions<Value>
  extends RequiredElementOptions, DefaultValueElementOptions<Value>, ParseValueElementOptions<Value> {
  attribute: string;
}

export interface AttributeElementParserMixin<Value>
  extends RequiredElementParserMixin,
    DefaultValueElementParserMixin<Value>,
    ParseValueElementParserMixin<Value> {
}

@Mixin(RequiredElementParserMixin, DefaultValueElementParserMixin, ParseValueElementParserMixin)
export class AttributeElementParserMixin<Value> {

  constructor(readonly options: any = {}) {
  }

  public get attribute(): string {
    return this.options.attribute!;
  }

}
