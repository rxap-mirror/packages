export interface Protractor {
  /** The name of the Protractor configuration file. */
  protractorConfig?: string;
  /** A dev-server builder target to run tests against in the format of `project:target[:configuration]`. You can also pass in more than one configuration name as a comma-separated list. Example: `project:target:production,staging`. */
  devServerTarget?: string;
  /** Execute specs whose names match the pattern, which is internally compiled to a RegExp. */
  grep?: string;
  /** Invert the selection specified by the 'grep' option. */
  invertGrep?: boolean;
  /** Override specs in the protractor config. */
  specs?: Array<string>;
  /** Override suite in the protractor config. */
  suite?: string;
  /** Try to update webdriver. */
  webdriverUpdate?: boolean;
  /** Compile and Serve the app. */
  serve?: boolean;
  /** The port to use to serve the application. */
  port?: number;
  /** Host to listen on. */
  host?: string;
  /** Base URL for protractor to connect to. */
  baseUrl?: string;
}
