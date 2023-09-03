import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { AppControllerNameResponse } from '../responses/app-controller-name.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-user',
  operationId: 'AppController_name',
  operation: '{"operationId":"AppController_name","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"string"}}}}},"method":"get","path":"/"}',
})
export class AppControllerNameRemoteMethod extends OpenApiRemoteMethod<AppControllerNameResponse, void, void> {
  public override call(): Promise<AppControllerNameResponse> {
    return super.call();
  }
}
