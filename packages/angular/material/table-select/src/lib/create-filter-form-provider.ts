import { StaticProvider } from '@angular/core';
import {
  RxapFormControl,
  RxapFormGroup,
} from '@rxap/forms';
import { RXAP_TABLE_FILTER_FORM_DEFINITION } from '@rxap/material-table-system';
import { TableSelectColumnMap } from './open-table-select-window.method';

export function CreateFilterFormProvider(columns: TableSelectColumnMap): StaticProvider {

  const columnNameList: string[] = Array.from(columns.entries())
                                        .filter(([ key, column ]) => column.filter)
                                        .map(([ key, column ]) => key);

  const controls: Record<string, RxapFormControl> = {};

  for (const column of columnNameList) {
    controls[column] = new RxapFormControl(null, { controlId: column });
  }

  const form = {
    ...controls,
    rxapFormGroup: new RxapFormGroup(controls, { controlId: 'filter' }),
    rxapMetadata: { controlId: 'filter' },
  };

  Reflect.set(form.rxapFormGroup, '_rxapFormDefinition', form);

  return {
    provide: RXAP_TABLE_FILTER_FORM_DEFINITION,
    useValue: form,
  };

}
