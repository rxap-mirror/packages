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
  WindowConfig
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
  FormSubmitSuccessfulMethod
} from '@rxap/forms';
import {
  Constructor,
  getMetadata,
  DeleteUndefinedProperties
} from '@rxap/utilities';
import { FormWindowRef } from './form-window-ref';
import { FormSystemMetadataKeys } from '@rxap/form-system';

export interface FormWindowOptions<FormData, D = any, T = any> extends WindowConfig<D, T> {
  initial?: FormData;
  submitMethod?: FormSubmitMethod<FormData>;
  submitSuccessfulMethod?: FormSubmitSuccessfulMethod;
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

  public open<FormData>(
    formDefinitionConstructor: Constructor<FormDefinition>,
    options?: FormWindowOptions<FormData>
  ): FormWindowRef<FormData> {

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
          provide: RXAP_FORM_SUBMIT_METHOD,
          useValue: options.submitMethod,
        });
      }
      if (options.submitSuccessfulMethod) {
        providers.push({
          provide:  RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
          useValue: options.submitSuccessfulMethod
        });
      }
    }

    const injector = Injector.create({
      parent:    options?.injector ?? this.injector,
      providers,
      name:      options?.injectorName ?? 'FormWindowService',
    });

    const component = options?.component ?? this.extractFormComponent(formDefinitionConstructor);

    const windowConfig: WindowConfig<any, any> = {
      component,
      injector,
    };

    if (options) {
      Object.assign(windowConfig, DeleteUndefinedProperties(options));
    }

    const windowRef = this.windowService.open(windowConfig);

    return new FormWindowRef<FormData>(
      injector.get(RXAP_FORM_DEFINITION),
      windowRef
    );

  }

  private extractFormComponent(formDefinitionConstructor: Constructor<FormDefinition>): Constructor {
    const component = getMetadata<Constructor>(FormSystemMetadataKeys.FORM_COMPONENT, formDefinitionConstructor) ?? null;

    if (!component) {
      throw new Error('Could not extract form component constructor');
    }

    return component;
  }

}
