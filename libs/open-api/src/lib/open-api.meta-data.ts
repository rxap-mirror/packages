import { OperationObjectWithMetadata } from './open-api';
import { BaseRemoteMethodMetadata } from '@rxap/remote-method';

export interface OpenApiMetaData extends BaseRemoteMethodMetadata {
  /**
   * The operation object with path and method
   */
  operation?: OperationObjectWithMetadata | string;
  /**
   * The index of the server object in the servers array in the open api config
   */
  serverIndex?: number;
  /**
   * used to specify the target server for the reset api operation
   */
  serverId?: string;
  id: string;
}
