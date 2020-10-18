export interface Environment {
  /**
   * The name of the environment
   */
  name: string;
  /**
   * The app is compiled from code in the production branch
   */
  production: boolean;
  /**
   * The app is compiled from code in the master branch
   */
  master: boolean;
  /**
   * The app is deployed for development purpose and all dev tools
   * should be activated
   */
  development: boolean;
  /**
   * The app is compiled from code in the stable branch
   */
  stable: boolean;
  /**
   * The app is compiled from code in the staging branch
   */
  staging: boolean;
  /**
   * Indicates that the application is compiled and startet in a
   * local development environment (ng serve)
   */
  local: boolean;
  /**
   * Where the service worker is active or not
   */
  serviceWorker: boolean;
  /**
   * The app is used for an e2e test
   */
  e2e: boolean;
  /**
   * The app is compiled from code in a merge request
   */
  mergeRequest: boolean;
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
  timestamp?: string | null;
  /**
   * The current branch
   */
  branch?: string | null;
  /**
   * The current tag
   */
  tag?: string | null;
}
