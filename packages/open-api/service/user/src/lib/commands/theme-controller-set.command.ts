import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { ThemeControllerSetRequestBody } from '../request-bodies/theme-controller-set.request-body';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'ThemeController_set',
  operation: '{"operationId":"ThemeController_set","parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{"density":{"type":"number","enum":[-3,-2,-1,0]},"typography":{"type":"string"},"preset":{"type":"string"}},"additionalProperties":true,"required":["preset"]}}}},"responses":{"200":{}},"method":"put","path":"/settings/theme"}',
})
export class ThemeControllerSetCommand
  extends OpenApiOperationCommand<void, void, ThemeControllerSetRequestBody<TRequestBody>> {
  public override execute(parameters: OpenApiOperationCommandParameters<void, ThemeControllerSetRequestBody<TRequestBody>>): Promise<void> {
    return super.execute(parameters);
  }
}
