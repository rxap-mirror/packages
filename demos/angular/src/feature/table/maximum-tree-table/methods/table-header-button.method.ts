import { Injectable, INJECTOR, inject } from '@angular/core';
import {
  FormWindowOptions,
  FormWindowService,
  RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS,
} from '@rxap/form-window-system';
import { Method } from '@rxap/pattern';
import { WindowRef } from '@rxap/window-system';
import { FormDefinition } from '@rxap/forms';
import { TableHeaderButtonFormComponent } from '../table-header-button-form/table-header-button-form.component';
import { TableHeaderButtonForm, ITableHeaderButtonForm } from '../table-header-button-form/table-header-button.form';

@Injectable()
export class TableHeaderButtonMethod implements Method<WindowRef<FormDefinition, ITableHeaderButtonForm>, Partial<ITableHeaderButtonForm>> {
  private readonly formWindowService = inject(FormWindowService);
  private readonly injector = inject(INJECTOR);
  private readonly defaultOptions = inject<FormWindowOptions<ITableHeaderButtonForm> | null>(
    RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS,
    { optional: true },
  );

  call(
    initial?: Partial<ITableHeaderButtonForm>,
    options?: Partial<FormWindowOptions<ITableHeaderButtonForm>>,
  ): WindowRef<FormDefinition, ITableHeaderButtonForm> {
    return this.formWindowService.open<ITableHeaderButtonForm>(TableHeaderButtonForm as any, {
      ...(this.defaultOptions ?? {}),
      injector: this.injector,
      ...(options ?? {}),
      initial: initial ?? this.defaultOptions?.initial,
      component: TableHeaderButtonFormComponent,
    });
  }
}
