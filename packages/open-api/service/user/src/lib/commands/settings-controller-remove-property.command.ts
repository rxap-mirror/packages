import {
  OpenApiOperationCommand,
  OperationCommand,
} from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { SettingsControllerRemovePropertyResponse } from '../responses/settings-controller-remove-property.response';
import { SettingsControllerRemovePropertyParameter } from '../parameters/settings-controller-remove-property.parameter';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_removeProperty',
  operation: '{"operationId":"SettingsController_removeProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"delete","path":"/settings/{propertyPath}/remove"}',
})
export class SettingsControllerRemovePropertyCommand
  extends OpenApiOperationCommand<SettingsControllerRemovePropertyResponse, SettingsControllerRemovePropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerRemovePropertyParameter, void>): Promise<SettingsControllerRemovePropertyResponse> {
    return super.execute(parameters);
  }
}
