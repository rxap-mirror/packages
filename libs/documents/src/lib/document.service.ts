import { Injectable } from '@angular/core';
import {
  RxapDocument,
  DocumentId
} from './document';
import {
  Observable,
  of
} from 'rxjs';
import { DocumentApiService } from './document-api.service';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class DocumentService {

  constructor(
    private readonly api: DocumentApiService
  ) {}

  public create<Document extends RxapDocument>(documentPath: string, document: Document): Observable<Document> {
    return this.api.post(documentPath, document);
  }

  public delete(documentOrId: RxapDocument | DocumentId): Observable<boolean> {
    const documentId: string = typeof documentOrId === 'string' ? documentOrId : documentOrId.id;
    return this.api.delete(documentId).pipe(map(Boolean));
  }

  public update<Document extends RxapDocument>(document: Document): Observable<Document> {
    return this.api.put(document.id, document);
  }

  public get<Document extends RxapDocument>(documentId: DocumentId): Observable<Document | null> {
    return this.api.get(documentId);
  }

  public queryToHttpParams<Query extends object>(query: Query): HttpParams {
    return Object.entries(query).reduce((params, [ key, value ]) => params.set(key, value), new HttpParams());
  }

  public find<Document extends RxapDocument, Query extends object>(documentPath: string, query: Query): Observable<Document[]> {
    return this.api.get<Document[]>(documentPath, { params: this.queryToHttpParams(query) });
  }

  public findOne<Document extends RxapDocument, Query extends object>(documentPath: string, query: Query): Observable<Document | null> {
    return this.api.get<Document>(documentPath, { params: this.queryToHttpParams(query) });
  }

  public archive(documentOrId: RxapDocument | DocumentId): Observable<boolean> {
    const documentId = typeof documentOrId === 'string' ? documentOrId : documentOrId.id;
    return of(false);
  }

  public restore(documentOrId: RxapDocument | DocumentId): Observable<boolean> {
    const documentId = typeof documentOrId === 'string' ? documentOrId : documentOrId.id;
    return of(false);
  }

}
