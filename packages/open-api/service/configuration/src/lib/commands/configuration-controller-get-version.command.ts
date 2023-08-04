import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@eurogard/service-open-api';
import { Injectable } from '@nestjs/common';
import { ConfigurationControllerGetVersionParameter } from '../parameters/configuration-controller-get-version.parameter';
import { ConfigurationControllerGetVersionResponse } from '../responses/configuration-controller-get-version.response';

@Injectable()
@OperationCommand({
  serverId: 'service-configuration',
  operationId: 'ConfigurationController_getVersion',
  operation: '{"operationId":"ConfigurationController_getVersion","parameters":[{"name":"version","required":true,"in":"path","schema":{"type":"string"}},{"name":"application","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"get","path":"/{version}/{application}"}',
})
export class ConfigurationControllerGetVersionCommand
  extends OpenApiOperationCommand<ConfigurationControllerGetVersionResponse, ConfigurationControllerGetVersionParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<ConfigurationControllerGetVersionParameter, void>): Promise<ConfigurationControllerGetVersionResponse> {
    return super.execute(parameters);
  }
}
