import {
  DefaultValueElementOptions,
  DefaultValueElementParserMixin
} from './default-value-element.parser.mixin';
import {
  RequiredElementOptions,
  RequiredElementParserMixin
} from './required-element.parser.mixin';
import { Mixin } from '@rxap/mixin';
import { TagElementParserMixin } from './tag-element.parser.mixin';
import {
  ParseValueElementParserMixin,
  ParseValueElementOptions
} from './parse-value-element-parser.mixin';

export interface TextContentElementOptions<Value, DefaultValue = Value>
  extends DefaultValueElementOptions<DefaultValue>,
          RequiredElementOptions,
          ParseValueElementOptions<Value> {
}

export interface TextContentElementParserMixin<Value, DefaultValue = Value>
  extends RequiredElementParserMixin,
          DefaultValueElementParserMixin<DefaultValue>,
          ParseValueElementParserMixin<Value> {}

@Mixin(RequiredElementParserMixin, DefaultValueElementParserMixin, TagElementParserMixin, ParseValueElementParserMixin)
export class TextContentElementParserMixin<Value, DefaultValue = Value> {}
