import { ComponentType } from '@angular/cdk/portal';
import {
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  INJECTOR,
  Optional,
} from '@angular/core';
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
  constructor(
    @Inject(FormWindowService)
    private readonly formWindowService: FormWindowService,
    @Inject(RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFINITION_CONSTRUCTOR)
    private readonly formDefinitionConstructor: Constructor<FormType<FormData>>,
    @Inject(INJECTOR)
    private readonly injector: Injector,
    @Optional()
    @Inject(RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_COMPONENT)
    private readonly formComponent: ComponentType<any> | null = null,
    @Optional()
    @Inject(RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS)
    private readonly defaultOptions: FormWindowOptions<FormData> | null = null,
  ) {
  }

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
