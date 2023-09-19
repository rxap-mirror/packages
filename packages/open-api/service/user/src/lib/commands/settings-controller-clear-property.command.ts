import {
  OpenApiOperationCommand,
  OperationCommand,
} from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { SettingsControllerClearPropertyResponse } from '../responses/settings-controller-clear-property.response';
import { SettingsControllerClearPropertyParameter } from '../parameters/settings-controller-clear-property.parameter';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_clearProperty',
  operation: '{"operationId":"SettingsController_clearProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"delete","path":"/settings/{propertyPath}"}',
})
export class SettingsControllerClearPropertyCommand
  extends OpenApiOperationCommand<SettingsControllerClearPropertyResponse, SettingsControllerClearPropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerClearPropertyParameter, void>): Promise<SettingsControllerClearPropertyResponse> {
    return super.execute(parameters);
  }
}
