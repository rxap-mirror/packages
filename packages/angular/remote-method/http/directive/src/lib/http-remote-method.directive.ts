import {
  Directive,
  Input,
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

  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
  @Input()
  public set headers(headers: HttpRemoteMethodParameter['headers']) {
    this.updateParameters({ headers });
  }

  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
  @Input()
  public set reportProgress(reportProgress: HttpRemoteMethodParameter['reportProgress']) {
    this.updateParameters({ reportProgress });
  }

  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
  @Input()
  public set params(params: HttpRemoteMethodParameter['params']) {
    this.updateParameters({ params });
  }

  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
  @Input()
  public set responseType(responseType: HttpRemoteMethodParameter['responseType']) {
    this.updateParameters({ responseType });
  }

  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
  @Input()
  public set withCredentials(withCredentials: HttpRemoteMethodParameter['withCredentials']) {
    this.updateParameters({ withCredentials });
  }

  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
  @Input()
  public set body(body: HttpRemoteMethodParameter['body']) {
    this.updateParameters({ body });
  }

  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
  @Input()
  public set setHeaders(setHeaders: HttpRemoteMethodParameter['setHeaders']) {
    this.updateParameters({ setHeaders });
  }

  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
  @Input()
  public set setParams(setParams: HttpRemoteMethodParameter['setParams']) {
    this.updateParameters({ setParams });
  }

  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
  @Input()
  public set pathParams(pathParams: HttpRemoteMethodParameter['pathParams']) {
    this.updateParameters({ pathParams });
  }

  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
  @Input('rxapHttpRemoteMethod')
  public override set remoteMethodOrIdOrToken(value: IdOrInstanceOrToken<BaseRemoteMethod<ReturnType, HttpRemoteMethodParameter, Metadata>>) {
    if (value) {
      this._remoteMethodOrIdOrToken = value;
    }
  }

}


