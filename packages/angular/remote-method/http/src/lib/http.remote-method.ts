import { Injectable } from '@angular/core';
import {
  HttpEventType,
  HttpHeaderResponse,
  HttpProgressEvent,
  HttpResponse,
  HttpSentEvent,
} from '@angular/common/http';
import {
  filter,
  map,
  retry,
  tap,
  timeout,
} from 'rxjs/operators';
import {
  BaseHttpRemoteMethod,
  HttpRemoteMethodMetadata,
  HttpRemoteMethodParameter,
} from './base-http.remote-method';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HttpRemoteMethod<ReturnType = any,
  PathParams = any,
  Parameter extends object = HttpRemoteMethodParameter<PathParams>,
  MetaData extends HttpRemoteMethodMetadata = HttpRemoteMethodMetadata>
  extends BaseHttpRemoteMethod<ReturnType, PathParams, Parameter, MetaData> {

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onSentEvent(event: HttpSentEvent): void {
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onHeaderResponse(event: HttpHeaderResponse): void {
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onResponse(event: HttpResponse<ReturnType>): void {
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onProgressEvent(event: HttpProgressEvent): void {
  }

  // TODO : make abstract to force implementation to handel parameter transformation
  public createHttpRequestParameters(parameters?: Parameter): Partial<HttpRemoteMethodParameter> {
    return parameters ?? {} as any;
  }

  public transformer(response: any): ReturnType {
    return response;
  }

  protected _call(parameters?: Parameter): Promise<ReturnType> {
    return firstValueFrom(this.http.request<ReturnType>(this.updateRequest(this.createHttpRequestParameters(parameters))).pipe(
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
    ));
  }

}
