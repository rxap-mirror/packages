import {
  Pipe,
  PipeTransform,
  NgModule
} from '@angular/core';
import { HttpDataSource } from '@rxap/data-source/http';
import { PaginationData } from '@rxap/data-source/http/pagination';
import { PaginatorLike } from '@rxap/data-source/pagination';
import {
  SortLike,
  FilterLike
} from '@rxap/data-source/table';
import {
  HttpTableDataSource,
  TableEventToHttpOptionsFunction
} from './http-table.data-source';

@Pipe({
  name: 'toHttpTableDataSource'
})
export class ToHttpTableDataSourcePipe implements PipeTransform {

  public transform<Data extends Record<any, any>>(
    dataSource: HttpDataSource<PaginationData<Data>>,
    paginator: PaginatorLike,
    tableEventToHttpOptions: TableEventToHttpOptionsFunction,
    sort?: SortLike,
    filter?: FilterLike
  ): HttpTableDataSource<Data> {
    return new HttpTableDataSource(dataSource, paginator, tableEventToHttpOptions, sort, filter);
  }

}

@NgModule({
  declarations: [ ToHttpTableDataSourcePipe ],
  exports:      [ ToHttpTableDataSourcePipe ]
})
export class ToHttpTableDataSourcePipeModule {}
