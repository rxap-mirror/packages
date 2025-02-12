import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandWithoutParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { ThemeControllerGetResponse } from '../responses/theme-controller-get.response';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'ThemeController_get',
  operation: '{"operationId":"ThemeController_get","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"density":{"type":"number","enum":[-3,-2,-1,0]},"typography":{"type":"string"},"preset":{"type":"string"}},"additionalProperties":true,"required":["preset"]}}}}},"method":"get","path":"/settings/theme"}',
})
export class ThemeControllerGetCommand
  extends OpenApiOperationCommand<ThemeControllerGetResponse<TResponse>, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<ThemeControllerGetResponse<TResponse>> {
    return super.execute(parameters);
  }
}
