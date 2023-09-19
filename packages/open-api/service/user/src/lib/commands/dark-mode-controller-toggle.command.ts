import {
  OpenApiOperationCommand,
  OperationCommand,
} from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { DarkModeControllerToggleResponse } from '../responses/dark-mode-controller-toggle.response';
import { OpenApiOperationCommandWithoutParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'DarkModeController_toggle',
  operation: '{"operationId":"DarkModeController_toggle","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"boolean"}}}}},"method":"put","path":"/settings/dark-mode/toggle"}',
})
export class DarkModeControllerToggleCommand
  extends OpenApiOperationCommand<DarkModeControllerToggleResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<DarkModeControllerToggleResponse> {
    return super.execute(parameters);
  }
}
