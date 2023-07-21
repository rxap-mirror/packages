export interface Environment {
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

  [key: string]: any;
}
