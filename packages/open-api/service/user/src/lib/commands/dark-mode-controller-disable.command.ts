import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandWithoutParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { DarkModeControllerDisableResponse } from '../responses/dark-mode-controller-disable.response';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'DarkModeController_disable',
  operation: '{"operationId":"DarkModeController_disable","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"boolean"}}}}},"method":"put","path":"/settings/dark-mode/disable"}',
})
export class DarkModeControllerDisableCommand
  extends OpenApiOperationCommand<DarkModeControllerDisableResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<DarkModeControllerDisableResponse> {
    return super.execute(parameters);
  }
}
