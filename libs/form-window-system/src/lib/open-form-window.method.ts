import {
  Method,
  Constructor
} from '@rxap/utilities';
import {
  Injectable,
  InjectionToken,
  Inject,
  Optional
} from '@angular/core';
import { FormDefinition } from '@rxap/forms';
import { ComponentType } from '@angular/cdk/portal';
import {
  FormWindowService,
  FormWindowOptions
} from './form-window.service';
import { FormWindowRef } from './form-window-ref';

export const RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFINITION_CONSTRUCTOR = new InjectionToken('rxap/form-window-system/open-form/definition-constructor');
export const RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS        = new InjectionToken('rxap/form-window-system/open-form/default-options');
export const RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_COMPONENT              = new InjectionToken('rxap/form-window-system/open-form/component');

@Injectable()
export class OpenFormWindowMethod<FormData> implements Method<FormWindowRef, Partial<FormData>> {

  constructor(
    @Inject(FormWindowService)
    private readonly formWindowService: FormWindowService,
    @Inject(RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFINITION_CONSTRUCTOR)
    private readonly formDefinitionConstructor: Constructor<FormDefinition>,
    @Optional()
    @Inject(RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_COMPONENT)
    private readonly formComponent: ComponentType<any> | null           = null,
    @Optional()
    @Inject(RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS)
    private readonly defaultOptions: FormWindowOptions<FormData> | null = null
  ) {}

  public call(initial?: Record<string, any>): FormWindowRef {
    return this.formWindowService.open(
      this.formDefinitionConstructor,
      {
        ...(this.defaultOptions ?? {}),
        initial:   initial ?? this.defaultOptions?.initial ?? {},
        component: this.formComponent ?? this.defaultOptions?.component ?? undefined
      }
    );
  }

}
