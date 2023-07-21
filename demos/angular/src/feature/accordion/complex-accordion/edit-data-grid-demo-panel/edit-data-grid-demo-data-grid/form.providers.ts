import {
  INJECTOR,
  Injector,
  Optional,
  Provider,
} from '@angular/core';
import {
  EditDataGridDemoForm,
  IEditDataGridDemoForm,
} from './edit-data-grid-demo.form';
import {
  RXAP_FORM_DEFINITION,
  RXAP_FORM_DEFINITION_BUILDER,
  RXAP_FORM_INITIAL_STATE,
  RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
  RxapFormBuilder,
} from '@rxap/forms';
import { DataSourceRefreshToMethodAdapterFactory } from '@rxap/data-source';
import { EditDataGridDemoDataGridDataSource } from './edit-data-grid-demo-data-grid.data-source';

export const FormProviders: Provider[] = [
  EditDataGridDemoForm, {
    provide: RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
    useFactory: DataSourceRefreshToMethodAdapterFactory,
    deps: [ EditDataGridDemoDataGridDataSource ],
  },
];
export const FormComponentProviders: Provider[] = [
  {
    provide: RXAP_FORM_DEFINITION,
    useFactory: FormFactory,
    deps: [ INJECTOR, [ new Optional(), RXAP_FORM_INITIAL_STATE ] ],
  },
];
export const FormBuilderProviders: Provider[] = [
  {
    provide: RXAP_FORM_DEFINITION_BUILDER,
    useFactory: FormBuilderFactory,
    deps: [ INJECTOR ],
  },
];

export function FormFactory(injector: Injector, state: IEditDataGridDemoForm | null): EditDataGridDemoForm {
  return new RxapFormBuilder<IEditDataGridDemoForm>(EditDataGridDemoForm, injector).build(state ?? {});
}

function FormBuilderFactory(injector: Injector): RxapFormBuilder<IEditDataGridDemoForm> {
  return new RxapFormBuilder<IEditDataGridDemoForm>(EditDataGridDemoForm, injector);
}
