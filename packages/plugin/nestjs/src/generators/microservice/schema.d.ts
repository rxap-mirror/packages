export enum MicroservicePlatformGeneratorSchemaEnum {
  EXPRESS = 'express',
  FASTIFY = 'fastify'
}

export interface MicroserviceGeneratorSchema {
  /** The name of microservice */
  name: string;
  /** The directory to create the microservice in */
  directory?: string;
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
  platform?: MicroservicePlatformGeneratorSchemaEnum;
  /** The default port where the server is listens */
  port?: number;
  apiPrefix?: string | boolean;
  /** Default sentry dsn */
  sentryDsn?: string;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
  /** Whether the application should use jwt */
  jwt?: boolean;
  /** Whether the application should use openApi as client */
  openApi?: boolean;
  /** The api configuration file to use */
  apiConfigurationFile?: string;
  /** Whether the nest service should be standalone */
  standalone?: boolean;
}
