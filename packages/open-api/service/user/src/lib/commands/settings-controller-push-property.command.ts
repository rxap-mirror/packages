import {
  OpenApiOperationCommand,
  OperationCommand,
} from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { SettingsControllerPushPropertyResponse } from '../responses/settings-controller-push-property.response';
import { SettingsControllerPushPropertyParameter } from '../parameters/settings-controller-push-property.parameter';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_pushProperty',
  operation: '{"operationId":"SettingsController_pushProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"put","path":"/settings/{propertyPath}/push"}',
})
export class SettingsControllerPushPropertyCommand
  extends OpenApiOperationCommand<SettingsControllerPushPropertyResponse, SettingsControllerPushPropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerPushPropertyParameter, void>): Promise<SettingsControllerPushPropertyResponse> {
    return super.execute(parameters);
  }
}
