import {
  NgModule,
  Inject
} from '@angular/core';
import { REGISTER_FORM_DEFINITION_TOKEN } from './tokens';
import { RootFormSystemModule } from './root-form-system.module';

@NgModule()
export class RegisterFormSystemModule {

  constructor(
    root: RootFormSystemModule,
    @Inject(REGISTER_FORM_DEFINITION_TOKEN) formDefinitionTypes: any[][]
  ) {
    formDefinitionTypes.forEach(fdts => fdts.forEach(fdt => root.register(fdt)));
  }

}
