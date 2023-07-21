import { Method } from '@rxap/pattern';
import {
  Inject,
  Injectable,
  INJECTOR,
  Injector,
  Optional,
} from '@angular/core';
import {
  FormWindowOptions,
  FormWindowService,
  OpenFormWindowMethod,
  RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS,
} from '@rxap/form-window-system';
import {
  ITableHeaderButtonForm,
  TableHeaderButtonForm,
} from '../table-header-button-form/table-header-button.form';
import { TableHeaderButtonFormComponent } from '../table-header-button-form/table-header-button-form.component';

@Injectable()
export class TableHeaderButtonMethod extends OpenFormWindowMethod<ITableHeaderButtonForm> implements Method {
  constructor(
    formWindowService: FormWindowService,
    @Inject(INJECTOR) injector: Injector,
    @Inject(RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS) @Optional() defaultOptions: FormWindowOptions<ITableHeaderButtonForm> | null = null,
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
    super.call(parameters);
  }
}
