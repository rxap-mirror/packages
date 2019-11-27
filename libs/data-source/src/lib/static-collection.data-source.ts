import {
  Injectable,
  Inject,
  Optional
} from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import { BaseDataSourcePaginator } from './base.data-source-paginator';
import { BaseDataSourceSort } from './base.data-source-sort';
import { BaseDataSourceFilter } from './base.data-source-filter';
import {
  RXAP_DATA_SOURCE_ID_TOKEN,
  RXAP_DATA_SOURCE_SOURCE_TOKEN,
  RXAP_DATA_SOURCE_TRANSFORMERS_TOKEN
} from './base.data-source';
import {
  CollectionDataSource,
  DataSourceId,
  Sort,
  Filter,
  ICollectionDataSourceViewer
} from './collection-data-source';

@Injectable()
export class StaticCollectionDataSource<Data, Source extends any[] = Data[], Viewer extends ICollectionDataSourceViewer = ICollectionDataSourceViewer>
  extends CollectionDataSource<Data, Source, Viewer> {

  public constructor(
    @Inject(RXAP_DATA_SOURCE_ID_TOKEN) public readonly id: DataSourceId,
    public paginator: BaseDataSourcePaginator<Source>,
    public sort: BaseDataSourceSort<Source>,
    public filter: BaseDataSourceFilter<Source>,
    @Optional() @Inject(RXAP_DATA_SOURCE_SOURCE_TOKEN) source: Source[] | null          = null,
    @Optional() @Inject(RXAP_DATA_SOURCE_TRANSFORMERS_TOKEN) transformers: any[] | null = null
  ) {
    super(id, source, transformers);
  }

  public apply(
    source: Source,
    page: number | null,
    pageSize: number | null,
    sort: Sort | null,
    filters: Array<Filter> | null
  ): Observable<Source> {
    return of(this.paginator.apply(this.sort.apply(this.filter.apply(source, filters), sort), page, pageSize));
  }

}
