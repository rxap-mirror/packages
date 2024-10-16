import { Mixin } from '@rxap/mixin';
import {
  RequiredElementOptions,
  RequiredElementMixin,
} from './required-element.mixin';
import {
  DefaultValueElementOptions,
  DefaultValueElementMixin,
} from './default-value-element.mixin';
import {
  ParseValueElementOptions,
  ParseValueElementMixin,
} from './parse-value-element.mixin';
import {
  SerializeValueElementOptions,
  SerializeValueElementMixin,
} from './serialize-value-element.mixin';

export interface AttributeElementOptions<Value>
  extends RequiredElementOptions, DefaultValueElementOptions<Value>, ParseValueElementOptions<Value>, SerializeValueElementOptions<Value> {
  attribute: string;
}

export interface AttributeElementMixin<Value>
  extends RequiredElementMixin,
          DefaultValueElementMixin<Value>,
          ParseValueElementMixin<Value>,
          SerializeValueElementMixin<Value> {
}

@Mixin(RequiredElementMixin, DefaultValueElementMixin, ParseValueElementMixin, SerializeValueElementMixin)
export class AttributeElementMixin<Value> {

  constructor(readonly options: any = {}) {
  }

  public get attribute(): string {
    return this.options.attribute!;
  }

}
