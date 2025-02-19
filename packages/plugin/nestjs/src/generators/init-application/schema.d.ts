export interface InitApplicationGeneratorSchema {
  project?: string;
  projects?: Array<string>;
  /** Whether this service should use sentry */
  sentry?: boolean;
  skipFormat?: boolean;
  /** Whether this service should use swagger */
  swagger?: boolean;
  /** Whether this service should start a swagger live server */
  swaggerLive?: boolean;
  /** Whether the main file should be generated */
  generateMain?: boolean;
  /** Whether this service should use a health indicator */
  healthIndicator?: boolean;
  /** A list of health indicators */
  healthIndicatorList?: Array<string>;
  /** Whether this service use the ValidationPipe */
  validator?: boolean;
  platform?: 'express' | 'fastify';
  /** The default port where the server is listens */
  port?: number;
  apiPrefix?: string | boolean;
  pluginBuildInfoOptions?: Record<string,Record<string, unknown>>;
  pluginDockerOptions?: Record<string,Record<string, unknown>>;
  /** Default sentry dsn */
  sentryDsn?: string;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
  /** Whether the application should use jwt */
  jwt?: boolean;
  /** Whether the application should use openApi as client */
  openApi?: boolean;
  /** Whether to skip executing project specific initialization */
  skipProjects?: boolean;
  /** The api configuration file to use */
  apiConfigurationFile?: string;
  /** Whether the nest service should be standalone */
  standalone?: boolean;
  typeorm?: 'none' | 'postgres';
  bootstrap?: 'monolithic' | 'hybrid' | 'microservice';
  /** The transport to use for microservices communication */
  transport?: 'none' | 'rabbitmq';
  /** Whether the application should use minio */
  minio?: boolean;
  /** Whether the application should use openai */
  openai?: boolean;
}
