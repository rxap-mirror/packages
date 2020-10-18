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

export interface TextContentElementOptions<Value>
  extends DefaultValueElementOptions<Value>,
          RequiredElementOptions,
          ParseValueElementOptions<Value> {
}

export interface TextContentElementParserMixin<Value>
  extends RequiredElementParserMixin,
          DefaultValueElementParserMixin<Value>,
          ParseValueElementParserMixin<Value> {}

@Mixin(RequiredElementParserMixin, DefaultValueElementParserMixin, TagElementParserMixin, ParseValueElementParserMixin)
export class TextContentElementParserMixin<Value> {}
