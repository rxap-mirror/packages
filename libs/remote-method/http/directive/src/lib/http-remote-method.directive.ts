import {
  Directive,
  Input,
  NgModule
} from '@angular/core';
import { Required } from '@rxap/utilities';
import { RemoteMethodDirective } from '@rxap/remote-method/directive';
import {
  HttpRemoteMethodParameter,
  HttpRemoteMethodMetadata
} from '@rxap/remote-method/http';
import { BaseRemoteMethod } from '@rxap/remote-method';
import { IdOrInstanceOrToken } from '@rxap/definition';

@Directive({
  selector: 'button[rxapHttpRemoteMethod]'
})
export class HttpRemoteMethodDirective<ReturnType = any, Metadata extends HttpRemoteMethodMetadata = HttpRemoteMethodMetadata> extends RemoteMethodDirective<ReturnType, HttpRemoteMethodParameter, Metadata> {

  @Input()
  public set headers(headers: HttpRemoteMethodParameter['headers']) {
    this.updateParameters({ headers });
  }

  @Input()
  public set reportProgress(reportProgress: HttpRemoteMethodParameter['reportProgress']) {
    this.updateParameters({ reportProgress });
  }

  @Input()
  public set params(params: HttpRemoteMethodParameter['params']) {
    this.updateParameters({ params });
  }

  @Input()
  public set responseType(responseType: HttpRemoteMethodParameter['responseType']) {
    this.updateParameters({ responseType });
  }

  @Input()
  public set withCredentials(withCredentials: HttpRemoteMethodParameter['withCredentials']) {
    this.updateParameters({ withCredentials });
  }

  @Input()
  public set body(body: HttpRemoteMethodParameter['body']) {
    this.updateParameters({ body });
  }

  @Input()
  public set setHeaders(setHeaders: HttpRemoteMethodParameter['setHeaders']) {
    this.updateParameters({ setHeaders });
  }

  @Input()
  public set setParams(setParams: HttpRemoteMethodParameter['setParams']) {
    this.updateParameters({ setParams });
  }

  @Input()
  public set pathParams(pathParams: HttpRemoteMethodParameter['pathParams']) {
    this.updateParameters({ pathParams });
  }

  @Input('rxapHttpRemoteMethod')
  public set remoteMethodOrIdOrToken(value: IdOrInstanceOrToken<BaseRemoteMethod<ReturnType, HttpRemoteMethodParameter, Metadata>>) {
    if (value) {
      this._remoteMethodOrIdOrToken = value;
    }
  }

}

@NgModule({
  declarations: [ HttpRemoteMethodDirective ],
  exports:      [ HttpRemoteMethodDirective ]
})
export class HttpRemoteMethodDirectiveModule {}
