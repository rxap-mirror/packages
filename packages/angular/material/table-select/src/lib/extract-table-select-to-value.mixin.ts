import {
  ExtractControlMixin,
  ExtractFormDefinitionMixin,
  RxapFormSystemError,
} from '@rxap/form-system';
import { Mixin } from '@rxap/mixin';
import { getMetadata } from '@rxap/reflect-metadata';
import { TABLE_SELECT_TO_VALUE } from './decorators';

export interface ExtractTableSelectToValueMixin<Data = unknown, Value = unknown> extends ExtractControlMixin,
  ExtractFormDefinitionMixin {
}

export type TableSelectToValueFunction<Data = unknown, Value = unknown> = (value: Data) => Value | Promise<Value>;

@Mixin(ExtractFormDefinitionMixin, ExtractControlMixin)
export class ExtractTableSelectToValueMixin<Data = unknown, Value = unknown> {

  protected extractTableSelectToValue(
    control        = this.extractControl(),
    formDefinition = this.extractFormDefinition(control),
  ) {
    const map = getMetadata<Map<string, TableSelectToValueFunction<Data, Value>>>(
      TABLE_SELECT_TO_VALUE,
      Object.getPrototypeOf(formDefinition),
    );

    if (!map) {
      throw new RxapFormSystemError('Could not extract the use data source map from the form definition instance', '');
    }

    if (!map.has(control.controlId)) {
      throw new RxapFormSystemError('A use data source definition does not exists in the form definition metadata', '');
    }

    return map.get(control.controlId)!;
  }

}
