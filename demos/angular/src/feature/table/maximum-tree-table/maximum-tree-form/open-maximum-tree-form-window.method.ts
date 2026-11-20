import { Injectable, INJECTOR, inject } from '@angular/core';
import {
  FormWindowOptions,
  FormWindowService,
  RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS,
} from '@rxap/form-window-system';
import { Method } from '@rxap/pattern';
import { WindowRef } from '@rxap/window-system';
import { FormDefinition } from '@rxap/forms';
import { MaximumTreeFormComponent } from './maximum-tree-form.component';
import { MaximumTreeForm, IMaximumTreeForm } from './maximum-tree.form';

@Injectable()
export class OpenMaximumTreeFormWindowMethod implements Method<WindowRef<FormDefinition, IMaximumTreeForm>, Partial<IMaximumTreeForm>> {
  private readonly formWindowService = inject(FormWindowService);
  private readonly injector = inject(INJECTOR);
  private readonly defaultOptions = inject<FormWindowOptions<IMaximumTreeForm> | null>(
    RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS,
    { optional: true },
  );

  call(
    initial?: Partial<IMaximumTreeForm>,
    options?: Partial<FormWindowOptions<IMaximumTreeForm>>,
  ): WindowRef<FormDefinition, IMaximumTreeForm> {
    return this.formWindowService.open<IMaximumTreeForm>(MaximumTreeForm as any, {
      ...(this.defaultOptions ?? {}),
      injector: this.injector,
      ...(options ?? {}),
      initial: initial ?? this.defaultOptions?.initial,
      component: MaximumTreeFormComponent,
    });
  }
}
