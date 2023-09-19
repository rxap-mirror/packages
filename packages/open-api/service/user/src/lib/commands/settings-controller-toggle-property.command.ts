import {
  OpenApiOperationCommand,
  OperationCommand,
} from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { SettingsControllerTogglePropertyResponse } from '../responses/settings-controller-toggle-property.response';
import { SettingsControllerTogglePropertyParameter } from '../parameters/settings-controller-toggle-property.parameter';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_toggleProperty',
  operation: '{"operationId":"SettingsController_toggleProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"put","path":"/settings/{propertyPath}/toggle"}',
})
export class SettingsControllerTogglePropertyCommand
  extends OpenApiOperationCommand<SettingsControllerTogglePropertyResponse, SettingsControllerTogglePropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerTogglePropertyParameter, void>): Promise<SettingsControllerTogglePropertyResponse> {
    return super.execute(parameters);
  }
}
