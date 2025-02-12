import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { ChangelogControllerGetVersionParameter } from '../parameters/changelog-controller-get-version.parameter';
import { ChangelogControllerGetVersionResponse } from '../responses/changelog-controller-get-version.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-changelog',
  operationId: 'ChangelogController_getVersion',
  operation: '{"operationId":"ChangelogController_getVersion","parameters":[{"name":"version","required":true,"in":"path","schema":{"type":"string"}},{"name":"application","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"general":{"type":"array","items":{"type":"string"}},"application":{"type":"array","items":{"type":"string"}}},"required":["general","application"]}}}}},"method":"get","path":"/{version}/{application}"}',
})
export class ChangelogControllerGetVersionRemoteMethod
  extends OpenApiRemoteMethod<ChangelogControllerGetVersionResponse, ChangelogControllerGetVersionParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<ChangelogControllerGetVersionParameter, void>): Promise<ChangelogControllerGetVersionResponse> {
    return super.call(parameters);
  }
}
