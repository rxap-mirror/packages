import { Inject, Injectable, Injector, INJECTOR, Optional } from '@angular/core';
import {
  FormWindowOptions,
  FormWindowService,
  OpenFormWindowMethod,
  RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS,
} from '@rxap/form-window-system';
import { MaximumTreeFormComponent } from './maximum-tree-form.component';
import { MaximumTreeForm, IMaximumTreeForm } from './maximum-tree.form';

@Injectable()
export class OpenMaximumTreeFormWindowMethod extends OpenFormWindowMethod<IMaximumTreeForm> {
  constructor(
    @Inject(FormWindowService) formWindowService: FormWindowService,
    @Inject(INJECTOR)
      injector: Injector,
    @Optional()
    @Inject(RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS)
      defaultOptions: FormWindowOptions<IMaximumTreeForm> | null = null,
  ) {
    super(
      formWindowService,
      MaximumTreeForm,
      injector,
      MaximumTreeFormComponent,
      defaultOptions,
    );
  }
}
