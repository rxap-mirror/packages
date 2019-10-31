import {
  NgModule,
  Type,
  ModuleWithProviders
} from '@angular/core';
import { RxapFormDefinition } from './form-definition/form-definition';
import {
  REGISTER_FORM_DEFINITION_TOKEN,
  ROOT_FORM_DEFINITION_TOKEN
} from './tokens';
import { RegisterFormSystemModule } from './register-form-system.module';
import { RootFormSystemModule } from './root-form-system.module';

@NgModule()
export class RxapFormSystemModule {

  public static forRoot(formDefinitionTypes: Array<Type<RxapFormDefinition<any>>> = []): ModuleWithProviders {
    return {
      ngModule: RootFormSystemModule,
      providers: [
                   ...formDefinitionTypes,
        {
          provide:  ROOT_FORM_DEFINITION_TOKEN,
          useValue: formDefinitionTypes,
        }
      ]
    }
  }

  public static register(formDefinitionTypes: Array<Type<RxapFormDefinition<any>>>): ModuleWithProviders {
    return {
      ngModule: RegisterFormSystemModule,
      providers: [
                   ...formDefinitionTypes,
        {
          provide:  REGISTER_FORM_DEFINITION_TOKEN,
          useValue: formDefinitionTypes,
          multi:    true,
        }
      ]
    }
  }

}
