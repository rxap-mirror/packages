import { AnyHttpErrorDialogData } from '../any-http-error/any-http-error-dialog-data';

export interface MessageHttpErrorDialogData extends Omit<AnyHttpErrorDialogData, 'error'> {
  error: { message: string } & Record<string, unknown>;
}
