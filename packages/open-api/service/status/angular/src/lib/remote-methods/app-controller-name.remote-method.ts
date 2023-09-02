import { Injectable } from '@angular/core';
import { AppControllerNameResponse } from '@rxap/open-api-service-status';
import {
  OpenApiRemoteMethod,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-status',
  operationId: 'AppController_name',
  operation: '{"operationId":"AppController_name","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"string"}}}}},"method":"get","path":"/"}',
})
export class AppControllerNameRemoteMethod extends OpenApiRemoteMethod<AppControllerNameResponse, void, void> {
  public override call(): Promise<AppControllerNameResponse> {
    return super.call();
  }
}
