import {
  Directive,
  input
} from '@angular/core';
import { DataSourceCollectionDirective } from '@rxap/data-source/directive';
import {
  AbstractPaginationDataSource,
  PaginatorLike,
  RxapPaginationDataSourceError,
} from '@rxap/data-source/pagination';
import { Required } from '@rxap/utilities';
import { IdOrInstanceOrToken } from '@rxap/definition';

@Directive({
  selector: '[rxapPaginationDataSource]',
  standalone: true,
})
export class PaginationDataSourceDirective<Data> extends DataSourceCollectionDirective<Data> {

  public readonly paginator = input.required<PaginatorLike>({ alias: "rxapPaginationDataSourcePaginator" });

  // eslint-disable-next-line @angular-eslint/no-input-rename
  public override readonly dataSourceOrIdOrToken = input.required<IdOrInstanceOrToken<AbstractPaginationDataSource<Data>>>({ alias: "rxapPaginationDataSourceFrom" });

  public override loadDataSource(): AbstractPaginationDataSource<Data> | null {
    const dataSource = super.loadDataSource();

    if (dataSource) {
      if (!(dataSource instanceof AbstractPaginationDataSource)) {
        throw new RxapPaginationDataSourceError('The data source is not a AbstractPaginationDataSource', '');
      }
      const paginator = this.paginator();
      if (dataSource.paginator !== paginator) {
        dataSource.paginator = paginator;
      }
    }

    return dataSource;

  }

}


