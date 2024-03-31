import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { ThemeControllerSetDensityRequestBody } from '../request-bodies/theme-controller-set-density.request-body';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'ThemeController_setDensity',
  operation: '{"operationId":"ThemeController_setDensity","parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{"value":{"type":"number","minimum":-3,"maximum":0}},"required":["value"]}}}},"responses":{"200":{}},"method":"put","path":"/settings/theme/density"}',
})
export class ThemeControllerSetDensityCommand
  extends OpenApiOperationCommand<void, void, ThemeControllerSetDensityRequestBody> {
  public override execute(parameters: OpenApiOperationCommandParameters<void, ThemeControllerSetDensityRequestBody>): Promise<void> {
    return super.execute(parameters);
  }
}
