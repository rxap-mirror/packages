import {
  Method,
  Constructor
} from '@rxap/utilities';
import {
  Injectable,
  InjectionToken,
  Inject,
  Optional,
  Injector,
  INJECTOR
} from '@angular/core';
import { FormDefinition } from '@rxap/forms';
import { ComponentType } from '@angular/cdk/portal';
import {
  FormWindowService,
  FormWindowOptions
} from './form-window.service';
import { WindowRef } from '@rxap/window-system';

export const RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFINITION_CONSTRUCTOR = new InjectionToken('rxap/form-window-system/open-form/definition-constructor');
export const RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS        = new InjectionToken('rxap/form-window-system/open-form/default-options');
export const RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_COMPONENT              = new InjectionToken('rxap/form-window-system/open-form/component');

@Injectable()
export class OpenFormWindowMethod<FormData extends Record<string, any> = Record<string, any>> implements Method<WindowRef<FormDefinition, FormData>, Partial<FormData>> {

  constructor(
    @Inject(FormWindowService)
    private readonly formWindowService: FormWindowService,
    @Inject(RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFINITION_CONSTRUCTOR)
    private readonly formDefinitionConstructor: Constructor<FormDefinition>,
    @Inject(INJECTOR)
    private readonly injector: Injector,
    @Optional()
    @Inject(RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_COMPONENT)
    private readonly formComponent: ComponentType<any> | null           = null,
    @Optional()
    @Inject(RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS)
    private readonly defaultOptions: FormWindowOptions<FormData> | null = null
  ) {}

  public call(initial?: FormData, options?: Partial<FormWindowOptions<FormData>>): WindowRef<FormDefinition, FormData> {
    return this.formWindowService.open<FormData>(
      this.formDefinitionConstructor,
      {
        ...(this.defaultOptions ?? {}),
        injector:  this.injector,
        ...(options ?? {}),
        initial:   initial ?? this.defaultOptions?.initial,
        component: this.formComponent ?? this.defaultOptions?.component ?? undefined
      }
    );
  }

}
