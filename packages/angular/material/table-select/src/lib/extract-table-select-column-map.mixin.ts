import {
  ExtractControlMixin,
  ExtractFormDefinitionMixin,
  RxapFormSystemError,
} from '@rxap/form-system';
import { Mixin } from '@rxap/mixin';
import { getMetadata } from '@rxap/reflect-metadata';
import { TABLE_SELECT_COLUMN_MAP } from './derectives';
import { TableSelectColumn } from './open-table-select-window.method';

export interface ExtractTableSelectColumnMapMixin extends ExtractControlMixin, ExtractFormDefinitionMixin {
}

@Mixin(ExtractFormDefinitionMixin, ExtractControlMixin)
export class ExtractTableSelectColumnMapMixin {

  protected extractTableSelectColumnMap(
    control        = this.extractControl(),
    formDefinition = this.extractFormDefinition(control),
  ) {
    const map = getMetadata<Map<string, Record<string, TableSelectColumn>>>(
      TABLE_SELECT_COLUMN_MAP,
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
