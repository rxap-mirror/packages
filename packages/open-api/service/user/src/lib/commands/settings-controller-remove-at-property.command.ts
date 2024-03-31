import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { SettingsControllerRemoveAtPropertyParameter } from '../parameters/settings-controller-remove-at-property.parameter';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_removeAtProperty',
  operation: '{"operationId":"SettingsController_removeAtProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}},{"name":"index","required":true,"in":"path","schema":{"type":"number"}}],"responses":{"200":{}},"method":"delete","path":"/settings/{propertyPath}/removeAt/{index}"}',
})
export class SettingsControllerRemoveAtPropertyCommand
  extends OpenApiOperationCommand<void, SettingsControllerRemoveAtPropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerRemoveAtPropertyParameter, void>): Promise<void> {
    return super.execute(parameters);
  }
}
