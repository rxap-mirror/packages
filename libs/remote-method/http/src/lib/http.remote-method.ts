import { Injectable } from '@angular/core';
import {
  HttpSentEvent,
  HttpHeaderResponse,
  HttpResponse,
  HttpProgressEvent,
  HttpEventType
} from '@angular/common/http';
import {
  tap,
  filter,
  map,
  timeout,
  retry
} from 'rxjs/operators';
import {
  BaseHttpRemoteMethod,
  HttpRemoteMethodParameter,
  HttpRemoteMethodMetadata
} from './base-http.remote-method';

@Injectable()
export class HttpRemoteMethod<ReturnType = any,
  PathParams = any,
  Parameter extends object = HttpRemoteMethodParameter<PathParams>,
  MetaData extends HttpRemoteMethodMetadata = HttpRemoteMethodMetadata>
  extends BaseHttpRemoteMethod<ReturnType, PathParams, Parameter, MetaData> {

  protected _call(parameters?: Parameter): Promise<ReturnType> {
    return this.http.request<ReturnType>(this.updateRequest(this.createHttpRequestParameters(parameters))).pipe(
      retry(this.metadata.retry ?? 0),
      tap(event => {
        switch (event.type) {

          case HttpEventType.Sent:
            this.onSentEvent(event);
            break;

          case HttpEventType.Response:
            this.onResponse(event);
            break;

          case HttpEventType.DownloadProgress:
            this.onProgressEvent(event);
            break;

          case HttpEventType.UploadProgress:
            this.onProgressEvent(event);
            break;

          case HttpEventType.ResponseHeader:
            this.onHeaderResponse(event);
            break;

        }
      }),
      filter((event: any) => event instanceof HttpResponse),
      map((event: HttpResponse<ReturnType>) => event.body),
      map(body => this.transformer(body)),
      timeout(this.timeout),
    ).toPromise();
  }

  public onSentEvent(event: HttpSentEvent): void {}

  public onHeaderResponse(event: HttpHeaderResponse): void {}

  public onResponse(event: HttpResponse<ReturnType>): void {}

  public onProgressEvent(event: HttpProgressEvent): void {}

  // TODO : make abstract to force implementation to handel parameter transformation
  public createHttpRequestParameters(parameters?: Parameter): Partial<HttpRemoteMethodParameter> {
    return parameters ?? {} as any;
  }

  public transformer(response: any): ReturnType {
    return response;
  }

}
