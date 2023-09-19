import {
  OpenApiOperationCommand,
  OperationCommand,
} from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { SettingsControllerPopPropertyResponse } from '../responses/settings-controller-pop-property.response';
import { SettingsControllerPopPropertyParameter } from '../parameters/settings-controller-pop-property.parameter';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_popProperty',
  operation: '{"operationId":"SettingsController_popProperty","parameters":[{"name":"propertyPath","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"delete","path":"/settings/{propertyPath}/pop"}',
})
export class SettingsControllerPopPropertyCommand
  extends OpenApiOperationCommand<SettingsControllerPopPropertyResponse, SettingsControllerPopPropertyParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<SettingsControllerPopPropertyParameter, void>): Promise<SettingsControllerPopPropertyResponse> {
    return super.execute(parameters);
  }
}
