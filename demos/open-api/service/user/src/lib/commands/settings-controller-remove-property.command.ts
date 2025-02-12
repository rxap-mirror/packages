import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { SettingsControllerRemovePropertyParameter } from '../parameters/settings-controller-remove-property.parameter';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_removeProperty',
  operation: '{"operationId":"SettingsController_removeProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{}},"method":"delete","path":"/settings/{propertyPath}/remove"}',
})
export class SettingsControllerRemovePropertyCommand
  extends OpenApiOperationCommand<void, SettingsControllerRemovePropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerRemovePropertyParameter, void>): Promise<void> {
    return super.execute(parameters);
  }
}
