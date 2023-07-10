import {Directive, Input} from '@angular/core';
import {DataSourceCollectionDirective} from '@rxap/data-source/directive';
import {
  AbstractPaginationDataSource,
  PaginatorLike,
  RxapPaginationDataSourceError,
} from '@rxap/data-source/pagination';
import {Required} from '@rxap/utilities';
import {IdOrInstanceOrToken} from '@rxap/definition';

@Directive({
  selector: '[rxapPaginationDataSource]',
  standalone: true,
})
export class PaginationDataSourceDirective<Data> extends DataSourceCollectionDirective<Data> {

  @Input('rxapPaginationDataSourcePaginator')
  public paginator!: PaginatorLike;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('rxapPaginationDataSourceFrom')
  @Required
  public override dataSourceOrIdOrToken!: IdOrInstanceOrToken<AbstractPaginationDataSource<Data>>;

  public override loadDataSource(): AbstractPaginationDataSource<Data> | null {
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


