export interface SentryGeneratorSchema {
  /** The name of the project. */
  project: string;
  /** Default sentry dsn */
  dsn?: string;
  /** Whether or not the sentry dsn should be required to start the application */
  required?: boolean;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
}
