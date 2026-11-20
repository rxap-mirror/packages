import { ComponentType } from '@angular/cdk/portal';
import { Injectable, InjectionToken, Injector, INJECTOR, inject } from '@angular/core';
import {
  FormDefinition,
  FormType,
} from '@rxap/forms';
import { Method } from '@rxap/pattern';
import { Constructor } from '@rxap/utilities';
import { WindowRef } from '@rxap/window-system';
import {
  FormWindowOptions,
  FormWindowService,
} from './form-window.service';

export const RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFINITION_CONSTRUCTOR =
  new InjectionToken(
    'rxap/form-window-system/open-form/definition-constructor',
  );
export const RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS =
  new InjectionToken('rxap/form-window-system/open-form/default-options');
export const RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_COMPONENT = new InjectionToken(
  'rxap/form-window-system/open-form/component',
);

@Injectable()
export class OpenFormWindowMethod<
  FormData extends Record<string, any> = Record<string, any>
> implements Method<WindowRef<FormDefinition, FormData>, Partial<FormData>> {
  private readonly formWindowService = inject<FormWindowService>(FormWindowService);
  private readonly formDefinitionConstructor = inject<Constructor<FormType<FormData>>>(RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFINITION_CONSTRUCTOR);
  private readonly injector = inject<Injector>(INJECTOR);
  private readonly formComponent = inject<ComponentType<any> | null>(RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_COMPONENT, { optional: true }) ?? null;
  private readonly defaultOptions = inject<FormWindowOptions<FormData> | null>(RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS, { optional: true }) ?? null;


  public call(
    initial?: Partial<FormData>,
    options?: Partial<FormWindowOptions<FormData>>,
  ): WindowRef<FormDefinition, FormData> {
    return this.formWindowService.open<FormData>(
      this.formDefinitionConstructor,
      {
        ...(this.defaultOptions ?? {}),
        injector: this.injector,
        ...(options ?? {}),
        initial: initial ?? this.defaultOptions?.initial,
        component:
          this.formComponent ?? this.defaultOptions?.component ?? undefined,
      },
    );
  }
}
