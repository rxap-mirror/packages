import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { SettingsControllerGetPropertyParameter } from '../parameters/settings-controller-get-property.parameter';
import { SettingsControllerGetPropertyResponse } from '../responses/settings-controller-get-property.response';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_getProperty',
  operation: '{"operationId":"SettingsController_getProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{}}}}},"method":"get","path":"/settings/{propertyPath}"}',
})
export class SettingsControllerGetPropertyCommand
  extends OpenApiOperationCommand<SettingsControllerGetPropertyResponse, SettingsControllerGetPropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerGetPropertyParameter, void>): Promise<SettingsControllerGetPropertyResponse> {
    return super.execute(parameters);
  }
}
