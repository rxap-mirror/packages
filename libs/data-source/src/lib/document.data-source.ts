import {
  BaseDataSource,
  IBaseDataSourceViewer
} from './base.data-source';
import { Injectable } from '@angular/core';
import {
  Observable,
  combineLatest,
  of,
  EMPTY
} from 'rxjs';
import {
  startWith,
  switchMap
} from 'rxjs/operators';

export interface IDocumentDataSourceViewer extends IBaseDataSourceViewer {
  documentId$?: Observable<string>
}

@Injectable()
export class DocumentDataSource<Document, Source = Document, Viewer extends IDocumentDataSourceViewer = IDocumentDataSourceViewer>
  extends BaseDataSource<Document, Source, Viewer> {

  public apply(
    sourceDocument: Source,
    documentId: string | null
  ): Observable<Source> {
    return of(sourceDocument);
  }

  public _connect(viewer: Viewer): Observable<Source> {

    return combineLatest([
      this.source$,
      (viewer.documentId$ || EMPTY).pipe(startWith(null))
    ]).pipe(
      switchMap(([ sourceDocument, documentId ]: [ Source, string | null ]) =>
        this.apply(sourceDocument, documentId)
      )
    );

  }

}
