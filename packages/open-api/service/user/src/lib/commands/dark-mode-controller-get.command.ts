import {
  OpenApiOperationCommand,
  OperationCommand,
} from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DarkModeControllerGetResponse } from '../responses/dark-mode-controller-get.response';
import { OpenApiOperationCommandWithoutParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'DarkModeController_get',
  operation: '{"operationId":"DarkModeController_get","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"boolean"}}}}},"method":"get","path":"/settings/dark-mode"}',
})
export class DarkModeControllerGetCommand extends OpenApiOperationCommand<DarkModeControllerGetResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<DarkModeControllerGetResponse> {
    return super.execute(parameters);
  }
}
