import {
  NgModule,
  Type,
  ModuleWithProviders
} from '@angular/core';
import { RxapTableDefinition } from './definition/table-definition';
import {
  ROOT_TABLE_DEFINITION_TOKEN,
  REGISTER_TABLE_DEFINITION_TOKEN
} from './tokens';
import { RootTableSystemModule } from './root-table-system.module';
import { RegisterTableSystemModule } from './register-table-system.module';

@NgModule()
export class TableSystemModule {

  public static forRoot(tableDefinitionTypes: Array<Type<RxapTableDefinition<any>>> = []): ModuleWithProviders {
    return {
      ngModule:  RootTableSystemModule,
      providers: [
        ...tableDefinitionTypes,
        {
          provide:  ROOT_TABLE_DEFINITION_TOKEN,
          useValue: tableDefinitionTypes
        }
      ]
    };
  }

  public static register(tableDefinitionTypes: Array<Type<RxapTableDefinition<any>>>): ModuleWithProviders {
    return {
      ngModule:  RegisterTableSystemModule,
      providers: [
        ...tableDefinitionTypes,
        {
          provide:  REGISTER_TABLE_DEFINITION_TOKEN,
          useValue: tableDefinitionTypes,
          multi:    true
        }
      ]
    };
  }

}
