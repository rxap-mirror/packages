import { Injectable } from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { MinimumTableControllerGetPageParameter } from '../parameters/minimum-table-controller-get-page.parameter';
import { MinimumTableControllerGetPageResponse } from '../responses/minimum-table-controller-get-page.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-app-angular-table',
  operationId: 'MinimumTableController_getPage',
  operation: '{"operationId":"MinimumTableController_getPage","parameters":[{"name":"sortBy","required":false,"in":"query","schema":{"type":"string"}},{"name":"sortDirection","required":false,"in":"query","schema":{"type":"string"}},{"name":"pageSize","required":false,"in":"query","schema":{"type":"number"}},{"name":"pageIndex","required":false,"in":"query","schema":{"type":"number"}},{"name":"filter","required":false,"in":"query","schema":{"type":"array","items":{"type":"string"}}}],"responses":{"200":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/MinimumTablePageDto"}}}}},"method":"get","path":"/"}',
})
export class MinimumTableControllerGetPageRemoteMethod
  extends OpenApiRemoteMethod<MinimumTableControllerGetPageResponse, MinimumTableControllerGetPageParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<MinimumTableControllerGetPageParameter, void>): Promise<MinimumTableControllerGetPageResponse> {
    return super.call(parameters);
  }
}
