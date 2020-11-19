import {
  Injectable,
  Optional,
  Inject,
  Injector
} from '@angular/core';
import {
  HttpClient,
  HttpRequest,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';
import {
  BaseRemoteMethod,
  BaseRemoteMethodMetadata,
  REMOTE_METHOD_META_DATA,
  RxapRemoteMethodError
} from '@rxap/remote-method';
import { hasIndexSignature } from '@rxap/utilities';

export interface HttpRemoteMethodMetadata extends BaseRemoteMethodMetadata {
  url: string | (() => string);
  method: 'DELETE' | 'GET' | 'HEAD' | 'JSONP' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH';
  headers?: HttpHeaders;
  reportProgress?: boolean;
  params?: HttpParams;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  withCredentials?: boolean;
  timeout?: number;
  retry?: number;
}

export interface HttpRemoteMethodParameter<PathParams = any> {
  headers?: HttpHeaders;
  reportProgress?: boolean;
  params?: HttpParams;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  withCredentials?: boolean;
  body?: any | null;
  setHeaders?: {
    [ name: string ]: string | string[];
  };
  setParams?: {
    [ param: string ]: string;
  };
  pathParams?: PathParams;
}

@Injectable()
export abstract class BaseHttpRemoteMethod<ReturnType = any,
  PathParams = any,
  Parameter extends object = HttpRemoteMethodParameter<PathParams>,
  MetaData extends HttpRemoteMethodMetadata = HttpRemoteMethodMetadata>
  extends BaseRemoteMethod<ReturnType, Parameter, MetaData> {

  protected _httpRequest!: HttpRequest<ReturnType>;

  public readonly id!: string;

  public timeout = 60 * 1000;

  constructor(
    @Inject(HttpClient) public readonly http: HttpClient,
    @Inject(Injector) injector: Injector,
    @Optional() @Inject(REMOTE_METHOD_META_DATA) metaData: any | null = null
  ) {
    super(injector, metaData);
    this.timeout = this.metadata.timeout ?? this.timeout;
    if (http === undefined) {
      throw new RxapRemoteMethodError('HttpClient is undefined. Ensure that the HttpClient is added to the deps property!', '', this.constructor.name);
    }
    if (!(http instanceof HttpClient)) {
      throw new RxapRemoteMethodError('The property http is not an instance of HttpClinent. Check the deps property!', '', this.constructor.name);
    }
    this.metadata = metaData || this.getMetadata();
  }

  protected getRequestUrl(): string {
    if (typeof this.metadata.url === 'function') {
      return this.metadata.url();
    }
    return this.metadata.url;
  }

  public init() {
    super.init();
    this._httpRequest = new HttpRequest<ReturnType>(
      this.metadata.method,
      this.getRequestUrl(),
      null,
      {
        headers:         this.metadata.headers,
        reportProgress:  this.metadata.reportProgress,
        params:          this.metadata.params,
        responseType:    this.metadata.responseType || 'json',
        withCredentials: this.metadata.withCredentials
      }
    );
  }

  public updateRequest(parameters: Partial<HttpRemoteMethodParameter>): HttpRequest<ReturnType> {
    let url = this._httpRequest.url;

    if (parameters && parameters.hasOwnProperty('pathParams')) {
      url = this.buildUrlWithParams(url, (parameters as any).pathParams);
    }

    return this._httpRequest.clone({
      ...parameters,
      url
    });
  }

  public buildUrlWithParams(url: string, pathParams?: PathParams): string {
    if (pathParams) {

      if (!hasIndexSignature(pathParams)) {
        throw new RxapRemoteMethodError(`Path params for remote method '${this.id}' has not an index signature`, '', this.constructor.name);
      }

      const matches = url.match(/\{[^\}]+\}/g);

      if (matches) {
        for (const match of matches) {
          const param = match.substr(1, match.length - 2);
          if (!pathParams.hasOwnProperty(param)) {
            throw new RxapRemoteMethodError(`Path params for remote method '${this.id}' has not a defined value for '${param}'`, '', this.constructor.name);
          }
          url = url.replace(match, encodeURIComponent(pathParams[ param ]));
        }
      }
    }

    return url;
  }

}

export interface HttpRemoteMethodMetadata extends BaseRemoteMethodMetadata {
  url: string | (() => string);
  method: 'DELETE' | 'GET' | 'HEAD' | 'JSONP' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH';
  headers?: HttpHeaders;
  reportProgress?: boolean;
  params?: HttpParams;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  withCredentials?: boolean;
}

export interface HttpRemoteMethodParameter<PathParams = any> {
  headers?: HttpHeaders;
  reportProgress?: boolean;
  params?: HttpParams;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  withCredentials?: boolean;
  body?: any | null;
  setHeaders?: {
    [ name: string ]: string | string[];
  };
  setParams?: {
    [ param: string ]: string;
  };
  pathParams?: PathParams;
}
