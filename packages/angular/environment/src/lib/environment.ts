export type AnySchema = { validateAsync: (...args: any[]) => any };

export interface Environment {
  /**
   * The name of the app
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
   * Where the service worker is active or not
   */
  serviceWorker?: boolean;
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

  tier?: string;

  slug?: {
    name?: string;
  };

  sentry?: {
    enabled?: boolean,
    debug?: boolean,
    dsn?: string,
    integrations?: {
      httpClient?: {
        failedRequestTargets?: string[];
      };
      BrowserTracing?: {
        tracePropagationTargets?: string[];
      }
    }
  },

  config?: string | {
    fromUrlParam?: string | boolean;
    fromLocalStorage?: boolean;
    schema?: AnySchema;
    url?: string | string[] | ((environment: Environment) => string | string[]);
    /**
     * static config values
     */
    static?: Record<string, any>;
  };

  origin?: string;

  openApi?: {
    load?: {
      openApiUrl?: string;
    } | boolean;
  }

  [key: string]: any;
}
