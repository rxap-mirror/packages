import {
  NgModule,
  Inject,
  Type
} from '@angular/core';
import { FormDefinitionRegister } from './form-definition-register';
import { ROOT_FORM_DEFINITION_TOKEN } from './tokens';
import { RxapFormDefinition } from './form-definition/form-definition';

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
