export interface InitApplicationGeneratorSchema {
  projects?: string[];
  google?: boolean;
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
  apiPrefix?: string;
  sentryDsn?: string;
  overwrite?: boolean;
  openApi?: boolean;
  jwt?: boolean;
}
