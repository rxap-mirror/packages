export interface DevServer {
  /** A browser builder target to serve in the format of `project:target[:configuration]`. You can also pass in more than one configuration name as a comma-separated list. Example: `project:target:production,staging`. */
  browserTarget?: string;
  /** Port to listen on. */
  port?: number;
  /** Host to listen on. */
  host?: string;
  /** Custom HTTP headers to be added to all responses. */
  headers?: {
      '[key: string]': string;
    };
  /** Proxy configuration file. */
  proxyConfig?: string;
  /** Serve using HTTPS. */
  ssl?: boolean;
  /** SSL key to use for serving HTTPS. */
  sslKey?: string;
  /** SSL certificate to use for serving HTTPS. */
  sslCert?: string;
  /** Open the live-reload URL in default browser. */
  open?: boolean;
  /** Reload the page on change using live-reload. */
  liveReload?: boolean;
  /** The URL that the browser client (or live-reload client, if enabled) should use to connect to the development server. Use for a complex dev server setup, such as one with reverse proxies. */
  publicHost?: string;
  /** List of hosts that are allowed to access the dev server. */
  allowedHosts?: Array<string>;
  /** The pathname where the app will be served. */
  servePath?: string;
  /** Do not verify that connected clients are part of allowed hosts. */
  disableHostCheck?: boolean;
  /** Enable hot module replacement. */
  hmr?: boolean;
  /** Rebuild on change. */
  watch?: boolean;
  /** Show a warning when the --hmr option is enabled. */
  hmrWarning?: boolean;
  /** Show a warning when deploy-url/base-href use unsupported serve path values. */
  servePathDefaultWarning?: boolean;
  /** Enables optimization of the build output. Including minification of scripts and styles, tree-shaking, dead-code elimination and fonts inlining. For more information, see https://angular.io/guide/workspace-config#optimization-configuration. */
  optimization?: {
      /** Enable optimization of the scripts output. */
      scripts?: boolean;
      /** Enable optimization of the styles output. */
      styles?: boolean;
    } | boolean | {
      /** Enable optimization of the scripts output. */
      scripts?: boolean;
      /** Enable optimization of the styles output. */
      styles?: boolean;
    } | boolean;
  /** Build using ahead-of-time compilation. */
  aot?: boolean;
  /** Output source maps for scripts and styles. For more information, see https://angular.io/guide/workspace-config#source-map-configuration. */
  sourceMap?: {
      /** Output source maps for all scripts. */
      scripts?: boolean;
      /** Output source maps for all styles. */
      styles?: boolean;
      /** Resolve vendor packages source maps. */
      vendor?: boolean;
    } | boolean | {
      /** Output source maps for all scripts. */
      scripts?: boolean;
      /** Output source maps for all styles. */
      styles?: boolean;
      /** Resolve vendor packages source maps. */
      vendor?: boolean;
    } | boolean;
  /** Generate a seperate bundle containing only vendor libraries. This option should only used for development. */
  vendorChunk?: boolean;
  /** Generate a seperate bundle containing code used across multiple bundles. */
  commonChunk?: boolean;
  /** Base url for the application being built. */
  baseHref?: string;
  /** URL where files will be deployed. */
  deployUrl?: string;
  /** Add more details to output logging. */
  verbose?: boolean;
  /** Log progress to the console while building. */
  progress?: boolean;
}
