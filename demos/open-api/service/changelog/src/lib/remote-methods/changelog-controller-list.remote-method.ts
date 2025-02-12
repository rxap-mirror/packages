import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { ChangelogControllerListResponse } from '../responses/changelog-controller-list.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-changelog',
  operationId: 'ChangelogController_list',
  operation: '{"operationId":"ChangelogController_list","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"array","items":{"type":"string"}}}}}},"method":"get","path":"/available-versions"}',
})
export class ChangelogControllerListRemoteMethod
  extends OpenApiRemoteMethod<ChangelogControllerListResponse, void, void> {
  public override call(): Promise<ChangelogControllerListResponse> {
    return super.call();
  }
}
