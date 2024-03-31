import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandWithoutParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { ProfileControllerGetResponse } from '../responses/profile-controller-get.response';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'ProfileController_get',
  operation: '{"operationId":"ProfileController_get","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{}}}}},"method":"get","path":"/profile"}',
})
export class ProfileControllerGetCommand
  extends OpenApiOperationCommand<ProfileControllerGetResponse<TResponse>, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<ProfileControllerGetResponse<TResponse>> {
    return super.execute(parameters);
  }
}
