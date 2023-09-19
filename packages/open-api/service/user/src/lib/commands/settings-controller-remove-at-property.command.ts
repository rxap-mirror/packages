import {
  OpenApiOperationCommand,
  OperationCommand,
} from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { SettingsControllerRemoveAtPropertyResponse } from '../responses/settings-controller-remove-at-property.response';
import { SettingsControllerRemoveAtPropertyParameter } from '../parameters/settings-controller-remove-at-property.parameter';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_removeAtProperty',
  operation: '{"operationId":"SettingsController_removeAtProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}},{"name":"index","required":true,"in":"path","schema":{"type":"number"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"delete","path":"/settings/{propertyPath}/removeAt/{index}"}',
})
export class SettingsControllerRemoveAtPropertyCommand
  extends OpenApiOperationCommand<SettingsControllerRemoveAtPropertyResponse, SettingsControllerRemoveAtPropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerRemoveAtPropertyParameter, void>): Promise<SettingsControllerRemoveAtPropertyResponse> {
    return super.execute(parameters);
  }
}
