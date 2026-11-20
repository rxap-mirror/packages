import {
  Directive,
  effect,
  input,
  untracked,
} from '@angular/core';
import { RemoteMethodDirective } from '@rxap/remote-method/directive';
import {
  HttpRemoteMethodMetadata,
  HttpRemoteMethodParameter,
} from '@rxap/remote-method/http';
import { BaseRemoteMethod } from '@rxap/remote-method';
import { IdOrInstanceOrToken } from '@rxap/definition';

@Directive({
  selector: 'button[rxapHttpRemoteMethod]',
  standalone: true,
})
export class HttpRemoteMethodDirective<ReturnType = any, Metadata extends HttpRemoteMethodMetadata = HttpRemoteMethodMetadata>
  extends RemoteMethodDirective<ReturnType, HttpRemoteMethodParameter, Metadata> {

  public readonly headers = input<HttpRemoteMethodParameter['headers']>();
  public readonly reportProgress = input<HttpRemoteMethodParameter['reportProgress']>();
  public readonly params = input<HttpRemoteMethodParameter['params']>();
  public readonly responseType = input<HttpRemoteMethodParameter['responseType']>();
  public readonly withCredentials = input<HttpRemoteMethodParameter['withCredentials']>();
  public readonly body = input<HttpRemoteMethodParameter['body']>();
  public readonly setHeaders = input<HttpRemoteMethodParameter['setHeaders']>();
  public readonly setParams = input<HttpRemoteMethodParameter['setParams']>();
  public readonly pathParams = input<HttpRemoteMethodParameter['pathParams']>();

  public override readonly remoteMethodOrIdOrToken = input<IdOrInstanceOrToken<BaseRemoteMethod<ReturnType, HttpRemoteMethodParameter, Metadata>>>(
    undefined,
    { alias: 'rxapHttpRemoteMethod' },
  );

  constructor() {
    super();
    // merge the bound http parameters into the current parameters
    effect(() => {
      const parameters: Partial<HttpRemoteMethodParameter> = {
        headers: this.headers(),
        reportProgress: this.reportProgress(),
        params: this.params(),
        responseType: this.responseType(),
        withCredentials: this.withCredentials(),
        body: this.body(),
        setHeaders: this.setHeaders(),
        setParams: this.setParams(),
        pathParams: this.pathParams(),
      };
      const bound = Object.fromEntries(Object.entries(parameters).filter(([ , value ]) => value !== undefined));
      if (Object.keys(bound).length) {
        untracked(() => this.updateParameters(bound));
      }
    });
  }

}
