import {
  OpenApiOperationCommand,
  OpenApiOperationCommandWithoutParameters,
  OperationCommand,
} from '@eurogard/service-open-api';
import { Injectable } from '@nestjs/common';
import { AppControllerEnvironmentResponse } from '../responses/app-controller-environment.response';

@Injectable()
@OperationCommand({
  serverId: 'service-status',
  operationId: 'AppController_environment',
  operation: '{"operationId":"AppController_environment","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"get","path":"/"}',
})
export class AppControllerEnvironmentCommand
  extends OpenApiOperationCommand<AppControllerEnvironmentResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<AppControllerEnvironmentResponse> {
    return super.execute(parameters);
  }
}
