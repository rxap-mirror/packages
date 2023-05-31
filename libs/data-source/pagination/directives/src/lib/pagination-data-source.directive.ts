import {
  Directive,
  Input
} from '@angular/core';
import { DataSourceCollectionDirective } from '@rxap/data-source/directive';
import {
  AbstractPaginationDataSource,
  RxapPaginationDataSourceError,
  PaginatorLike
} from '@rxap/data-source/pagination';
import { Required } from '@rxap/utilities';
import { IdOrInstanceOrToken } from '@rxap/definition';

@Directive({
  selector:   '[rxapPaginationDataSource]',
  standalone: true
})
export class PaginationDataSourceDirective<Data> extends DataSourceCollectionDirective<Data> {

  @Input('rxapPaginationDataSourcePaginator')
  public paginator!: PaginatorLike;

  @Input('rxapPaginationDataSourceFrom')
  @Required
  public dataSourceOrIdOrToken!: IdOrInstanceOrToken<AbstractPaginationDataSource<Data>>;

  public loadDataSource(): AbstractPaginationDataSource<Data> | null {
    const dataSource = super.loadDataSource();

    if (dataSource) {
      if (!(dataSource instanceof AbstractPaginationDataSource)) {
        throw new RxapPaginationDataSourceError('The data source is not a AbstractPaginationDataSource', '');
      }
      if (dataSource.paginator !== this.paginator) {
        dataSource.paginator = this.paginator;
      }
    }

    return dataSource;

  }

}


