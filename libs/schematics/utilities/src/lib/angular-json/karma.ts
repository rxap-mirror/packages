import { AssetPattern } from './asset-pattern';
import { ExtraEntryPoint } from './extra-entry-point';

export interface Karma {
  /** The name of the main entry-point file. */
  main?: string;
  /** The name of the TypeScript configuration file. */
  tsConfig?: string;
  /** The name of the Karma configuration file. */
  karmaConfig?: string;
  /** The name of the polyfills file. */
  polyfills?: string;
  /** List of static application assets. */
  assets?: Array<AssetPattern>;
  /** Global scripts to be included in the build. */
  scripts?: Array<ExtraEntryPoint>;
  /** Global styles to be included in the build. */
  styles?: Array<ExtraEntryPoint>;
  /** Options to pass to style preprocessors */
  stylePreprocessorOptions?: {
      /** Paths to include. Paths will be resolved to project root. */
      includePaths?: Array<string>;
    };
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
  /** Log progress to the console while building. */
  progress?: boolean;
  /** Run build when files change. */
  watch?: boolean;
  /** Enable and define the file watching poll time period in milliseconds. */
  poll?: number;
  /** Do not use the real path when resolving modules. */
  preserveSymlinks?: boolean;
  /** Override which browsers tests are run against. */
  browsers?: string;
  /** Output a code coverage report. */
  codeCoverage?: boolean;
  /** Globs to exclude from code coverage. */
  codeCoverageExclude?: Array<string>;
  /** Replace compilation source files with other compilation source files in the build. */
  fileReplacements?: Array<{
      src: string;
      replaceWith: string;
    } | {
      replace: string;
      with: string;
    } | {
      src: string;
      replaceWith: string;
    } | {
      replace: string;
      with: string;
    }>;
  /** Karma reporters to use. Directly passed to the karma runner. */
  reporters?: Array<string>;
  /** TypeScript configuration for Web Worker modules. */
  webWorkerTsConfig?: string;
}
