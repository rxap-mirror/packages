import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { ThemeControllerSetTypographyRequestBody } from '../request-bodies/theme-controller-set-typography.request-body';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'ThemeController_setTypography',
  operation: '{"operationId":"ThemeController_setTypography","parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{}}}}},"responses":{"200":{}},"method":"put","path":"/settings/theme/typography"}',
})
export class ThemeControllerSetTypographyCommand
  extends OpenApiOperationCommand<void, void, ThemeControllerSetTypographyRequestBody> {
  public override execute(parameters: OpenApiOperationCommandParameters<void, ThemeControllerSetTypographyRequestBody>): Promise<void> {
    return super.execute(parameters);
  }
}
