import { KeyValue } from '@rxap/utilities';
import {
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';

export interface HttpDataSourceOptions<PathParams = KeyValue, Body = any | null> {
  url?: string | null;
  pathParams?: PathParams;
  body?: Body;
  params?: HttpParams;
  headers?: HttpHeaders;
  lazy?: boolean;
}
