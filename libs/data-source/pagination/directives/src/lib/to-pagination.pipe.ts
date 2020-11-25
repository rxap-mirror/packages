import {
  Pipe,
  PipeTransform,
  NgModule
} from '@angular/core';
import {
  BaseDataSource,
  staticDataSource,
  observableDataSource
} from '@rxap/data-source';
import {
  PaginationDataSource,
  PaginatorLike
} from '@rxap/data-source/pagination';
import {
  isObservable,
  Observable
} from 'rxjs';

@Pipe({
  name: 'toPagination'
})
export class ToPaginationPipe implements PipeTransform {

  transform<Data>(value: BaseDataSource<Data[]> | Data[] | Observable<Data[]>, paginator: PaginatorLike | null = null): PaginationDataSource<Data> {
    let dataSource: BaseDataSource<Data[]>;
    if (Array.isArray(value)) {
      dataSource = staticDataSource(value, { id: 'auto-to-pagination' });
    } else if (isObservable(value)) {
      dataSource = observableDataSource(value, { id: 'auto-to-pagination' });
    } else {
      dataSource = value;
    }
    return new PaginationDataSource<Data>(dataSource, paginator);
  }

}

@NgModule({
  declarations: [ ToPaginationPipe ],
  exports:      [ ToPaginationPipe ]
})
export class ToPaginationPipeModule {}
