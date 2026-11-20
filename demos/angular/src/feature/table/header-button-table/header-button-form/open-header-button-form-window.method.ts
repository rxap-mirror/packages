import { Injectable, INJECTOR, inject } from '@angular/core';
import {
  FormWindowOptions,
  FormWindowService,
  RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS,
} from '@rxap/form-window-system';
import { Method } from '@rxap/pattern';
import { WindowRef } from '@rxap/window-system';
import { FormDefinition } from '@rxap/forms';
import { HeaderButtonFormComponent } from './header-button-form.component';
import { HeaderButtonForm, IHeaderButtonForm } from './header-button.form';

@Injectable()
export class OpenHeaderButtonFormWindowMethod implements Method<WindowRef<FormDefinition, IHeaderButtonForm>, Partial<IHeaderButtonForm>> {
  private readonly formWindowService = inject(FormWindowService);
  private readonly injector = inject(INJECTOR);
  private readonly defaultOptions = inject<FormWindowOptions<IHeaderButtonForm> | null>(
    RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS,
    { optional: true },
  );

  call(
    initial?: Partial<IHeaderButtonForm>,
    options?: Partial<FormWindowOptions<IHeaderButtonForm>>,
  ): WindowRef<FormDefinition, IHeaderButtonForm> {
    return this.formWindowService.open<IHeaderButtonForm>(HeaderButtonForm as any, {
      ...(this.defaultOptions ?? {}),
      injector: this.injector,
      ...(options ?? {}),
      initial: initial ?? this.defaultOptions?.initial,
      component: HeaderButtonFormComponent,
    });
  }
}
