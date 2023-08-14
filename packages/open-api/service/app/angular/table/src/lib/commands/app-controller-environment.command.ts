import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandWithoutParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { AppControllerEnvironmentResponse } from '../responses/app-controller-environment.response';

@Injectable()
@OperationCommand({
  serverId: 'service-app-angular-table',
  operationId: 'AppController_environment',
  operation: '{"operationId":"AppController_environment","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"get","path":"/"}',
})
export class AppControllerEnvironmentCommand
  extends OpenApiOperationCommand<AppControllerEnvironmentResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<AppControllerEnvironmentResponse> {
    return super.execute(parameters);
  }
}
