import {
  NgModule,
  Type,
  ModuleWithProviders
} from '@angular/core';
import { BaseDataSource } from './base.data-source';
import {
  ROOT_DATA_SOURCE_TOKEN,
  REGISTER_DATA_SOURCE_TOKEN
} from './tokens';
import { RegisterDataSourceModule } from './register-data-source.module';
import { RootDataSourceModule } from './root-data-source.module';

@NgModule()
export class RxapDataSourceSystemModule {

  public static forRoot(dataSourceTypes: Array<Type<BaseDataSource<any>>> = []): ModuleWithProviders {
    return {
      ngModule:  RootDataSourceModule,
      providers: [
        ...dataSourceTypes,
        {
          provide:  ROOT_DATA_SOURCE_TOKEN,
          useValue: dataSourceTypes
        }
      ]
    };
  }

  public static register(dataSourceTypes: Array<Type<BaseDataSource<any>>>): ModuleWithProviders {
    return {
      ngModule:  RegisterDataSourceModule,
      providers: [
        ...dataSourceTypes,
        {
          provide:  REGISTER_DATA_SOURCE_TOKEN,
          useValue: dataSourceTypes,
          multi:    true
        }
      ]
    };
  }

}
