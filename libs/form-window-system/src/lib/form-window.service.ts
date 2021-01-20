import {
  Injectable,
  Injector,
  Optional,
  StaticProvider,
  Inject,
  INJECTOR
} from '@angular/core';
import {
  WindowService,
  WindowConfig,
  WindowRef
} from '@rxap/window-system';
import {
  RxapFormBuilder,
  FormDefinition,
  RXAP_FORM_DEFINITION_BUILDER,
  RXAP_FORM_DEFINITION,
  RXAP_FORM_INITIAL_STATE,
  FormSubmitMethod,
  RXAP_FORM_SUBMIT_METHOD,
  RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
  FormSubmitSuccessfulMethod,
  RXAP_FORM_LOAD_METHOD
} from '@rxap/forms';
import {
  Constructor,
  getMetadata,
  DeleteUndefinedProperties
} from '@rxap/utilities';
import { FormSystemMetadataKeys } from '@rxap/form-system';

export interface FormWindowOptions<FormData, D = any, T = any> extends WindowConfig<D, T> {
  initial?: FormData;
  submitMethod?: FormSubmitMethod<FormData>;
  submitSuccessfulMethod?: FormSubmitSuccessfulMethod;
  providers?: StaticProvider[];
  resetLoad?: boolean;
  resetSubmit?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class FormWindowService {

  constructor(
    @Inject(WindowService)
    private readonly windowService: WindowService,
    @Inject(INJECTOR)
    private readonly injector: Injector,
  ) {}

  private createFormDefinitionInstance(formBuilder: RxapFormBuilder, initial?: any): FormDefinition {
    return formBuilder.build(initial);
  }

  public open<FormData extends Record<string, any>>(
    formDefinitionConstructor: Constructor<FormDefinition>,
    options?: FormWindowOptions<FormData>
  ): WindowRef<FormDefinition, FormData> {

    const providers: StaticProvider[] = [
      {
        provide:  RXAP_FORM_DEFINITION_BUILDER,
        useValue: new RxapFormBuilder(formDefinitionConstructor, options?.injector ?? this.injector)
      },
      {
        provide:    RXAP_FORM_DEFINITION,
        useFactory: this.createFormDefinitionInstance.bind(this),
        deps:       [ RXAP_FORM_DEFINITION_BUILDER, [ new Optional(), RXAP_FORM_INITIAL_STATE ] ]
      },
      ...(options?.providers ?? [])
    ];

    if (options) {
      if (options.initial) {
        providers.push({
          provide:  RXAP_FORM_INITIAL_STATE,
          useValue: options.initial,
        });
      }
      if (options.submitMethod) {
        providers.push({
          provide:  RXAP_FORM_SUBMIT_METHOD,
          useValue: options.submitMethod
        });
      }
      if (options.submitSuccessfulMethod) {
        providers.push({
          provide:  RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
          useValue: options.submitSuccessfulMethod
        });
      }
      if (options.resetSubmit) {
        providers.push({
          provide:  RXAP_FORM_SUBMIT_METHOD,
          useValue: null
        });
      }
      if (options.resetLoad) {
        providers.push({
          provide:  RXAP_FORM_LOAD_METHOD,
          useValue: null
        });
      }
    }

    const injector = Injector.create({
      parent:    options?.injector ?? this.injector,
      providers,
      name:      options?.injectorName ?? 'FormWindowService',
    });

    const component = options?.component ?? this.extractFormComponent(formDefinitionConstructor);

    let windowConfig: WindowConfig<any, any> = {
      component,
      injector,
      data: injector.get(RXAP_FORM_DEFINITION)
    };

    if (options) {
      windowConfig = Object.assign(DeleteUndefinedProperties(options), windowConfig);
    }

    return this.windowService.open(windowConfig);
  }

  private extractFormComponent(formDefinitionConstructor: Constructor<FormDefinition>): Constructor {
    const component = getMetadata<Constructor>(FormSystemMetadataKeys.FORM_COMPONENT, formDefinitionConstructor) ?? null;

    if (!component) {
      throw new Error('Could not extract form component constructor');
    }

    return component;
  }

}
