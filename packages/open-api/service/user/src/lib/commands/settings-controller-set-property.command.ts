import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { SettingsControllerSetPropertyParameter } from '../parameters/settings-controller-set-property.parameter';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_setProperty',
  operation: '{"operationId":"SettingsController_setProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{}},"method":"put","path":"/settings/{propertyPath}"}',
})
export class SettingsControllerSetPropertyCommand
  extends OpenApiOperationCommand<void, SettingsControllerSetPropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerSetPropertyParameter, void>): Promise<void> {
    return super.execute(parameters);
  }
}
