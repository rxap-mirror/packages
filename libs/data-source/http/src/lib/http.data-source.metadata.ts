import { KeyValue } from '@rxap/utilities';
import { BaseDataSourceMetadata } from '@rxap/data-source';
import {
  HttpParams,
  HttpHeaders
} from '@angular/common/http';

export interface HttpDataSourceMetadata<PathParams = KeyValue, Body = any | null> extends BaseDataSourceMetadata {
  url: string | (() => string);
  method?: string;
  params?: HttpParams;
  headers?: HttpHeaders;
  body?: Body;
  pathParams?: PathParams;
  lazy?: boolean;
  withCredentials?: boolean;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  bufferSize?: number;
  retry?: number;
  timeout?: number;
}
