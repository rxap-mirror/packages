import {
  Directive,
  Input,
  TemplateRef,
  TrackByFunction,
  input
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
import {
  DataSourceCollectionDirective,
  DataSourceCollectionErrorTemplateContext,
} from '@rxap/data-source/directive';
import { IdOrInstanceOrToken } from '@rxap/definition';
import {
  BaseDataSource,
  BaseDataSourceViewer,
} from '@rxap/data-source';
import { Observable } from 'rxjs';

@Directive({
  selector: '[rxapTableDataSource]',
  standalone: true,
})
export class TableDataSourceDirective<Data extends Record<any, any> = any, Parameters = any>
  extends DataSourceCollectionDirective<Data> {

  public readonly paginator = input.required<PaginatorLike>({ alias: "rxapTableDataSourcePaginator" });

  public readonly sort = input.required<SortLike>({ alias: "rxapTableDataSourceSort" });

  public readonly parameters = input.required<Observable<Record<string, any>>>({ alias: "rxapTableDataSourceParameters" });

  public readonly filter = input.required<FilterLike>({ alias: "rxapTableDataSourceFilter" });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  public override readonly dataSourceOrIdOrToken = input.required<IdOrInstanceOrToken<AbstractTableDataSource<Data>>>({ alias: "rxapTableDataSourceFrom" });
  public override readonly viewer = input<BaseDataSourceViewer>({ id: '[rxapTableDataSource]' }, { alias: "rxapTableDataSourceViewer" });

  public override readonly emptyTemplate = input<TemplateRef<void>>(undefined, { alias: "rxapTableDataSourceEmpty" });

  public override readonly errorTemplate = input<TemplateRef<DataSourceCollectionErrorTemplateContext>>(undefined, { alias: "rxapTableDataSourceErrorTemplate" });

  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
  @Input()
  set rxapTableDataSourceTrackBy(fn: TrackByFunction<Data>) {
    this.rxapDataSourceCollectionTrackBy = fn;
  }

  public override loadDataSource(): AbstractPaginationDataSource<Data> | null {
    const dataSource = super.loadDataSource();

    if (dataSource) {
      if (!(dataSource instanceof AbstractTableDataSource)) {
        throw new RxapTableDataSourceError('The data source is not a AbstractTableDataSource', '');
      }
      const viewer = this.viewer();
      if (viewer.id && dataSource instanceof DynamicTableDataSource) {
        dataSource.setPaginator(this.paginator(), viewer.id);
        dataSource.setSort(this.sort(), viewer.id);
        dataSource.setFilter(this.filter(), viewer.id);
        dataSource.setParameters(this.parameters(), viewer.id);
      } else {
        const paginator = this.paginator();
        if (dataSource.paginator !== paginator) {
          dataSource.paginator = paginator;
        }
        const sort = this.sort();
        if (dataSource.sort !== sort) {
          dataSource.sort = sort;
        }
        const filter = this.filter();
        if (dataSource.filter !== filter) {
          dataSource.filter = filter;
        }
        const parameters = this.parameters();
        if (dataSource.parameters !== parameters) {
          dataSource.parameters = parameters;
        }
      }
    }

    return dataSource as AbstractPaginationDataSource<Data> | null;

  }

}


