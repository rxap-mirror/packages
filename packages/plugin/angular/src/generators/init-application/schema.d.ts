export interface InitApplicationGeneratorSchema {
  project?: string;
  projects?: Array<string>;
  /** Whether to enable incremental build */
  incrementalBuild?: boolean;
  moduleFederation?: 'host' | 'remote';
  /** Route path for layout children */
  layoutRoutePath?: string;
  /** Whether to import the mfe remote as a standalone import */
  standaloneImport?: boolean;
  /** Whether to skip the docker configuration */
  skipDocker?: boolean;
  /** Host project for module federation */
  host?: string;
  /** Add target to deploy to after build */
  deploy?: 'web3-storage' | 'test';
  sentry?: boolean;
  apiStatusCheck?: boolean;
  authentication?: 'oauth2-proxy' | boolean;
  /** Whether to enable OpenAPI */
  openApi?: boolean;
  openApiLegacy?: boolean;
  /** Whether to enable configuration */
  config?: boolean;
  /** Whether to enable Localazy */
  localazy?: boolean;
  /** Whether to enable i18n */
  i18n?: boolean;
  /** Whether to enable service worker */
  serviceWorker?: boolean;
  languages?: Array<string>;
  /** Whether to enable Angular Material */
  material?: boolean;
  /** Whether to generate the main file */
  generateMain?: boolean;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
  /** Whether to cleanup files */
  cleanup?: boolean;
  /** Whether to generate a monolithic application */
  monolithic?: boolean;
  /** Localazy read key */
  localazyReadKey?: string;
  /** Use authentik for authentication */
  authentik?: boolean;
  /** Use OAuth for authentication */
  oauth?: boolean;
  /** Whether to skip executing project specific initialization */
  skipProjects?: boolean;
  skipFormat?: boolean;
  coerce?: boolean | any;
}
