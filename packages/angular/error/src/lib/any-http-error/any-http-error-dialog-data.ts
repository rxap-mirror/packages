export interface AnyHttpErrorDialogData {
  method: string;
  body?: any;
  error: any;
  message: string;
  name: string;
  status: number;
  statusText: string;
  url: string | null;
  headers: Record<string, string[]>;
  timestamp: number;
}
