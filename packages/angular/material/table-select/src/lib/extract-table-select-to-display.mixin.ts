import {
  ExtractControlMixin,
  ExtractFormDefinitionMixin,
  RxapFormSystemError,
} from '@rxap/form-system';
import { Mixin } from '@rxap/mixin';
import { getMetadata } from '@rxap/reflect-metadata';
import { TABLE_SELECT_TO_DISPLAY } from './derectives';

export interface ExtractTableSelectToDisplayMixin<Value = unknown> extends ExtractControlMixin,
  ExtractFormDefinitionMixin {
}

export type TableSelectToDisplayFunction<Value = unknown> = (value: Value) => string | Promise<string>;

@Mixin(ExtractFormDefinitionMixin, ExtractControlMixin)
export class ExtractTableSelectToDisplayMixin<Value = unknown> {

  protected extractTableSelectToDisplay(
    control        = this.extractControl(),
    formDefinition = this.extractFormDefinition(control),
  ) {
    const map = getMetadata<Map<string, TableSelectToDisplayFunction<Value>>>(
      TABLE_SELECT_TO_DISPLAY,
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
