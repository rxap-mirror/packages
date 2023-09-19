import {
  OpenApiOperationCommand,
  OperationCommand,
} from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { SettingsControllerDecrementPropertyResponse } from '../responses/settings-controller-decrement-property.response';
import { SettingsControllerDecrementPropertyParameter } from '../parameters/settings-controller-decrement-property.parameter';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_decrementProperty',
  operation: '{"operationId":"SettingsController_decrementProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"put","path":"/settings/{propertyPath}/decrement"}',
})
export class SettingsControllerDecrementPropertyCommand
  extends OpenApiOperationCommand<SettingsControllerDecrementPropertyResponse, SettingsControllerDecrementPropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerDecrementPropertyParameter, void>): Promise<SettingsControllerDecrementPropertyResponse> {
    return super.execute(parameters);
  }
}
