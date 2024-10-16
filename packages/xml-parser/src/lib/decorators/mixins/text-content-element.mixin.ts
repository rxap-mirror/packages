import {
  DefaultValueElementOptions,
  DefaultValueElementMixin,
} from './default-value-element.mixin';
import {
  RequiredElementOptions,
  RequiredElementMixin,
} from './required-element.mixin';
import { Mixin } from '@rxap/mixin';
import { TagElementMixin } from './tag-element.mixin';
import {
  ParseValueElementOptions,
  ParseValueElementMixin,
} from './parse-value-element.mixin';

export interface TextContentElementOptions<Value, DefaultValue = Value>
  extends DefaultValueElementOptions<DefaultValue>,
          RequiredElementOptions,
          ParseValueElementOptions<Value> {
}

export interface TextContentElementMixin<Value, DefaultValue = Value>
  extends RequiredElementMixin,
          DefaultValueElementMixin<DefaultValue>,
          ParseValueElementMixin<Value> {
}

@Mixin(RequiredElementMixin, DefaultValueElementMixin, TagElementMixin, ParseValueElementMixin)
export class TextContentElementMixin<Value, DefaultValue = Value> {
}
