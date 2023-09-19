import {
  OpenApiOperationCommand,
  OperationCommand,
} from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DarkModeControllerEnableResponse } from '../responses/dark-mode-controller-enable.response';
import { OpenApiOperationCommandWithoutParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'DarkModeController_enable',
  operation: '{"operationId":"DarkModeController_enable","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"boolean"}}}}},"method":"put","path":"/settings/dark-mode/enable"}',
})
export class DarkModeControllerEnableCommand
  extends OpenApiOperationCommand<DarkModeControllerEnableResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<DarkModeControllerEnableResponse> {
    return super.execute(parameters);
  }
}
