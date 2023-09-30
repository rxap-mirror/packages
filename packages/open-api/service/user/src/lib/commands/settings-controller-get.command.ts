import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandWithoutParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { SettingsControllerGetResponse } from '../responses/settings-controller-get.response';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_get',
  operation: '{"operationId":"SettingsController_get","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"darkMode":{"type":"boolean"},"language":{"type":"string"},"theme":{"type":"object","properties":{"preset":{"type":"string"},"density":{"type":"number","enum":[0,-1,-2,-3]},"typography":{"type":"string"}},"additionalProperties":true,"required":["preset"]}},"additionalProperties":true,"required":["darkMode","language","theme"]}}}}},"method":"get","path":"/settings"}',
})
export class SettingsControllerGetCommand
  extends OpenApiOperationCommand<SettingsControllerGetResponse<TResponse>, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<SettingsControllerGetResponse<TResponse>> {
    return super.execute(parameters);
  }
}
