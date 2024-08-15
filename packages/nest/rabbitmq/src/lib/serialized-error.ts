export interface SerializedError {
  name: string;
  message: string;
  stack?: string;

  [key: string]: unknown;
}
