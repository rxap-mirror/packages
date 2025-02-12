import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { SettingsControllerPushPropertyParameter } from '../parameters/settings-controller-push-property.parameter';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_pushProperty',
  operation: '{"operationId":"SettingsController_pushProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{}},"method":"put","path":"/settings/{propertyPath}/push"}',
})
export class SettingsControllerPushPropertyCommand
  extends OpenApiOperationCommand<void, SettingsControllerPushPropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerPushPropertyParameter, void>): Promise<void> {
    return super.execute(parameters);
  }
}
