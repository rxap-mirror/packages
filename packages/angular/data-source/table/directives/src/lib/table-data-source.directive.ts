import {
  Directive,
  Input,
} from '@angular/core';
import {
  AbstractPaginationDataSource,
  PaginatorLike,
} from '@rxap/data-source/pagination';
import {
  AbstractTableDataSource,
  DynamicTableDataSource,
  FilterLike,
  RxapTableDataSourceError,
  SortLike,
} from '@rxap/data-source/table';
import { Required } from '@rxap/utilities';
import { DataSourceCollectionDirective } from '@rxap/data-source/directive';
import { IdOrInstanceOrToken } from '@rxap/definition';
import { BaseDataSourceViewer } from '@rxap/data-source';

@Directive({
  selector: '[rxapTableDataSource]',
  standalone: true,
})
export class TableDataSourceDirective<Data extends Record<any, any> = any, Parameters = any>
  extends DataSourceCollectionDirective<Data> {

  @Input('rxapTableDataSourcePaginator')
  public paginator!: PaginatorLike;

  @Input('rxapTableDataSourceSort')
  public sort!: SortLike;

  @Input('rxapTableDataSourceFilter')
  public filter!: FilterLike;
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('rxapTableDataSourceFrom')
  @Required
  public override dataSourceOrIdOrToken!: IdOrInstanceOrToken<AbstractTableDataSource<Data>>;
  @Input('rxapTableDataSourceViewer')
  public override viewer: BaseDataSourceViewer = { id: '[rxapDataSourceCollection]' };

  public override loadDataSource(): AbstractPaginationDataSource<Data> | null {
    const dataSource = super.loadDataSource();

    if (dataSource) {
      if (!(dataSource instanceof AbstractTableDataSource)) {
        throw new RxapTableDataSourceError('The data source is not a AbstractTableDataSource', '');
      }
      if (this.viewer.id && dataSource instanceof DynamicTableDataSource) {
        dataSource.setPaginator(this.paginator, this.viewer.id);
        dataSource.setSort(this.sort, this.viewer.id);
        dataSource.setFilter(this.filter, this.viewer.id);
      } else {
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
    }

    return dataSource as AbstractPaginationDataSource<Data> | null;

  }

}


