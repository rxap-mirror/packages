import {
  OpenApiOperationCommand,
  OperationCommand,
} from '@rxap/nest-open-api';
import { Injectable } from '@nestjs/common';
import { LanguageControllerSetResponse } from '../responses/language-controller-set.response';
import { LanguageControllerSetParameter } from '../parameters/language-controller-set.parameter';
import { OpenApiOperationCommandParameters } from '@rxap/nest-open-api';

@Injectable()
@OperationCommand({
  serverId: 'service-user',
  operationId: 'LanguageController_set',
  operation: '{"operationId":"LanguageController_set","parameters":[{"name":"language","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"put","path":"/settings/language/{language}"}',
})
export class LanguageControllerSetCommand
  extends OpenApiOperationCommand<LanguageControllerSetResponse, LanguageControllerSetParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<LanguageControllerSetParameter, void>): Promise<LanguageControllerSetResponse> {
    return super.execute(parameters);
  }
}
