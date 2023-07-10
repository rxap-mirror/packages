import {Injectable, InjectFlags, Injector} from '@angular/core';
import {BaseDataSource, BaseDataSourceMetadata, BaseDataSourceViewer} from './base.data-source';
import {Observable} from 'rxjs';
import {DefinitionLoader, IdOrInstanceOrToken} from '@rxap/definition';

@Injectable({providedIn: 'root'})
export class DataSourceLoader extends DefinitionLoader {

  public connect<Data>(
    dataSourceIdOrInstanceOrToken: IdOrInstanceOrToken<BaseDataSource<Data>>,
    viewer: BaseDataSourceViewer,
    metadata?: Partial<BaseDataSourceMetadata>,
    injector?: Injector,
    notFoundValue?: BaseDataSource<Data>,
    flags?: InjectFlags,
  ): Observable<Data> {
    return this
      .load(
        dataSourceIdOrInstanceOrToken,
        metadata,
        injector,
        notFoundValue,
        flags,
      )
      .connect(viewer);
  }

}
