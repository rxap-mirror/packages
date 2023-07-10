import { FileReplacement } from './file-replacement';
import { Localize } from './localize';
import { MissingTranslation } from './missing-translation';

export type Server = {
  /** The name of the main entry-point file. */
  main?: string;
  /** The name of the TypeScript configuration file. */
  tsConfig?: string;
  /** Options to pass to style preprocessors */
  stylePreprocessorOptions?: {
    /** Paths to include. Paths will be resolved to project root. */
    includePaths?: Array<string>;
  };
  /** Enables optimization of the build output. Including minification of scripts and styles, tree-shaking and dead-code elimination. For more information, see https://angular.io/guide/workspace-config#optimization-configuration. */
  optimization?: {
    /** Enables optimization of the scripts output. */
    scripts?: boolean;
    /** Enables optimization of the styles output. */
    styles?: boolean;
  } | boolean;
  /** Replace compilation source files with other compilation source files in the build. */
  fileReplacements?: Array<FileReplacement>;
  /** Path where output will be placed. */
  outputPath?: string;
  /** The path where style resources will be placed, relative to outputPath. */
  resourcesOutputPath?: string;
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
  } | boolean;
  /** Adds more details to output logging. */
  verbose?: boolean;
  /** Log progress to the console while building. */
  progress?: boolean;
  localize?: Localize;
  /** Localization file to use for i18n. */
  i18nFile?: string;
  /** Format of the localization file specified with --i18n-file. */
  i18nFormat?: string;
  /** Locale to use for i18n. */
  i18nLocale?: string;
  i18nMissingTranslation?: MissingTranslation;
  /** Define the output filename cache-busting hashing mode. */
  outputHashing?: 'none' | 'all' | 'media' | 'bundles';
  /** delete-output-path */
  deleteOutputPath?: boolean;
  /** Do not use the real path when resolving modules. */
  preserveSymlinks?: boolean;
  /** Extract all licenses in a separate file, in the case of production builds only. */
  extractLicenses?: boolean;
  /** Show circular dependency warnings on builds. */
  showCircularDependencies?: boolean;
  /** Use file name for lazy loaded chunks. */
  namedChunks?: boolean;
  /** Available on server platform only. Which external dependencies to bundle into the module. By default, all of node_modules will be bundled. */
  bundleDependencies?: boolean | 'none' | 'all';
  /** Exclude the listed external dependencies from being bundled into the bundle. Instead, the created bundle relies on these dependencies to be available during runtime. */
  externalDependencies?: Array<string>;
  /** Generates a 'stats.json' file which can be analyzed using tools such as 'webpack-bundle-analyzer'. */
  statsJson?: boolean;
  /** Run the TypeScript type checker in a forked process. */
  forkTypeChecker?: boolean;
  /** List of additional NgModule files that will be lazy loaded. Lazy router modules with be discovered automatically. */
  lazyModules?: Array<string>;
};
