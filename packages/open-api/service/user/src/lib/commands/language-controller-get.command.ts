import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandWithoutParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { LanguageControllerGetResponse } from '../responses/language-controller-get.response';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'LanguageController_get',
  operation: '{"operationId":"LanguageController_get","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"string"}}}}},"method":"get","path":"/settings/language"}',
})
export class LanguageControllerGetCommand extends OpenApiOperationCommand<LanguageControllerGetResponse, void, void> {
  public override execute(parameters: OpenApiOperationCommandWithoutParameters = {}): Promise<LanguageControllerGetResponse> {
    return super.execute(parameters);
  }
}
