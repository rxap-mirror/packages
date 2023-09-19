import {
  OpenApiOperationCommand,
  OperationCommand,
} from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { SettingsControllerGetResponse } from '../responses/settings-controller-get.response';
import { OpenApiOperationCommandWithoutParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_get',
  operation: '{"operationId":"SettingsController_get","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"get","path":"/settings"}',
})
export class SettingsControllerGetCommand extends OpenApiOperationCommand<SettingsControllerGetResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<SettingsControllerGetResponse> {
    return super.execute(parameters);
  }
}
