import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { SettingsControllerShiftPropertyParameter } from '../parameters/settings-controller-shift-property.parameter';
import { SettingsControllerShiftPropertyResponse } from '../responses/settings-controller-shift-property.response';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_shiftProperty',
  operation: '{"operationId":"SettingsController_shiftProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{}}}}},"method":"delete","path":"/settings/{propertyPath}/shift"}',
})
export class SettingsControllerShiftPropertyCommand
  extends OpenApiOperationCommand<SettingsControllerShiftPropertyResponse, SettingsControllerShiftPropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerShiftPropertyParameter, void>): Promise<SettingsControllerShiftPropertyResponse> {
    return super.execute(parameters);
  }
}
