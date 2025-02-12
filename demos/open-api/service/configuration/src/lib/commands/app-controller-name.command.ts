import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandWithoutParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { AppControllerNameResponse } from '../responses/app-controller-name.response';

@Injectable()
@OperationCommand({
  serverId: 'service-configuration',
  operationId: 'AppController_name',
  operation: '{"operationId":"AppController_name","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"string"}}}}},"method":"get","path":"/"}',
})
export class AppControllerNameCommand extends OpenApiOperationCommand<AppControllerNameResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<AppControllerNameResponse> {
    return super.execute(parameters);
  }
}
