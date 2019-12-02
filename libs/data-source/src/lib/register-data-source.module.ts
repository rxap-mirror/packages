import {
  NgModule,
  Inject
} from '@angular/core';
import { RootDataSourceModule } from './root-data-source.module';
import { REGISTER_DATA_SOURCE_TOKEN } from './tokens';

@NgModule()
export class RegisterDataSourceModule {

  constructor(
    root: RootDataSourceModule,
    @Inject(REGISTER_DATA_SOURCE_TOKEN) dataSourceTypes: any[][]
  ) {
    dataSourceTypes.forEach(fdts => fdts.forEach(fdt => root.register(fdt)));
  }

}
