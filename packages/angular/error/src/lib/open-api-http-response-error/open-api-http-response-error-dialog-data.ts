import { OpenApiMetaData } from '@rxap/open-api';
import { AnyHttpErrorDialogData } from '../any-http-error/any-http-error-dialog-data';

export interface OpenApiHttpResponseErrorDialogData extends AnyHttpErrorDialogData {
  metadata: OpenApiMetaData;
  operationId: string;
  serverId?: string;
}
