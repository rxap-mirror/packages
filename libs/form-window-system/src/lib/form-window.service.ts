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
  RXAP_FORM_LOAD_METHOD,
  FormLoadMethod,
  RXAP_FORM_CONTEXT,
  FormType
} from '@rxap/forms';
import {
  Constructor,
  DeleteUndefinedProperties
} from '@rxap/utilities';
import { FormSystemMetadataKeys } from '@rxap/form-system';
import { getMetadata } from '@rxap/utilities/reflect-metadata';

export interface FormWindowOptions<FormData, D = any, T = any>
  extends WindowConfig<D, T> {
  initial?: FormData;
  submitMethod?: FormSubmitMethod<FormData>;
  submitSuccessfulMethod?: FormSubmitSuccessfulMethod;
  providers?: StaticProvider[];
  resetLoad?: boolean;
  resetSubmit?: boolean;
  loadMethod?: FormLoadMethod<FormData>;
  /**
   * Stores the context of the form window.
   * Can be used to transfer the id or uuid of the
   * document the is currently edited
   */
  context?: any;
}

@Injectable({
  providedIn: 'root',
})
export class FormWindowService {
  constructor(
    @Inject(WindowService)
    private readonly windowService: WindowService,
    @Inject(INJECTOR)
    private readonly injector: Injector
  ) {}

  public open<FormData extends Record<string, any>>(
    formDefinitionConstructor: Constructor<FormType<any>>,
    options?: FormWindowOptions<FormData>
  ): WindowRef<FormDefinition, FormData> {
    function FormDefinitionFactory(
      formBuilder: RxapFormBuilder,
      initial?: any
    ): FormDefinition {
      return formBuilder.build(initial);
    }

    function FormDefinitionBuilderFactory(
      _injector: Injector
    ): RxapFormBuilder {
      return new RxapFormBuilder(formDefinitionConstructor, _injector);
    }

    const providers: StaticProvider[] = [
      {
        provide: RXAP_FORM_DEFINITION_BUILDER,
        useFactory: FormDefinitionBuilderFactory,
        deps: [INJECTOR],
      },
      {
        provide: RXAP_FORM_DEFINITION,
        useFactory: FormDefinitionFactory,
        deps: [
          RXAP_FORM_DEFINITION_BUILDER,
          [new Optional(), RXAP_FORM_INITIAL_STATE],
        ],
      },
      ...(options?.providers ?? []),
    ];

    if (options) {
      if (options.initial) {
        providers.push({
          provide: RXAP_FORM_INITIAL_STATE,
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
          provide: RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
          useValue: options.submitSuccessfulMethod,
        });
      }
      if (options.resetSubmit) {
        providers.push({
          provide: RXAP_FORM_SUBMIT_METHOD,
          useValue: null,
        });
      }
      if (options.resetLoad && !options.loadMethod) {
        providers.push({
          provide: RXAP_FORM_LOAD_METHOD,
          useValue: null,
        });
      }
      if (options.loadMethod) {
        providers.push({
          provide: RXAP_FORM_LOAD_METHOD,
          useValue: options.loadMethod,
        });
      }
      if (options.context) {
        providers.push({
          provide: RXAP_FORM_CONTEXT,
          useValue: options.context,
        });
      }
    }

    const injector = Injector.create({
      parent: options?.injector ?? this.injector,
      providers,
      name: options?.injectorName ?? 'FormWindowService',
    });

    const component =
      options?.component ??
      this.extractFormComponent(formDefinitionConstructor);

    let windowConfig: WindowConfig<any, any> = {
      component,
      injector,
      data: injector.get(RXAP_FORM_DEFINITION),
    };

    if (options) {
      windowConfig = Object.assign(
        DeleteUndefinedProperties(options),
        windowConfig
      );
    }

    return this.windowService.open(windowConfig);
  }

  private extractFormComponent(
    formDefinitionConstructor: Constructor<FormType<any>>
  ): Constructor {
    const component =
      getMetadata<Constructor>(
        FormSystemMetadataKeys.FORM_COMPONENT,
        formDefinitionConstructor
      ) ?? null;

    if (!component) {
      throw new Error('Could not extract form component constructor');
    }

    return component;
  }
}
