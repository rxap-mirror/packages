import {
  Pipe,
  PipeTransform,
  NgModule
} from '@angular/core';
import { HttpDataSource } from '@rxap/data-source/http';
import {
  HttpPaginationDataSource,
  PaginationData,
  PageEventToHttpOptionsFunction
} from './http-pagination.data-source';
import { PaginatorLike } from '@rxap/data-source/pagination';

@Pipe({
  name: 'toHttpPagination'
})
export class ToHttpPaginationPipe implements PipeTransform {

  public transform<Data>(
    dataSource: HttpDataSource<PaginationData<Data>>,
    paginator: PaginatorLike,
    pageEventToHttpOptions: PageEventToHttpOptionsFunction
  ): HttpPaginationDataSource<Data> {
    return new HttpPaginationDataSource<Data>(dataSource, paginator, pageEventToHttpOptions);
  }

}

@NgModule({
  declarations: [ ToHttpPaginationPipe ],
  exports:      [ ToHttpPaginationPipe ]
})
export class ToHttpPaginationPipeModule {}
