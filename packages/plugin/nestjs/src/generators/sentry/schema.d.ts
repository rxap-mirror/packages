export interface SentryGeneratorSchema {
  project: string;
  dsn?: string;
  required?: boolean;
  overwrite?: boolean;
}
