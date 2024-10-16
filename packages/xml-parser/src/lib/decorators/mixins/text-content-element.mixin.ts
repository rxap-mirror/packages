import {
  DefaultValueElementOptions,
  DefaultValueElementMixin,
} from './default-value-element.mixin';
import {
  RequiredElementOptions,
  RequiredElementMixin,
} from './required-element.mixin';
import { Mixin } from '@rxap/mixin';
import {
  SerializeValueElementMixin,
  SerializeValueElementOptions,
} from './serialize-value-element.mixin';
import { TagElementMixin } from './tag-element.mixin';
import {
  ParseValueElementOptions,
  ParseValueElementMixin,
} from './parse-value-element.mixin';

export interface TextContentElementOptions<Value, DefaultValue = Value>
  extends DefaultValueElementOptions<DefaultValue>,
          RequiredElementOptions,
          ParseValueElementOptions<Value>,
          SerializeValueElementOptions<Value> {
}

export interface TextContentElementMixin<Value, DefaultValue = Value>
  extends RequiredElementMixin,
          DefaultValueElementMixin<DefaultValue>,
          ParseValueElementMixin<Value>,
          SerializeValueElementMixin<Value> {
}

@Mixin(RequiredElementMixin, DefaultValueElementMixin, TagElementMixin, ParseValueElementMixin, SerializeValueElementMixin)
export class TextContentElementMixin<Value, DefaultValue = Value> {
}
