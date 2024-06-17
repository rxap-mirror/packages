export interface AngularErrorDialogData {
  name?: string;
  message: string;
  stack?: string;
  contexts: Record<string, Record<string, unknown>>;
  extra: Record<string, unknown>;
  tags: Record<string, string>;
}
