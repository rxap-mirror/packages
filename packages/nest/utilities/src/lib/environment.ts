
/**
 * @internal
 * use the tag a environment object to mark it as prepared. So that a second call of the prepareEnvironment method will not overwrite the environment object.
 */
export const ENVIRONMENT_PREPARED = Symbol('ENVIRONMENT_PREPARED');


export interface Environment {
  /**
   * Optional property that indicates whether the environment has been prepared.
   * It can be used as a flag to determine if certain initialization or setup tasks
   * have been completed within the system.
   */
  [ENVIRONMENT_PREPARED]?: boolean;
  /**
   * The name of the application
   */
  app: string;
  /**
   * The name of the environment
   */
  name?: string;
  /**
   * The app is compiled from code in the production branch
   */
  production: boolean;
  /**
   * The current app release
   */
  release?: string | null;
  /**
   * The current commit
   */
  commit?: string | null;
  /**
   * The build timestamp
   */
  timestamp?: string | number | null;
  /**
   * The current branch
   */
  branch?: string | null;
  /**
   * The current tag
   */
  tag?: string | null;
  ci?: boolean;
  tier?: string;
  slug?: {
    name?: string;
  };
  sentry?: {
    enabled?: boolean,
    debug?: boolean,
    dsn?: string,
    environment?: string,
    release?: string,
    serverName?: string,
    [key: string]: any;
  },
  swagger?: boolean;

  [key: string | symbol]: any;
}
