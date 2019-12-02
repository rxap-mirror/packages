import {
  NgModule,
  Inject
} from '@angular/core';
import { REGISTER_TABLE_DEFINITION_TOKEN } from './tokens';
import { RootTableSystemModule } from './root-table-system.module';

@NgModule()
export class RegisterTableSystemModule {

  constructor(
    root: RootTableSystemModule,
    @Inject(REGISTER_TABLE_DEFINITION_TOKEN) tableDefinitionTypes: any[][]
  ) {
    tableDefinitionTypes.forEach(fdts => fdts.forEach(fdt => root.register(fdt)));
  }

}
