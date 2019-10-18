import {
  NgModule,
  Type,
  ModuleWithProviders,
  Inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RxapFormDefinition } from './form-definition/form-definition';
import { FormDefinitionRegister } from './form-definition-register';
import {
  REGISTER_FORM_DEFINITION_TOKEN,
  ROOT_FORM_DEFINITION_TOKEN
} from './tokens';
import { BaseFormControl } from './forms/form-controls/base.form-control';
import { BaseFormGroup } from './forms/form-groups/base.form-group';
import { BaseFormArray } from './forms/form-arrays/base.form-array';

@NgModule()
export class RootFormSystemModule {

  constructor(
    public formDefinitionRegistry: FormDefinitionRegister,
    @Inject(ROOT_FORM_DEFINITION_TOKEN) formDefinitionTypes: Array<Type<RxapFormDefinition<any>>>
  ) {
    formDefinitionTypes.forEach(fdt => this.register(fdt));
  }

  public register(formDefinitionType: Type<RxapFormDefinition<any>>): void {
    this.formDefinitionRegistry.register(formDefinitionType);
  }

}

@NgModule()
export class RegisterFormSystemModule {

  constructor(
    root: RootFormSystemModule,
    @Inject(REGISTER_FORM_DEFINITION_TOKEN) formDefinitionTypes: Array<Array<Type<RxapFormDefinition<any>>>>
  ) {
    formDefinitionTypes.forEach(fdts => fdts.forEach(fdt => root.register(fdt)));
  }

}

@NgModule({
  imports: [CommonModule]
})
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
