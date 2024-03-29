import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { ConfigurationControllerGetVersionParameter } from '../parameters/configuration-controller-get-version.parameter';
import { ConfigurationControllerGetVersionResponse } from '../responses/configuration-controller-get-version.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-configuration',
  operationId: 'ConfigurationController_getVersion',
  operation: '{"operationId":"ConfigurationController_getVersion","parameters":[{"name":"version","required":true,"in":"path","schema":{"type":"string"}},{"name":"application","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"get","path":"/{version}/{application}"}',
})
export class ConfigurationControllerGetVersionRemoteMethod
  extends OpenApiRemoteMethod<ConfigurationControllerGetVersionResponse, ConfigurationControllerGetVersionParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<ConfigurationControllerGetVersionParameter, void>): Promise<ConfigurationControllerGetVersionResponse> {
    return super.call(parameters);
  }
}
