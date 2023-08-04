import {
  OpenApiOperationCommand,
  OpenApiOperationCommandParameters,
  OperationCommand,
} from '@eurogard/service-open-api';
import { Injectable } from '@nestjs/common';
import { ConfigurationControllerGetLatestParameter } from '../parameters/configuration-controller-get-latest.parameter';
import { ConfigurationControllerGetLatestResponse } from '../responses/configuration-controller-get-latest.response';

@Injectable()
@OperationCommand({
  serverId: 'service-configuration',
  operationId: 'ConfigurationController_getLatest',
  operation: '{"operationId":"ConfigurationController_getLatest","parameters":[{"name":"application","required":true,"in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"get","path":"/latest/{application}"}',
})
export class ConfigurationControllerGetLatestCommand
  extends OpenApiOperationCommand<ConfigurationControllerGetLatestResponse, ConfigurationControllerGetLatestParameter, void> {
  public override execute(parameters: OpenApiOperationCommandParameters<ConfigurationControllerGetLatestParameter, void>): Promise<ConfigurationControllerGetLatestResponse> {
    return super.execute(parameters);
  }
}
