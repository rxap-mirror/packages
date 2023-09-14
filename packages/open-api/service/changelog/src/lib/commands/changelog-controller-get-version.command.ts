import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { ChangelogControllerGetVersionParameter } from '../parameters/changelog-controller-get-version.parameter';
import { ChangelogControllerGetVersionResponse } from '../responses/changelog-controller-get-version.response';

@Injectable()
@OperationCommand({
  serverId: 'service-changelog',
  operationId: 'ChangelogController_getVersion',
  operation: '{"operationId":"ChangelogController_getVersion","parameters":[{"name":"version","required":true,"in":"path","schema":{"type":"string"}},{"name":"application","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"general":{"type":"array","items":{"type":"string"}},"application":{"type":"array","items":{"type":"string"}}},"required":["general","application"]}}}}},"method":"get","path":"/{version}/{application}"}',
})
export class ChangelogControllerGetVersionCommand
  extends OpenApiOperationCommand<ChangelogControllerGetVersionResponse, ChangelogControllerGetVersionParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<ChangelogControllerGetVersionParameter, void>): Promise<ChangelogControllerGetVersionResponse> {
    return super.execute(parameters);
  }
}
