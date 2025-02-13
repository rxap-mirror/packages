export interface DockerComposeGeneratorSchema {
  /** The tags a project needs to be used to generate docker compose service */
  tags?: Array<string>;
  /** The projects to ignore when generating docker compose service */
  ignoreProjects?: Array<string>;
  skipFormat?: boolean;
  /** The environment variables to be used in docker compose service */
  serviceEnvironments?: Array<string>;
  /** The root domain to be used in docker compose service */
  rootDomain?: string;
  /** The traefik middlewares to be add to each service */
  middlewares?: Array<string>;
}
