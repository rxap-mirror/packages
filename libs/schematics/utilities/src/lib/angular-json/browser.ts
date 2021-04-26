import { AssetPattern } from './asset-pattern';
import { Budget } from './budget';
import { ExtraEntryPoint } from './extra-entry-point';
import { FileReplacement } from './file-replacement';
import { Localize } from './localize';
import { MissingTranslation } from './missing-translation';

export type Browser = {
    /** List of static application assets. */
    assets?: Array<AssetPattern>;
    /** The name of the main entry-point file. */
    main?: string;
    /** The name of the polyfills file. */
    polyfills?: string;
    /** The name of the TypeScript configuration file. */
    tsConfig?: string;
    /** Global scripts to be included in the build. */
    scripts?: Array<ExtraEntryPoint>;
    /** Global styles to be included in the build. */
    styles?: Array<ExtraEntryPoint>;
    /** Options to pass to style preprocessors. */
    stylePreprocessorOptions?: {
        /** Paths to include. Paths will be resolved to project root. */
        includePaths?: Array<string>;
      };
    /** Enables optimization of the build output. Including minification of scripts and styles, tree-shaking, dead-code elimination, inlining of critical CSS and fonts inlining. For more information, see https://angular.io/guide/workspace-config#optimization-configuration. */
    optimization?: {
        /** Enables optimization of the scripts output. */
        scripts?: boolean;
        /** Enables optimization of the styles output. */
        styles?: {
            /** Minify CSS definitions by removing extraneous whitespace and comments, merging identifiers and minimizing values. */
            minify?: boolean;
            /** Extract and inline critical CSS definitions to improve first paint time. */
            inlineCritical?: boolean;
          } | boolean | {
            /** Minify CSS definitions by removing extraneous whitespace and comments, merging identifiers and minimizing values. */
            minify?: boolean;
            /** Extract and inline critical CSS definitions to improve first paint time. */
            inlineCritical?: boolean;
          } | boolean;
        /** Enables optimization for fonts. This option requires internet access. `HTTPS_PROXY` environment variable can be used to specify a proxy server. */
        fonts?: {
            /** Reduce render blocking requests by inlining external Google fonts and icons CSS definitions in the application's HTML index file. This option requires internet access. `HTTPS_PROXY` environment variable can be used to specify a proxy server. */
            inline?: boolean;
          } | boolean | {
            /** Reduce render blocking requests by inlining external Google fonts and icons CSS definitions in the application's HTML index file. This option requires internet access. `HTTPS_PROXY` environment variable can be used to specify a proxy server. */
            inline?: boolean;
          } | boolean;
      } | boolean | {
        /** Enables optimization of the scripts output. */
        scripts?: boolean;
        /** Enables optimization of the styles output. */
        styles?: {
            /** Minify CSS definitions by removing extraneous whitespace and comments, merging identifiers and minimizing values. */
            minify?: boolean;
            /** Extract and inline critical CSS definitions to improve first paint time. */
            inlineCritical?: boolean;
          } | boolean | {
            /** Minify CSS definitions by removing extraneous whitespace and comments, merging identifiers and minimizing values. */
            minify?: boolean;
            /** Extract and inline critical CSS definitions to improve first paint time. */
            inlineCritical?: boolean;
          } | boolean;
        /** Enables optimization for fonts. This option requires internet access. `HTTPS_PROXY` environment variable can be used to specify a proxy server. */
        fonts?: {
            /** Reduce render blocking requests by inlining external Google fonts and icons CSS definitions in the application's HTML index file. This option requires internet access. `HTTPS_PROXY` environment variable can be used to specify a proxy server. */
            inline?: boolean;
          } | boolean | {
            /** Reduce render blocking requests by inlining external Google fonts and icons CSS definitions in the application's HTML index file. This option requires internet access. `HTTPS_PROXY` environment variable can be used to specify a proxy server. */
            inline?: boolean;
          } | boolean;
      } | boolean;
    /** Replace compilation source files with other compilation source files in the build. */
    fileReplacements?: Array<FileReplacement>;
    /** Path where output will be placed. */
    outputPath?: string;
    /** The path where style resources will be placed, relative to outputPath. */
    resourcesOutputPath?: string;
    /** Build using Ahead of Time compilation. */
    aot?: boolean;
    /** Output source maps for scripts and styles. For more information, see https://angular.io/guide/workspace-config#source-map-configuration. */
    sourceMap?: {
        /** Output source maps for all scripts. */
        scripts?: boolean;
        /** Output source maps for all styles. */
        styles?: boolean;
        /** Output source maps used for error reporting tools. */
        hidden?: boolean;
        /** Resolve vendor packages source maps. */
        vendor?: boolean;
      } | boolean | {
        /** Output source maps for all scripts. */
        scripts?: boolean;
        /** Output source maps for all styles. */
        styles?: boolean;
        /** Output source maps used for error reporting tools. */
        hidden?: boolean;
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
    /** Adds more details to output logging. */
    verbose?: boolean;
    /** Log progress to the console while building. */
    progress?: boolean;
    localize?: Localize;
    i18nMissingTranslation?: MissingTranslation;
    /** Localization file to use for i18n. */
    i18nFile?: string;
    /** Format of the localization file specified with --i18n-file. */
    i18nFormat?: string;
    /** Locale to use for i18n. */
    i18nLocale?: string;
    /** Extract CSS from global styles into '.css' files instead of '.js'. */
    extractCss?: boolean;
    /** Run build when files change. */
    watch?: boolean;
    /** Define the output filename cache-busting hashing mode. */
    outputHashing?: string;
    /** Enable and define the file watching poll time period in milliseconds. */
    poll?: number;
    /** Delete the output path before building. */
    deleteOutputPath?: boolean;
    /** Do not use the real path when resolving modules. */
    preserveSymlinks?: boolean;
    /** Extract all licenses in a separate file, in the case of production builds only. */
    extractLicenses?: boolean;
    /** Show circular dependency warnings on builds. */
    showCircularDependencies?: boolean;
    /** Enables @angular-devkit/build-optimizer optimizations when using the 'aot' option. */
    buildOptimizer?: boolean;
    /** Use file name for lazy loaded chunks. */
    namedChunks?: boolean;
    /** Enables the use of subresource integrity validation. */
    subresourceIntegrity?: boolean;
    /** Generates a service worker config for production builds. */
    serviceWorker?: boolean;
    /** Path to ngsw-config.json. */
    ngswConfigPath?: string;
    /** Configures the generation of the application's HTML index. */
    index?: string | {
        /** The path of a file to use for the application's generated HTML index. */
        input: string;
        /** The output path of the application's generated HTML index file. The full provided path will be used and will be considered relative to the application's configured output path. */
        output?: string;
      } | string | {
        /** The path of a file to use for the application's generated HTML index. */
        input: string;
        /** The output path of the application's generated HTML index file. The full provided path will be used and will be considered relative to the application's configured output path. */
        output?: string;
      };
    /** Generates a 'stats.json' file which can be analyzed using tools such as 'webpack-bundle-analyzer'. */
    statsJson?: boolean;
    /** Run the TypeScript type checker in a forked process. */
    forkTypeChecker?: boolean;
    /** List of additional NgModule files that will be lazy loaded. Lazy router modules will be discovered automatically. */
    lazyModules?: Array<string>;
    /** Budget thresholds to ensure parts of your application stay within boundaries which you set. */
    budgets?: Array<Budget>;
    /** TypeScript configuration for Web Worker modules. */
    webWorkerTsConfig?: string;
    /** Define the crossorigin attribute setting of elements that provide CORS support. */
    crossOrigin?: string;
    /** Concatenate modules with Rollup before bundling them with Webpack. */
    experimentalRollupPass?: boolean;
    /** A list of CommonJS packages that are allowed to be used without a build time warning. */
    allowedCommonJsDependencies?: Array<string>;
  };
