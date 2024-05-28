import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { ChangelogControllerGetLatestParameter } from '../parameters/changelog-controller-get-latest.parameter';
import { ChangelogControllerGetLatestResponse } from '../responses/changelog-controller-get-latest.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-changelog',
  operationId: 'ChangelogController_getLatest',
  operation: '{"operationId":"ChangelogController_getLatest","parameters":[{"name":"application","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"general":{"type":"array","items":{"type":"string"}},"application":{"type":"array","items":{"type":"string"}}},"required":["general","application"]}}}}},"method":"get","path":"/latest/{application}"}',
})
export class ChangelogControllerGetLatestRemoteMethod
  extends OpenApiRemoteMethod<ChangelogControllerGetLatestResponse, ChangelogControllerGetLatestParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<ChangelogControllerGetLatestParameter, void>): Promise<ChangelogControllerGetLatestResponse> {
    return super.call(parameters);
  }
}
