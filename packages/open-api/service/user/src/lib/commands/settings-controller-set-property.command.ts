import {
  OpenApiOperationCommand,
  OperationCommand,
} from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { SettingsControllerSetPropertyResponse } from '../responses/settings-controller-set-property.response';
import { SettingsControllerSetPropertyParameter } from '../parameters/settings-controller-set-property.parameter';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_setProperty',
  operation: '{"operationId":"SettingsController_setProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"put","path":"/settings/{propertyPath}"}',
})
export class SettingsControllerSetPropertyCommand
  extends OpenApiOperationCommand<SettingsControllerSetPropertyResponse, SettingsControllerSetPropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerSetPropertyParameter, void>): Promise<SettingsControllerSetPropertyResponse> {
    return super.execute(parameters);
  }
}
