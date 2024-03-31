import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { ThemeControllerSetPresetRequestBody } from '../request-bodies/theme-controller-set-preset.request-body';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'ThemeController_setPreset',
  operation: '{"operationId":"ThemeController_setPreset","parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{}}}}},"responses":{"200":{}},"method":"put","path":"/settings/theme/preset"}',
})
export class ThemeControllerSetPresetCommand
  extends OpenApiOperationCommand<void, void, ThemeControllerSetPresetRequestBody> {
  public override execute(parameters: OpenApiOperationCommandParameters<void, ThemeControllerSetPresetRequestBody>): Promise<void> {
    return super.execute(parameters);
  }
}
