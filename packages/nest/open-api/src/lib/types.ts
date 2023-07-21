import { OpenAPIV3 } from 'openapi-types';

export interface OperationObjectWithMetadata extends OpenAPIV3.OperationObject {
  path: string;
  method: string;
}

export interface OperationCommandOptions {
  operation: string;
  // TODO : remove
  operationId: string;
  /**
   * used to specify the target server for the reset api operation
   */
  serverId: string;
}
