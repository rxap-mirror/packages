import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { SettingsControllerDecrementPropertyParameter } from '../parameters/settings-controller-decrement-property.parameter';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_decrementProperty',
  operation: '{"operationId":"SettingsController_decrementProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{}},"method":"put","path":"/settings/{propertyPath}/decrement"}',
})
export class SettingsControllerDecrementPropertyCommand
  extends OpenApiOperationCommand<void, SettingsControllerDecrementPropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerDecrementPropertyParameter, void>): Promise<void> {
    return super.execute(parameters);
  }
}
