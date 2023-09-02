import { Injectable } from '@angular/core';
import {
  ConfigurationControllerGetLatestParameter,
  ConfigurationControllerGetLatestResponse,
} from '@rxap/open-api-service-configuration';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-configuration',
  operationId: 'ConfigurationController_getLatest',
  operation: '{"operationId":"ConfigurationController_getLatest","parameters":[{"name":"application","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"get","path":"/latest/{application}"}',
})
export class ConfigurationControllerGetLatestRemoteMethod
  extends OpenApiRemoteMethod<ConfigurationControllerGetLatestResponse, ConfigurationControllerGetLatestParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<ConfigurationControllerGetLatestParameter, void>): Promise<ConfigurationControllerGetLatestResponse> {
    return super.call(parameters);
  }
}
