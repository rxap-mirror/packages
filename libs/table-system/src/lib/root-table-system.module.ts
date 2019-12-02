import {
  NgModule,
  Inject,
  Type
} from '@angular/core';
import { ROOT_TABLE_DEFINITION_TOKEN } from './tokens';
import { HttpClientModule } from '@angular/common/http';
import { TableDefinitionRegistry } from './table-definition-registry';
import { RxapTableDefinition } from './definition/table-definition';

@NgModule({
  exports: [ HttpClientModule ]
})
export class RootTableSystemModule {

  constructor(
    public tableDefinitionRegistry: TableDefinitionRegistry,
    @Inject(ROOT_TABLE_DEFINITION_TOKEN) tableDefinitionTypes: Array<Type<RxapTableDefinition<any>>>
  ) {
    tableDefinitionTypes.forEach(fdt => this.register(fdt));
  }

  public register(tableDefinitionType: Type<RxapTableDefinition<any>>): void {
    this.tableDefinitionRegistry.register(tableDefinitionType);
  }

}
