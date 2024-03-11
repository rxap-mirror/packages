export interface InitApplicationGeneratorSchema {
  generateMain?: boolean;
  swaggerLive?: boolean;
  projects?: string[];
  sentry?: boolean;
  swagger?: boolean;
  healthIndicator?: boolean;
  platform?: 'express' | 'fastify';
  validator?: boolean;
  healthIndicatorList?: string[];
  pluginBuildInfoOptions?: Record<string, unknown>;
  pluginDockerOptions?: {
    imageSuffix?: string;
    imageName?: string;
    imageRegistry?: string;
    save?: boolean;
  } & Record<string, unknown>;
  port?: number;
  apiPrefix?: string | false;
  sentryDsn?: string;
  overwrite?: boolean;
  openApi?: boolean;
  jwt?: boolean;
  statusRegister?: boolean;
  skipProjects?: boolean;
  apiConfigurationFile?: string;
  standalone?: boolean;
}
