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
import { HeaderButtonFormComponent } from './header-button-form.component';
import { HeaderButtonForm, IHeaderButtonForm } from './header-button.form';

@Injectable()
export class OpenHeaderButtonFormWindowMethod extends OpenFormWindowMethod<IHeaderButtonForm> {
  constructor(
    @Inject(FormWindowService) formWindowService: FormWindowService,
    @Inject(INJECTOR)
    injector: Injector,
    @Optional()
    @Inject(RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS)
    defaultOptions: FormWindowOptions<IHeaderButtonForm> | null = null
  ) {
    super(
      formWindowService,
      HeaderButtonForm,
      injector,
      HeaderButtonFormComponent,
      defaultOptions
    );
  }
}
