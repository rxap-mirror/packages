import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { ChangelogControllerGetLatestParameter } from '../parameters/changelog-controller-get-latest.parameter';
import { ChangelogControllerGetLatestResponse } from '../responses/changelog-controller-get-latest.response';

@Injectable()
@OperationCommand({
  serverId: 'service-changelog',
  operationId: 'ChangelogController_getLatest',
  operation: '{"operationId":"ChangelogController_getLatest","parameters":[{"name":"application","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"general":{"type":"array","items":{"type":"string"}},"application":{"type":"array","items":{"type":"string"}}},"required":["general","application"]}}}}},"method":"get","path":"/latest/{application}"}',
})
export class ChangelogControllerGetLatestCommand
  extends OpenApiOperationCommand<ChangelogControllerGetLatestResponse, ChangelogControllerGetLatestParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<ChangelogControllerGetLatestParameter, void>): Promise<ChangelogControllerGetLatestResponse> {
    return super.execute(parameters);
  }
}
