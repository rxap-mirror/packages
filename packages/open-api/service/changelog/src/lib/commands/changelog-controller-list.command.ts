import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandWithoutParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { ChangelogControllerListResponse } from '../responses/changelog-controller-list.response';

@Injectable()
@OperationCommand({
  serverId: 'service-changelog',
  operationId: 'ChangelogController_list',
  operation: '{"operationId":"ChangelogController_list","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"array","items":{"type":"string"}}}}}},"method":"get","path":"/available-versions"}',
})
export class ChangelogControllerListCommand
  extends OpenApiOperationCommand<ChangelogControllerListResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<ChangelogControllerListResponse> {
    return super.execute(parameters);
  }
}
