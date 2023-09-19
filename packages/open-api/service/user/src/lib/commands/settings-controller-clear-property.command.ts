import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { SettingsControllerClearPropertyParameter } from '../parameters/settings-controller-clear-property.parameter';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_clearProperty',
  operation: '{"operationId":"SettingsController_clearProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{}},"method":"delete","path":"/settings/{propertyPath}"}',
})
export class SettingsControllerClearPropertyCommand
  extends OpenApiOperationCommand<void, SettingsControllerClearPropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerClearPropertyParameter, void>): Promise<void> {
    return super.execute(parameters);
  }
}
