import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@eurogard/service-open-api';
import { Injectable } from '@nestjs/common';
import { MinimumTableControllerGetPageParameter } from '../parameters/minimum-table-controller-get-page.parameter';
import { MinimumTableControllerGetPageResponse } from '../responses/minimum-table-controller-get-page.response';

@Injectable()
@OperationCommand({
  serverId: 'service-app-angular-table',
  operationId: 'MinimumTableController_getPage',
  operation: '{"operationId":"MinimumTableController_getPage","parameters":[{"name":"sortBy","required":false,"in":"query","schema":{"type":"string"}},{"name":"sortDirection","required":false,"in":"query","schema":{"type":"string"}},{"name":"pageSize","required":false,"in":"query","schema":{"type":"number"}},{"name":"pageIndex","required":false,"in":"query","schema":{"type":"number"}},{"name":"filter","required":false,"in":"query","schema":{"type":"array","items":{"type":"string"}}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"rows":{"type":"array","items":{"$ref":"#/components/schemas/MinimumTableRowDto"}}},"required":["rows"]}}}}},"method":"get","path":"/"}',
})
export class MinimumTableControllerGetPageCommand
  extends OpenApiOperationCommand<MinimumTableControllerGetPageResponse, MinimumTableControllerGetPageParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<MinimumTableControllerGetPageParameter, void>): Promise<MinimumTableControllerGetPageResponse> {
    return super.execute(parameters);
  }
}
