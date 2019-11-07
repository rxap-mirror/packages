import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';
import { ConfigService } from '@rxap/config';
import { DocumentsConfig } from './documents.config';
import {
  deepMerge,
  joinPath
} from '../../../utilities/src';
import { Observable } from 'rxjs';

export interface HttpClientOptions {
  headers?: HttpHeaders | {
    [ header: string ]: string | string[];
  };
  observe?: 'body';
  params?: HttpParams | {
    [ param: string ]: string | string[];
  };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}

@Injectable({ providedIn: 'root' })
export class DocumentApiService {

  public readonly defaultOptions: HttpClientOptions = {
    responseType: 'json'
  };

  public readonly baseUrl: string;

  constructor(
    public http: HttpClient,
    public config: ConfigService<DocumentsConfig>
  ) {
    this.baseUrl = this.config.get<string>('documents.api');
  }

  public buildUrl(url: string): string {
    return joinPath(this.baseUrl, url);
  }

  public get<T>(url: string, options: HttpClientOptions = {}): Observable<T> {
    return this.http.get<T>(this.buildUrl(url), deepMerge(this.defaultOptions, options));
  }

  public post<T>(url: string, body: any, options: HttpClientOptions = {}): Observable<T> {
    return this.http.post<T>(this.buildUrl(url), body, deepMerge(this.defaultOptions, options));
  }

  public delete<T>(url: string, options: HttpClientOptions = {}): Observable<T> {
    return this.http.delete<T>(this.buildUrl(url), deepMerge(this.defaultOptions, options));
  }

  public put<T>(url: string, body: any, options: HttpClientOptions = {}): Observable<T> {
    return this.http.put<T>(this.buildUrl(url), body, deepMerge(this.defaultOptions, options));
  }

}
