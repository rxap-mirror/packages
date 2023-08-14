import {
  Inject,
  Injectable,
  Injector,
  INJECTOR,
  Optional,
} from '@angular/core';
import {
  FormWindowOptions,
  FormWindowService,
  OpenFormWindowMethod,
  RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS,
} from '@rxap/form-window-system';
import { TableHeaderButtonMethod } from '@rxap/material-table-system';
import { TableHeaderButtonFormComponent } from '../table-header-button-form/table-header-button-form.component';
import {
  ITableHeaderButtonForm,
  TableHeaderButtonForm,
} from '../table-header-button-form/table-header-button.form';

@TableHeaderButtonMethod()
@Injectable()
export class WindowTableHeaderButtonMethod extends OpenFormWindowMethod<ITableHeaderButtonForm> {
  constructor(
    @Inject(FormWindowService) formWindowService: FormWindowService,
    @Inject(INJECTOR)
      injector: Injector,
    @Optional()
    @Inject(RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS)
      defaultOptions: FormWindowOptions<ITableHeaderButtonForm> | null = null,
  ) {
    super(
      formWindowService,
      TableHeaderButtonForm,
      injector,
      TableHeaderButtonFormComponent,
      defaultOptions,
    );
  }

  override call(parameters?: any): any {
    return super.call(parameters);
  }
}
