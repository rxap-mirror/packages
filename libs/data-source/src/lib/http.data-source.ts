import {
  BaseDataSource,
  IBaseDataSourceViewer,
  RXAP_DATA_SOURCE_ID_TOKEN,
  RXAP_DATA_SOURCE_TRANSFORMERS_TOKEN,
  DataSourceTransformerFunction,
  DataSourceTransformerToken
} from './base.data-source';
import {
  Injectable,
  Optional,
  Inject
} from '@angular/core';
import { DataSourceId } from './collection-data-source';
import {
  HttpClient,
  HttpRequest,
  HttpEvent,
  HttpEventType,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  map,
  tap,
  filter
} from 'rxjs/operators';

export interface IHttpDataSourceViewer<Source> extends IBaseDataSourceViewer, HttpRequest<Source> {
}

@Injectable()
export class HttpDataSource<Data, Source = Data, Viewer extends IHttpDataSourceViewer<Source> = IHttpDataSourceViewer<Source>>
  extends BaseDataSource<Data, Source | null, Viewer> {

  constructor(
    public http: HttpClient,
    @Optional() @Inject(RXAP_DATA_SOURCE_ID_TOKEN) id: DataSourceId,
    @Optional() @Inject(RXAP_DATA_SOURCE_TRANSFORMERS_TOKEN) transformers: DataSourceTransformerFunction<Data, Source | null> | DataSourceTransformerToken<Data, Source | null>[] | null = null
  ) {
    super(id, null, transformers);
  }

  protected _connect(viewer: Viewer): Observable<Source | null> {
    return this.http.request<Source>(viewer).pipe(
      tap((event: HttpEvent<Source>) => {

        switch (event.type) {
          case HttpEventType.Sent:
            break;
          case HttpEventType.ResponseHeader:
            break;
          case HttpEventType.Response:
            break;
          case HttpEventType.DownloadProgress:
            break;
          case HttpEventType.UploadProgress:
            break;
          case HttpEventType.User:
            break;
        }

        return null as any;

      }),
      filter((event): event is HttpResponse<Source> => event.type === HttpEventType.Response),
      map((event: HttpResponse<Source>) => {
        return event.body;
      })
    );
  }

}
