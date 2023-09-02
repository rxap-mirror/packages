import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandWithoutParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { AppControllerEnvironmentResponse } from '@rxap/open-api-service-configuration';

@Injectable()
@OperationCommand({
  serverId: 'service-configuration',
  operationId: 'AppController_environment',
  operation: '{"operationId":"AppController_environment","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"get","path":"/info"}',
})
export class AppControllerEnvironmentCommand
  extends OpenApiOperationCommand<AppControllerEnvironmentResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<AppControllerEnvironmentResponse> {
    return super.execute(parameters);
  }
}
