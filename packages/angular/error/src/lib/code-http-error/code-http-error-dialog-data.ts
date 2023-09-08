import { AnyHttpErrorDialogData } from '../any-http-error/any-http-error-dialog-data';

export interface CodeHttpErrorDialogData extends Omit<AnyHttpErrorDialogData, 'error'> {
  errorCode: string | number;
  error: { message?: string } & Record<string, unknown>;
}
