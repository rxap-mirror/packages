import {
  Pipe,
  PipeTransform,
  NgModule
} from '@angular/core';
import { PaginationData } from '@rxap/data-source/http/pagination';
import { PaginatorLike } from '@rxap/data-source/pagination';
import {
  SortLike,
  FilterLike
} from '@rxap/data-source/table';
import { OpenApiDataSource } from '@rxap/open-api/data-source';
import {
  OpenApiTableDataSource,
  TableEventToOpenApiParametersFunction
} from './open-api-table.data-source';

@Pipe({
  name: 'toOpenApiTableDataSource'
})
export class ToOpenApiTableDataSourcePipe implements PipeTransform {

  public transform<Data extends object, Parameters extends Record<string, any>>(
    dataSource: OpenApiDataSource<PaginationData<Data>>,
    paginator: PaginatorLike,
    tableEventToOpenApiParameters?: TableEventToOpenApiParametersFunction<Parameters>,
    sort?: SortLike,
    filter?: FilterLike
  ): OpenApiTableDataSource<Data> {
    return new OpenApiTableDataSource(dataSource, paginator, tableEventToOpenApiParameters, sort, filter);
  }

}

@NgModule({
  exports:      [ ToOpenApiTableDataSourcePipe ],
  declarations: [ ToOpenApiTableDataSourcePipe ]
})
export class ToOpenApiTableDataSourcePipeModule {}
