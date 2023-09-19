import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { SettingsControllerPopPropertyParameter } from '../parameters/settings-controller-pop-property.parameter';
import { SettingsControllerPopPropertyResponse } from '../responses/settings-controller-pop-property.response';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_popProperty',
  operation: '{"operationId":"SettingsController_popProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{}}}}},"method":"delete","path":"/settings/{propertyPath}/pop"}',
})
export class SettingsControllerPopPropertyCommand
  extends OpenApiOperationCommand<SettingsControllerPopPropertyResponse, SettingsControllerPopPropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerPopPropertyParameter, void>): Promise<SettingsControllerPopPropertyResponse> {
    return super.execute(parameters);
  }
}
