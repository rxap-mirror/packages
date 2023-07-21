export type TsNodeDefinition = {
  /**
   * ts-node options.  See also: https://typestrong.org/ts-node/docs/configuration
   *
   * ts-node offers TypeScript execution and REPL for node.js, with source map support.
   */
  'ts-node'?: {
    /** Specify a custom TypeScript compiler. */
    compiler?: string;
    /** Use TypeScript's compiler tree API instead of the language service API. */
    compilerHost?: boolean;
    /** JSON object to merge with TypeScript `compilerOptions`. */
    compilerOptions?: Record<string, any>;
    /** Emit output files into `.ts-node` directory. */
    emit?: boolean;
    /**
     * Load "files" and "include" from `tsconfig.json` on startup.
     *
     * Default is to override `tsconfig.json` "files" and "include" to only include the entrypoint script.
     */
    files?: boolean;
    /**
     * Paths which should not be compiled.
     *
     * Each string in the array is converted to a regular expression via `new RegExp()` and tested against source paths prior to compilation.
     *
     * Source paths are normalized to posix-style separators, relative to the directory containing `tsconfig.json` or to cwd if no `tsconfig.json` is loaded.
     *
     * Default is to ignore all node_modules subdirectories.
     */
    ignore?: Array<string>;
    /** Ignore TypeScript warnings by diagnostic code. */
    ignoreDiagnostics?: Array<string | number>;
    /** Logs TypeScript errors to stderr instead of throwing exceptions. */
    logError?: boolean;
    /**
     * Re-order file extensions so that TypeScript imports are preferred.
     *
     * For example, when both `index.js` and `index.ts` exist, enabling this option causes `require('./index')` to resolve to `index.ts` instead of `index.js`
     */
    preferTsExts?: boolean;
    /** Use pretty diagnostic formatter. */
    pretty?: boolean;
    /**
     * Modules to require, like node's `--require` flag.
     *
     * If specified in `tsconfig.json`, the modules will be resolved relative to the `tsconfig.json` file.
     *
     * If specified programmatically, each input string should be pre-resolved to an absolute path for
     * best results.
     */
    require?: Array<string>;
    /** Skip ignore check, so that compilation will be attempted for all files with matching extensions. */
    skipIgnore?: boolean;
    /** Use TypeScript's faster `transpileModule`. */
    transpileOnly?: boolean;
    /** Specify a custom transpiler for use with transpileOnly */
    transpiler?: Array<any> | string;
    /** **DEPRECATED** Specify type-check is enabled (e.g. `transpileOnly == false`). */
    typeCheck?: boolean;
  };
};
