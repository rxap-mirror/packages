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
import { TableHeaderButtonFormComponent } from './table-header-button-form.component';
import {
  ITableHeaderButtonForm,
  TableHeaderButtonForm,
} from './table-header-button.form';

@Injectable()
export class OpenTableHeaderButtonFormWindowMethod extends OpenFormWindowMethod<ITableHeaderButtonForm> {
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
}
