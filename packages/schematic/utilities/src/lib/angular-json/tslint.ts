export interface Tslint {
  /** The name of the TSLint configuration file. */
  tslintConfig?: string;
  /** The name of the TypeScript configuration file. */
  tsConfig?: string | Array<string>;
  /** Fixes linting errors (may overwrite linted files). */
  fix?: boolean;
  /** Controls the type check for linting. */
  typeCheck?: boolean;
  /** Succeeds even if there was linting errors. */
  force?: boolean;
  /** Show output text. */
  silent?: boolean;
  /** Output format (prose, json, stylish, verbose, pmd, msbuild, checkstyle, vso, fileslist, codeFrame). */
  format?: string;
  /** Files to exclude from linting. */
  exclude?: Array<string>;
  /** Files to include in linting. */
  files?: Array<string>;
}
