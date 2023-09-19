import {
  OpenApiOperationCommand,
  OperationCommand,
} from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { SettingsControllerUnshiftPropertyResponse } from '../responses/settings-controller-unshift-property.response';
import { SettingsControllerUnshiftPropertyParameter } from '../parameters/settings-controller-unshift-property.parameter';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_unshiftProperty',
  operation: '{"operationId":"SettingsController_unshiftProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"put","path":"/settings/{propertyPath}/unshift"}',
})
export class SettingsControllerUnshiftPropertyCommand
  extends OpenApiOperationCommand<SettingsControllerUnshiftPropertyResponse, SettingsControllerUnshiftPropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerUnshiftPropertyParameter, void>): Promise<SettingsControllerUnshiftPropertyResponse> {
    return super.execute(parameters);
  }
}
