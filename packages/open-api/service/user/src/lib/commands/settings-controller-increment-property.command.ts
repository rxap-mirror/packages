import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { SettingsControllerIncrementPropertyParameter } from '../parameters/settings-controller-increment-property.parameter';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_incrementProperty',
  operation: '{"operationId":"SettingsController_incrementProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{}},"method":"put","path":"/settings/{propertyPath}/increment"}',
})
export class SettingsControllerIncrementPropertyCommand
  extends OpenApiOperationCommand<void, SettingsControllerIncrementPropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerIncrementPropertyParameter, void>): Promise<void> {
    return super.execute(parameters);
  }
}
