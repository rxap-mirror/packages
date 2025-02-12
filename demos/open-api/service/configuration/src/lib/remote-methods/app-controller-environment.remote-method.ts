import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { AppControllerEnvironmentResponse } from '../responses/app-controller-environment.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-configuration',
  operationId: 'AppController_environment',
  operation: '{"operationId":"AppController_environment","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"get","path":"/info"}',
})
export class AppControllerEnvironmentRemoteMethod
    extends OpenApiRemoteMethod<AppControllerEnvironmentResponse, void, void> {
  public override call(): Promise<AppControllerEnvironmentResponse> {
    return super.call();
  }
}
