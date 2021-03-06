import {
  Directive,
  NgModule,
  Input
} from '@angular/core';
import {
  PaginatorLike,
  AbstractPaginationDataSource
} from '@rxap/data-source/pagination';
import {
  SortLike,
  FilterLike,
  AbstractTableDataSource,
  RxapTableDataSourceError
} from '@rxap/data-source/table';
import { Required } from '@rxap/utilities';
import { DataSourceCollectionDirective } from '@rxap/data-source/directive';
import { IdOrInstanceOrToken } from '@rxap/definition';
import { BaseDataSourceViewer } from '@rxap/data-source';

@Directive({
  selector: '[rxapTableDataSource]'
})
export class TableDataSourceDirective<Data extends Record<any, any> = any, Parameters = any> extends DataSourceCollectionDirective<Data> {

  @Input('rxapTableDataSourcePaginator')
  public paginator!: PaginatorLike;

  @Input('rxapTableDataSourceSort')
  public sort!: SortLike;

  @Input('rxapTableDataSourceFilter')
  public filter!: FilterLike;

  public loadDataSource(): AbstractPaginationDataSource<Data> | null {
    const dataSource = super.loadDataSource();

    if (dataSource) {
      if (!(dataSource instanceof AbstractTableDataSource)) {
        throw new RxapTableDataSourceError('The data source is not a AbstractTableDataSource', '');
      }
      if (dataSource.paginator !== this.paginator) {
        dataSource.paginator = this.paginator;
      }
      if (dataSource.sort !== this.sort) {
        dataSource.sort = this.sort;
      }
      if (dataSource.filter !== this.filter) {
        dataSource.filter = this.filter;
      }
    }

    return dataSource as AbstractPaginationDataSource<Data> | null;

  }

  @Input('rxapTableDataSourceFrom')
  @Required
  public dataSourceOrIdOrToken!: IdOrInstanceOrToken<AbstractTableDataSource<Data>>;

  @Input('rxapTableDataSourceViewer')
  public viewer: BaseDataSourceViewer = { id: '[rxapDataSourceCollection]' };

}

@NgModule({
  exports:      [ TableDataSourceDirective ],
  declarations: [ TableDataSourceDirective ]
})
export class TableDataSourceDirectiveModule {}
