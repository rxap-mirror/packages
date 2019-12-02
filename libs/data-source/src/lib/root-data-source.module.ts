import {
  NgModule,
  Inject,
  Type
} from '@angular/core';
import { ROOT_DATA_SOURCE_TOKEN } from './tokens';
import { HttpClientModule } from '@angular/common/http';
import { DataSourceRegistry } from './data-source-registry';
import { BaseDataSource } from './base.data-source';

@NgModule({
  exports: [ HttpClientModule ]
})
export class RootDataSourceModule {

  constructor(
    public dataSourceRegistry: DataSourceRegistry,
    @Inject(ROOT_DATA_SOURCE_TOKEN) dataSourceTypes: Array<Type<BaseDataSource<any>>>
  ) {
    dataSourceTypes.forEach(fdt => this.register(fdt));
  }

  public register(tableDefinitionType: Type<BaseDataSource<any>>): void {
    this.dataSourceRegistry.register(tableDefinitionType);
  }

}
