import {
  Pipe,
  PipeTransform,
  NgModule
} from '@angular/core';
import { PaginatorLike } from '@rxap/data-source/pagination';
import { TableDataSource } from './table.data-source';
import { BaseDataSource } from '@rxap/data-source';
import {
  SortLike,
  FilterLike
} from './abstract-table.data-source';

@Pipe({
  name: 'toTableDataSource'
})
export class ToTableDataSourcePipe implements PipeTransform {

  public transform<Data extends Record<any, any>>(
    dataSource: BaseDataSource<Data[]>,
    paginator: PaginatorLike,
    sort?: SortLike,
    filter?: FilterLike
  ): TableDataSource<Data> {
    return new TableDataSource(dataSource, paginator, sort, filter);
  }

}

@NgModule({
  declarations: [ ToTableDataSourcePipe ],
  exports:      [ ToTableDataSourcePipe ]
})
export class ToTableDataSourcePipeModule {}
