import { Injectable } from '@nestjs/common';
import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@rxap/nest-open-api';
import { LanguageControllerSetParameter } from '../parameters/language-controller-set.parameter';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'LanguageController_set',
  operation: '{"operationId":"LanguageController_set","parameters":[{"name":"language","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{}},"method":"put","path":"/settings/language/{language}"}',
})
export class LanguageControllerSetCommand extends OpenApiOperationCommand<void, LanguageControllerSetParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<LanguageControllerSetParameter, void>): Promise<void> {
    return super.execute(parameters);
  }
}
