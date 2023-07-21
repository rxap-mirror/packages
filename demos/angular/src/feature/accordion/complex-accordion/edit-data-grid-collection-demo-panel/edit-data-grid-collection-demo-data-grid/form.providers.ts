import {
  INJECTOR,
  Injector,
  Optional,
  Provider,
} from '@angular/core';
import {
  EditDataGridCollectionDemoForm,
  IEditDataGridCollectionDemoForm,
} from './edit-data-grid-collection-demo.form';
import {
  RXAP_FORM_DEFINITION,
  RXAP_FORM_DEFINITION_BUILDER,
  RXAP_FORM_INITIAL_STATE,
  RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
  RxapFormBuilder,
} from '@rxap/forms';
import { DataSourceRefreshToMethodAdapterFactory } from '@rxap/data-source';
import { EditDataGridCollectionDemoDataGridDataSource } from './edit-data-grid-collection-demo-data-grid.data-source';

export const FormProviders: Provider[] = [
  EditDataGridCollectionDemoForm, {
    provide: RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
    useFactory: DataSourceRefreshToMethodAdapterFactory,
    deps: [ EditDataGridCollectionDemoDataGridDataSource ],
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

export function FormFactory(
  injector: Injector,
  state: IEditDataGridCollectionDemoForm | null,
): EditDataGridCollectionDemoForm {
  return new RxapFormBuilder<IEditDataGridCollectionDemoForm>(EditDataGridCollectionDemoForm, injector).build(state ??
    {});
}

function FormBuilderFactory(injector: Injector): RxapFormBuilder<IEditDataGridCollectionDemoForm> {
  return new RxapFormBuilder<IEditDataGridCollectionDemoForm>(EditDataGridCollectionDemoForm, injector);
}
