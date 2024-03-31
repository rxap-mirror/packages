import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { SettingsControllerUnshiftPropertyParameter } from '../parameters/settings-controller-unshift-property.parameter';
import { SettingsControllerUnshiftPropertyResponse } from '../responses/settings-controller-unshift-property.response';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_unshiftProperty',
  operation: '{"operationId":"SettingsController_unshiftProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"number"}}}}},"method":"put","path":"/settings/{propertyPath}/unshift"}',
})
export class SettingsControllerUnshiftPropertyCommand
  extends OpenApiOperationCommand<SettingsControllerUnshiftPropertyResponse, SettingsControllerUnshiftPropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerUnshiftPropertyParameter, void>): Promise<SettingsControllerUnshiftPropertyResponse> {
    return super.execute(parameters);
  }
}
