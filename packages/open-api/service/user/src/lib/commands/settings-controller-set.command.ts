import {
  OpenApiOperationCommand,
  OperationCommand,
} from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { SettingsControllerSetResponse } from '../responses/settings-controller-set.response';
import { OpenApiOperationCommandWithoutParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_set',
  operation: '{"operationId":"SettingsController_set","parameters":[],"responses":{"201":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"post","path":"/settings"}',
})
export class SettingsControllerSetCommand extends OpenApiOperationCommand<SettingsControllerSetResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<SettingsControllerSetResponse> {
    return super.execute(parameters);
  }
}
