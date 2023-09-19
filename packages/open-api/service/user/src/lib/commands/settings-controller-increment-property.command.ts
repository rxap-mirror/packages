import {
  OpenApiOperationCommand,
  OperationCommand,
} from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { SettingsControllerIncrementPropertyResponse } from '../responses/settings-controller-increment-property.response';
import { SettingsControllerIncrementPropertyParameter } from '../parameters/settings-controller-increment-property.parameter';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_incrementProperty',
  operation: '{"operationId":"SettingsController_incrementProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"put","path":"/settings/{propertyPath}/increment"}',
})
export class SettingsControllerIncrementPropertyCommand
  extends OpenApiOperationCommand<SettingsControllerIncrementPropertyResponse, SettingsControllerIncrementPropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerIncrementPropertyParameter, void>): Promise<SettingsControllerIncrementPropertyResponse> {
    return super.execute(parameters);
  }
}
