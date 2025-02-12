import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { SettingsControllerSetRequestBody } from '../request-bodies/settings-controller-set.request-body';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'SettingsController_set',
  operation: '{"operationId":"SettingsController_set","parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{"darkMode":{"type":"boolean"},"language":{"type":"string"},"theme":{"type":"object","properties":{"preset":{"type":"string"},"density":{"type":"number","enum":[0,-1,-2,-3]},"typography":{"type":"string"}},"additionalProperties":true}},"additionalProperties":true}}}},"responses":{"201":{}},"method":"post","path":"/settings"}',
})
export class SettingsControllerSetCommand
  extends OpenApiOperationCommand<void, void, SettingsControllerSetRequestBody<TRequestBody>> {
  public override execute(parameters: OpenApiOperationCommandParameters<void, SettingsControllerSetRequestBody<TRequestBody>>): Promise<void> {
    return super.execute(parameters);
  }
}
