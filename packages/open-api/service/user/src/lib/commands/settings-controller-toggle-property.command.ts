import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { SettingsControllerTogglePropertyParameter } from '../parameters/settings-controller-toggle-property.parameter';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_toggleProperty',
  operation: '{"operationId":"SettingsController_toggleProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{}},"method":"put","path":"/settings/{propertyPath}/toggle"}',
})
export class SettingsControllerTogglePropertyCommand
  extends OpenApiOperationCommand<void, SettingsControllerTogglePropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerTogglePropertyParameter, void>): Promise<void> {
    return super.execute(parameters);
  }
}
