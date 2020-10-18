import {
  Pipe,
  PipeTransform,
  NgModule
} from '@angular/core';
import { BaseDataSource } from '@rxap/data-source';
import {
  PaginationDataSource,
  PaginatorLike
} from '@rxap/data-source/pagination';

@Pipe({
  name: 'toPagination'
})
export class ToPaginationPipe implements PipeTransform {

  transform<Data>(value: BaseDataSource<Data[]>, paginator: PaginatorLike): PaginationDataSource<Data> {
    return new PaginationDataSource<Data>(value, paginator);
  }

}

@NgModule({
  declarations: [ ToPaginationPipe ],
  exports:      [ ToPaginationPipe ]
})
export class ToHttpPaginationPipeModule {}
