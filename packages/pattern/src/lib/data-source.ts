import { Observable } from 'rxjs';

export interface DataSourceViewer {
  id?: string;
  viewChange?: Observable<any>;

  [key: string]: any;
}

export interface DataSource<Data = unknown, Viewer extends DataSourceViewer = DataSourceViewer> {

  connect(viewer: Viewer): Observable<Data>;

  disconnect(viewer: Viewer): void;

  disconnect(viewerId: string): void;

}
